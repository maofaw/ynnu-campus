# 云师大校园地图 — 完整代码快照
> 生成时间: 2026-06-09
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

## index.html

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>云师大校园地图</title>
  <link rel="stylesheet" href="css/style.css">
</head>
<body>
  <div class="main-container">
    <!-- 左侧边栏 -->
    <aside class="sidebar" id="sidebar">
      <!-- 学校简介 -->
      <div class="intro-section">
        <div class="intro-header">
          <span class="intro-icon">🎓</span>
          <div>
            <h2>云南师范大学（呈贡校区）</h2>
            <p>智慧校园导览系统</p>
          </div>
        </div>
        <p class="intro-desc">云南师范大学前身是1938年抗战期间北大、清华、南开南迁昆明组建的西南联合大学师范学院，坐落于春城昆明。</p>
        <div class="intro-stats">
          <div class="stat-item"><div class="stat-num">38</div><div class="stat-label">栋建筑</div></div>
          <div class="stat-item"><div class="stat-num">8</div><div class="stat-label">种分类</div></div>
          <div class="stat-item"><div class="stat-num">375万+</div><div class="stat-label">图书馆藏书</div></div>
        </div>
      </div>

      <!-- 搜索 -->
      <div class="search-box">
        <input type="text" id="search-input" placeholder="🔍 搜索教学楼、食堂、宿舍..." autocomplete="off">
        <ul id="search-results"></ul>
      </div>

      <!-- 分类标签 -->
      <div class="category-tabs" id="category-tabs">
        <button class="cat-tab active" data-category="all">全部</button>
        <button class="cat-tab" data-category="teaching">🏢 教学楼</button>
        <button class="cat-tab" data-category="canteen">🍜 食堂</button>
        <button class="cat-tab" data-category="dormitory">🏠 宿舍</button>
        <button class="cat-tab" data-category="sports">⚽ 体育</button>
        <button class="cat-tab" data-category="office">🏛️ 行政</button>
        <button class="cat-tab" data-category="library">📚 图书馆</button>
        <button class="cat-tab" data-category="landmark">📍 地标</button>
      </div>

      <!-- 建筑卡片列表 -->
      <div class="cards-container" id="cards-container">
        <div class="cards-loading">加载中...</div>
      </div>
    </aside>

    <!-- 地图容器 -->
    <div id="map-container">
      <!-- 图例 -->
      <div class="map-legend" id="map-legend">
        <div class="legend-title">图例</div>
        <div class="legend-item"><span class="legend-dot" style="background:#1890ff"></span>教学楼</div>
        <div class="legend-item"><span class="legend-dot" style="background:#fa8c16"></span>食堂</div>
        <div class="legend-item"><span class="legend-dot" style="background:#52c41a"></span>宿舍楼</div>
        <div class="legend-item"><span class="legend-dot" style="background:#f5222d"></span>体育场馆</div>
        <div class="legend-item"><span class="legend-dot" style="background:#8c8c8c"></span>行政楼</div>
        <div class="legend-item"><span class="legend-dot" style="background:#722ed1"></span>图书馆</div>
        <div class="legend-item"><span class="legend-dot" style="background:#faad14"></span>地标广场</div>
      </div>

      <!-- 图层切换 -->
      <div class="map-controls-right">
        <button class="control-btn active" id="vectorBtn" title="矢量地图">🗺️</button>
        <button class="control-btn" id="satelliteBtn" title="卫星地图">🛰️</button>
        <button class="control-btn" id="locateBtn" title="定位">📍</button>
      </div>

      <!-- 图层指示 -->
      <div class="layer-indicator" id="layer-indicator">🗺️ 矢量地图</div>
    </div>
  </div>

  <!-- 建筑详情底部面板 -->
  <div id="detail-panel" class="detail-hidden">
    <div id="detail-content"></div>
    <button id="detail-close">&times;</button>
  </div>

  <!-- 高德地图 JS API -->
  <script>
    window._AMapSecurityConfig = {
      securityJsCode: 'a596b54c4cf3f4bda610e07acf349c95'
    };
  </script>
  <script src="https://webapi.amap.com/maps?v=2.0&key=5001e1f6633447cc4b019a5c703970d2"></script>
  <script src="js/data.js"></script>
  <script src="js/api.js"></script>
  <script src="js/search.js"></script>
  <script src="js/map.js"></script>
</body>
</html>

```

---

## calibrator.html

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>坐标校准器 - 云师大校园地图</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Microsoft YaHei", sans-serif; height: 100vh; display: flex; }

    /* 侧边栏 */
    .sidebar {
      width: 360px; min-width: 360px; height: 100vh;
      display: flex; flex-direction: column;
      background: #1a1a2e; color: #eee;
    }
    .sidebar-header {
      padding: 16px; background: #16213e;
      border-bottom: 1px solid #0f3460;
    }
    .sidebar-header h1 { font-size: 18px; margin-bottom: 4px; }
    .sidebar-header p { font-size: 11px; color: #8899aa; }

    .toolbar {
      display: flex; gap: 6px; padding: 10px 16px;
      background: #16213e; border-bottom: 1px solid #0f3460;
      flex-wrap: wrap;
    }
    .toolbar button {
      padding: 7px 12px; border: 1px solid #0f3460; border-radius: 6px;
      background: #1a1a2e; color: #ccc; font-size: 12px; cursor: pointer;
      transition: all 0.15s;
    }
    .toolbar button:hover { background: #0f3460; color: white; }
    .toolbar button.primary { background: #e94560; border-color: #e94560; color: white; }
    .toolbar button.primary:hover { background: #ff6b81; }
    .toolbar button.success { background: #0f9b58; border-color: #0f9b58; color: white; }

    .search-box { padding: 10px 16px; }
    .search-box input {
      width: 100%; padding: 8px 12px; border-radius: 6px;
      border: 1px solid #0f3460; background: #16213e; color: white;
      font-size: 13px; outline: none;
    }
    .search-box input:focus { border-color: #e94560; }

    .stats { padding: 6px 16px; font-size: 11px; color: #8899aa; }

    .building-list {
      flex: 1; overflow-y: auto; padding: 0 12px 12px;
    }
    .building-list::-webkit-scrollbar { width: 4px; }
    .building-list::-webkit-scrollbar-thumb { background: #0f3460; border-radius: 4px; }

    .building-item {
      display: flex; align-items: center; gap: 10px;
      padding: 10px 12px; margin-bottom: 4px;
      border-radius: 8px; cursor: pointer;
      transition: all 0.15s; border: 1px solid transparent;
      background: #16213e;
    }
    .building-item:hover { border-color: #0f3460; background: #1a2744; }
    .building-item.selected { border-color: #e94560; background: #1a1025; }

    .item-color {
      width: 12px; height: 12px; border-radius: 50%; flex-shrink: 0;
    }
    .item-info { flex: 1; min-width: 0; }
    .item-name { font-size: 13px; font-weight: 500; }
    .item-coords { font-size: 10px; color: #8899aa; margin-top: 2px; }
    .item-cat {
      font-size: 10px; padding: 2px 6px; border-radius: 4px;
      color: white; white-space: nowrap;
    }
    .item-dirty { color: #faad14; font-size: 10px; margin-left: 4px; }

    .map-wrap { flex: 1; position: relative; }

    /* 坐标信息浮层 */
    .coord-info {
      position: absolute; bottom: 16px; left: 16px; z-index: 100;
      background: rgba(0,0,0,0.8); color: white; padding: 8px 14px;
      border-radius: 8px; font-size: 12px; font-family: monospace;
      pointer-events: none;
    }

    /* 新增模式提示 */
    .add-mode-hint {
      display: none; position: absolute; top: 16px; left: 50%;
      transform: translateX(-50%); z-index: 100;
      background: #e94560; color: white; padding: 10px 20px;
      border-radius: 20px; font-size: 14px; font-weight: 500;
      box-shadow: 0 4px 20px rgba(233,69,96,0.4);
    }
    .add-mode-hint.active { display: block; }

    /* 编辑弹窗 */
    .modal-overlay {
      display: none; position: fixed; inset: 0; z-index: 9999;
      background: rgba(0,0,0,0.6); justify-content: center; align-items: center;
    }
    .modal-overlay.active { display: flex; }
    .modal {
      background: #1a1a2e; border: 1px solid #0f3460; border-radius: 12px;
      padding: 24px; width: 400px; max-width: 90vw; color: #eee;
    }
    .modal h2 { margin-bottom: 16px; font-size: 18px; }
    .modal label { display: block; font-size: 12px; color: #8899aa; margin-bottom: 4px; margin-top: 10px; }
    .modal input, .modal select, .modal textarea {
      width: 100%; padding: 8px 12px; border-radius: 6px;
      border: 1px solid #0f3460; background: #16213e; color: white;
      font-size: 13px;
    }
    .modal textarea { resize: vertical; min-height: 60px; }
    .modal-buttons { display: flex; gap: 8px; margin-top: 16px; justify-content: flex-end; }
    .modal-buttons button {
      padding: 8px 16px; border-radius: 6px; border: none; cursor: pointer; font-size: 13px;
    }
    .btn-cancel { background: #333; color: #ccc; }
    .btn-save { background: #e94560; color: white; }
    .btn-delete { background: #c0392b; color: white; margin-right: auto; }

    .toast {
      position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%);
      background: #0f9b58; color: white; padding: 10px 24px; border-radius: 20px;
      z-index: 9999; font-size: 14px; animation: fadeInOut 2.5s ease;
    }
    @keyframes fadeInOut {
      0% { opacity: 0; transform: translateX(-50%) translateY(10px); }
      15% { opacity: 1; transform: translateX(-50%) translateY(0); }
      75% { opacity: 1; }
      100% { opacity: 0; }
    }

    @media (max-width: 768px) {
      body { flex-direction: column; }
      .sidebar { width: 100%; min-width: 100%; height: 40vh; }
      .map-wrap { height: 60vh; }
    }
  </style>
</head>
<body>
  <div class="sidebar">
    <div class="sidebar-header">
      <h1>🎯 坐标校准器</h1>
      <p>拖拽标注 = 更新坐标 | 点击地图 = 新增 | 导出保存</p>
    </div>

    <div class="toolbar">
      <button class="primary" onclick="enterAddMode()" title="在地图上点击放置新建筑">＋ 新增建筑</button>
      <button onclick="importJSON()">📥 导入</button>
      <button class="success" onclick="exportJSON()">📤 导出</button>
      <button onclick="resetAll()" title="放弃所有未保存修改">↺ 还原</button>
    </div>

    <div class="search-box">
      <input type="text" id="searchInput" placeholder="🔍 搜索建筑..." oninput="filterList()">
    </div>

    <div class="stats" id="stats">共 0 栋建筑</div>

    <div class="building-list" id="buildingList"></div>
  </div>

  <div class="map-wrap" id="mapWrap">
    <div class="coord-info" id="coordInfo">鼠标移动查看坐标</div>
    <div class="add-mode-hint" id="addModeHint">👆 在地图上点击放置新建筑 (ESC取消)</div>
  </div>

  <!-- 编辑弹窗 -->
  <div class="modal-overlay" id="modalOverlay">
    <div class="modal" id="modal">
      <h2 id="modalTitle">编辑建筑</h2>
      <label>名称</label>
      <input type="text" id="editName">
      <label>分类</label>
      <select id="editCategory">
        <option value="teaching">教学楼</option>
        <option value="canteen">食堂</option>
        <option value="dormitory">宿舍楼</option>
        <option value="landmark">地标广场</option>
        <option value="sports">体育场馆</option>
        <option value="office">行政楼</option>
        <option value="library">图书馆</option>
        <option value="other">其他</option>
      </select>
      <label>简介</label>
      <textarea id="editDesc"></textarea>
      <label>标签（逗号分隔）</label>
      <input type="text" id="editTags" placeholder="食堂, 西区">
      <label>坐标</label>
      <input type="text" id="editCoords" readonly style="color:#8899aa;font-family:monospace;">
      <div class="modal-buttons">
        <button class="btn-delete" id="btnDelete" onclick="deleteBuilding()">🗑 删除</button>
        <button class="btn-cancel" onclick="closeModal()">取消</button>
        <button class="btn-save" onclick="saveEdit()">保存</button>
      </div>
    </div>
  </div>

  <script>
    window._AMapSecurityConfig = { securityJsCode: 'a596b54c4cf3f4bda610e07acf349c95' };
  </script>
  <script src="https://webapi.amap.com/maps?v=2.0&key=5001e1f6633447cc4b019a5c703970d2"></script>
  <script src="js/data.js"></script>
  <script>
    // ============================================
    // 坐标校准器主逻辑
    // ============================================

    const CAT_COLORS = {
      teaching: '#1890ff', canteen: '#fa8c16', dormitory: '#52c41a',
      landmark: '#faad14', sports: '#f5222d', office: '#8c8c8c',
      library: '#722ed1', other: '#d9d9d9'
    };
    const CAT_LABELS = {
      teaching: '教学楼', canteen: '食堂', dormitory: '宿舍楼',
      landmark: '地标广场', sports: '体育场馆', office: '行政楼',
      library: '图书馆', other: '其他'
    };

    let map;
    let markers = [];         // { building, marker }
    let buildings = [];       // 当前编辑中的数据（深拷贝）
    let originalData = '';    // 原始 JSON 字符串，用于还原
    let selectedId = null;
    let addMode = false;
    let addClickHandlerFn = null;  // 具名函数引用，用于正确移除监听

    // ── 初始化 ──
    function init() {
      // 尝试从 EMBEDDED_BUILDINGS 加载
      if (typeof EMBEDDED_BUILDINGS !== 'undefined') {
        buildings = JSON.parse(JSON.stringify(EMBEDDED_BUILDINGS));
      } else {
        buildings = [];
      }
      // 统一 id 字段
      buildings.forEach(b => { if (!b.id && b._id) b.id = b._id; });
      originalData = JSON.stringify(buildings);

      map = new AMap.Map('mapWrap', {
        center: [102.8500, 24.8600],
        zoom: 16,
        mapStyle: 'amap://styles/light'
      });

      // 鼠标移动显示坐标
      map.on('mousemove', e => {
        document.getElementById('coordInfo').textContent =
          `lng: ${e.lnglat.lng.toFixed(6)}  lat: ${e.lnglat.lat.toFixed(6)}`;
      });

      renderAllMarkers();
      renderList();
      updateStats();
    }

    // ── 渲染所有标注 ──
    function renderAllMarkers() {
      markers.forEach(m => m.marker.setMap(null));
      markers = [];

      buildings.forEach(b => {
        if (typeof b.lng !== 'number' || typeof b.lat !== 'number') return;
        const color = CAT_COLORS[b.category] || CAT_COLORS.other;

        const marker = new AMap.Marker({
          position: [b.lng, b.lat],
          title: b.name,
          draggable: true,
          icon: new AMap.Icon({
            size: new AMap.Size(28, 36),
            imageSize: new AMap.Size(28, 36),
            image: createMarkerSVG(color)
          }),
          zIndex: b.id === selectedId ? 200 : 100
        });

        // 点击标注 → 选中
        marker.on('click', () => selectBuilding(b.id));

        // 拖拽结束 → 更新坐标
        marker.on('dragend', () => {
          const pos = marker.getPosition();
          b.lng = pos.lng;
          b.lat = pos.lat;
          renderList();
          updateStats();
          highlightDirty(b.id);
        });

        marker.setLabel({
          content: `<div style="background:white;padding:2px 6px;border-radius:3px;font-size:10px;white-space:nowrap;box-shadow:0 1px 4px rgba(0,0,0,0.2);">${b.name}</div>`,
          direction: 'top',
          offset: new AMap.Pixel(0, -10)
        });

        marker.setMap(map);
        markers.push({ building: b, marker });
      });
    }

    function createMarkerSVG(color) {
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="36" viewBox="0 0 28 36">
        <path d="M14 0C6.268 0 0 6.268 0 14c0 10.5 14 22 14 22s14-11.5 14-22C28 6.268 21.732 0 14 0z" fill="${color}"/>
        <circle cx="14" cy="14" r="5" fill="white"/>
      </svg>`;
      return 'data:image/svg+xml;base64,' + btoa(encodeURIComponent(svg).replace(/%([0-9A-F]{2})/g, (_, p1) => String.fromCharCode('0x' + p1)));
    }

    // ── 侧边栏列表 ──
    function renderList(filter) {
      const container = document.getElementById('buildingList');
      let list = buildings;
      if (filter) {
        const kw = filter.toLowerCase();
        list = buildings.filter(b => b.name.toLowerCase().includes(kw));
      }

      container.innerHTML = list.map(b => {
        const color = CAT_COLORS[b.category] || CAT_COLORS.other;
        const catLabel = CAT_LABELS[b.category] || '其他';
        const isSelected = b.id === selectedId;
        return `
          <div class="building-item ${isSelected ? 'selected' : ''}"
               onclick="selectBuilding('${b.id}')"
               ondblclick="openEdit('${b.id}')">
            <span class="item-color" style="background:${color}"></span>
            <div class="item-info">
              <div class="item-name">${b.name}</div>
              <div class="item-coords">${b.lng.toFixed(6)}, ${b.lat.toFixed(6)}</div>
            </div>
            <span class="item-cat" style="background:${color}">${catLabel}</span>
          </div>
        `;
      }).join('');
    }

    function filterList() {
      const kw = document.getElementById('searchInput').value;
      renderList(kw);
    }

    function updateStats() {
      const changed = buildings.filter(b => {
        const orig = JSON.parse(originalData).find(o => o.id === b.id);
        return orig && (orig.lng !== b.lng || orig.lat !== b.lat);
      }).length;
      document.getElementById('stats').textContent =
        `共 ${buildings.length} 栋建筑` + (changed > 0 ? ` · ${changed} 栋已修改` : '');
    }

    function highlightDirty(id) {
      const items = document.querySelectorAll('.building-item');
      items.forEach(el => {
        if (el.querySelector('.item-name')?.textContent === buildings.find(b => b.id === id)?.name) {
          const coordsEl = el.querySelector('.item-coords');
          if (coordsEl && !coordsEl.querySelector('.item-dirty')) {
            coordsEl.innerHTML += '<span class="item-dirty">●已修改</span>';
          }
        }
      });
    }

    // ── 选中建筑 ──
    function selectBuilding(id) {
      selectedId = id;
      const b = buildings.find(b => b.id === id);
      if (!b) return;

      map.setZoomAndCenter(18, [b.lng, b.lat]);
      renderList(document.getElementById('searchInput').value || null);

      // 高亮标注
      markers.forEach(({ building, marker }) => {
        const color = CAT_COLORS[building.category] || CAT_COLORS.other;
        marker.setIcon(new AMap.Icon({
          size: new AMap.Size(28, 36),
          imageSize: new AMap.Size(28, 36),
          image: createMarkerSVG(building.id === id ? '#e94560' : color)
        }));
        marker.setzIndex(building.id === id ? 200 : 100);
      });
    }

    // ── 编辑弹窗 ──
    function openEdit(id) {
      const b = buildings.find(b => b.id === id);
      if (!b) return;
      document.getElementById('modalTitle').textContent = '编辑建筑';
      document.getElementById('editName').value = b.name;
      document.getElementById('editCategory').value = b.category || 'other';
      document.getElementById('editDesc').value = b.description || '';
      document.getElementById('editTags').value = (b.tags || []).join(', ');
      document.getElementById('editCoords').value = `${b.lng.toFixed(6)}, ${b.lat.toFixed(6)}`;
      document.getElementById('btnDelete').style.display = 'block';
      document.getElementById('modalOverlay').classList.add('active');
      document.getElementById('modalOverlay').dataset.editId = id;
    }

    function closeModal() {
      document.getElementById('modalOverlay').classList.remove('active');
    }

    function saveEdit() {
      const id = document.getElementById('modalOverlay').dataset.editId;
      const b = buildings.find(b => b.id === id);
      if (!b) return;

      b.name = document.getElementById('editName').value.trim() || b.name;
      b.category = document.getElementById('editCategory').value;
      b.description = document.getElementById('editDesc').value.trim();
      b.tags = document.getElementById('editTags').value.split(',').map(t => t.trim()).filter(Boolean);

      closeModal();
      renderAllMarkers();
      renderList(document.getElementById('searchInput').value || null);
      selectBuilding(id);
      updateStats();
      showToast('✅ 已更新');
    }

    function deleteBuilding() {
      const id = document.getElementById('modalOverlay').dataset.editId;
      if (!confirm(`确定删除「${buildings.find(b => b.id === id)?.name}」？`)) return;

      buildings = buildings.filter(b => b.id !== id);
      if (selectedId === id) selectedId = null;
      closeModal();
      renderAllMarkers();
      renderList();
      updateStats();
      showToast('🗑 已删除');
    }

    // ── 新增模式 ──
    function enterAddMode() {
      if (addMode) { cancelAddMode(); return; }
      addMode = true;
      document.getElementById('addModeHint').classList.add('active');
      document.getElementById('mapWrap').style.cursor = 'crosshair';

      // 具名函数，确保能正确移除
      addClickHandlerFn = function(e) {
        // 防止 prompt 堆积——如果已有 prompt 在显示，忽略后续点击
        if (addClickHandlerFn._pending) return;
        addClickHandlerFn._pending = true;

        const name = prompt('建筑名称：');
        addClickHandlerFn._pending = false;
        if (!name) return;

        const id = 'custom-' + Date.now();
        const newBuilding = {
          id, name,
          category: 'other',
          description: '',
          lng: e.lnglat.lng,
          lat: e.lnglat.lat,
          images: [],
          tags: []
        };

        buildings.push(newBuilding);
        cancelAddMode();
        renderAllMarkers();
        renderList();
        updateStats();
        selectBuilding(id);
        openEdit(id);
        showToast('✅ 已添加：' + name);
      };

      map.on('click', addClickHandlerFn);
      document.addEventListener('keydown', escHandler);
    }

    function escHandler(e) {
      if (e.key === 'Escape') cancelAddMode();
    }

    function cancelAddMode() {
      addMode = false;
      document.getElementById('addModeHint').classList.remove('active');
      document.getElementById('mapWrap').style.cursor = '';
      if (addClickHandlerFn) { map.off('click', addClickHandlerFn); addClickHandlerFn = null; }
      document.removeEventListener('keydown', escHandler);
    }

    // ── 导入导出 ──
    function exportJSON() {
      // 清理临时字段
      const clean = buildings.map(({ id, name, category, description, lng, lat, images, tags, floors }) => {
        const obj = { id, name, category, description, lng, lat, images: images || [], tags: tags || [] };
        if (floors) obj.floors = floors;
        return obj;
      });

      const blob = new Blob([JSON.stringify(clean, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'buildings.json';
      a.click();
      URL.revokeObjectURL(url);
      showToast('📤 已导出 buildings.json');
    }

    function importJSON() {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';
      input.onchange = e => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = ev => {
          try {
            const data = JSON.parse(ev.target.result);
            if (!Array.isArray(data)) throw new Error('格式错误：需要 JSON 数组');
            buildings = data;
            buildings.forEach(b => { if (!b.id && b._id) b.id = b._id; });
            originalData = JSON.stringify(buildings);
            selectedId = null;
            renderAllMarkers();
            renderList();
            updateStats();
            showToast(`📥 已导入 ${buildings.length} 栋建筑`);
          } catch (err) {
            alert('导入失败：' + err.message);
          }
        };
        reader.readAsText(file);
      };
      input.click();
    }

    function resetAll() {
      if (!confirm('确定还原到初始数据？所有未导出修改将丢失。')) return;
      buildings = JSON.parse(originalData);
      selectedId = null;
      renderAllMarkers();
      renderList();
      updateStats();
      showToast('↺ 已还原');
    }

    function showToast(msg) {
      const toast = document.createElement('div');
      toast.className = 'toast';
      toast.textContent = msg;
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 2500);
    }

    // 双击列表项编辑
    document.getElementById('modalOverlay').addEventListener('click', e => {
      if (e.target === e.currentTarget) closeModal();
    });

    window.onload = init;
  </script>
</body>
</html>

```

---

## admin.html

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>后台管理 - 云师大校园地图</title>
  <link rel="stylesheet" href="css/style.css">
  <style>
    /* 管理页独有样式 */
    body { background: #f5f5f5; }
    .admin-container { max-width: 1100px; margin: 0 auto; padding: 20px; }

    /* 登录页 */
    #login-page {
      max-width: 360px;
      margin: 100px auto;
      background: white;
      padding: 40px;
      border-radius: 16px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.08);
    }
    #login-page h1 { text-align: center; margin-bottom: 24px; color: #333; }
    .form-group { margin-bottom: 16px; }
    .form-group label { display: block; margin-bottom: 6px; font-weight: 500; color: #555; }
    .form-group input {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid #ddd;
      border-radius: 8px;
      font-size: 14px;
    }
    .form-group input:focus { border-color: #1890ff; outline: none; }
    .btn-login {
      width: 100%;
      padding: 12px;
      background: #1890ff;
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 15px;
      cursor: pointer;
      margin-top: 8px;
    }
    .btn-login:hover { background: #40a9ff; }
    .login-error { color: #ff4d4f; text-align: center; margin-top: 12px; display: none; }

    /* 管理界面 */
    #admin-page { display: none; }
    .admin-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 0;
      border-bottom: 1px solid #eee;
      margin-bottom: 24px;
    }
    .admin-header h1 { font-size: 20px; }
    .btn-logout { background: #f0f0f0; border: none; padding: 8px 16px; border-radius: 8px; cursor: pointer; }

    .admin-layout { display: grid; grid-template-columns: 240px 1fr; gap: 24px; }

    .building-list {
      background: white;
      border-radius: 12px;
      padding: 16px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.06);
      max-height: 70vh;
      overflow-y: auto;
    }

    .building-list-item {
      padding: 10px 12px;
      border-radius: 8px;
      cursor: pointer;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 4px;
    }
    .building-list-item:hover { background: #f0f5ff; }
    .building-list-item.active { background: #e6f7ff; border-left: 3px solid #1890ff; }
    .building-list-item .delete-btn {
      background: none;
      border: none;
      color: #ff4d4f;
      cursor: pointer;
      font-size: 16px;
      opacity: 0;
      transition: opacity 0.2s;
    }
    .building-list-item:hover .delete-btn { opacity: 1; }

    .btn-add {
      width: 100%;
      padding: 10px;
      border: 2px dashed #ddd;
      background: none;
      border-radius: 8px;
      cursor: pointer;
      color: #999;
      margin-top: 8px;
    }
    .btn-add:hover { border-color: #1890ff; color: #1890ff; }

    .edit-panel {
      background: white;
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.06);
    }

    .edit-panel .form-group textarea {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid #ddd;
      border-radius: 8px;
      font-size: 14px;
      resize: vertical;
      min-height: 100px;
    }

    .edit-panel .form-group select {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid #ddd;
      border-radius: 8px;
      font-size: 14px;
      background: white;
    }

    .btn-row { display: flex; gap: 12px; margin-top: 16px; }
    .btn-save { flex: 1; padding: 10px; background: #52c41a; color: white; border: none; border-radius: 8px; cursor: pointer; }
    .btn-cancel { flex: 1; padding: 10px; background: #f0f0f0; border: none; border-radius: 8px; cursor: pointer; }
    .btn-save:hover { background: #73d13d; }

    .coords-row { display: flex; gap: 12px; }
    .coords-row input { flex: 1; }

    /* 标签编辑 */
    .tags-input-wrapper { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 6px; }
    .tag-editable {
      display: inline-flex;
      align-items: center;
      background: #f0f0f0;
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 12px;
      gap: 4px;
    }
    .tag-editable .tag-remove { cursor: pointer; color: #999; }
    .tag-editable .tag-remove:hover { color: #ff4d4f; }

    .section-title { font-size: 16px; font-weight: 600; margin: 20px 0 12px; padding-top: 16px; border-top: 1px solid #eee; }

    /* 菜单编辑器 */
    .stall-block {
      background: #fafafa;
      padding: 12px;
      border-radius: 8px;
      margin-bottom: 12px;
    }
    .menu-item-row { display: flex; gap: 8px; align-items: center; margin-bottom: 6px; }
    .menu-item-row input { flex: 1; padding: 6px; border: 1px solid #ddd; border-radius: 6px; font-size: 13px; }
    .menu-item-row input.price-input { flex: 0 0 80px; }
    .btn-small {
      padding: 4px 10px;
      font-size: 12px;
      border-radius: 6px;
      border: none;
      cursor: pointer;
    }
    .btn-small-add { background: #1890ff; color: white; }
    .btn-small-del { background: #ff4d4f; color: white; }

    .toast-success {
      position: fixed;
      bottom: 40px;
      left: 50%;
      transform: translateX(-50%);
      background: #52c41a;
      color: white;
      padding: 10px 24px;
      border-radius: 20px;
      font-size: 14px;
      z-index: 9999;
      animation: fadeInOut 2s ease;
    }

    @media (max-width: 768px) {
      .admin-layout { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>
  <!-- 登录页 -->
  <div id="login-page">
    <h1>🏫 后台管理</h1>
    <div class="form-group">
      <label>用户名</label>
      <input type="text" id="login-username" placeholder="请输入用户名">
    </div>
    <div class="form-group">
      <label>密码</label>
      <input type="password" id="login-password" placeholder="请输入密码">
    </div>
    <button class="btn-login" onclick="doLogin()">登录</button>
    <p class="login-error" id="login-error">用户名或密码错误</p>
  </div>

  <!-- 管理界面 -->
  <div id="admin-page">
    <div class="admin-container">
      <div class="admin-header">
        <h1>🏫 云师大校园地图后台</h1>
        <div>
          <a href="/" style="margin-right:16px;color:#1890ff;text-decoration:none;">← 回到地图</a>
          <button class="btn-logout" onclick="doLogout()">退出</button>
        </div>
      </div>

      <div class="admin-layout">
        <!-- 左侧建筑列表 -->
        <div>
          <div class="building-list" id="building-list"></div>
          <button class="btn-add" onclick="newBuilding()">+ 新增建筑</button>
        </div>

        <!-- 右侧编辑面板 -->
        <div class="edit-panel" id="edit-panel">
          <p style="color:#999;">← 从左侧选择一栋建筑开始编辑</p>
        </div>
      </div>
    </div>
  </div>

  <script src="js/api.js"></script>
  <script src="js/admin.js"></script>
</body>
</html>

```

---

## css/style.css

```css
/* ============================================
   云师大校园地图 — 样式
   ============================================ */

/* ── 基础重置 ── */
* { margin: 0; padding: 0; box-sizing: border-box; }

html, body {
  width: 100%; height: 100%;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Microsoft YaHei", sans-serif;
  overflow: hidden;
}

/* ── 主布局：侧边栏 + 地图 ── */
.main-container {
  display: flex;
  width: 100%; height: 100%;
}

/* ============================================
   侧边栏
   ============================================ */
.sidebar {
  width: 380px;
  min-width: 380px;
  height: 100%;
  background: #f5f6f8;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  z-index: 10;
  box-shadow: 2px 0 12px rgba(0,0,0,0.06);
}

/* ── 学校简介 ── */
.intro-section {
  background: linear-gradient(135deg, #1565c0 0%, #0d47a1 100%);
  color: white;
  padding: 18px 20px;
  flex-shrink: 0;
}

.intro-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;
}

.intro-icon {
  width: 44px; height: 44px;
  background: rgba(255,255,255,0.2);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  flex-shrink: 0;
}

.intro-header h2 { font-size: 16px; font-weight: 600; }
.intro-header p { font-size: 11px; opacity: 0.85; }

.intro-desc {
  font-size: 12px;
  line-height: 1.7;
  opacity: 0.92;
  margin-bottom: 12px;
}

.intro-stats {
  display: flex;
  gap: 10px;
}

.stat-item {
  flex: 1;
  text-align: center;
  background: rgba(255,255,255,0.13);
  padding: 8px 4px;
  border-radius: 8px;
}

.stat-num { font-size: 18px; font-weight: 700; }
.stat-label { font-size: 10px; opacity: 0.85; margin-top: 2px; }

/* ── 搜索框 ── */
.search-box {
  padding: 12px 16px;
  background: white;
  border-bottom: 1px solid #eee;
  flex-shrink: 0;
  position: relative;
}

#search-input {
  width: 100%;
  padding: 10px 14px;
  border: 2px solid #e8e8e8;
  border-radius: 10px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
}

#search-input:focus { border-color: #1565c0; }

#search-results {
  display: none;
  position: absolute;
  top: calc(100% - 4px);
  left: 16px;
  right: 16px;
  background: white;
  border-radius: 0 0 10px 10px;
  box-shadow: 0 6px 20px rgba(0,0,0,0.12);
  list-style: none;
  overflow: hidden;
  max-height: 240px;
  overflow-y: auto;
  z-index: 100;
}

#search-results.show { display: block; }

#search-results li {
  padding: 10px 14px;
  cursor: pointer;
  border-bottom: 1px solid #f5f5f5;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  transition: background 0.15s;
}

#search-results li:hover { background: #f0f5ff; }

#search-results li .result-name { font-weight: 500; flex: 1; }

#search-results li .result-category {
  font-size: 11px;
  color: #999;
}

/* ── 分类标签 ── */
.category-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 12px 16px;
  background: white;
  border-bottom: 1px solid #eee;
  flex-shrink: 0;
}

.cat-tab {
  padding: 6px 12px;
  border: 1.5px solid #e0e0e0;
  border-radius: 18px;
  background: white;
  font-size: 12px;
  cursor: pointer;
  color: #666;
  transition: all 0.2s;
  white-space: nowrap;
}

.cat-tab:hover { border-color: #1565c0; color: #1565c0; }

.cat-tab.active {
  background: #1565c0;
  color: white;
  border-color: #1565c0;
}

/* ── 建筑卡片列表 ── */
.cards-container {
  flex: 1;
  overflow-y: auto;
  padding: 10px 16px 16px;
}

.cards-container::-webkit-scrollbar { width: 5px; }
.cards-container::-webkit-scrollbar-thumb { background: #ccc; border-radius: 10px; }

.cards-loading {
  text-align: center;
  padding: 40px;
  color: #999;
  font-size: 14px;
}

/* 分类小标题 */
.category-section-title {
  font-size: 12px;
  font-weight: 600;
  color: #999;
  padding: 8px 4px 6px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* 单张卡片 */
.building-card {
  background: white;
  border-radius: 10px;
  padding: 14px;
  margin-bottom: 8px;
  cursor: pointer;
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
  transition: all 0.2s;
  border-left: 4px solid transparent;
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.building-card:hover {
  transform: translateX(3px);
  box-shadow: 0 3px 12px rgba(0,0,0,0.08);
}

.building-card.active-card {
  border-left-color: #1565c0;
  background: #f0f5ff;
  box-shadow: 0 2px 10px rgba(21,101,192,0.12);
}

/* 卡片分类色条 */
.building-card.cat-teaching { border-left-color: #1890ff; }
.building-card.cat-canteen  { border-left-color: #fa8c16; }
.building-card.cat-dormitory { border-left-color: #52c41a; }
.building-card.cat-landmark  { border-left-color: #faad14; }
.building-card.cat-sports    { border-left-color: #f5222d; }
.building-card.cat-office    { border-left-color: #8c8c8c; }
.building-card.cat-library   { border-left-color: #722ed1; }

.card-icon-wrap {
  width: 40px; height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
}

.card-icon-wrap.cat-teaching { background: #e6f7ff; }
.card-icon-wrap.cat-canteen  { background: #fff7e6; }
.card-icon-wrap.cat-dormitory { background: #f6ffed; }
.card-icon-wrap.cat-landmark  { background: #fffbe6; }
.card-icon-wrap.cat-sports    { background: #fff1f0; }
.card-icon-wrap.cat-office    { background: #f5f5f5; }
.card-icon-wrap.cat-library   { background: #f9f0ff; }

.card-info { flex: 1; min-width: 0; }

.card-title {
  font-size: 14px;
  font-weight: 600;
  color: #222;
  margin-bottom: 2px;
}

.card-category {
  display: inline-block;
  font-size: 10px;
  padding: 1px 8px;
  border-radius: 10px;
  color: white;
  margin-bottom: 4px;
}

.card-desc {
  font-size: 12px;
  color: #888;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 6px;
}

.card-tag {
  font-size: 10px;
  background: #f0f0f0;
  color: #888;
  padding: 2px 6px;
  border-radius: 4px;
}

.card-arrow {
  color: #ccc;
  font-size: 14px;
  align-self: center;
  flex-shrink: 0;
}

/* ── 无结果 ── */
.no-results {
  text-align: center;
  padding: 30px;
  color: #bbb;
  font-size: 13px;
}

/* ============================================
   地图区域
   ============================================ */
#map-container {
  flex: 1;
  height: 100%;
  position: relative;
}

/* ── 图例 ── */
.map-legend {
  position: absolute;
  bottom: 24px;
  left: 12px;
  z-index: 100;
  background: white;
  padding: 10px 14px;
  border-radius: 10px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.12);
}

.legend-title {
  font-size: 11px;
  font-weight: 600;
  color: #333;
  margin-bottom: 6px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 3px;
  font-size: 11px;
  color: #666;
}

.legend-dot {
  width: 10px; height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

/* ── 右侧控制按钮组 ── */
.map-controls-right {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 100;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.control-btn {
  width: 38px; height: 38px;
  border: none;
  border-radius: 10px;
  background: white;
  box-shadow: 0 2px 10px rgba(0,0,0,0.12);
  font-size: 17px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.control-btn:hover { transform: scale(1.06); }

.control-btn.active {
  background: #1565c0;
  color: white;
}

/* ── 图层指示 ── */
.layer-indicator {
  position: absolute;
  top: 12px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 100;
  background: white;
  padding: 6px 14px;
  border-radius: 16px;
  font-size: 12px;
  color: #555;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

/* ============================================
   底部详情面板（保留）
   ============================================ */
#detail-panel {
  position: fixed;
  bottom: 0;
  left: 380px;
  right: 0;
  z-index: 1000;
  background: white;
  border-radius: 20px 20px 0 0;
  box-shadow: 0 -4px 20px rgba(0,0,0,0.1);
  padding: 24px 20px 32px;
  max-height: 55vh;
  overflow-y: auto;
  transition: transform 0.3s ease;
}

.detail-hidden { transform: translateY(100%); }
.detail-visible { transform: translateY(0); }

#detail-close {
  position: absolute;
  top: 16px;
  right: 16px;
  background: #f0f0f0;
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.detail-header { margin-bottom: 16px; }

.category-badge {
  display: inline-block;
  color: white;
  padding: 2px 10px;
  border-radius: 12px;
  font-size: 12px;
  margin-bottom: 8px;
}

.detail-header h2 { font-size: 22px; }

.detail-images { margin-bottom: 12px; }
.detail-image { width: 100%; border-radius: 12px; margin-bottom: 8px; }

.detail-tags { margin-bottom: 12px; }

.tag {
  display: inline-block;
  background: #f0f0f0;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  margin-right: 6px;
  margin-bottom: 4px;
  color: #666;
}

.detail-desc { color: #333; line-height: 1.7; margin-bottom: 16px; }

.detail-info-section {
  background: #f7f8fa;
  border-radius: 10px;
  padding: 12px 14px;
  margin-bottom: 14px;
}

.detail-info {
  font-size: 13px;
  color: #555;
  padding: 4px 0;
  line-height: 1.6;
}

.detail-info .info-label {
  font-weight: 600;
  color: #333;
  margin-right: 4px;
}

.btn-primary {
  width: 100%;
  padding: 12px;
  background: #1890ff;
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-primary:hover { background: #40a9ff; }

.detail-nav-btns {
  display: flex;
  gap: 10px;
  margin-bottom: 8px;
}

.detail-nav-btns .btn-primary { flex: 1; }

.btn-outline {
  flex: 1;
  padding: 12px;
  background: white;
  color: #1890ff;
  border: 1.5px solid #1890ff;
  border-radius: 12px;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-outline:hover { background: #e6f7ff; }

.btn-text {
  width: 100%;
  padding: 8px;
  background: none;
  color: #999;
  border: none;
  font-size: 13px;
  cursor: pointer;
}

.btn-text:hover { color: #ff4d4f; }

/* 路线 Toast */
.route-toast {
  position: fixed;
  bottom: 80px;
  left: 50%;
  transform: translateX(-50%);
  background: #333;
  color: white;
  padding: 10px 20px;
  border-radius: 20px;
  font-size: 14px;
  z-index: 9999;
  white-space: nowrap;
  animation: fadeInOut 4s ease;
}

/* 食堂菜单样式 */
.canteen-floor {
  margin-bottom: 16px;
  padding: 12px;
  background: #fafafa;
  border-radius: 12px;
}

.canteen-floor h4 { margin-bottom: 8px; color: #333; }

.stall { margin-bottom: 8px; }

.stall-name {
  font-weight: 500;
  font-size: 13px;
  color: #fa8c16;
  padding-bottom: 4px;
  border-bottom: 1px solid #eee;
  margin-bottom: 4px;
}

.menu-item {
  display: flex;
  justify-content: space-between;
  padding: 4px 0;
  font-size: 14px;
}

.price { font-weight: 500; color: #f5222d; }

/* 起终点按钮 */
.detail-route-section {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
}

.btn-start, .btn-end {
  flex: 1;
  padding: 10px;
  border-radius: 10px;
  font-size: 13px;
  cursor: pointer;
  border: 1.5px dashed #bbb;
  background: #fafafa;
  transition: all 0.2s;
}

.btn-start:hover { border-color: #1890ff; background: #e6f7ff; }
.btn-end:hover { border-color: #f5222d; background: #fff1f0; }

/* 路线浮动条 */
#route-bar {
  display: none;
  position: fixed;
  top: 12px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1001;
  background: white;
  padding: 8px 14px;
  border-radius: 20px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.15);
  font-size: 13px;
  align-items: center;
  gap: 10px;
  white-space: nowrap;
}

#route-bar.active { display: flex; }

.route-info { color: #333; max-width: 260px; overflow: hidden; text-overflow: ellipsis; }

.route-actions { display: flex; gap: 6px; }

.route-mode-btn {
  padding: 5px 12px;
  border-radius: 14px;
  border: 1px solid #ddd;
  background: white;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.15s;
}

.route-mode-btn:hover { border-color: #1890ff; }

.route-mode-btn.active-mode {
  background: #1890ff;
  color: white;
  border-color: #1890ff;
}

.route-clear { color: #999; border: none; font-weight: bold; }
.route-clear:hover { color: #ff4d4f; border: none; }

/* 标注标签 */
.marker-label {
  background: white;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  white-space: nowrap;
  box-shadow: 0 1px 4px rgba(0,0,0,0.15);
}

/* Toast 错误提示 */
.toast-error {
  position: fixed;
  bottom: 80px;
  left: 50%;
  transform: translateX(-50%);
  background: #ff4d4f;
  color: white;
  padding: 10px 24px;
  border-radius: 20px;
  font-size: 14px;
  z-index: 9999;
  animation: fadeInOut 3s ease;
}

mark { background: #fff1b8; color: inherit; padding: 0 2px; border-radius: 2px; }

@keyframes fadeInOut {
  0% { opacity: 0; transform: translateX(-50%) translateY(10px); }
  10% { opacity: 1; transform: translateX(-50%) translateY(0); }
  80% { opacity: 1; }
  100% { opacity: 0; }
}

/* ============================================
   响应式
   ============================================ */
@media (max-width: 768px) {
  .main-container { flex-direction: column; }

  .sidebar {
    width: 100%;
    min-width: 100%;
    height: 45vh;
    order: 2;
  }

  #map-container {
    height: 55vh;
    order: 1;
  }

  .intro-desc { display: none; }

  #detail-panel {
    left: 0;
    max-height: 65vh;
    padding: 20px 16px 28px;
  }

  #detail-panel h2 { font-size: 20px; }

  .map-legend { bottom: 8px; left: 8px; padding: 6px 10px; }
  .map-legend .legend-item { font-size: 10px; }
}

```

---

## js/data.js

```js
// ============================================
// 校园地图静态数据（用于 GitHub Pages 等静态部署）
// 由 scripts/calibrate-coords.js 自动生成
// ============================================

const EMBEDDED_BUILDINGS = [{"id":"ynnu-mba-center","name":"MBA教育中心","category":"teaching","description":"聚贤街768号云南师范大学(呈贡校区)","lng":102.850752,"lat":24.861233,"images":[],"tags":["高等院校"]},{"id":"ynnu-economics","name":"经济与管理学院","category":"teaching","description":"云南师范大学呈贡校区内","lng":102.850573,"lat":24.861548,"images":[],"tags":["高等院校"]},{"id":"ynnu-philosophy-law","name":"哲学与政法学院","category":"teaching","description":"呈贡大学城","lng":102.850573,"lat":24.861554,"images":[],"tags":["高等院校"]},{"id":"ynnu-discipline","name":"纪检监察学院","category":"teaching","description":"梨花中路云南师范大学(呈贡校区)","lng":102.850578,"lat":24.861557,"images":[],"tags":["高等院校"]},{"id":"ynnu-career-center","name":"就业处","category":"office","description":"云南师范大学呈贡主校区大学生活动中心一楼","lng":102.850014,"lat":24.85821,"images":[],"tags":["行政"]},{"id":"ynnu-student-affairs","name":"学生处(学生工作部)","category":"office","description":"吴家营街道聚贤街768号云南师范大学呈贡校区东区工程中心三楼301室","lng":102.850105,"lat":24.858311,"images":[],"tags":["行政"]},{"id":"ynnu-career-activity-west","name":"大学生就业活动中心(西区)","category":"office","description":"秋获路云南师范大学(呈贡校区)","lng":102.850014,"lat":24.85821,"images":[],"tags":["行政","活动中心"]},{"id":"ynnu-xingjian-center","name":"启园·行健学生活动中心","category":"other","description":"景明南路云南师范大学(呈贡校区)","lng":102.850146,"lat":24.858074,"images":[],"tags":["活动中心"]},{"id":"ynnu-virtual-lab","name":"虚拟仿真实验教学中心","category":"teaching","description":"聚贤街768号云南师范大学(呈贡校区)","lng":102.852153,"lat":24.860503,"images":[],"tags":["实验中心","高等院校"]},{"id":"ynnu-foreign-lang","name":"外国语学院","category":"teaching","description":"聚贤街768号云南师范大学(呈贡校区)","lng":102.851925,"lat":24.861625,"images":[],"tags":["高等院校"]},{"id":"ynnu-huiwen-3","name":"汇文楼3区","category":"teaching","description":"春耘路与梨花中路交叉口东北100米","lng":102.847313,"lat":24.860089,"images":[],"tags":["教学楼"]},{"id":"ynnu-huiwen-4","name":"汇文楼4区","category":"teaching","description":"春耘路与梨花中路交叉口东北140米","lng":102.847325,"lat":24.860725,"images":[],"tags":["教学楼"]},{"id":"ynnu-media-college","name":"传媒学院","category":"teaching","description":"片区1号云南师范大学呈贡校区西区4栋传媒学院附近","lng":102.85067,"lat":24.862714,"images":[],"tags":["高等院校"]},{"id":"ynnu-chinese-college","name":"文学院","category":"teaching","description":"聚贤街768号云南师范大学(呈贡校区)","lng":102.850713,"lat":24.862758,"images":[],"tags":["高等院校"]},{"id":"ynnu-history-college","name":"历史学院","category":"teaching","description":"聚贤街768号云南师范大学(呈贡校区)","lng":102.850748,"lat":24.862997,"images":[],"tags":["高等院校"]},{"id":"ynnu-kindergarten","name":"附属幼儿园","category":"other","description":"聚贤街768号(云南师范大学呈贡校区内)","lng":102.8481,"lat":24.857015,"images":[],"tags":["幼儿园"]},{"id":"ynnu-qiyuan-area","name":"启园","category":"landmark","description":"春耘路学生生活区","lng":102.856117,"lat":24.862393,"images":[],"tags":["生活区","宿舍区"]},{"id":"ynnu-design-center","name":"众创设计研究中心","category":"teaching","description":"聚贤街云南师范大学(呈贡校区)","lng":102.854043,"lat":24.860292,"images":[],"tags":["科研机构"]},{"id":"ynnu-admin-building","name":"行政楼","category":"office","description":"聚贤街768号附1号","lng":102.853885,"lat":24.858814,"images":[],"tags":["行政"]},{"id":"ynnu-marxism-college","name":"马克思主义学院","category":"teaching","description":"明德楼4号楼","lng":102.850979,"lat":24.863753,"images":[],"tags":["高等院校"]},{"id":"ynnu-swimming-pool","name":"游泳馆","category":"sports","description":"聚贤街768号云南师范大学呈贡校区内","lng":102.851132,"lat":24.859364,"images":[],"tags":["游泳馆"]},{"id":"ynnu-west-gym","name":"西区体育馆","category":"sports","description":"聚贤街768号云南师范大学(呈贡校区)","lng":102.848938,"lat":24.857718,"images":[],"tags":["综合体育馆"]},{"id":"ynnu-football-field","name":"足球场","category":"sports","description":"启园北路","lng":102.847226,"lat":24.8578,"images":[],"tags":["足球场"]},{"id":"ynnu-west-stadium","name":"西区体育场","category":"sports","description":"启园北路","lng":102.846283,"lat":24.857632,"images":[],"tags":["综合体育馆"]},{"id":"ynnu-qiyuan-training","name":"启园训练馆","category":"sports","description":"启园北路","lng":102.846527,"lat":24.856683,"images":[],"tags":["运动场所"]},{"id":"ynnu-qiyuan-dorm-9","name":"启园9号学生公寓","category":"dormitory","description":"启园宿舍区","lng":102.848208,"lat":24.862544,"images":[],"tags":["宿舍"]},{"id":"ynnu-qiyuan-dorm-5","name":"启园5号学生公寓","category":"dormitory","description":"春耘路与梨花中路交叉口北220米","lng":102.846715,"lat":24.861552,"images":[],"tags":["宿舍"]},{"id":"ynnu-qiyuan-dorm-10","name":"启园10号学生公寓","category":"dormitory","description":"联大街与景明南路交叉口西南160米","lng":102.84774,"lat":24.862724,"images":[],"tags":["宿舍"]},{"id":"ynnu-mingde-4","name":"明德楼4号楼","category":"teaching","description":"呈贡校区东区","lng":102.850981,"lat":24.863753,"images":[],"tags":["教学楼"]},{"id":"ynnu-qiyuan-dorm-4","name":"启园4号学生公寓","category":"dormitory","description":"春耘路与梨花中路交叉口西北180米","lng":102.845813,"lat":24.861004,"images":[],"tags":["宿舍"]},{"id":"ynnu-qiyuan-dorm-3","name":"启园3号学生公寓","category":"dormitory","description":"聚贤街768号","lng":102.845155,"lat":24.860422,"images":[],"tags":["宿舍"]},{"id":"ynnu-qiyuan-dorm-2","name":"启园2号学生公寓","category":"dormitory","description":"启园北路与梨花中路交叉口北200米","lng":102.844905,"lat":24.861053,"images":[],"tags":["宿舍"]},{"id":"ynnu-qiyuan-dorm-1","name":"启园1号学生公寓","category":"dormitory","description":"联大街与春融东路交叉口东160米","lng":102.844692,"lat":24.8618,"images":[],"tags":["宿舍"]},{"id":"canteen-east","name":"东区食堂","category":"canteen","description":"呈贡校区东区","lng":102.859577,"lat":24.862218,"images":[],"tags":["食堂","餐饮"],"floors":[{"name":"一楼","stalls":[{"name":"盖浇饭窗口","items":[{"name":"红烧肉盖饭","price":15},{"name":"宫保鸡丁盖饭","price":13},{"name":"鱼香肉丝盖饭","price":12}]},{"name":"面食窗口","items":[{"name":"牛肉面","price":12},{"name":"炸酱面","price":10},{"name":"米线","price":8}]}]},{"name":"二楼","stalls":[{"name":"麻辣烫窗口","items":[{"name":"麻辣烫（自选）","price":18}]},{"name":"清真窗口","items":[{"name":"兰州拉面","price":12},{"name":"手抓饭","price":20}]}]}]},{"id":"ynnu-library","name":"图书馆","category":"library","description":"聚贤街768号云南师范大学呈贡校区，馆藏丰富，设有自习室","lng":102.854184,"lat":24.861987,"images":[],"tags":["图书馆","自习"]},{"id":"ynnu-hongzhu-square","name":"红烛广场","category":"landmark","description":"春耘路，校内地标广场，日常活动和集会场所","lng":102.848506,"lat":24.860144,"images":[],"tags":["广场","地标"]},{"id":"canteen-qiyuan-1","name":"启园一食堂","category":"canteen","description":"吴家营街道聚贤街1058号，西区启园一楼，人均¥14","lng":102.845743,"lat":24.861917,"images":[],"tags":["食堂","西区"],"floors":[{"name":"一楼","stalls":[]}]},{"id":"canteen-heyuan","name":"和园食堂","category":"canteen","description":"聚贤街与致远路交叉口北320米，东区，人均¥17","lng":102.859547,"lat":24.862517,"images":[],"tags":["食堂","东区"],"floors":[{"name":"","stalls":[]}]}];

```

---

## js/api.js

```js
// ============================================
// 数据层：自动检测 — 服务器可用则用 API，否则用内嵌数据
// ============================================

const API = (() => {
  // 检测是否在本地服务器环境
  let useServer = false;

  async function checkServer() {
    try {
      const res = await fetch('/api/buildings');
      if (res.ok) {
        useServer = true;
        console.log('📡 使用本地服务器数据');
        return true;
      }
    } catch (e) { /* 服务器不可用，使用内嵌数据 */ }
    console.log('📦 使用内嵌静态数据');
    return false;
  }

  // ── 服务器模式 ──
  const serverAPI = {
    async getBuildings(params = {}) {
      try {
        let url = '/api/buildings';
        const query = [];
        if (params.category) query.push(`category=${encodeURIComponent(params.category)}`);
        if (params.search) query.push(`search=${encodeURIComponent(params.search)}`);
        if (query.length) url += '?' + query.join('&');
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return await res.json();
      } catch (err) { console.error(err); return []; }
    },

    async getBuilding(id) {
      try {
        const res = await fetch(`/api/buildings/${encodeURIComponent(id)}`);
        if (!res.ok) return null;
        return await res.json();
      } catch (err) { return null; }
    },

    async getCanteens(params = {}) {
      try {
        const res = await fetch('/api/canteens');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        let canteens = await res.json();
        if (params.buildingId) canteens = canteens.filter(c => c.buildingId === params.buildingId);
        return canteens;
      } catch (err) { return []; }
    },

    async getCanteen(id) {
      try {
        const res = await fetch(`/api/canteens/${encodeURIComponent(id)}`);
        if (!res.ok) return null;
        return await res.json();
      } catch (err) { return null; }
    },

    async getAllLocations() {
      const buildings = await this.getBuildings();
      return buildings.filter(b => typeof b.lng === 'number' && typeof b.lat === 'number');
    }
  };

  // ── 静态模式 ──
  const staticAPI = {
    async getBuildings(params = {}) {
      let result = EMBEDDED_BUILDINGS;
      if (params.category) result = result.filter(b => b.category === params.category);
      if (params.search) {
        const kw = params.search.toLowerCase();
        result = result.filter(b =>
          b.name.toLowerCase().includes(kw) ||
          (b.tags || []).some(t => t.toLowerCase().includes(kw))
        );
      }
      return result;
    },

    async getBuilding(id) {
      return EMBEDDED_BUILDINGS.find(b => b.id === id || b._id === id) || null;
    },

    async getCanteens(params = {}) {
      // 食堂数据已嵌入到对应建筑的 floors 字段中
      const canteens = EMBEDDED_BUILDINGS.filter(b => b.category === 'canteen' && b.floors);
      // 转换为与服务器 API 兼容的格式（按楼层展开）
      let result = [];
      canteens.forEach(c => {
        (c.floors || []).forEach(floor => {
          result.push({
            id: `${c.id}-${floor.name}`,
            buildingId: c.id,
            name: `${c.name}${floor.name}`,
            stalls: floor.stalls || []
          });
        });
      });
      if (params.buildingId) result = result.filter(c => c.buildingId === params.buildingId);
      return result;
    },

    async getCanteen(id) {
      // 支持两种查询：按 canteen id 或按 expanded floor id
      const canteens = await this.getCanteens();
      let found = canteens.find(c => c.id === id);
      if (!found) {
        // 尝试匹配 buildingId
        found = canteens.find(c => c.buildingId === id);
      }
      return found || null;
    },

    async getAllLocations() {
      return EMBEDDED_BUILDINGS.filter(b => typeof b.lng === 'number' && typeof b.lat === 'number');
    }
  };

  // ── 初始化时检测 ──
  let _ready = false;
  let _activeAPI = staticAPI; // 默认静态

  async function init() {
    if (_ready) return;
    const serverAvailable = await checkServer();
    _activeAPI = serverAvailable ? serverAPI : staticAPI;
    _ready = true;
  }

  // 初始化（不阻塞页面加载）
  init();

  // ── 代理对象：自动路由到活跃 API ──
  return new Proxy({}, {
    get(target, prop) {
      return async (...args) => {
        await init();
        if (typeof _activeAPI[prop] === 'function') {
          return _activeAPI[prop](...args);
        }
        throw new Error(`API method not found: ${prop}`);
      };
    }
  });
})();

```

---

## js/map.js

```js
// 云师大坐标（呈贡校区）
const YNNU_CENTER = [102.8500, 24.8600];

let map;
let markers = [];
let allBuildings = [];
let walkingRoute = null;
let drivingRoute = null;
let currentPosition = null;
let routeStart = null;
let routeEnd = null;
let currentCategory = 'all';

// 分类对应图标颜色
const CATEGORY_COLORS = {
  teaching: '#1890ff',
  canteen: '#fa8c16',
  dormitory: '#52c41a',
  landmark: '#faad14',
  sports: '#f5222d',
  office: '#8c8c8c',
  library: '#722ed1',
  other: '#d9d9d9'
};

const CATEGORY_LABELS = {
  teaching: '教学楼',
  canteen: '食堂',
  dormitory: '宿舍楼',
  landmark: '地标广场',
  sports: '体育场馆',
  office: '行政楼',
  library: '图书馆',
  other: '其他'
};

const CATEGORY_ICONS = {
  teaching: '🏢',
  canteen: '🍜',
  dormitory: '🏠',
  landmark: '📍',
  sports: '⚽',
  office: '🏛️',
  library: '📚',
  other: '📌'
};

// 图层状态
let currentLayer = 'normal';

// 初始化地图
function initMap() {
  map = new AMap.Map('map-container', {
    center: YNNU_CENTER,
    zoom: 16,
    mapStyle: 'amap://styles/light'
  });

  // 加载路线规划插件
  AMap.plugin(['AMap.Walking', 'AMap.Driving', 'AMap.Geolocation'], () => {
    console.log('路线规划插件加载完成');
  });

  // 获取用户当前位置
  getCurrentPosition();

  // 加载建筑数据
  loadBuildings();

  // 绑定图层切换按钮
  bindControls();
}

// 绑定控制按钮
function bindControls() {
  document.getElementById('vectorBtn').addEventListener('click', () => switchLayer('normal'));
  document.getElementById('satelliteBtn').addEventListener('click', () => switchLayer('satellite'));
  document.getElementById('locateBtn').addEventListener('click', locateMe);

  // 分类标签
  document.querySelectorAll('.cat-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.cat-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentCategory = tab.dataset.category;
      renderBuildingCards(allBuildings);
      filterMarkers();
    });
  });

  // 关闭详情面板
  document.getElementById('detail-close').addEventListener('click', () => {
    const panel = document.getElementById('detail-panel');
    panel.classList.remove('detail-visible');
    panel.classList.add('detail-hidden');
  });
}

// 切换图层
function switchLayer(type) {
  if (currentLayer === type) return;
  currentLayer = type;

  const vBtn = document.getElementById('vectorBtn');
  const sBtn = document.getElementById('satelliteBtn');
  const indicator = document.getElementById('layer-indicator');

  if (type === 'satellite') {
    map.setLayers([
      new AMap.TileLayer.Satellite(),
      new AMap.TileLayer.RoadNet()
    ]);
    sBtn.classList.add('active');
    vBtn.classList.remove('active');
    indicator.textContent = '🛰️ 卫星地图';
  } else {
    map.setLayers([new AMap.TileLayer()]);
    vBtn.classList.add('active');
    sBtn.classList.remove('active');
    indicator.textContent = '🗺️ 矢量地图';
  }
}

let userMarker = null;
let userCircle = null;
let geolocation = null;

// 初始化高德定位
function getCurrentPosition() {
  map.plugin('AMap.Geolocation', () => {
    geolocation = new AMap.Geolocation({
      enableHighAccuracy: true,
      timeout: 10000,
      showMarker: false,
      showCircle: false,
      panToLocation: false
    });

    geolocation.getCurrentPosition((status, result) => {
      if (status === 'complete' && result.position) {
        currentPosition = [result.position.lng, result.position.lat];
        addUserMarker(currentPosition);
      } else {
        currentPosition = YNNU_CENTER;
      }
    });
  });
}

// 主动定位
function locateMe() {
  if (!geolocation) {
    if (navigator.geolocation) {
      showToast('正在定位...');
      navigator.geolocation.getCurrentPosition(
        pos => {
          currentPosition = [pos.coords.longitude, pos.coords.latitude];
          addUserMarker(currentPosition);
          map.setZoomAndCenter(17, currentPosition);
          showToast('📍 已定位到你的位置');
        },
        () => showToast('定位失败，请检查浏览器定位权限'),
        { timeout: 10000, enableHighAccuracy: true }
      );
    }
    return;
  }

  showToast('正在精确定位...');
  geolocation.getCurrentPosition((status, result) => {
    if (status === 'complete' && result.position) {
      currentPosition = [result.position.lng, result.position.lat];
      addUserMarker(currentPosition);
      map.setZoomAndCenter(17, currentPosition);
      const acc = result.accuracy ? ` (精度${result.accuracy}米)` : '';
      showToast(`📍 已定位${acc}`);
    } else {
      showToast('定位失败，请确认已授权定位权限');
    }
  });
}

// 在地图上画用户标记
function addUserMarker(pos) {
  if (userMarker) { userMarker.setMap(null); }
  userMarker = new AMap.Marker({
    position: pos,
    icon: new AMap.Icon({
      size: new AMap.Size(28, 28),
      image: 'https://webapi.amap.com/theme/v1.3/markers/n/mark_b.png',
      imageSize: new AMap.Size(28, 28)
    }),
    zIndex: 100,
    title: '我的位置（可拖拽微调）',
    anchor: 'center',
    draggable: true
  });
  userMarker.setMap(map);

  userMarker.on('dragend', () => {
    const p = userMarker.getPosition();
    currentPosition = [p.lng, p.lat];
    showToast('📍 位置已更新，可拖拽蓝点继续微调');
  });

  if (userCircle) { userCircle.setMap(null); }

  userCircle = new AMap.Circle({
    center: pos,
    radius: 50,
    strokeColor: '#1890ff',
    strokeWeight: 1,
    strokeOpacity: 0.3,
    fillColor: '#1890ff',
    fillOpacity: 0.08,
    zIndex: 99
  });
  userCircle.setMap(map);

  userMarker.on('dragging', () => { userCircle.setCenter(userMarker.getPosition()); });
  userMarker.on('dragend', () => { userCircle.setCenter(userMarker.getPosition()); });
}

// ──────────────────────────────────
// 数据加载 & 侧边栏卡片
// ──────────────────────────────────

async function loadBuildings() {
  try {
    allBuildings = await API.getAllLocations();
    renderMarkers(allBuildings);
    renderBuildingCards(allBuildings);
  } catch (err) {
    console.error('加载建筑数据失败:', err);
    showError('加载地图数据失败，请刷新页面重试');
  }
}

// 渲染侧边栏建筑卡片
function renderBuildingCards(buildings) {
  const container = document.getElementById('cards-container');

  // 按分类筛选
  let filtered = buildings;
  if (currentCategory !== 'all') {
    filtered = buildings.filter(b => b.category === currentCategory);
  }

  if (filtered.length === 0) {
    container.innerHTML = '<div class="no-results">暂无匹配的建筑</div>';
    return;
  }

  // 按分类分组
  const grouped = {};
  filtered.forEach(b => {
    const cat = b.category || 'other';
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(b);
  });

  let html = '';

  for (const [cat, items] of Object.entries(grouped)) {
    // 全部模式下显示分类标题
    if (currentCategory === 'all') {
      html += `<div class="category-section-title">${CATEGORY_ICONS[cat] || '📌'} ${CATEGORY_LABELS[cat] || cat} · ${items.length}栋</div>`;
    }

    items.forEach(b => {
      const catColor = CATEGORY_COLORS[b.category] || CATEGORY_COLORS.other;
      const catIcon = CATEGORY_ICONS[b.category] || '📌';
      const catLabel = CATEGORY_LABELS[b.category] || '其他';
      const desc = b.description || '暂无介绍';
      const tags = (b.tags || []).slice(0, 3);

      html += `
        <div class="building-card cat-${b.category || 'other'}" data-id="${b.id || b._id}" onclick="onCardClick('${b.id || b._id}')">
          <div class="card-icon-wrap cat-${b.category || 'other'}">${catIcon}</div>
          <div class="card-info">
            <div class="card-title">${b.name}</div>
            <span class="card-category" style="background:${catColor}">${catLabel}</span>
            <div class="card-desc">${desc}</div>
            ${tags.length ? `<div class="card-tags">${tags.map(t => `<span class="card-tag">${t}</span>`).join('')}</div>` : ''}
          </div>
          <span class="card-arrow">›</span>
        </div>
      `;
    });
  }

  container.innerHTML = html;
}

// 点击侧边栏卡片
function onCardClick(id) {
  const building = allBuildings.find(b => (b.id || b._id) === id);
  if (!building) return;

  // 高亮卡片
  document.querySelectorAll('.building-card').forEach(c => c.classList.remove('active-card'));
  const card = document.querySelector(`.building-card[data-id="${id}"]`);
  if (card) card.classList.add('active-card');

  // 地图飞向目标
  map.setZoomAndCenter(18, [building.lng, building.lat]);

  // 显示详情面板
  showDetail(building);
}

// ──────────────────────────────────
// 地图标注
// ──────────────────────────────────

function renderMarkers(buildings) {
  clearMarkers();
  buildings.forEach(building => {
    createMarker(building);
  });
}

function createMarker(building) {
  const color = CATEGORY_COLORS[building.category] || CATEGORY_COLORS.other;
  const marker = new AMap.Marker({
    position: [building.lng, building.lat],
    title: building.name,
    icon: new AMap.Icon({
      size: new AMap.Size(28, 36),
      imageSize: new AMap.Size(28, 36),
      image: createMarkerSVG(color)
    }),
    // 存储分类以便筛选
    extData: { category: building.category }
  });

  marker.on('click', () => {
    onCardClick(building.id || building._id);
  });

  marker.setLabel({
    content: `<div class="marker-label">${building.name}</div>`,
    direction: 'top',
    offset: new AMap.Pixel(0, -10)
  });

  marker.setMap(map);
  markers.push(marker);
}

// 按分类筛选标注
function filterMarkers() {
  markers.forEach(m => {
    const cat = m.getExtData()?.category;
    if (currentCategory === 'all' || cat === currentCategory) {
      m.show();
    } else {
      m.hide();
    }
  });
}

function createMarkerSVG(color) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="36" viewBox="0 0 28 36">
    <path d="M14 0C6.268 0 0 6.268 0 14c0 10.5 14 22 14 22s14-11.5 14-22C28 6.268 21.732 0 14 0z" fill="${color}"/>
    <circle cx="14" cy="14" r="5" fill="white"/>
  </svg>`;
  return 'data:image/svg+xml;base64,' + btoa(encodeURIComponent(svg).replace(/%([0-9A-F]{2})/g, (_, p1) => String.fromCharCode('0x' + p1)));
}

function clearMarkers() {
  markers.forEach(m => m.setMap(null));
  markers = [];
}

// ──────────────────────────────────
// 建筑详情面板
// ──────────────────────────────────

function showDetail(building) {
  const panel = document.getElementById('detail-panel');
  const content = document.getElementById('detail-content');

  const categoryLabel = CATEGORY_LABELS[building.category] || '其他';
  const tags = (building.tags || []).map(t => `<span class="tag">${t}</span>`).join('');
  const images = (building.images || []).map(img =>
    `<img src="${img}" alt="${building.name}" class="detail-image" onerror="this.style.display='none'">`
  ).join('');

  // 信息行
  let infoSection = '';
  if (building.openTime) {
    infoSection += `<div class="detail-info"><span class="info-label">🕐 开放时间</span> ${building.openTime}</div>`;
  }
  if (building.officeHours) {
    infoSection += `<div class="detail-info"><span class="info-label">🕐 办公时间</span> ${building.officeHours}</div>`;
  }
  if (building.phone) {
    infoSection += `<div class="detail-info"><span class="info-label">📞 电话</span> ${building.phone}</div>`;
  }
  if (building.services && building.services.length) {
    infoSection += `<div class="detail-info"><span class="info-label">📋 办理业务</span> ${building.services.join('、')}</div>`;
  }
  if (building.organizer) {
    infoSection += `<div class="detail-info"><span class="info-label">👤 主办</span> ${building.organizer}</div>`;
  }
  if (building.startTime) {
    infoSection += `<div class="detail-info"><span class="info-label">📅 时间</span> ${building.startTime} ~ ${building.endTime}</div>`;
  }
  if (building.capacity) {
    infoSection += `<div class="detail-info"><span class="info-label">👥 容量</span> ${building.capacity}人</div>`;
  }

  // 食堂菜单
  let extraSection = '';
  if (building.category === 'canteen') {
    extraSection = `<div class="detail-extra">
      <button class="btn-primary" onclick="loadCanteenMenu('${building.id || building._id}')">🍴 查看菜单</button>
      <div id="canteen-menu"></div>
    </div>`;
  }

  content.innerHTML = `
    <div class="detail-header">
      <span class="category-badge" style="background:${CATEGORY_COLORS[building.category]}">${categoryLabel}</span>
      <h2>${building.name}</h2>
    </div>
    ${images ? `<div class="detail-images">${images}</div>` : ''}
    <div class="detail-tags">${tags}</div>
    <p class="detail-desc">${building.description || '暂无介绍'}</p>
    ${infoSection ? `<div class="detail-info-section">${infoSection}</div>` : ''}
    ${extraSection}
    <div class="detail-route-section">
      <button class="btn-start" onclick="setRouteStart(${building.lng},${building.lat},'${escapeHtml(building.name)}')">📍 设为起点</button>
      <button class="btn-end" onclick="setRouteEnd(${building.lng},${building.lat},'${escapeHtml(building.name)}')">🏁 设为终点</button>
    </div>
    <div class="detail-nav-btns">
      <button class="btn-primary" onclick="navigateTo(${building.lng},${building.lat},'walking')">🚶 步行导航</button>
      <button class="btn-outline" onclick="navigateTo(${building.lng},${building.lat},'driving')">🚗 驾车导航</button>
    </div>
    <button class="btn-text" onclick="clearAllRoutes()">🗑️ 清除路线</button>
  `;

  panel.classList.remove('detail-hidden');
  panel.classList.add('detail-visible');
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ──────────────────────────────────
// 食堂菜单
// ──────────────────────────────────

async function loadCanteenMenu(buildingId) {
  const menuDiv = document.getElementById('canteen-menu');
  menuDiv.innerHTML = '<p>加载中...</p>';
  try {
    let canteen = allBuildings.find(b => (b._id || b.id) === buildingId);
    if (!canteen || !canteen.floors) {
      const fresh = await API.getCanteen(buildingId);
      if (fresh) canteen = fresh;
    }

    if (!canteen || !canteen.floors || canteen.floors.length === 0) {
      menuDiv.innerHTML = '<p>暂无菜单信息</p>';
      return;
    }

    menuDiv.innerHTML = canteen.floors.map(floor => `
      <div class="canteen-floor">
        <h4>${floor.name}</h4>
        ${(floor.stalls || []).map(stall => `
          <div class="stall">
            <div class="stall-name">${stall.name}</div>
            ${(stall.items || []).map(item => `
              <div class="menu-item">
                <span>${item.name}</span>
                <span class="price">¥${item.price}</span>
              </div>
            `).join('')}
          </div>
        `).join('')}
      </div>
    `).join('');
  } catch (err) {
    menuDiv.innerHTML = '<p>加载菜单失败</p>';
  }
}

// ──────────────────────────────────
// 路线规划
// ──────────────────────────────────

function setRouteStart(lng, lat, name) {
  routeStart = { lng, lat, name };
  showToast(`📍 起点：${name}`);
  updateRouteBar();
  if (routeEnd) planRoute();
}

function setRouteEnd(lng, lat, name) {
  routeEnd = { lng, lat, name };
  showToast(`🏁 终点：${name}`);
  updateRouteBar();
  if (routeStart) planRoute();
}

function updateRouteBar() {
  let bar = document.getElementById('route-bar');
  if (!bar) {
    bar = document.createElement('div');
    bar.id = 'route-bar';
    document.body.appendChild(bar);
  }

  const from = routeStart ? routeStart.name : '?';
  const to = routeEnd ? routeEnd.name : '?';

  if (routeStart && routeEnd) {
    bar.innerHTML = `
      <span class="route-info"><b>${from}</b> → <b>${to}</b></span>
      <span class="route-actions">
        <button class="route-mode-btn" onclick="planRoute('walking')">🚶 步行</button>
        <button class="route-mode-btn" onclick="planRoute('driving')">🚗 驾车</button>
        <button class="route-mode-btn route-clear" onclick="clearAllRoutes()">✕</button>
      </span>
    `;
    bar.classList.add('active');
    planRoute('walking');
  } else if (routeStart || routeEnd) {
    bar.innerHTML = `
      <span class="route-info">${routeStart ? `起点：${from}` : `终点：${to}`} — 请选择${routeStart ? '终点' : '起点'}</span>
      <button class="route-mode-btn route-clear" onclick="clearAllRoutes()">✕</button>
    `;
    bar.classList.add('active');
  }
}

function planRoute(mode) {
  if (!routeStart || !routeEnd) return;
  mode = mode || 'walking';

  clearRoutes();

  const start = [routeStart.lng, routeStart.lat];
  const end = [routeEnd.lng, routeEnd.lat];

  if (mode === 'walking') {
    AMap.plugin('AMap.Walking', () => {
      const walking = new AMap.Walking({ map });
      walking.search(start, end, (status, result) => {
        if (status === 'complete') {
          walkingRoute = walking;
          const r = result.routes[0] || result;
          const dist = (r.distance / 1000).toFixed(1);
          const dur = Math.round(r.time / 60);
          showToast(`🚶 ${routeStart.name} → ${routeEnd.name}：${dist}km，约${dur}分钟`);
        } else {
          showToast('路线规划失败');
        }
      });
    });
  } else if (mode === 'driving') {
    AMap.plugin('AMap.Driving', () => {
      const driving = new AMap.Driving({ map });
      driving.search(start, end, (status, result) => {
        if (status === 'complete') {
          drivingRoute = driving;
          const r = result.routes[0] || result;
          const dist = (r.distance / 1000).toFixed(1);
          const dur = Math.round(r.time / 60);
          showToast(`🚗 ${routeStart.name} → ${routeEnd.name}：${dist}km，约${dur}分钟`);
        } else {
          showToast('路线规划失败');
        }
      });
    });
  }
}

function clearAllRoutes() {
  clearRoutes();
  routeStart = null;
  routeEnd = null;
  const bar = document.getElementById('route-bar');
  if (bar) bar.classList.remove('active');
  showToast('已清除路线');
}

function clearRoutes() {
  if (walkingRoute) { walkingRoute.clear(); walkingRoute = null; }
  if (drivingRoute) { drivingRoute.clear(); drivingRoute = null; }
}

function navigateTo(lng, lat, mode) {
  mode = mode || 'walking';
  const start = currentPosition || YNNU_CENTER;
  const end = [lng, lat];

  clearRoutes();

  if (mode === 'walking') {
    AMap.plugin('AMap.Walking', () => {
      const walking = new AMap.Walking({ map });
      walking.search(start, end, (status, result) => {
        if (status === 'complete') {
          walkingRoute = walking;
          const steps = result.routes[0] || result;
          const dist = (steps.distance / 1000).toFixed(1);
          const dur = Math.round(steps.time / 60);
          showToast(`🚶 步行 ${dist}km，约 ${dur} 分钟`);
        } else {
          showToast('步行路线规划失败，请稍后重试');
        }
      });
    });
  } else if (mode === 'driving') {
    AMap.plugin('AMap.Driving', () => {
      const driving = new AMap.Driving({ map });
      driving.search(start, end, (status, result) => {
        if (status === 'complete') {
          drivingRoute = driving;
          const steps = result.routes[0] || result;
          const dist = (steps.distance / 1000).toFixed(1);
          const dur = Math.round(steps.time / 60);
          showToast(`🚗 驾车 ${dist}km，约 ${dur} 分钟`);
        } else {
          showToast('驾车路线规划失败，请稍后重试');
        }
      });
    });
  }
}

// ──────────────────────────────────
// 辅助函数
// ──────────────────────────────────

function showToast(msg) {
  const toast = document.createElement('div');
  toast.className = 'route-toast';
  toast.textContent = msg;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}

function showError(msg) {
  const toast = document.createElement('div');
  toast.className = 'toast-error';
  toast.textContent = msg;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// 页面加载完成后初始化
window.onload = initMap;

```

---

## js/search.js

```js
document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('search-input');
  const results = document.getElementById('search-results');

  input.addEventListener('input', () => {
    const keyword = input.value.trim();

    if (keyword.length === 0) {
      results.classList.remove('show');
      results.innerHTML = '';
      return;
    }

    // 本地过滤
    const matched = allBuildings.filter(b =>
      b.name.toLowerCase().includes(keyword.toLowerCase()) ||
      (b.tags || []).some(tag => tag.toLowerCase().includes(keyword.toLowerCase()))
    );

    if (matched.length === 0) {
      results.innerHTML = '<li style="color:#999">未找到匹配的建筑</li>';
    } else {
      results.innerHTML = matched.slice(0, 8).map(b => `
        <li onclick="selectBuilding('${b.id}')">
          <span class="result-name">${highlightMatch(b.name, keyword)}</span>
          <span class="result-category">${CATEGORY_LABELS[b.category] || '其他'}</span>
        </li>
      `).join('');
    }

    results.classList.add('show');
  });

  // 点击输入框外部关闭搜索结果
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-box')) {
      results.classList.remove('show');
    }
  });
});

// 选中搜索结果
function selectBuilding(id) {
  const building = allBuildings.find(b => b.id === id);
  if (!building) return;

  // 地图飞向目标
  map.setZoomAndCenter(18, [building.lng, building.lat]);

  // 高亮侧边栏卡片
  document.querySelectorAll('.building-card').forEach(c => c.classList.remove('active-card'));
  const card = document.querySelector(`.building-card[data-id="${id}"]`);
  if (card) {
    card.classList.add('active-card');
    card.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  // 显示详情面板
  showDetail(building);

  // 关闭搜索结果
  document.getElementById('search-results').classList.remove('show');
  document.getElementById('search-input').value = building.name;
}

// 高亮匹配文字
function highlightMatch(text, keyword) {
  const regex = new RegExp(`(${escapeRegExp(keyword)})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
}

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

```

---

## js/cloudbase.js

```js
// CloudBase 云开发初始化
// 使用 CDN 引入 SDK 后，全局 cloudbase 对象可用

let db = null;
let cloudbaseReady = false;

async function initCloudbase() {
  // TODO: 替换为你的 CloudBase 环境 ID
  // 在微信云开发控制台 → 设置 → 环境 ID 中获取
  const ENV_ID = 'your-env-id';

  try {
    const app = cloudbase.init({
      env: ENV_ID
    });

    // 匿名登录（只读用户，安全规则保证无法写入）
    const auth = app.auth();
    await auth.signInAnonymously();

    db = app.database();
    cloudbaseReady = true;
    console.log('✅ CloudBase 已连接，匿名登录成功');
  } catch (err) {
    console.error('❌ CloudBase 初始化失败:', err);
    cloudbaseReady = false;
  }
}

// 页面加载时初始化
initCloudbase();

```

---

## data/buildings.json

```json
[
  {
    "id": "ynnu-mba-center",
    "name": "MBA教育中心",
    "category": "teaching",
    "description": "聚贤街768号云南师范大学(呈贡校区)",
    "lng": 102.850752,
    "lat": 24.861233,
    "images": [],
    "tags": [
      "高等院校"
    ],
    "createdAt": "2026-06-06T09:56:11.663Z",
    "updatedAt": "2026-06-06T09:56:11.663Z"
  },
  {
    "id": "ynnu-economics",
    "name": "经济与管理学院",
    "category": "teaching",
    "description": "云南师范大学呈贡校区内",
    "lng": 102.850573,
    "lat": 24.861548,
    "images": [],
    "tags": [
      "高等院校"
    ],
    "createdAt": "2026-06-06T09:56:11.663Z",
    "updatedAt": "2026-06-06T09:56:11.663Z"
  },
  {
    "id": "ynnu-philosophy-law",
    "name": "哲学与政法学院",
    "category": "teaching",
    "description": "呈贡大学城",
    "lng": 102.850573,
    "lat": 24.861554,
    "images": [],
    "tags": [
      "高等院校"
    ],
    "createdAt": "2026-06-06T09:56:11.663Z",
    "updatedAt": "2026-06-06T09:56:11.663Z"
  },
  {
    "id": "ynnu-discipline",
    "name": "纪检监察学院",
    "category": "teaching",
    "description": "梨花中路云南师范大学(呈贡校区)",
    "lng": 102.850578,
    "lat": 24.861557,
    "images": [],
    "tags": [
      "高等院校"
    ],
    "createdAt": "2026-06-06T09:56:11.663Z",
    "updatedAt": "2026-06-06T09:56:11.663Z"
  },
  {
    "id": "ynnu-career-center",
    "name": "就业处",
    "category": "office",
    "description": "云南师范大学呈贡主校区大学生活动中心一楼",
    "lng": 102.850014,
    "lat": 24.85821,
    "images": [],
    "tags": [
      "行政"
    ],
    "createdAt": "2026-06-06T09:56:11.663Z",
    "updatedAt": "2026-06-06T09:56:11.663Z"
  },
  {
    "id": "ynnu-student-affairs",
    "name": "学生处(学生工作部)",
    "category": "office",
    "description": "吴家营街道聚贤街768号云南师范大学呈贡校区东区工程中心三楼301室",
    "lng": 102.850105,
    "lat": 24.858311,
    "images": [],
    "tags": [
      "行政"
    ],
    "createdAt": "2026-06-06T09:56:11.663Z",
    "updatedAt": "2026-06-06T09:56:11.663Z"
  },
  {
    "id": "ynnu-career-activity-west",
    "name": "大学生就业活动中心(西区)",
    "category": "office",
    "description": "秋获路云南师范大学(呈贡校区)",
    "lng": 102.850014,
    "lat": 24.85821,
    "images": [],
    "tags": [
      "行政",
      "活动中心"
    ],
    "createdAt": "2026-06-06T09:56:11.663Z",
    "updatedAt": "2026-06-06T09:56:11.663Z"
  },
  {
    "id": "ynnu-xingjian-center",
    "name": "启园·行健学生活动中心",
    "category": "other",
    "description": "景明南路云南师范大学(呈贡校区)",
    "lng": 102.850146,
    "lat": 24.858074,
    "images": [],
    "tags": [
      "活动中心"
    ],
    "createdAt": "2026-06-06T09:56:11.663Z",
    "updatedAt": "2026-06-06T09:56:11.663Z"
  },
  {
    "id": "ynnu-virtual-lab",
    "name": "虚拟仿真实验教学中心",
    "category": "teaching",
    "description": "聚贤街768号云南师范大学(呈贡校区)",
    "lng": 102.852153,
    "lat": 24.860503,
    "images": [],
    "tags": [
      "实验中心",
      "高等院校"
    ],
    "createdAt": "2026-06-06T09:56:11.663Z",
    "updatedAt": "2026-06-06T09:56:11.663Z"
  },
  {
    "id": "ynnu-foreign-lang",
    "name": "外国语学院",
    "category": "teaching",
    "description": "聚贤街768号云南师范大学(呈贡校区)",
    "lng": 102.851925,
    "lat": 24.861625,
    "images": [],
    "tags": [
      "高等院校"
    ],
    "createdAt": "2026-06-06T09:56:11.663Z",
    "updatedAt": "2026-06-06T09:56:11.663Z"
  },
  {
    "id": "ynnu-huiwen-3",
    "name": "汇文楼3区",
    "category": "teaching",
    "description": "春耘路与梨花中路交叉口东北100米",
    "lng": 102.847313,
    "lat": 24.860089,
    "images": [],
    "tags": [
      "教学楼"
    ],
    "createdAt": "2026-06-06T09:56:11.663Z",
    "updatedAt": "2026-06-06T09:56:11.663Z"
  },
  {
    "id": "ynnu-huiwen-4",
    "name": "汇文楼4区",
    "category": "teaching",
    "description": "春耘路与梨花中路交叉口东北140米",
    "lng": 102.847325,
    "lat": 24.860725,
    "images": [],
    "tags": [
      "教学楼"
    ],
    "createdAt": "2026-06-06T09:56:11.663Z",
    "updatedAt": "2026-06-06T09:56:11.663Z"
  },
  {
    "id": "ynnu-media-college",
    "name": "传媒学院",
    "category": "teaching",
    "description": "片区1号云南师范大学呈贡校区西区4栋传媒学院附近",
    "lng": 102.85067,
    "lat": 24.862714,
    "images": [],
    "tags": [
      "高等院校"
    ],
    "createdAt": "2026-06-06T09:56:11.663Z",
    "updatedAt": "2026-06-06T09:56:11.663Z"
  },
  {
    "id": "ynnu-chinese-college",
    "name": "文学院",
    "category": "teaching",
    "description": "聚贤街768号云南师范大学(呈贡校区)",
    "lng": 102.850713,
    "lat": 24.862758,
    "images": [],
    "tags": [
      "高等院校"
    ],
    "createdAt": "2026-06-06T09:56:11.663Z",
    "updatedAt": "2026-06-06T09:56:11.663Z"
  },
  {
    "id": "ynnu-history-college",
    "name": "历史学院",
    "category": "teaching",
    "description": "聚贤街768号云南师范大学(呈贡校区)",
    "lng": 102.850748,
    "lat": 24.862997,
    "images": [],
    "tags": [
      "高等院校"
    ],
    "createdAt": "2026-06-06T09:56:11.663Z",
    "updatedAt": "2026-06-06T09:56:11.663Z"
  },
  {
    "id": "ynnu-kindergarten",
    "name": "附属幼儿园",
    "category": "other",
    "description": "聚贤街768号(云南师范大学呈贡校区内)",
    "lng": 102.8481,
    "lat": 24.857015,
    "images": [],
    "tags": [
      "幼儿园"
    ],
    "createdAt": "2026-06-06T09:56:11.663Z",
    "updatedAt": "2026-06-06T09:56:11.663Z"
  },
  {
    "id": "ynnu-qiyuan-area",
    "name": "启园",
    "category": "landmark",
    "description": "春耘路学生生活区",
    "lng": 102.856117,
    "lat": 24.862393,
    "images": [],
    "tags": [
      "生活区",
      "宿舍区"
    ],
    "createdAt": "2026-06-06T09:56:11.663Z",
    "updatedAt": "2026-06-06T09:56:11.663Z"
  },
  {
    "id": "ynnu-design-center",
    "name": "众创设计研究中心",
    "category": "teaching",
    "description": "聚贤街云南师范大学(呈贡校区)",
    "lng": 102.854043,
    "lat": 24.860292,
    "images": [],
    "tags": [
      "科研机构"
    ],
    "createdAt": "2026-06-06T09:56:11.663Z",
    "updatedAt": "2026-06-06T09:56:11.663Z"
  },
  {
    "id": "ynnu-admin-building",
    "name": "行政楼",
    "category": "office",
    "description": "聚贤街768号附1号",
    "lng": 102.853885,
    "lat": 24.858814,
    "images": [],
    "tags": [
      "行政"
    ],
    "createdAt": "2026-06-06T09:56:11.663Z",
    "updatedAt": "2026-06-06T09:56:11.663Z"
  },
  {
    "id": "ynnu-marxism-college",
    "name": "马克思主义学院",
    "category": "teaching",
    "description": "明德楼4号楼",
    "lng": 102.850979,
    "lat": 24.863753,
    "images": [],
    "tags": [
      "高等院校"
    ],
    "createdAt": "2026-06-06T09:56:11.663Z",
    "updatedAt": "2026-06-06T09:56:11.663Z"
  },
  {
    "id": "ynnu-swimming-pool",
    "name": "游泳馆",
    "category": "sports",
    "description": "聚贤街768号云南师范大学呈贡校区内",
    "lng": 102.851132,
    "lat": 24.859364,
    "images": [],
    "tags": [
      "游泳馆"
    ],
    "createdAt": "2026-06-06T09:56:11.663Z",
    "updatedAt": "2026-06-06T09:56:11.663Z"
  },
  {
    "id": "ynnu-west-gym",
    "name": "西区体育馆",
    "category": "sports",
    "description": "聚贤街768号云南师范大学(呈贡校区)",
    "lng": 102.848938,
    "lat": 24.857718,
    "images": [],
    "tags": [
      "综合体育馆"
    ],
    "createdAt": "2026-06-06T09:56:11.663Z",
    "updatedAt": "2026-06-06T09:56:11.663Z"
  },
  {
    "id": "ynnu-football-field",
    "name": "足球场",
    "category": "sports",
    "description": "启园北路",
    "lng": 102.847226,
    "lat": 24.8578,
    "images": [],
    "tags": [
      "足球场"
    ],
    "createdAt": "2026-06-06T09:56:11.663Z",
    "updatedAt": "2026-06-06T09:56:11.663Z"
  },
  {
    "id": "ynnu-west-stadium",
    "name": "西区体育场",
    "category": "sports",
    "description": "启园北路",
    "lng": 102.846283,
    "lat": 24.857632,
    "images": [],
    "tags": [
      "综合体育馆"
    ],
    "createdAt": "2026-06-06T09:56:11.663Z",
    "updatedAt": "2026-06-06T09:56:11.663Z"
  },
  {
    "id": "ynnu-qiyuan-training",
    "name": "启园训练馆",
    "category": "sports",
    "description": "启园北路",
    "lng": 102.846527,
    "lat": 24.856683,
    "images": [],
    "tags": [
      "运动场所"
    ],
    "createdAt": "2026-06-06T09:56:11.663Z",
    "updatedAt": "2026-06-06T09:56:11.663Z"
  },
  {
    "id": "ynnu-qiyuan-dorm-9",
    "name": "启园9号学生公寓",
    "category": "dormitory",
    "description": "启园宿舍区",
    "lng": 102.848208,
    "lat": 24.862544,
    "images": [],
    "tags": [
      "宿舍"
    ],
    "createdAt": "2026-06-06T09:56:11.663Z",
    "updatedAt": "2026-06-06T09:56:11.663Z"
  },
  {
    "id": "ynnu-qiyuan-dorm-5",
    "name": "启园5号学生公寓",
    "category": "dormitory",
    "description": "春耘路与梨花中路交叉口北220米",
    "lng": 102.846715,
    "lat": 24.861552,
    "images": [],
    "tags": [
      "宿舍"
    ],
    "createdAt": "2026-06-06T09:56:11.663Z",
    "updatedAt": "2026-06-06T09:56:11.663Z"
  },
  {
    "id": "ynnu-qiyuan-dorm-10",
    "name": "启园10号学生公寓",
    "category": "dormitory",
    "description": "联大街与景明南路交叉口西南160米",
    "lng": 102.84774,
    "lat": 24.862724,
    "images": [],
    "tags": [
      "宿舍"
    ],
    "createdAt": "2026-06-06T09:56:11.663Z",
    "updatedAt": "2026-06-06T09:56:11.663Z"
  },
  {
    "id": "ynnu-mingde-4",
    "name": "明德楼4号楼",
    "category": "teaching",
    "description": "呈贡校区东区",
    "lng": 102.850981,
    "lat": 24.863753,
    "images": [],
    "tags": [
      "教学楼"
    ],
    "createdAt": "2026-06-06T09:56:11.663Z",
    "updatedAt": "2026-06-06T09:56:11.663Z"
  },
  {
    "id": "ynnu-qiyuan-dorm-4",
    "name": "启园4号学生公寓",
    "category": "dormitory",
    "description": "春耘路与梨花中路交叉口西北180米",
    "lng": 102.845813,
    "lat": 24.861004,
    "images": [],
    "tags": [
      "宿舍"
    ],
    "createdAt": "2026-06-06T09:56:11.663Z",
    "updatedAt": "2026-06-06T09:56:11.663Z"
  },
  {
    "id": "ynnu-qiyuan-dorm-3",
    "name": "启园3号学生公寓",
    "category": "dormitory",
    "description": "聚贤街768号",
    "lng": 102.845155,
    "lat": 24.860422,
    "images": [],
    "tags": [
      "宿舍"
    ],
    "createdAt": "2026-06-06T09:56:11.663Z",
    "updatedAt": "2026-06-06T09:56:11.663Z"
  },
  {
    "id": "ynnu-qiyuan-dorm-2",
    "name": "启园2号学生公寓",
    "category": "dormitory",
    "description": "启园北路与梨花中路交叉口北200米",
    "lng": 102.844905,
    "lat": 24.861053,
    "images": [],
    "tags": [
      "宿舍"
    ],
    "createdAt": "2026-06-06T09:56:11.663Z",
    "updatedAt": "2026-06-06T09:56:11.663Z"
  },
  {
    "id": "ynnu-qiyuan-dorm-1",
    "name": "启园1号学生公寓",
    "category": "dormitory",
    "description": "联大街与春融东路交叉口东160米",
    "lng": 102.844692,
    "lat": 24.8618,
    "images": [],
    "tags": [
      "宿舍"
    ],
    "createdAt": "2026-06-06T09:56:11.663Z",
    "updatedAt": "2026-06-06T09:56:11.663Z"
  },
  {
    "id": "canteen-east",
    "name": "东区食堂",
    "category": "canteen",
    "description": "呈贡校区东区",
    "lng": 102.859577,
    "lat": 24.862218,
    "images": [],
    "tags": [
      "食堂",
      "餐饮"
    ],
    "createdAt": "2026-06-06T10:00:00Z",
    "updatedAt": "2026-06-06T13:00:00Z"
  },
  {
    "id": "ynnu-library",
    "name": "图书馆",
    "category": "library",
    "description": "聚贤街768号云南师范大学呈贡校区，馆藏丰富，设有自习室",
    "lng": 102.854184,
    "lat": 24.861987,
    "images": [],
    "tags": [
      "图书馆",
      "自习"
    ],
    "createdAt": "2026-06-06T13:00:00Z",
    "updatedAt": "2026-06-06T13:00:00Z"
  },
  {
    "id": "ynnu-hongzhu-square",
    "name": "红烛广场",
    "category": "landmark",
    "description": "春耘路，校内地标广场，日常活动和集会场所",
    "lng": 102.848506,
    "lat": 24.860144,
    "images": [],
    "tags": [
      "广场",
      "地标"
    ],
    "createdAt": "2026-06-06T13:00:00Z",
    "updatedAt": "2026-06-06T13:00:00Z"
  },
  {
    "id": "canteen-qiyuan-1",
    "name": "启园一食堂",
    "category": "canteen",
    "description": "吴家营街道聚贤街1058号，西区启园一楼，人均¥14",
    "lng": 102.845743,
    "lat": 24.861917,
    "images": [],
    "tags": [
      "食堂",
      "西区"
    ],
    "createdAt": "2026-06-06T13:00:00Z",
    "updatedAt": "2026-06-06T13:00:00Z"
  },
  {
    "id": "canteen-heyuan",
    "name": "和园食堂",
    "category": "canteen",
    "description": "聚贤街与致远路交叉口北320米，东区，人均¥17",
    "lng": 102.859547,
    "lat": 24.862517,
    "images": [],
    "tags": [
      "食堂",
      "东区"
    ],
    "createdAt": "2026-06-06T13:00:00Z",
    "updatedAt": "2026-06-06T13:00:00Z"
  }
]
```

---

## data/canteens.json

```json
[
  {
    "id": "canteen-east-1f",
    "buildingId": "canteen-east",
    "name": "东区食堂一楼",
    "stalls": [
      {
        "name": "盖浇饭窗口",
        "items": [
          { "name": "红烧肉盖饭", "price": 15 },
          { "name": "宫保鸡丁盖饭", "price": 13 },
          { "name": "鱼香肉丝盖饭", "price": 12 }
        ]
      },
      {
        "name": "面食窗口",
        "items": [
          { "name": "牛肉面", "price": 12 },
          { "name": "炸酱面", "price": 10 },
          { "name": "米线", "price": 8 }
        ]
      }
    ],
    "updatedAt": "2026-06-06T10:00:00Z"
  },
  {
    "id": "canteen-east-2f",
    "buildingId": "canteen-east",
    "name": "东区食堂二楼",
    "stalls": [
      {
        "name": "麻辣烫窗口",
        "items": [
          { "name": "麻辣烫（自选）", "price": 18 }
        ]
      },
      {
        "name": "清真窗口",
        "items": [
          { "name": "兰州拉面", "price": 12 },
          { "name": "手抓饭", "price": 20 }
        ]
      }
    ],
    "updatedAt": "2026-06-06T10:00:00Z"
  },
  {
    "id": "canteen-qiyuan-1f",
    "buildingId": "canteen-qiyuan-1",
    "name": "启园一食堂一楼",
    "stalls": [],
    "updatedAt": "2026-06-06T13:00:00Z"
  },
  {
    "id": "canteen-heyuan-1f",
    "buildingId": "canteen-heyuan",
    "name": "和园食堂",
    "stalls": [],
    "updatedAt": "2026-06-06T13:00:00Z"
  }
]

```

---

## server.js

```js
const express = require('express');
const session = require('express-session');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// 解析 JSON 请求体
app.use(express.json());

// Session 配置（管理登录用）
app.use(session({
  secret: process.env.SESSION_SECRET || 'ynnu-campus-secret-key-change-in-production',
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

```

---

## package.json

```json
{
  "name": "ynnu-campus",
  "version": "1.0.0",
  "description": "",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "type": "commonjs",
  "dependencies": {
    "bcryptjs": "^3.0.3",
    "express": "^5.2.1",
    "express-session": "^1.19.0",
    "multer": "^2.1.1"
  }
}

```

---

## README.md

```md
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

```

---

## SETUP.md

```md
# CloudBase 云开发环境配置指南

## 一、开通云开发环境

1. 打开 **https://console.cloud.tencent.com/tcb**（腾讯云开发控制台）
2. 使用微信扫码登录（微信开发者账号）
3. 点击「新建环境」→ 环境名称填 `ynnu-campus`
4. 选择「按量计费」（有免费额度，不会扣费）
5. 点击「立即开通」，等待 1-2 分钟创建完成

## 二、获取环境 ID

1. 进入环境 → 点击顶部环境名称旁的复制按钮
2. 得到类似 `ynnu-campus-7gx8xxxxx` 的环境 ID
3. **修改 `js/cloudbase.js`** 中的 `ENV_ID`：
   ```js
   const ENV_ID = '你的环境ID'; // 替换这里
   ```

## 三、开启匿名登录

1. 控制台 → 环境 → 「用户管理」→「登录设置」
2. 找到「匿名登录」→ 点击「开启」

## 四、创建 4 个数据库集合

1. 控制台 → 「数据库」→「集合管理」→「新建集合」
2. 依次创建以下 4 个集合（名称严格一致）：
   - `campus_buildings`
   - `campus_canteens`  
   - `campus_depts`
   - `campus_events`

## 五、配置安全规则

1. 控制台 → 「数据库」→ 点击每个集合 →「权限设置」
2. 切换到「自定义安全规则」
3. **每个集合**都粘贴以下规则：

```json
{
  "read": true,
  "write": false
}
```

> 含义：所有人可读，Web 端无法写入。管理员通过控制台直接编辑数据。

## 六、导入数据

### 方式 A：控制台导入（推荐）

1. 控制台 → 「数据库」→ 点击「campus_buildings」集合
2. 点击「导入」→ 选择 `data/import/campus_buildings.json`
3. 导入格式选择「JSON Lines」（如果不是），点确定
4. 用同样的方式依次导入其余 3 个 JSON 文件到对应集合

### 方式 B：JSON 批量导入（如控制台不支持直接导入）

在控制台 → 「数据库」→ 记录管理 → 点击「添加记录」→ 逐个复制 JSON 对象粘贴。数据量少（30+条），5 分钟即可完成。

## 七、验证

1. 修改完 `cloudbase.js` 中的 ENV_ID 后
2. 重新 commit + push 到 GitHub
3. GitHub Pages 自动部署后，打开 `https://maofaw.github.io/ynnu-campus/`
4. 检查浏览器控制台有无错误
5. 如果看到「✅ CloudBase 已连接」，即为成功

## 八、管理员日常操作

需要增删改数据时：
- 打开 CloudBase 控制台 → 数据库 → 选中集合 → 直接编辑/新增/删除记录
- 所有修改实时生效，刷新网页即可看到

```

---

