const express = require('express');
const fs = require('fs');
const path = require('path');
const { requireAuth } = require('./auth');
const router = express.Router();

const DATA_FILE = path.join(__dirname, '..', 'data', 'buildings.json');

function getBuildings() {
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
}

function saveBuildings(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

// 新增建筑（需登录）
router.post('/', requireAuth, (req, res) => {
  const { name, category, description, lng, lat, images, tags } = req.body;

  if (!name || !category || lng == null || lat == null) {
    return res.status(400).json({ error: '名称、分类、坐标（lng, lat）为必填项' });
  }

  const buildings = getBuildings();
  const id = name.toLowerCase().replace(/[^a-z0-9一-龥]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');

  if (buildings.find(b => b.id === id)) {
    return res.status(409).json({ error: '建筑ID已存在，请修改名称' });
  }

  const now = new Date().toISOString();
  const building = {
    id,
    name,
    category,
    description: description || '',
    lng,
    lat,
    images: images || [],
    tags: tags || [],
    createdAt: now,
    updatedAt: now
  };

  buildings.push(building);
  saveBuildings(buildings);
  res.status(201).json(building);
});

// 更新建筑（需登录）
router.put('/:id', requireAuth, (req, res) => {
  const buildings = getBuildings();
  const index = buildings.findIndex(b => b.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ error: '建筑不存在' });
  }

  const { name, category, description, lng, lat, images, tags } = req.body;

  buildings[index] = {
    ...buildings[index],
    name: name ?? buildings[index].name,
    category: category ?? buildings[index].category,
    description: description ?? buildings[index].description,
    lng: lng ?? buildings[index].lng,
    lat: lat ?? buildings[index].lat,
    images: images ?? buildings[index].images,
    tags: tags ?? buildings[index].tags,
    updatedAt: new Date().toISOString()
  };

  saveBuildings(buildings);
  res.json(buildings[index]);
});

// 删除建筑（需登录）
router.delete('/:id', requireAuth, (req, res) => {
  let buildings = getBuildings();
  const index = buildings.findIndex(b => b.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ error: '建筑不存在' });
  }

  buildings.splice(index, 1);
  saveBuildings(buildings);
  res.json({ success: true });
});

module.exports = router;
