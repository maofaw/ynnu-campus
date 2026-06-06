const express = require('express');
const fs = require('fs');
const path = require('path');
const { requireAuth } = require('./auth');
const router = express.Router();

const DATA_FILE = path.join(__dirname, '..', 'data', 'canteens.json');

function getCanteens() {
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
}

function saveCanteens(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

// 更新食堂菜单（需登录）
router.put('/:id', requireAuth, (req, res) => {
  const canteens = getCanteens();
  const index = canteens.findIndex(c => c.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ error: '食堂不存在' });
  }

  const { name, stalls } = req.body;

  canteens[index] = {
    ...canteens[index],
    name: name ?? canteens[index].name,
    stalls: stalls ?? canteens[index].stalls,
    updatedAt: new Date().toISOString()
  };

  saveCanteens(canteens);
  res.json(canteens[index]);
});

// 新增食堂（需登录）
router.post('/', requireAuth, (req, res) => {
  const { id, buildingId, name, stalls } = req.body;

  if (!id || !buildingId || !name) {
    return res.status(400).json({ error: 'id, buildingId, name 为必填项' });
  }

  const canteens = getCanteens();
  if (canteens.find(c => c.id === id)) {
    return res.status(409).json({ error: '食堂ID已存在' });
  }

  const canteen = {
    id,
    buildingId,
    name,
    stalls: stalls || [],
    updatedAt: new Date().toISOString()
  };

  canteens.push(canteen);
  saveCanteens(canteens);
  res.status(201).json(canteen);
});

module.exports = router;
