import asyncio
from datetime import datetime, timezone
from app.workers.celery_app import celery_app


def run_async(coro):
    return asyncio.get_event_loop().run_until_complete(coro)


@celery_app.task(bind=True, name="search.run_query")
def run_search_query(self, query_id: str) -> dict:
    from app.db.session import async_session_factory
    from app.models.search_query import SearchQuery, QueryStatus
    from app.models.site import Site, SiteAnalysis, ReviewSnippet, SiteType
    from app.services.search_service import search_sites, profile_site, calculate_relevance_score
    from app.services.ai_service import analyze_reviews
    from sqlalchemy import select
    import redis as sync_redis
    import json

    redis_client = sync_redis.from_url("redis://redis:6379/0")

    def publish_progress(step: str, progress: int, message: str, status: str = "running"):
        redis_client.publish(f"progress:{query_id}", json.dumps({
            "query_id": query_id, "status": status,
            "progress": progress, "step": step, "message": message,
        }))

    async def execute():
        async with async_session_factory() as db:
            result = await db.execute(select(SearchQuery).where(SearchQuery.id == query_id))
            query = result.scalar_one_or_none()
            if not query:
                return

            query.status = QueryStatus.RUNNING
            query.progress = 5
            await db.commit()
            publish_progress("discovery", 5, "Поиск сайтов...")

            # Step 1 — Discovery
            sites_data = await search_sites(query.query_text, query.topic, query.sites_requested)
            publish_progress("discovery", 20, f"Найдено {len(sites_data)} сайтов")

            total = len(sites_data)
            for i, site_data in enumerate(sites_data):
                step_progress = 20 + int((i / total) * 60)
                publish_progress("profiling", step_progress, f"Анализ {site_data['domain']}...")

                # Step 2 — Site profiling
                profile = await profile_site(site_data["url"])

                # Upsert site
                existing = await db.execute(select(Site).where(Site.domain == site_data["domain"]))
                site = existing.scalar_one_or_none()
                if not site:
                    site = Site(
                        domain=site_data["domain"],
                        url=site_data["url"],
                        title=profile.get("title") or site_data.get("title", ""),
                        description=profile.get("description", ""),
                        registration_methods=profile.get("registration_methods", []),
                        has_antibot=profile.get("has_antibot", False),
                        antibot_type=profile.get("antibot_type"),
                    )
                    db.add(site)
                    await db.flush()
                else:
                    site.registration_methods = profile.get("registration_methods", [])
                    site.has_antibot = profile.get("has_antibot", False)
                    site.antibot_type = profile.get("antibot_type")
                    site.last_analyzed_at = datetime.now(timezone.utc)

                # Step 3+4 — Scraping + AI analysis
                snippets = [site_data.get("snippet", "")] if site_data.get("snippet") else []
                ai_result = await analyze_reviews(query.query_text, site_data["domain"], snippets)

                total_reviews = ai_result.get("positive_count", 0) + ai_result.get("negative_count", 0) + ai_result.get("neutral_count", 0)
                relevance = calculate_relevance_score(
                    reviews_total=total_reviews,
                    latest_review_days_ago=None,
                    activity_score=ai_result.get("activity_score", 0),
                    has_antibot=profile.get("has_antibot", False),
                )

                analysis = SiteAnalysis(
                    search_query_id=query_id,
                    site_id=site.id,
                    description=ai_result.get("description", ""),
                    positive_count=ai_result.get("positive_count", 0),
                    negative_count=ai_result.get("negative_count", 0),
                    neutral_count=ai_result.get("neutral_count", 0),
                    reviews_total=total_reviews,
                    activity_score=ai_result.get("activity_score", 0),
                    relevance_score=relevance,
                    raw_data={"summary": ai_result.get("summary", ""), "source_url": site_data["url"]},
                )
                db.add(analysis)
                await db.commit()

            # Done
            query.status = QueryStatus.COMPLETED
            query.progress = 100
            query.completed_at = datetime.now(timezone.utc)
            await db.commit()
            publish_progress("done", 100, "Поиск завершён!", status="completed")
            return {"status": "completed", "query_id": query_id}

    try:
        return run_async(execute())
    except Exception as e:
        async def mark_failed():
            async with async_session_factory() as db:
                from sqlalchemy import select
                result = await db.execute(select(SearchQuery).where(SearchQuery.id == query_id))
                query = result.scalar_one_or_none()
                if query:
                    query.status = QueryStatus.FAILED
                    query.error_message = str(e)
                    await db.commit()
        run_async(mark_failed())
        publish_progress("error", 0, str(e), status="failed")
        raise
