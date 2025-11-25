# JM 图片下载器

基于 React Native Expo 和 FastAPI 的 JM 图片下载应用，从原 JM-NcatBot QQ 机器人项目迁移而来。

## 项目结构

```
JM-RN/
├── backend/          # Python FastAPI 后端
│   ├── app/
│   │   ├── main.py              # FastAPI 主应用
│   │   ├── download_service.py  # 下载服务
│   │   ├── models.py            # 数据模型
│   │   └── config.py            # 配置管理
│   ├── config.yml               # jmcomic 配置
│   └── requirements.txt         # Python 依赖
│
├── frontend/         # React Native Expo 前端
│   ├── src/
│   │   ├── screens/             # 页面组件
│   │   ├── services/            # API 服务
│   │   ├── contexts/            # Context
│   │   └── hooks/               # Hooks
│   └── package.json             # 前端依赖
│
├── JM-NcatBot/       # 原始 QQ 机器人项目（保留参考）
└── 迁移方案大纲.md   # 迁移方案文档
```

## 快速开始

### 1. 启动后端服务

```bash
cd backend

# 创建虚拟环境（推荐）
python -m venv venv
source venv/bin/activate  # Linux/Mac
# 或
venv\Scripts\activate  # Windows

# 安装依赖
pip install -r requirements.txt

# 运行服务
python -m app.main
# 或
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

后端将在 `http://localhost:8000` 启动。

API 文档可在以下地址访问：
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

### 2. 启动前端应用

```bash
cd frontend

# 安装依赖
npm install

# 启动开发服务器
npm start
```

然后选择运行平台：
- 按 `a` 运行 Android
- 按 `i` 运行 iOS
- 按 `w` 运行 Web

### 3. 配置前端

1. 在应用中打开"设置"页面
2. 输入后端 API 地址：
   - 如果后端运行在本地电脑，使用电脑的 IP 地址（例如: `http://192.168.1.100:8000`）
   - **注意**: 不能使用 `localhost`，需要使用实际的 IP 地址
3. 点击"测试连接"验证连接
4. 连接成功后点击"保存"

## 使用说明

1. **下载专辑**:
   - 在"首页"输入专辑 ID（例如: 350234）
   - 点击"开始下载"
   - 在"下载"标签页查看进度

2. **查看已下载**:
   - 在"收藏"标签页查看所有已下载的专辑
   - 点击专辑查看图片

3. **设置**:
   - 在"设置"标签页配置 API 地址
   - 查看连接状态

## 功能特性

### 后端
- ✅ FastAPI RESTful API
- ✅ 异步下载任务管理
- ✅ 下载进度跟踪
- ✅ 图片和PDF文件服务
- ✅ CORS 支持

### 前端
- ✅ React Native Expo 跨平台应用
- ✅ 实时下载进度显示
- ✅ 图片浏览和查看
- ✅ API 地址配置
- ✅ 下载任务管理

## 技术栈

### 后端
- Python 3.8+
- FastAPI
- jmcomic (JM图片下载库)
- img2pdf (图片转PDF)
- uvicorn (ASGI服务器)

### 前端
- React Native
- Expo
- React Navigation
- Axios
- React Native Image Viewing

## API 端点

- `POST /api/v1/download/album` - 开始下载专辑
- `GET /api/v1/download/status/{task_id}` - 查询下载状态
- `GET /api/v1/download/result/{album_id}` - 获取PDF文件
- `GET /api/v1/download/images/{album_id}` - 获取图片列表
- `GET /api/v1/download/image/{album_id}/{path}` - 获取单张图片
- `GET /api/v1/download/list` - 获取已下载列表

详细API文档请访问 `http://localhost:8000/docs`

## 目录说明

### 后端目录
- `stock/` - 下载的图片存储目录
- `pdf/` - 生成的PDF文件存储目录
- `tasks.json` - 任务状态存储文件

### 前端存储
- 使用 AsyncStorage 存储 API 配置和下载任务列表

## 故障排除

### 后端无法启动
- 检查 Python 版本（需要 3.8+）
- 确认所有依赖已安装
- 检查端口 8000 是否被占用

### 前端无法连接后端
- 确认后端正在运行
- 检查 API 地址是否正确（不能使用 localhost）
- 确认手机和电脑在同一个 WiFi 网络
- 检查防火墙设置

### 下载失败
- 检查网络连接
- 确认专辑 ID 正确
- 查看后端日志获取详细错误信息

## 开发

### 后端开发
```bash
cd backend
python -m app.main
```

### 前端开发
```bash
cd frontend
npm start
```

## 许可证

本项目仅用于技术学习和研究目的。

## 参考

- [JMComic-Crawler-Python](https://github.com/hect0x7/JMComic-Crawler-Python)
- [FastAPI 文档](https://fastapi.tiangolo.com/)
- [React Native Expo 文档](https://docs.expo.dev/)

