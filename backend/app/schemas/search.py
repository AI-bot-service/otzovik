from datetime import datetime
from pydantic import BaseModel, Field
from app.models.search_query import QueryStatus
from app.models.site import SiteType, SentimentType


class CreateSearchQueryRequest(BaseModel):
    query_text: str = Field(..., min_length=2, max_length=500)
    topic: str | None = Field(None, max_length=255)
    sites_requested: int = Field(10, ge=1, le=20)


class SearchQueryRead(BaseModel):
    id: str
    query_text: str
    topic: str | None
    sites_requested: int
    status: QueryStatus
    progress: int
    error_message: str | None
    created_at: datetime
    completed_at: datetime | None

    model_config = {"from_attributes": True}


class SiteRead(BaseModel):
    id: str
    domain: str
    url: str
    title: str | None
    description: str | None
    site_type: SiteType
    registration_methods: list[str]
    has_antibot: bool
    antibot_type: str | None

    model_config = {"from_attributes": True}


class ReviewSnippetRead(BaseModel):
    id: str
    author: str | None
    text: str
    sentiment: SentimentType
    posted_at: datetime | None
    url: str | None

    model_config = {"from_attributes": True}


class SiteAnalysisRead(BaseModel):
    id: str
    site: SiteRead
    description: str | None
    positive_count: int
    negative_count: int
    neutral_count: int
    reviews_total: int
    latest_review_date: datetime | None
    activity_score: float
    relevance_score: float

    model_config = {"from_attributes": True}


class SearchQueryDetail(SearchQueryRead):
    analyses: list[SiteAnalysisRead] = []


class ProgressUpdate(BaseModel):
    query_id: str
    status: QueryStatus
    progress: int
    step: str
    message: str
