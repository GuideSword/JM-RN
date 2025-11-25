import jmcomic
import asyncio
import json
import uuid
from pathlib import Path
from typing import Dict, Optional
from datetime import datetime
from app.config import CONFIG_FILE, STOCK_DIR, PDF_DIR, TASKS_FILE
from app.models import TaskStatus, TaskStatusResponse

class DownloadService:
    def __init__(self):
        """初始化下载服务"""
        self.option = jmcomic.JmOption.from_file(str(CONFIG_FILE))
        self.tasks: Dict[str, Dict] = {}
        self._load_tasks()
    
    def _load_tasks(self):
        """从文件加载任务状态"""
        if TASKS_FILE.exists():
            try:
                with open(TASKS_FILE, 'r', encoding='utf-8') as f:
                    self.tasks = json.load(f)
            except Exception as e:
                print(f"加载任务状态失败: {e}")
                self.tasks = {}
    
    def _save_tasks(self):
        """保存任务状态到文件"""
        try:
            with open(TASKS_FILE, 'w', encoding='utf-8') as f:
                json.dump(self.tasks, f, ensure_ascii=False, indent=2)
        except Exception as e:
            print(f"保存任务状态失败: {e}")
    
    def _update_task_status(
        self, 
        task_id: str, 
        status: TaskStatus, 
        progress: float = 0.0,
        message: Optional[str] = None,
        error: Optional[str] = None,
        current_image: Optional[int] = None,
        total_images: Optional[int] = None
    ):
        """更新任务状态"""
        if task_id not in self.tasks:
            self.tasks[task_id] = {}
        
        self.tasks[task_id].update({
            "status": status.value,
            "progress": progress,
            "message": message,
            "error": error,
            "current_image": current_image,
            "total_images": total_images,
            "updated_at": datetime.now().isoformat()
        })
        self._save_tasks()
    
    async def download_album(self, album_id: str) -> str:
        """
        异步下载专辑
        
        Args:
            album_id: 专辑ID
            
        Returns:
            task_id: 任务ID
        """
        task_id = str(uuid.uuid4())
        
        # 初始化任务状态
        self.tasks[task_id] = {
            "task_id": task_id,
            "album_id": album_id,
            "status": TaskStatus.PENDING.value,
            "progress": 0.0,
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat()
        }
        self._save_tasks()
        
        # 在后台任务中执行下载
        asyncio.create_task(self._download_task(task_id, album_id))
        
        return task_id
    
    async def _download_task(self, task_id: str, album_id: str):
        """执行下载任务"""
        try:
            self._update_task_status(
                task_id,
                TaskStatus.DOWNLOADING,
                progress=0.1,
                message="开始下载..."
            )
            
            # 在线程池中执行同步的下载操作
            loop = asyncio.get_event_loop()
            await loop.run_in_executor(
                None,
                self._sync_download,
                album_id
            )
            
            # 检查是否下载成功（检查PDF是否存在）
            pdf_path = PDF_DIR / f"{album_id}.pdf"
            if pdf_path.exists():
                self._update_task_status(
                    task_id,
                    TaskStatus.COMPLETED,
                    progress=1.0,
                    message="下载完成"
                )
            else:
                # 检查图片是否存在
                # jmcomic可能下载到以专辑标题命名的文件夹
                has_images = self._check_images_exist(album_id)
                if has_images:
                    self._update_task_status(
                        task_id,
                        TaskStatus.COMPLETED,
                        progress=1.0,
                        message="图片下载完成（PDF生成中）"
                    )
                else:
                    raise Exception("下载失败：未找到下载的文件")
                    
        except Exception as e:
            error_msg = str(e)
            print(f"下载任务失败: {error_msg}")
            self._update_task_status(
                task_id,
                TaskStatus.FAILED,
                progress=0.0,
                error=error_msg,
                message="下载失败"
            )
    
    def _sync_download(self, album_id: str):
        """同步下载方法（在线程池中执行）"""
        try:
            # 使用jmcomic下载
            album_list = [album_id]
            self.option.download_album(album_list)
        except Exception as e:
            print(f"下载错误: {e}")
            raise
    
    def _check_images_exist(self, album_id: str) -> bool:
        """检查图片是否存在"""
        # 查找包含该album_id的文件夹
        if not STOCK_DIR.exists():
            return False
        
        # 方法1: 检查是否有以album_id开头的文件夹
        for item in STOCK_DIR.iterdir():
            if item.is_dir() and album_id in item.name:
                # 检查是否有图片文件
                images = list(item.rglob("*.jpg")) + list(item.rglob("*.png"))
                if images:
                    return True
        
        # 方法2: 递归查找包含该ID的文件夹
        for item in STOCK_DIR.rglob("*"):
            if item.is_dir() and album_id in str(item):
                images = list(item.rglob("*.jpg")) + list(item.rglob("*.png"))
                if images:
                    return True
        
        return False
    
    def get_task_status(self, task_id: str) -> Optional[TaskStatusResponse]:
        """获取任务状态"""
        if task_id not in self.tasks:
            return None
        
        task = self.tasks[task_id]
        
        return TaskStatusResponse(
            task_id=task_id,
            album_id=task.get("album_id", ""),
            status=TaskStatus(task.get("status", TaskStatus.PENDING.value)),
            progress=task.get("progress", 0.0),
            current_image=task.get("current_image"),
            total_images=task.get("total_images"),
            message=task.get("message"),
            error=task.get("error")
        )
    
    def get_pdf_path(self, album_id: str) -> Optional[Path]:
        """获取PDF文件路径"""
        pdf_path = PDF_DIR / f"{album_id}.pdf"
        if pdf_path.exists():
            return pdf_path
        return None
    
    def get_images_path(self, album_id: str) -> Optional[Path]:
        """获取图片文件夹路径"""
        if not STOCK_DIR.exists():
            return None
        
        # 查找包含该album_id的文件夹
        for item in STOCK_DIR.iterdir():
            if item.is_dir() and album_id in item.name:
                # 检查是否有图片
                images = list(item.rglob("*.jpg")) + list(item.rglob("*.png"))
                if images:
                    return item
        
        # 递归查找
        for item in STOCK_DIR.rglob("*"):
            if item.is_dir() and album_id in str(item):
                images = list(item.rglob("*.jpg")) + list(item.rglob("*.png"))
                if images:
                    return item
        
        return None


# 全局单例
download_service = DownloadService()

