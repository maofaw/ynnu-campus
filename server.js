const express = require('express');
const session = require('express-session');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// 解析 JSON 请求体
app.use(express.json());

// Session 配置（管理登录用）
app.use(session({
  secret: 'ynnu-campus-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 24 * 60 * 60 * 1000 } // 24 小时
}));

// 静态文件服务
app.use(express.static(__dirname));
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

// 辅助函数：读取 JSON 文件（每次读磁盘，不用 require 缓存）
function readJSON(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

// 公开 API 路由
app.get('/api/buildings', (req, res) => {
  const buildings = readJSON(path.join(__dirname, 'data', 'buildings.json'));
  const { category, search } = req.query;

  let result = buildings;

  if (category) {
    result = result.filter(b => b.category === category);
  }

  if (search) {
    const keyword = search.toLowerCase();
    result = result.filter(b =>
      b.name.toLowerCase().includes(keyword) ||
      (b.tags || []).some(tag => tag.toLowerCase().includes(keyword))
    );
  }

  res.json(result);
});

app.get('/api/buildings/:id', (req, res) => {
  const buildings = readJSON(path.join(__dirname, 'data', 'buildings.json'));
  const building = buildings.find(b => b.id === req.params.id);
  if (!building) {
    return res.status(404).json({ error: '建筑不存在' });
  }
  res.json(building);
});

app.get('/api/canteens', (req, res) => {
  const canteens = readJSON(path.join(__dirname, 'data', 'canteens.json'));
  res.json(canteens);
});

app.get('/api/canteens/:id', (req, res) => {
  const canteens = readJSON(path.join(__dirname, 'data', 'canteens.json'));
  const item = canteens.find(c => c.id === req.params.id);
  if (!item) {
    return res.status(404).json({ error: '食堂不存在' });
  }
  res.json(item);
});

// 认证路由
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

// 管理 API（需登录，挂载在 /api/admin 下避免与公开 GET 路由冲突）
const buildingAdminRoutes = require('./routes/buildings');
const canteenAdminRoutes = require('./routes/canteens');

app.use('/api/admin/buildings', buildingAdminRoutes);
app.use('/api/admin/canteens', canteenAdminRoutes);

// 404
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
