# JM Download API

基于 FastAPI 和 jmcomic 的图片下载后端服务。

## 安装

1. 创建虚拟环境（推荐）:
```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
# 或
venv\Scripts\activate  # Windows
```

2. 安装依赖:
```bash
pip install -r requirements.txt
```

## 配置

配置文件 `config.yml` 已包含默认配置，可根据需要修改。

环境变量（可选）:
- `API_HOST`: API服务地址（默认: 0.0.0.0）
- `API_PORT`: API服务端口（默认: 8000）
- `CORS_ORIGINS`: CORS允许的来源，逗号分隔

## 运行

```bash
# 方式1: 直接运行
python -m app.main

# 方式2: 使用uvicorn
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

API文档将在以下地址可用:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## API端点

### 开始下载
```
POST /api/v1/download/album
Body: { "album_id": "350234" }
```

### 查询下载状态
```
GET /api/v1/download/status/{task_id}
```

### 获取PDF文件
```
GET /api/v1/download/result/{album_id}
```

### 获取图片列表
```
GET /api/v1/download/images/{album_id}
```

### 获取单张图片
```
GET /api/v1/download/image/{album_id}/{image_path}
```

### 获取已下载列表
```
GET /api/v1/download/list
```

## 目录结构

- `stock/`: 下载的图片存储目录
- `pdf/`: 生成的PDF文件存储目录
- `tasks.json`: 任务状态存储文件

