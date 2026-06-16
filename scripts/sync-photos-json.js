// 将照片匹配到建筑数据（更新 buildings.json）
const fs = require('fs');
const path = require('path');

const PHOTOS_DIR = 'E:/ynnu-campus/public/images/buildings';
const JSON_FILE = 'E:/ynnu-campus/data/buildings.json';

// 照片文件名 → 建筑名称映射
const PHOTO_MAP = {
  '三校碑.jpg': '三校纪念碑',
  '东区体育馆.jpg': '东区体育馆',
  '东区田径场.jpg': '东区田径场',
  '传媒学院.jpg': '传媒学院',
  '体育学院.jpg': '体育学院',
  '信息学院.jpg': '信息学院',
  '化工学院.jpg': '化工学院',
  '华文学院.jpg': '华文学院',
  '历史学院.jpg': '历史学院',
  '启园食堂.jpg': '启园一食堂',
  '和园食堂.jpg': '和园食堂',
  '哲学与政法学院.jpg': '哲学与政法学院',
  '图书馆.jpg': '图书馆',
  '地理学部.jpg': '地理学部',
  '外国语学院.jpg': '外国语学院',
  '教育学部.jpg': '教育学部',
  '文学院.jpg': '文学院',
  '智慧餐厅.jpg': '和园智慧餐厅',
  '校史馆.jpg': '云南师范大学档案馆',
  '游泳馆.jpg': '游泳馆',
  '物电学院.jpg': '物电学院',
  '生科学院.jpg': '生科学院',
  '红烛广场.jpg': '红烛广场',
  '纪检与监察学院.jpg': '纪检监察学院',
  '经济与管理学院.jpg': '经济与管理学院',
  '能环学院.jpg': null,
  '艺术学院.jpg': '艺术学院',
  '莲花体育馆.jpg': null,
  '行政楼.jpg': '行政楼',
  '西区体育场.jpg': '西区体育场',
  '西南联大纪念碑.jpg': '国立西南联大纪念碑',
  '贝壳广场.jpg': '贝壳广场',
  '马克思主义学院.jpg': '马克思主义学院',
  '学生宿舍1.jpg': '启园1号学生公寓',
  '学生宿舍2.jpg': '启园2号学生公寓',
  '学生宿舍3.jpg': '启园3号学生公寓',
  '学生宿舍4.jpg': '启园4号学生公寓',
  '学生宿舍5.jpg': '启园5号学生公寓',
  '学生宿舍6.jpg': '启园6号学生公寓',
  '学生宿舍7.jpg': '启园7号学生公寓',
  '学生宿舍8.jpg': '启园8号学生公寓',
  '学生宿舍9.jpg': '启园9号学生公寓',
  '学生宿舍10.jpg': '启园10号学生公寓',
};

const buildings = JSON.parse(fs.readFileSync(JSON_FILE, 'utf-8'));
const photoFiles = fs.readdirSync(PHOTOS_DIR).filter(f => f.endsWith('.jpg'));

console.log(`JSON 中有 ${buildings.length} 栋建筑`);
console.log(`照片目录中有 ${photoFiles.length} 张照片`);

let matched = 0;

buildings.forEach(b => {
  b.images = b.images || [];
  for (const [photoFile, buildingName] of Object.entries(PHOTO_MAP)) {
    if (buildingName === b.name && photoFiles.includes(photoFile)) {
      b.images.push(`/public/images/buildings/${photoFile}`);
      matched++;
    }
  }
});

const unmatchedBuildings = buildings.filter(b => !b.images || b.images.length === 0).map(b => b.name);

console.log(`\n✅ 匹配成功: ${matched} 栋建筑`);
console.log(`❌ 无照片建筑 (${unmatchedBuildings.length}):`);
unmatchedBuildings.forEach(n => console.log(`   - ${n}`));

fs.writeFileSync(JSON_FILE, JSON.stringify(buildings, null, 2), 'utf-8');
console.log(`\n📝 已更新 ${JSON_FILE}`);
