import enum
from datetime import datetime
from sqlalchemy import String, Boolean, Enum, ForeignKey, Text, Integer, Float, DateTime
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base, TimestampMixin, new_uuid


class SiteType(str, enum.Enum):
    REVIEW_PLATFORM = "review_platform"
    FORUM = "forum"
    MARKETPLACE = "marketplace"
    BLOG = "blog"
    OTHER = "other"


class SentimentType(str, enum.Enum):
    POSITIVE = "positive"
    NEGATIVE = "negative"
    NEUTRAL = "neutral"


class Site(Base, TimestampMixin):
    __tablename__ = "sites"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_uuid)
    domain: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    url: Mapped[str] = mapped_column(String(2048), nullable=False)
    title: Mapped[str | None] = mapped_column(String(500), nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    site_type: Mapped[SiteType] = mapped_column(Enum(SiteType), default=SiteType.OTHER)
    registration_methods: Mapped[dict] = mapped_column(JSONB, default=list)
    has_antibot: Mapped[bool] = mapped_column(Boolean, default=False)
    antibot_type: Mapped[str | None] = mapped_column(String(100), nullable=True)
    last_analyzed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    analyses: Mapped[list["SiteAnalysis"]] = relationship(back_populates="site")  # type: ignore[name-defined]


class SiteAnalysis(Base, TimestampMixin):
    __tablename__ = "site_analyses"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_uuid)
    search_query_id: Mapped[str] = mapped_column(String(36), ForeignKey("search_queries.id"), nullable=False, index=True)
    site_id: Mapped[str] = mapped_column(String(36), ForeignKey("sites.id"), nullable=False, index=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    positive_count: Mapped[int] = mapped_column(Integer, default=0)
    negative_count: Mapped[int] = mapped_column(Integer, default=0)
    neutral_count: Mapped[int] = mapped_column(Integer, default=0)
    reviews_total: Mapped[int] = mapped_column(Integer, default=0)
    latest_review_date: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    activity_score: Mapped[float] = mapped_column(Float, default=0.0)
    relevance_score: Mapped[float] = mapped_column(Float, default=0.0)
    raw_data: Mapped[dict] = mapped_column(JSONB, default=dict)

    search_query: Mapped["SearchQuery"] = relationship(back_populates="site_analyses")  # type: ignore[name-defined]
    site: Mapped["Site"] = relationship(back_populates="analyses")
    snippets: Mapped[list["ReviewSnippet"]] = relationship(back_populates="analysis")


class ReviewSnippet(Base, TimestampMixin):
    __tablename__ = "review_snippets"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_uuid)
    site_analysis_id: Mapped[str] = mapped_column(String(36), ForeignKey("site_analyses.id"), nullable=False, index=True)
    author: Mapped[str | None] = mapped_column(String(255), nullable=True)
    text: Mapped[str] = mapped_column(Text, nullable=False)
    sentiment: Mapped[SentimentType] = mapped_column(Enum(SentimentType), default=SentimentType.NEUTRAL)
    posted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    url: Mapped[str | None] = mapped_column(String(2048), nullable=True)

    analysis: Mapped["SiteAnalysis"] = relationship(back_populates="snippets")
