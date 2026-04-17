import enum
from datetime import datetime
from sqlalchemy import String, Integer, Enum, ForeignKey, Text, Float, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base, TimestampMixin, SoftDeleteMixin, new_uuid


class QueryStatus(str, enum.Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"


class SearchQuery(Base, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "search_queries"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_uuid)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    query_text: Mapped[str] = mapped_column(String(500), nullable=False)
    topic: Mapped[str | None] = mapped_column(String(255), nullable=True)
    sites_requested: Mapped[int] = mapped_column(Integer, default=10, nullable=False)
    status: Mapped[QueryStatus] = mapped_column(Enum(QueryStatus), default=QueryStatus.PENDING, nullable=False)
    progress: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    error_message: Mapped[str | None] = mapped_column(Text, nullable=True)
    celery_task_id: Mapped[str | None] = mapped_column(String(255), nullable=True)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    user: Mapped["User"] = relationship(back_populates="search_queries")  # type: ignore[name-defined]
    site_analyses: Mapped[list["SiteAnalysis"]] = relationship(back_populates="search_query")  # type: ignore[name-defined]
