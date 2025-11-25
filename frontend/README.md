# JM Download Frontend

基于 React Native Expo 的 JM 图片下载前端应用。

## 安装

1. 安装依赖:
```bash
cd frontend
npm install
```

## 运行

### 开发模式
```bash
npm start
```

然后按提示选择：
- `a` - 在Android模拟器/设备上运行
- `i` - 在iOS模拟器/设备上运行
- `w` - 在Web浏览器中运行

### 特定平台
```bash
npm run android
npm run ios
npm run web
```

## 配置

### API地址配置

1. 首次运行应用时，进入"设置"页面
2. 输入后端API服务器的地址（例如: `http://192.168.1.100:8000`）
3. 点击"测试连接"检查连接
4. 连接成功后点击"保存"

**注意**: 
- 如果后端运行在本地电脑，需要使用电脑的IP地址，不能使用 `localhost`
- 确保手机和电脑在同一个WiFi网络下
- 确保后端API服务正在运行

## 功能

- ✅ 输入专辑ID开始下载
- ✅ 查看下载进度和状态
- ✅ 浏览已下载的专辑列表
- ✅ 查看和浏览图片
- ✅ 配置API服务器地址

## 项目结构

```
frontend/
├── src/
│   ├── screens/          # 页面组件
│   │   ├── HomeScreen.js        # 首页
│   │   ├── DownloadScreen.js    # 下载管理
│   │   ├── LibraryScreen.js     # 收藏列表
│   │   ├── AlbumViewScreen.js   # 专辑查看
│   │   └── SettingsScreen.js    # 设置
│   ├── services/         # API服务
│   │   └── api.js
│   ├── contexts/         # Context上下文
│   │   └── ApiContext.js
│   └── hooks/            # 自定义Hooks
│       └── useDownload.js
├── App.js                # 应用入口和导航
└── package.json
```

## 技术栈

- React Native
- Expo
- React Navigation
- Axios
- React Native Image Viewing
- AsyncStorage

## 开发注意事项

1. **网络连接**: 确保后端API和前端在同一个网络下
2. **CORS**: 后端需要配置正确的CORS允许来源
3. **文件访问**: 图片和PDF通过后端API提供，前端不直接访问文件系统

## 构建

### Android APK
```bash
eas build --platform android
```

### iOS IPA
```bash
eas build --platform ios
```

注意: 构建需要配置 Expo EAS 账户。

