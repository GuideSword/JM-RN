import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

# 项目根目录
BASE_DIR = Path(__file__).parent.parent

# 配置文件路径
CONFIG_FILE = BASE_DIR / "config.yml"

# 下载目录
STOCK_DIR = BASE_DIR / "stock"
PDF_DIR = BASE_DIR / "pdf"

# 确保目录存在
STOCK_DIR.mkdir(exist_ok=True)
PDF_DIR.mkdir(exist_ok=True)

# API配置
API_HOST = os.getenv("API_HOST", "0.0.0.0")
API_PORT = int(os.getenv("API_PORT", "8000"))

# CORS配置
CORS_ORIGINS = os.getenv(
    "CORS_ORIGINS",
    "http://localhost:8081,http://localhost:19000,exp://localhost:8081"
).split(",")

# 任务状态存储
TASKS_FILE = BASE_DIR / "tasks.json"

