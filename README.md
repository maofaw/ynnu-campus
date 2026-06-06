# 云师大校园地图

交互式校园地图 Web 应用，帮助师生和访客快速找到校园建筑。

## 功能
- 🗺️ **交互地图**：缩放拖拽，建筑标注一目了然
- 🔍 **智能搜索**：输入建筑名称，地图自动定位
- 📋 **详情展示**：点击建筑查看介绍、照片、标签
- 🍜 **食堂菜单**：每个食堂展示窗口和菜品价格
- 🔧 **后台管理**：在线增删改建筑信息和菜单

## 快速开始

### 1. 安装依赖
```bash
npm install
```

### 2. 初始化管理员账号
```bash
node scripts/init-admin.js
```
默认账号 `admin`，密码 `admin123`。可传参自定义密码：
```bash
node scripts/init-admin.js 我的密码
```

### 3. 获取高德地图 Key
- 访问 https://lbs.amap.com/ 注册开发者账号
- 创建应用，获取 JS API Key（选择"Web端(JS API)"）
- 在 `index.html` 中替换 `YOUR_AMAP_KEY` 为你的 Key

### 4. 启动服务
```bash
node server.js
```

### 5. 打开浏览器
- 地图主页: http://localhost:3000
- 后台管理: http://localhost:3000/admin.html

## 技术栈
- 前端：原生 HTML/CSS/JS + 高德地图 JS API 2.0
- 后端：Node.js + Express
- 存储：JSON 文件
- 认证：express-session + bcryptjs

## 项目结构

```
ynnu-campus/
├── index.html           # 地图主页
├── admin.html           # 后台管理页
├── server.js            # Express 后端入口
├── css/style.css        # 全局样式
├── js/
│   ├── api.js           # 前端 API 封装
│   ├── map.js           # 地图初始化、标注渲染、详情弹窗
│   ├── search.js        # 搜索逻辑
│   └── admin.js         # 后台管理逻辑
├── routes/
│   ├── auth.js          # 登录认证
│   ├── buildings.js     # 建筑 CRUD（需登录）
│   └── canteens.js      # 食堂菜单管理（需登录）
├── data/
│   ├── buildings.json   # 建筑数据
│   └── canteens.json    # 食堂菜单
├── scripts/
│   └── init-admin.js    # 管理员初始化脚本
└── public/uploads/      # 建筑照片
```

## 待办

- [ ] 获取高德地图 Key 替换 `index.html` 中的 `YOUR_AMAP_KEY`
- [ ] 用高德坐标拾取器校准建筑坐标：https://lbs.amap.com/tools/picker
- [ ] 补充更多建筑数据和食堂菜单
- [ ] 拍摄/收集建筑照片

## 部署

上线前需要：
- 修改 `server.js` 中的 `session.secret` 为随机字符串
- 使用 PM2 管理 Node 进程
- 配置 Nginx 反向代理 + HTTPS
