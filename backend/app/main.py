from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from pathlib import Path
import os
from typing import List

from app.models import (
    DownloadRequest,
    TaskResponse,
    TaskStatusResponse,
    AlbumInfo,
    AlbumListResponse
)
from app.download_service import download_service
from app.config import (
    API_HOST,
    API_PORT,
    CORS_ORIGINS,
    PDF_DIR,
    STOCK_DIR
)

# 创建FastAPI应用
app = FastAPI(
    title="JM Download API",
    description="JM图片下载API服务",
    version="1.0.0"
)

# 配置CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    """根路径，返回API信息"""
    return {
        "name": "JM Download API",
        "version": "1.0.0",
        "status": "running"
    }


@app.get("/health")
async def health_check():
    """健康检查"""
    return {"status": "healthy"}


@app.post("/api/v1/download/album", response_model=TaskResponse)
async def start_download(request: DownloadRequest):
    """
    开始下载专辑
    
    Args:
        request: 包含album_id的请求
        
    Returns:
        TaskResponse: 任务信息
    """
    try:
        task_id = await download_service.download_album(request.album_id)
        return TaskResponse(
            task_id=task_id,
            album_id=request.album_id,
            status="pending",
            message="下载任务已创建"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"创建下载任务失败: {str(e)}")


@app.get("/api/v1/download/status/{task_id}", response_model=TaskStatusResponse)
async def get_download_status(task_id: str):
    """
    获取下载任务状态
    
    Args:
        task_id: 任务ID
        
    Returns:
        TaskStatusResponse: 任务状态信息
    """
    status = download_service.get_task_status(task_id)
    if status is None:
        raise HTTPException(status_code=404, detail="任务不存在")
    return status


@app.get("/api/v1/download/result/{album_id}")
async def get_download_result(album_id: str):
    """
    获取下载结果（PDF文件）
    
    Args:
        album_id: 专辑ID
        
    Returns:
        FileResponse: PDF文件流
    """
    pdf_path = download_service.get_pdf_path(album_id)
    if pdf_path is None:
        raise HTTPException(status_code=404, detail="PDF文件不存在")
    
    return FileResponse(
        path=str(pdf_path),
        media_type="application/pdf",
        filename=f"{album_id}.pdf"
    )


@app.get("/api/v1/download/images/{album_id}")
async def get_images_info(album_id: str):
    """
    获取专辑图片列表信息
    
    Args:
        album_id: 专辑ID
        
    Returns:
        JSONResponse: 图片列表信息
    """
    images_path = download_service.get_images_path(album_id)
    if images_path is None:
        raise HTTPException(status_code=404, detail="图片文件夹不存在")
    
    # 获取所有图片文件
    image_files = sorted(
        list(images_path.rglob("*.jpg")) + 
        list(images_path.rglob("*.png"))
    )
    
    images_info = []
    for img_path in image_files:
        relative_path = img_path.relative_to(images_path)
        images_info.append({
            "name": img_path.name,
            "path": str(relative_path),
            "full_path": str(img_path)
        })
    
    return {
        "album_id": album_id,
        "base_path": str(images_path),
        "images": images_info,
        "total": len(images_info)
    }


@app.get("/api/v1/download/image/{album_id}/{image_path:path}")
async def get_image_file(album_id: str, image_path: str):
    """
    获取单张图片文件
    
    Args:
        album_id: 专辑ID
        image_path: 图片相对路径
        
    Returns:
        FileResponse: 图片文件流
    """
    images_path = download_service.get_images_path(album_id)
    if images_path is None:
        raise HTTPException(status_code=404, detail="图片文件夹不存在")
    
    full_path = images_path / image_path
    if not full_path.exists() or not full_path.is_file():
        raise HTTPException(status_code=404, detail="图片文件不存在")
    
    # 根据文件扩展名确定媒体类型
    media_type = "image/jpeg" if full_path.suffix.lower() == ".jpg" else "image/png"
    
    return FileResponse(
        path=str(full_path),
        media_type=media_type,
        filename=full_path.name
    )


@app.get("/api/v1/download/list", response_model=AlbumListResponse)
async def get_download_list():
    """
    获取已下载的专辑列表
    
    Returns:
        AlbumListResponse: 专辑列表
    """
    albums = []
    
    # 从PDF目录获取
    if PDF_DIR.exists():
        for pdf_file in PDF_DIR.glob("*.pdf"):
            album_id = pdf_file.stem
            albums.append(AlbumInfo(
                album_id=album_id,
                has_pdf=True,
                has_images=download_service.get_images_path(album_id) is not None
            ))
    
    # 从图片目录获取（避免重复）
    if STOCK_DIR.exists():
        for item in STOCK_DIR.iterdir():
            if item.is_dir():
                # 尝试从文件夹名提取album_id
                # 这里简化处理，实际可能需要更复杂的逻辑
                images = list(item.rglob("*.jpg")) + list(item.rglob("*.png"))
                if images:
                    # 检查是否已在列表中
                    album_id = item.name
                    if not any(a.album_id == album_id for a in albums):
                        albums.append(AlbumInfo(
                            album_id=album_id,
                            has_pdf=download_service.get_pdf_path(album_id) is not None,
                            has_images=True
                        ))
    
    return AlbumListResponse(
        albums=albums,
        total=len(albums)
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=API_HOST,
        port=API_PORT,
        reload=True
    )

