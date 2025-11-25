from pydantic import BaseModel
from typing import Optional, Dict, Any
from enum import Enum


class TaskStatus(str, Enum):
    PENDING = "pending"
    DOWNLOADING = "downloading"
    COMPLETED = "completed"
    FAILED = "failed"


class DownloadRequest(BaseModel):
    album_id: str


class TaskResponse(BaseModel):
    task_id: str
    album_id: str
    status: TaskStatus
    message: Optional[str] = None


class TaskStatusResponse(BaseModel):
    task_id: str
    album_id: str
    status: TaskStatus
    progress: float  # 0.0 to 1.0
    current_image: Optional[int] = None
    total_images: Optional[int] = None
    message: Optional[str] = None
    error: Optional[str] = None


class AlbumInfo(BaseModel):
    album_id: str
    title: Optional[str] = None
    downloaded_at: Optional[str] = None
    has_pdf: bool = False
    has_images: bool = False


class AlbumListResponse(BaseModel):
    albums: list[AlbumInfo]
    total: int

