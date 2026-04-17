import json
import asyncio
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.core.deps import get_db, get_current_user
from app.core.config import settings
from app.models.user import User
from app.models.search_query import SearchQuery, QueryStatus
from app.models.site import SiteAnalysis, Site
from app.schemas.search import CreateSearchQueryRequest, SearchQueryRead, SearchQueryDetail, SiteAnalysisRead
from app.workers.tasks import run_search_query

router = APIRouter(prefix="/search", tags=["search"])


@router.post("/queries", response_model=SearchQueryRead, status_code=status.HTTP_201_CREATED)
async def create_query(
    req: CreateSearchQueryRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Rate limit check
    one_hour_ago = datetime.now(timezone.utc).replace(minute=0, second=0, microsecond=0)
    count_result = await db.execute(
        select(func.count()).where(
            SearchQuery.user_id == current_user.id,
            SearchQuery.created_at >= one_hour_ago,
            SearchQuery.deleted_at.is_(None),
        )
    )
    count = count_result.scalar_one()
    if count >= settings.MAX_QUERIES_PER_HOUR:
        raise HTTPException(status_code=status.HTTP_429_TOO_MANY_REQUESTS, detail="Rate limit exceeded")

    query = SearchQuery(
        user_id=current_user.id,
        query_text=req.query_text,
        topic=req.topic,
        sites_requested=min(req.sites_requested, settings.MAX_SITES_PER_QUERY),
    )
    db.add(query)
    await db.commit()
    await db.refresh(query)

    task = run_search_query.delay(query.id)
    query.celery_task_id = task.id
    await db.commit()

    return query


@router.get("/queries", response_model=list[SearchQueryRead])
async def list_queries(
    skip: int = 0,
    limit: int = 20,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(SearchQuery)
        .where(SearchQuery.user_id == current_user.id, SearchQuery.deleted_at.is_(None))
        .order_by(SearchQuery.created_at.desc())
        .offset(skip).limit(limit)
    )
    return result.scalars().all()


@router.get("/queries/{query_id}", response_model=SearchQueryDetail)
async def get_query(
    query_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(SearchQuery).where(
            SearchQuery.id == query_id,
            SearchQuery.user_id == current_user.id,
            SearchQuery.deleted_at.is_(None),
        )
    )
    query = result.scalar_one_or_none()
    if not query:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Query not found")

    analyses_result = await db.execute(
        select(SiteAnalysis).where(SiteAnalysis.search_query_id == query_id)
        .order_by(SiteAnalysis.relevance_score.desc())
    )
    analyses = analyses_result.scalars().all()

    sites_map = {}
    if analyses:
        site_ids = [a.site_id for a in analyses]
        sites_result = await db.execute(select(Site).where(Site.id.in_(site_ids)))
        sites_map = {s.id: s for s in sites_result.scalars().all()}

    for a in analyses:
        a.site = sites_map.get(a.site_id)  # type: ignore

    query.analyses = analyses  # type: ignore
    return query


@router.delete("/queries/{query_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_query(
    query_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(SearchQuery).where(SearchQuery.id == query_id, SearchQuery.user_id == current_user.id)
    )
    query = result.scalar_one_or_none()
    if not query:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")
    query.deleted_at = datetime.now(timezone.utc)
    await db.commit()


@router.websocket("/queries/{query_id}/progress")
async def ws_progress(query_id: str, websocket: WebSocket):
    await websocket.accept()
    import redis.asyncio as aioredis
    redis = await aioredis.from_url(settings.REDIS_URL)
    pubsub = redis.pubsub()
    await pubsub.subscribe(f"progress:{query_id}")

    try:
        async for message in pubsub.listen():
            if message["type"] == "message":
                data = json.loads(message["data"])
                await websocket.send_json(data)
                if data.get("status") in ("completed", "failed"):
                    break
    except WebSocketDisconnect:
        pass
    finally:
        await pubsub.unsubscribe(f"progress:{query_id}")
        await redis.aclose()
        await websocket.close()
