// 云师大坐标（呈贡校区）
const YNNU_CENTER = [102.8500, 24.8600];

let map;
let markers = [];
let allBuildings = [];
let walkingRoute = null;
let drivingRoute = null;
let ridingRoute = null;
let currentPosition = null;
let routeStart = null;
let routeEnd = null;
let currentCategory = 'all';
let startMarker = null;
let navMode = 'walking';
let lastRouteAlts = [];
let lastRouteIdx = 0;

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

  // 帮助按钮事件（M3 — 仅手机端）
  const helpBtn = document.getElementById('help-btn');
  const helpOverlay = document.getElementById('help-overlay');
  const helpClose = document.getElementById('help-close');
  if (helpBtn && helpOverlay) {
    helpBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      helpOverlay.classList.add('show');
    });
    if (helpClose) {
      helpClose.addEventListener('click', (e) => {
        e.stopPropagation();
        helpOverlay.classList.remove('show');
      });
    }
    helpOverlay.addEventListener('click', () => {
      helpOverlay.classList.remove('show');
    });
  }

  // 3D 视图切换
  init3DView();

  // 手机端抽屉触摸拖拽（M2）
  initDrawerDrag();

  // 抽屉初始半开
  if (window.innerWidth <= 768) {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) { sidebar.classList.add('drawer-half'); }
  }
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

let allEvents = [];  // 所有活动
let eventsByBuilding = {}; // buildingId -> [events]

async function loadBuildings() {
  try {
    allBuildings = await API.getAllLocations();
    allEvents = await API.getEvents({ upcoming: true });
    // 按 buildingId 建立索引
    eventsByBuilding = {};
    allEvents.forEach(e => {
      if (!eventsByBuilding[e.buildingId]) eventsByBuilding[e.buildingId] = [];
      eventsByBuilding[e.buildingId].push(e);
    });
    renderMarkers(allBuildings);
    renderBuildingCards(allBuildings);
    renderEventStrip(allEvents);
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

// 侧边栏近期活动滚动卡片
function renderEventStrip(events) {
  const container = document.getElementById('events-scroll');
  if (!events || events.length === 0) {
    container.innerHTML = '<div class="events-loading">暂无近期活动</div>';
    return;
  }
  container.innerHTML = events.slice(0, 5).map(e => {
    const tag = (e.tags || [])[0] || '';
    const date = formatEventDate(e.startTime);
    return `
      <div class="event-mini-card" onclick="jumpToEvent('${e.id}')">
        <div class="event-mini-title">${e.title}</div>
        <div class="event-mini-meta">📅 ${date} · ${e.organizer}</div>
        ${tag ? `<span class="event-mini-tag">${tag}</span>` : ''}
      </div>
    `;
  }).join('');
}

function formatEventDate(isoStr) {
  const d = new Date(isoStr);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

// 从活动卡片跳转到对应建筑
function jumpToEvent(eventId) {
  const event = allEvents.find(e => e.id === eventId);
  if (!event) return;
  const building = allBuildings.find(b => (b.id || b._id) === event.buildingId);
  if (!building) return;
  onCardClick(building.id || building._id);
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

  // 有活动的建筑加红点角标
  if (eventsByBuilding[building.id || building._id]) {
    const badge = document.createElement('div');
    badge.className = 'event-badge';
    badge.title = `${eventsByBuilding[building.id || building._id].length} 个活动`;
    marker.setContent(badge);
  }

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
  const hasImages = building.images && building.images.length > 0;
  const imagesHTML = hasImages
    ? building.images.map(img =>
        `<img src="${img}" alt="${building.name}" class="detail-image" onerror="this.style.display='none'">`
      ).join('')
    : `<div class="detail-no-photo">
         <div class="no-photo-icon">📷</div>
         <div class="no-photo-text">暂无照片</div>
         <div class="no-photo-hint">照片采集中，敬请期待</div>
       </div>`;

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

  // 活动板块
  let eventsSection = '';
  const bid = building.id || building._id;
  if (eventsByBuilding[bid] && eventsByBuilding[bid].length > 0) {
    eventsSection = `
      <div class="detail-events-section">
        <div class="detail-events-title">📢 本场活动</div>
        ${eventsByBuilding[bid].map(e => `
          <div class="detail-event-item">
            <div class="detail-event-name">${e.title}</div>
            <div class="detail-event-meta">📅 ${formatEventDate(e.startTime)} ~ ${formatEventDate(e.endTime)} · ${e.organizer}</div>
            <div class="detail-event-meta">📝 ${e.registration}</div>
          </div>
        `).join('')}
      </div>
    `;
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
    <div class="detail-images">${imagesHTML}</div>
    <div class="detail-tags">${tags}</div>
    <p class="detail-desc">${building.description || '暂无介绍'}</p>
    ${infoSection ? `<div class="detail-info-section">${infoSection}</div>` : ''}
    ${eventsSection}
    ${extraSection}
    <div class="detail-route-section">
      <button class="btn-start" onclick="setRouteStart(${building.lng},${building.lat},'${escapeHtml(building.name)}')">📍 设为起点</button>
      <button class="btn-end" onclick="setRouteEnd(${building.lng},${building.lat},'${escapeHtml(building.name)}')">🏁 设为终点</button>
    </div>
    <div class="detail-nav-btns">
      <button class="btn-primary" onclick="navigateTo(${building.lng},${building.lat},'${escapeHtml(building.name)}','walking')">🚶 步行导航</button>
      <button class="btn-outline" onclick="navigateTo(${building.lng},${building.lat},'${escapeHtml(building.name)}','riding')">🚲 骑行</button>
      <button class="btn-outline" onclick="navigateTo(${building.lng},${building.lat},'${escapeHtml(building.name)}','driving')">🚗 驾车导航</button>
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
  if (routeEnd) planRoute(navMode);
}

function setRouteEnd(lng, lat, name) {
  routeEnd = { lng, lat, name };
  showToast(`🏁 终点：${name}`);
  if (routeStart) planRoute(navMode);
}

function planRoute(mode) {
  if (!routeStart || !routeEnd) return;
  mode = mode || 'walking';
  navMode = mode;

  // 清除旧路线 + 信息卡 + 关闭详情面板
  clearRoutes();
  hideNavCard();
  const detailPanel = document.getElementById('detail-panel');
  if (detailPanel) {
    detailPanel.classList.remove('detail-visible');
    detailPanel.classList.add('detail-hidden');
  }

  // 隐藏非起终点标注，自动聚焦起点（N1）
  hideMarkersExcept(routeStart, routeEnd);
  const startPos = [routeStart.lng, routeStart.lat];
  map.setZoomAndCenter(17, startPos);
  addStartMarker(startPos);

  // 导航时隐藏活动卡片 + 手机端隐藏搜索栏（N5）
  const sidebar = document.getElementById('sidebar');
  if (sidebar) sidebar.classList.add('nav-active');

  const start = [routeStart.lng, routeStart.lat];
  const end = [routeEnd.lng, routeEnd.lat];

  function fitRoute() {
    try {
      map.setFitView([start, end], false, [80, 80, 200, 80]);
    } catch(e) {
      map.setZoomAndCenter(16, [(start[0]+end[0])/2, (start[1]+end[1])/2]);
    }
  }

  function onComplete(type, routeObj, result) {
    lastRouteAlts = result.routes || [];
    lastRouteIdx = 0;
    const r = lastRouteAlts[0] || result;
    const dist = (r.distance / 1000).toFixed(1);
    const dur = Math.round(r.time / 60);
    const icons = { walking: '🚶', driving: '🚗', riding: '🚲' };
    showToast(`${icons[type]} ${routeStart.name} → ${routeEnd.name}：${dist}km，约${dur}分钟`);
    showNavCard(type, routeStart.name, routeEnd.name, result);
    setTimeout(fitRoute, 300);
  }

  if (mode === 'walking') {
    AMap.plugin('AMap.Walking', () => {
      const walking = new AMap.Walking({ map });
      walking.search(start, end, (status, result) => {
        if (status === 'complete') {
          walkingRoute = walking;
          drivingRoute = null;
          ridingRoute = null;
          onComplete('walking', walking, result);
        } else { showToast('路线规划失败'); }
      });
    });
  } else if (mode === 'driving') {
    AMap.plugin('AMap.Driving', () => {
      const driving = new AMap.Driving({ map });
      driving.search(start, end, (status, result) => {
        if (status === 'complete') {
          drivingRoute = driving;
          walkingRoute = null;
          ridingRoute = null;
          onComplete('driving', driving, result);
        } else { showToast('路线规划失败'); }
      });
    });
  } else if (mode === 'riding') {
    AMap.plugin('AMap.Riding', () => {
      const riding = new AMap.Riding({ map });
      riding.search(start, end, (status, result) => {
        if (status === 'complete') {
          ridingRoute = riding;
          walkingRoute = null;
          drivingRoute = null;
          onComplete('riding', riding, result);
        } else { showToast('骑行路线规划失败'); }
      });
    });
  }
}

function clearAllRoutes() {
  clearRoutes();
  if (startMarker) { startMarker.setMap(null); startMarker = null; }
  routeStart = null;
  routeEnd = null;
  lastRouteAlts = [];
  hideNavCard();
  restoreAllMarkers(allBuildings);
  // 手机端恢复搜索栏（N5）
  const sidebar = document.getElementById('sidebar');
  if (sidebar) sidebar.classList.remove('nav-active');
  showToast('已清除路线');
}

function clearRoutes() {
  if (walkingRoute) { walkingRoute.clear(); walkingRoute = null; }
  if (drivingRoute) { drivingRoute.clear(); drivingRoute = null; }
  if (ridingRoute) { ridingRoute.clear(); ridingRoute = null; }
}

function navigateTo(lng, lat, name, mode) {
  // 兼容旧调用：navigateTo(lng, lat, mode) 无 name
  if (name === 'walking' || name === 'driving' || name === 'riding') {
    mode = name;
    name = '目的地';
  }
  mode = mode || 'walking';
  const start = currentPosition || YNNU_CENTER;
  routeStart = { lng: start[0], lat: start[1], name: '我的位置' };
  routeEnd = { lng, lat, name: name };
  planRoute(mode);
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

// ──────────────────────────────────
// 导航信息卡（N2）
// ──────────────────────────────────

function updateNavCardData(mode, fromName, toName, result) {
  navMode = mode;
  const icon = document.getElementById('nav-card-icon');
  const route = document.getElementById('nav-card-route');
  const stats = document.getElementById('nav-card-stats');
  const altBar = document.getElementById('nav-card-alts');
  const walkBtn = document.getElementById('nav-mode-walk');
  const driveBtn = document.getElementById('nav-mode-drive');
  const rideBtn = document.getElementById('nav-mode-ride');

  if (!icon || !route || !stats) return;

  const icons = { walking: '🚶', driving: '🚗', riding: '🚲' };
  icon.textContent = icons[mode] || '🚶';
  route.textContent = `${fromName} → ${toName}`;

  const r = lastRouteAlts[0] || result;
  const dist = (r.distance / 1000).toFixed(1);
  const dur = Math.round(r.time / 60);

  // ETA
  const now = new Date();
  const arrival = new Date(now.getTime() + r.time * 1000);
  const eta = `${arrival.getHours().toString().padStart(2,'0')}:${arrival.getMinutes().toString().padStart(2,'0')}`;
  stats.innerHTML = `${dist}km · 约${dur}分钟 · <span class="nav-card-eta">预计 ${eta} 到达</span>`;

  // 模式按钮高亮
  if (walkBtn) walkBtn.classList.toggle('active', mode === 'walking');
  if (driveBtn) driveBtn.classList.toggle('active', mode === 'driving');
  if (rideBtn) rideBtn.classList.toggle('active', mode === 'riding');

  // 路线方案切换
  if (altBar && lastRouteAlts.length > 1) {
    altBar.innerHTML = lastRouteAlts.map((rt, i) => {
      const d = (rt.distance / 1000).toFixed(1);
      const t = Math.round(rt.time / 60);
      return `<span class="route-alt-pill ${i === lastRouteIdx ? 'active' : ''}"
              onclick="switchRoute(${i})">方案${i+1} ${d}km ${t}分钟</span>`;
    }).join('');
    altBar.style.display = 'flex';
  } else if (altBar) {
    altBar.style.display = 'none';
  }
}

function showNavCard(mode, fromName, toName, result) {
  updateNavCardData(mode, fromName, toName, result);
  const card = document.getElementById('nav-card');
  if (card) {
    card.classList.remove('nav-card-hidden');
    card.classList.add('nav-card-visible');
  }
}

function hideNavCard() {
  const card = document.getElementById('nav-card');
  if (card) {
    card.classList.remove('nav-card-visible');
    card.classList.add('nav-card-hidden');
  }
}

// 切换路线方案
function switchRoute(idx) {
  if (!routeStart || !routeEnd || !lastRouteAlts[idx]) return;
  lastRouteIdx = idx;
  clearRoutes();
  // 用当前模式重新规划（driving 用不同策略）
  if (navMode === 'driving' && idx < 3) {
    const policies = [0, 2, 1]; // 最快/最短/少收费
    AMap.plugin('AMap.Driving', () => {
      const driving = new AMap.Driving({ map, policy: policies[idx] });
      driving.search([routeStart.lng, routeStart.lat], [routeEnd.lng, routeEnd.lat], (status, result) => {
        if (status === 'complete') {
          drivingRoute = driving;
          walkingRoute = null;
          ridingRoute = null;
          lastRouteAlts = result.routes || [];
          updateNavCardData('driving', routeStart.name, routeEnd.name, result);
        }
      });
    });
  } else {
    planRoute(navMode);
  }
}

// ──────────────────────────────────
// 导航标注控制（N1）
// ──────────────────────────────────

function addStartMarker(pos) {
  if (startMarker) startMarker.setMap(null);
  startMarker = new AMap.Marker({
    position: pos,
    icon: new AMap.Icon({
      size: new AMap.Size(20, 20),
      image: 'https://webapi.amap.com/theme/v1.3/markers/n/mark_b.png',
      imageSize: new AMap.Size(20, 20)
    }),
    zIndex: 101,
    anchor: 'center'
  });
  startMarker.setMap(map);
}

function hideMarkersExcept(startObj, endObj) {
  markers.forEach(m => {
    const pos = m.getPosition();
    const isStart = pos.lng === startObj.lng && pos.lat === startObj.lat;
    const isEnd = pos.lng === endObj.lng && pos.lat === endObj.lat;
    if (!isStart && !isEnd) {
      m.setMap(null);
    }
  });
}

function restoreAllMarkers(buildings) {
  clearMarkers();
  buildings.forEach(b => createMarker(b));
}

// ──────────────────────────────────
// 3D 视图切换（新3）
// ──────────────────────────────────
let is3D = false;
function init3DView() {
  const btn = document.getElementById('view3dBtn');
  if (!btn) return;
  btn.addEventListener('click', () => {
    is3D = !is3D;
    if (is3D) {
      map.setPitch(60);
      map.setRotation(30);
      map.setZooms([3, 20]);
      map.setZoom(17);
      btn.classList.add('active');
    } else {
      map.setPitch(0);
      map.setRotation(0);
      btn.classList.remove('active');
      switchLayer(currentLayer);
    }
  });
}

// ──────────────────────────────────
// 手机端抽屉触摸拖拽（M2）
// ──────────────────────────────────
function initDrawerDrag() {
  const sidebar = document.getElementById('sidebar');
  if (!sidebar) return;

  let startY = 0;
  let currentTranslate = 0;
  let dragging = false;

  function isMobile() { return window.innerWidth <= 768; }

  sidebar.addEventListener('touchstart', (e) => {
    if (!isMobile()) return;
    startY = e.touches[0].clientY;
    dragging = true;
    sidebar.style.transition = 'none';
    const matrix = new DOMMatrixReadOnly(getComputedStyle(sidebar).transform);
    currentTranslate = matrix.m42;
  }, { passive: true });

  sidebar.addEventListener('touchmove', (e) => {
    if (!isMobile() || !dragging) return;
    const deltaY = e.touches[0].clientY - startY;
    const newTranslate = currentTranslate + deltaY;
    const maxOpen = 0;
    const maxClosed = sidebar.offsetHeight - 50;
    const clamped = Math.max(maxOpen, Math.min(maxClosed, newTranslate));
    sidebar.style.transform = `translateY(${clamped}px)`;
  }, { passive: true });

  sidebar.addEventListener('touchend', (e) => {
    if (!isMobile() || !dragging) return;
    dragging = false;
    sidebar.style.transition = 'transform 0.3s ease';

    const endY = e.changedTouches[0].clientY;
    const deltaY = endY - startY;

    sidebar.classList.remove('drawer-open', 'drawer-half', 'drawer-closed');

    if (Math.abs(deltaY) > 100) {
      if (deltaY > 0) {
        sidebar.classList.add('drawer-closed');
      } else {
        sidebar.classList.add('drawer-open');
      }
    } else if (Math.abs(deltaY) > 30) {
      sidebar.classList.add('drawer-half');
    } else {
      sidebar.classList.add('drawer-half');
    }
  });
}

// 页面加载完成后初始化
window.onload = initMap;
