// 用高德 API 自动搜索云师大校园建筑坐标
const https = require('https');
const fs = require('fs');
const path = require('path');

const KEY = '020ad1e9c45cbef32738d56a6c188362';
const CENTER = '102.85,24.86';

function fetch(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch(e) { reject(new Error('Parse error: ' + e.message)); }
      });
    }).on('error', reject);
  });
}

// 分类映射：高德 POI type → 我们的 category
function mapCategory(poi) {
  const type = poi.type || '';
  const name = poi.name || '';

  if (type.includes('图书馆') || name.includes('图书馆')) return 'library';
  if (type.includes('体育') || type.includes('运动') || name.includes('体育') || name.includes('运动') || name.includes('篮球') || name.includes('游泳')) return 'sports';
  if (type.includes('餐饮') || type.includes('餐厅') || name.includes('食堂') || name.includes('餐厅') || name.includes('咖啡')) return 'canteen';
  if (type.includes('宿舍') || type.includes('公寓') || name.includes('宿舍') || name.includes('公寓')) return 'dormitory';
  if (type.includes('科研') || type.includes('实验室')) return 'teaching';
  if (type.includes('学校') || type.includes('学院') || type.includes('教育')) return 'teaching';
  if (name.includes('广场') || name.includes('雕塑') || name.includes('花园')) return 'landmark';
  return 'other';
}

async function main() {
  console.log('🔍 搜索云师大校园建筑...\n');

  // 搜索科教文化类 + 餐饮类（食堂）+ 体育类 + 住宅类（宿舍）
  const searches = [
    { types: '140000', label: '科教文化' },
    { types: '050000', label: '餐饮' },
    { types: '080000', label: '体育' },
    { types: '120000', label: '住宅' },
  ];

  const allPois = [];
  const seen = new Set();

  for (const s of searches) {
    const url = `https://restapi.amap.com/v3/place/around?location=${CENTER}&radius=2000&key=${KEY}&offset=25&types=${s.types}`;
    console.log(`  搜索 ${s.label} 类...`);
    try {
      const r = await fetch(url);
      if (r.status === '1' && r.pois) {
        for (const p of r.pois) {
          // 筛掉无关的
          const name = p.name || '';
          const address = p.address || '';

          // 必须在云师大范围内
          const isYNNU = address.includes('云南师范大学') || address.includes('师范大学')
                     || name.includes('云南师范大学') || name.includes('师范大学')
                     || name.includes('云南师大')
                     || address.includes('呈贡校区');

          if (!isYNNU) continue;
          if (seen.has(p.id)) continue;
          seen.add(p.id);

          allPois.push(p);
        }
        console.log(`    找到 ${r.pois.length} 个 → 筛选后 ${allPois.length} 个`);
      }
    } catch(e) {
      console.log(`    出错: ${e.message}`);
    }
  }

  console.log(`\n📋 共找到 ${allPois.length} 个POI\n`);

  // 转换为 buildings 格式
  const buildings = allPois.map(p => {
    const [lng, lat] = (p.location || '0,0').split(',').map(Number);
    const name = p.name || '';
    const category = mapCategory(p);
    const id = name.toLowerCase()
      .replace(/[^a-z0-9一-鿿]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    return {
      id,
      name,
      category,
      description: p.address || '',
      lng,
      lat,
      images: [],
      tags: [p.type ? p.type.split(';').pop() : ''].filter(Boolean),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  });

  // 去重（同名建筑保留一个）
  const unique = [];
  const nameSeen = new Set();
  for (const b of buildings) {
    const key = b.name;
    if (nameSeen.has(key)) continue;
    nameSeen.add(key);
    unique.push(b);
  }

  console.log('去重后:', unique.length, '栋\n');
  console.log('分类统计:');
  const stats = {};
  unique.forEach(b => {
    stats[b.category] = (stats[b.category] || 0) + 1;
    console.log(`  ${b.category.padEnd(12)} ${b.name.padEnd(30)} (${b.lng}, ${b.lat})`);
  });
  console.log('');
  console.log(stats);

  // 保存
  const filePath = path.join(__dirname, '..', 'data', 'buildings.json');
  fs.writeFileSync(filePath, JSON.stringify(unique, null, 2), 'utf-8');
  console.log(`\n✅ 已保存到 data/buildings.json`);
}

main().catch(e => { console.error(e); process.exit(1); });
