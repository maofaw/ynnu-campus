// ============================================
// 坐标校准脚本：通过高德 POI 搜索修正建筑坐标
// 用法：node scripts/calibrate-coords.js
// ============================================

const fs = require('fs');
const path = require('path');
const https = require('https');

const AMAP_KEY = '020ad1e9c45cbef32738d56a6c188362';
const BUILDINGS_PATH = path.join(__dirname, '..', 'data', 'buildings.json');
const DATA_JS_PATH = path.join(__dirname, '..', 'js', 'data.js');

// 读取建筑数据
const buildings = JSON.parse(fs.readFileSync(BUILDINGS_PATH, 'utf-8'));

// 高德 POI 搜索
function searchPlace(keyword) {
  return new Promise((resolve, reject) => {
    const params = new URLSearchParams({
      keywords: keyword,
      city: '昆明',
      key: AMAP_KEY,
      output: 'JSON',
      offset: 5
    });
    const url = `https://restapi.amap.com/v3/place/text?${params}`;

    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.status === '1' && json.pois && json.pois.length > 0) {
            // 找最匹配的结果
            const best = json.pois[0];
            resolve({
              lng: parseFloat(best.location.split(',')[0]),
              lat: parseFloat(best.location.split(',')[1]),
              name: best.name,
              address: best.address,
              type: best.type
            });
          } else {
            resolve(null);
          }
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function main() {
  console.log(`🔍 开始校准 ${buildings.length} 栋建筑坐标...\n`);

  let updated = 0;
  let failed = 0;

  for (let i = 0; i < buildings.length; i++) {
    const b = buildings[i];
    const keyword = `${b.name} 云南师范大学呈贡校区`;

    process.stdout.write(`[${i + 1}/${buildings.length}] ${b.name} ... `);

    try {
      const result = await searchPlace(keyword);

      if (result) {
        const oldLng = b.lng;
        const oldLat = b.lat;
        const dist = getDistance(oldLat, oldLng, result.lat, result.lng);

        b.lng = result.lng;
        b.lat = result.lat;

        if (dist > 50) {
          console.log(`⚠️ 偏移 ${dist.toFixed(0)}m → (${result.lng}, ${result.lat}) ${result.name}`);
        } else {
          console.log(`✅ 微调 ${dist.toFixed(0)}m`);
        }
        updated++;
      } else {
        // 没搜到，用原坐标 + 微调关键词重试
        const retry = await searchPlace(b.name);
        if (retry) {
          b.lng = retry.lng;
          b.lat = retry.lat;
          console.log(`🔄 重试成功 → (${retry.lng}, ${retry.lat})`);
          updated++;
        } else {
          console.log(`❌ 未找到，保持原坐标`);
          failed++;
        }
      }
    } catch (err) {
      console.log(`❌ 请求失败: ${err.message}`);
      failed++;
    }

    // 避免请求过快（高德 API QPS 限制）
    await sleep(200);
  }

  console.log(`\n📊 结果: ${updated} 栋已更新, ${failed} 栋未变`);

  // 写回 buildings.json
  fs.writeFileSync(BUILDINGS_PATH, JSON.stringify(buildings, null, 2), 'utf-8');
  console.log(`✅ 已更新 data/buildings.json`);

  // 重新生成 data.js
  generateDataJS(buildings);
  console.log(`✅ 已更新 js/data.js`);
}

// 计算两点距离（米）
function getDistance(lat1, lng1, lat2, lng2) {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// 生成 js/data.js（同步更新静态数据）
function generateDataJS(buildings) {
  // 读取 canteens.json 以获取食堂楼层数据
  const canteensPath = path.join(__dirname, '..', 'data', 'canteens.json');
  const canteens = JSON.parse(fs.readFileSync(canteensPath, 'utf-8'));

  // 将食堂楼层合并到对应建筑的 floors 字段
  const enriched = buildings.map(b => {
    const building = { ...b };
    if (b.category === 'canteen') {
      const relCanteens = canteens.filter(c => c.buildingId === b.id);
      if (relCanteens.length > 0) {
        building.floors = relCanteens.map(c => ({
          name: c.name.replace(b.name, ''),
          stalls: c.stalls || []
        }));
      } else {
        building.floors = [{ name: '一楼', stalls: [] }];
      }
    }
    // 删除不需要的字段（减小文件体积）
    delete building.createdAt;
    delete building.updatedAt;
    return building;
  });

  const content = `// ============================================
// 校园地图静态数据（用于 GitHub Pages 等静态部署）
// 由 scripts/calibrate-coords.js 自动生成
// ============================================

const EMBEDDED_BUILDINGS = ${JSON.stringify(enriched)};
`;

  fs.writeFileSync(DATA_JS_PATH, content, 'utf-8');
  // 同时写一份压缩版以减小加载体积
  const minPath = path.join(__dirname, '..', 'js', 'data.min.js');
  fs.writeFileSync(minPath, `const EMBEDDED_BUILDINGS=${JSON.stringify(enriched)};`, 'utf-8');
}

main().catch(console.error);
