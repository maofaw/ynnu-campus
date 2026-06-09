// 生成 AI 可读的单文件代码快照
// 用法: node scripts/ai-snapshot.js
// 输出: ai-snapshot.md（直接拖给任何 AI 即可）

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'ai-snapshot.md');

// 要包含的文件（按顺序）
const FILES = [
  'index.html',
  'calibrator.html',
  'admin.html',
  'css/style.css',
  'js/data.js',
  'js/api.js',
  'js/map.js',
  'js/search.js',
  'js/cloudbase.js',
  'data/buildings.json',
  'data/canteens.json',
  'server.js',
  'package.json',
  'README.md',
  'SETUP.md',
];

let output = `# 云师大校园地图 — 完整代码快照
> 生成时间: ${new Date().toISOString().split('T')[0]}
> GitHub: https://github.com/maofaw/ynnu-campus
> 线上地址: https://maofaw.github.io/ynnu-campus/

---

## 项目概述

Web 网页版云南师范大学（呈贡校区）校园交互地图。
- 38 栋建筑，8 种分类
- 前端：原生 HTML/CSS/JS + 高德地图 JS API 2.0
- 后端：Node.js + Express（可选，GitHub Pages 可纯静态运行）
- 功能：搜索、分类筛选、步行/驾车导航、A→B 路线规划、GPS 定位、卫星图层、坐标校准器

---

`;

for (const file of FILES) {
  const filePath = path.join(ROOT, file);
  if (!fs.existsSync(filePath)) {
    output += `## ${file}\n\n> ⚠️ 文件不存在\n\n---\n\n`;
    continue;
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  const ext = path.extname(file).slice(1);

  // 限制单文件大小（data 文件可能很大）
  const MAX = 50000;
  const truncated = content.length > MAX
    ? content.slice(0, MAX) + `\n\n... (截断，原文件 ${content.length} 字符)`
    : content;

  output += `## ${file}\n\n`;
  output += `\`\`\`${ext}\n${truncated}\n\`\`\`\n\n---\n\n`;
}

fs.writeFileSync(OUT, output, 'utf-8');
console.log(`✅ 已生成: ${OUT}`);
console.log(`   大小: ${(fs.statSync(OUT).size / 1024).toFixed(1)} KB`);
console.log(`   直接拖入 AI 对话框即可`);
