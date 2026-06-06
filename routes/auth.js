const express = require('express');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const USERS_FILE = path.join(__dirname, '..', 'data', 'users.json');

function getUsers() {
  return JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8'));
}

// 登录
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: '请输入用户名和密码' });
  }

  const users = getUsers();
  const user = users.find(u => u.username === username);

  if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
    return res.status(401).json({ error: '用户名或密码错误' });
  }

  req.session.user = { username: user.username, role: user.role };
  res.json({ success: true, username: user.username });
});

// 退出
router.post('/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

// 检查登录状态
router.get('/status', (req, res) => {
  if (req.session.user) {
    res.json({ loggedIn: true, username: req.session.user.username });
  } else {
    res.json({ loggedIn: false });
  }
});

// 认证中间件：后续管理路由使用
function requireAuth(req, res, next) {
  if (!req.session.user) {
    return res.status(401).json({ error: '请先登录' });
  }
  next();
}

module.exports = router;
module.exports.requireAuth = requireAuth;
