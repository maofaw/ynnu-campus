// 云师大坐标（呈贡校区）
const YNNU_CENTER = [102.8500, 24.8600];

let map;
let markers = [];
let allBuildings = [];
let walkingRoute = null;    // 步行路线对象
let drivingRoute = null;    // 驾车路线对象
let currentPosition = null; // 用户当前位置
let routeStart = null;      // 路线起点 {lng, lat, name}
let routeEnd = null;        // 路线终点 {lng, lat, name}

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

// 图层状态
let currentLayer = 'normal'; // 'normal' | 'satellite'

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

  // 添加图层切换器
  addLayerSwitcher();

  // 添加定位按钮
  addLocateButton();
}

// 图层切换器
function addLayerSwitcher() {
  const switcher = document.createElement('div');
  switcher.id = 'layer-switcher';
  switcher.innerHTML = `
    <button class="layer-btn active" data-layer="normal">🗺️ 标准</button>
    <button class="layer-btn" data-layer="satellite">🛰️ 卫星</button>
  `;
  document.body.appendChild(switcher);

  // 绑定点击事件
  switcher.querySelectorAll('.layer-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const layer = btn.dataset.layer;
      switchLayer(layer);
      switcher.querySelectorAll('.layer-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });
}

// 定位按钮
function addLocateButton() {
  const locateBtn = document.createElement('button');
  locateBtn.id = 'locate-btn';
  locateBtn.innerHTML = '📍';
  locateBtn.title = '定位到我的位置';
  locateBtn.addEventListener('click', locateMe);
  document.body.appendChild(locateBtn);
}

// 切换图层
function switchLayer(type) {
  if (currentLayer === type) return;
  currentLayer = type;

  if (type === 'satellite') {
    // 卫星图 + 路网标注
    map.setLayers([
      new AMap.TileLayer.Satellite(),
      new AMap.TileLayer.RoadNet()
    ]);
  } else {
    // 标准矢量地图
    map.setLayers([new AMap.TileLayer()]);
  }
}

let userMarker = null;     // 用户位置标注
let userCircle = null;     // 定位精度圈
let geolocation = null;    // 高德定位实例

// 初始化高德定位（页面加载时静默执行，精度更高）
function getCurrentPosition() {
  map.plugin('AMap.Geolocation', () => {
    geolocation = new AMap.Geolocation({
      enableHighAccuracy: true,    // 高精度
      timeout: 10000,
      showMarker: false,           // 我们自己画标注
      showCircle: false,
      panToLocation: false         // 不自动移动地图
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

// 主动定位——点击按钮触发，移动地图到用户位置
function locateMe() {
  if (!geolocation) {
    // 还没初始化，用浏览器定位降级
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

      // 显示定位精度
      const acc = result.accuracy ? ` (精度${result.accuracy}米)` : '';
      showToast(`📍 已定位${acc}`);
    } else {
      showToast('定位失败，请确认已授权定位权限');
    }
  });
}

// 在地图上画用户标记（可拖拽微调）
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
    draggable: true       // 可拖拽
  });
  userMarker.setMap(map);

  // 拖拽结束后更新坐标
  userMarker.on('dragend', () => {
    const p = userMarker.getPosition();
    currentPosition = [p.lng, p.lat];
    showToast('📍 位置已更新，可拖拽蓝点继续微调');
  });

  // 清除旧精度圈
  if (userCircle) { userCircle.setMap(null); }

  // 显示精度圈（约 50 米参考圈）
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
  circle.setMap(map);
  // 拖拽时圈跟随移动
  userMarker.on('dragging', () => {
    userCircle.setCenter(userMarker.getPosition());
  });
  userMarker.on('dragend', () => {
    userCircle.setCenter(userMarker.getPosition());
  });
}

// 加载并渲染建筑标注
async function loadBuildings() {
  try {
    allBuildings = await API.getBuildings();
    renderMarkers(allBuildings);
  } catch (err) {
    console.error('加载建筑数据失败:', err);
    showError('加载地图数据失败，请刷新页面重试');
  }
}

// 在地图上渲染标注
function renderMarkers(buildings) {
  // 清除旧标注
  clearMarkers();

  buildings.forEach(building => {
    const color = CATEGORY_COLORS[building.category] || CATEGORY_COLORS.other;

    const marker = new AMap.Marker({
      position: [building.lng, building.lat],
      title: building.name,
      icon: new AMap.Icon({
        size: new AMap.Size(28, 36),
        imageSize: new AMap.Size(28, 36),
        image: createMarkerSVG(color)
      })
    });

    // 点击标注显示详情
    marker.on('click', () => showDetail(building));

    // 悬停显示名称
    marker.setLabel({
      content: `<div class="marker-label">${building.name}</div>`,
      direction: 'top',
      offset: new AMap.Pixel(0, -10)
    });

    marker.setMap(map);
    markers.push(marker);
  });
}

// 用 SVG data URI 生成彩色标注图标
function createMarkerSVG(color) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="36" viewBox="0 0 28 36">
    <path d="M14 0C6.268 0 0 6.268 0 14c0 10.5 14 22 14 22s14-11.5 14-22C28 6.268 21.732 0 14 0z" fill="${color}"/>
    <circle cx="14" cy="14" r="5" fill="white"/>
  </svg>`;
  return 'data:image/svg+xml;base64,' + btoa(encodeURIComponent(svg).replace(/%([0-9A-F]{2})/g, (_, p1) => String.fromCharCode('0x' + p1)));
}

// 清除所有标注
function clearMarkers() {
  markers.forEach(m => m.setMap(null));
  markers = [];
}

// 在地图上标注单栋建筑
function addMarker(building) {
  markers.push(building);
  renderMarkers([...allBuildings]);
}

// 显示建筑详情
function showDetail(building) {
  const panel = document.getElementById('detail-panel');
  const content = document.getElementById('detail-content');

  const categoryLabel = CATEGORY_LABELS[building.category] || '其他';
  const tags = (building.tags || []).map(t => `<span class="tag">${t}</span>`).join('');
  const images = (building.images || []).map(img =>
    `<img src="${img}" alt="${building.name}" class="detail-image" onerror="this.style.display='none'">`
  ).join('');

  // 如果是食堂，特殊展示
  let extraSection = '';
  if (building.category === 'canteen') {
    extraSection = `<div class="detail-extra">
      <button class="btn-primary" onclick="loadCanteenMenu('${building.id}')">查看菜单</button>
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
    ${extraSection}
    <div class="detail-route-section">
      <button class="btn-start" onclick="setRouteStart(${building.lng},${building.lat},'${building.name.replace(/'/g, "\\'")}')">📍 设为起点</button>
      <button class="btn-end" onclick="setRouteEnd(${building.lng},${building.lat},'${building.name.replace(/'/g, "\\'")}')">🏁 设为终点</button>
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

// 关闭详情面板
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('detail-close').addEventListener('click', () => {
    const panel = document.getElementById('detail-panel');
    panel.classList.remove('detail-visible');
    panel.classList.add('detail-hidden');
  });
});

// 加载食堂菜单
async function loadCanteenMenu(buildingId) {
  const menuDiv = document.getElementById('canteen-menu');
  menuDiv.innerHTML = '<p>加载中...</p>';
  try {
    const canteens = await API.getCanteens();
    const items = canteens.filter(c => c.buildingId === buildingId);
    if (items.length === 0) {
      menuDiv.innerHTML = '<p>暂无菜单信息</p>';
      return;
    }
    menuDiv.innerHTML = items.map(c => `
      <div class="canteen-floor">
        <h4>${c.name}</h4>
        ${c.stalls.map(stall => `
          <div class="stall">
            <div class="stall-name">${stall.name}</div>
            ${stall.items.map(item => `
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

// 设置路线起点
function setRouteStart(lng, lat, name) {
  routeStart = { lng, lat, name };
  showToast(`📍 起点：${name}`);
  updateRouteBar();
  if (routeEnd) planRoute();
}

// 设置路线终点
function setRouteEnd(lng, lat, name) {
  routeEnd = { lng, lat, name };
  showToast(`🏁 终点：${name}`);
  updateRouteBar();
  if (routeStart) planRoute();
}

// 路线信息浮动条
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
    // 自动规划步行路线
    planRoute('walking');
  } else if (routeStart || routeEnd) {
    bar.innerHTML = `
      <span class="route-info">${routeStart ? `起点：${from}` : `终点：${to}`} — 请选择${routeStart ? '终点' : '起点'}</span>
      <button class="route-mode-btn route-clear" onclick="clearAllRoutes()">✕</button>
    `;
    bar.classList.add('active');
  }
}

// 从起点到终点规划路线
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

  // 更新浮动条中的按钮状态
  updateRouteBarButtons(mode);
}

function updateRouteBarButtons(activeMode) {
  const bar = document.getElementById('route-bar');
  if (!bar) return;
  bar.querySelectorAll('.route-mode-btn').forEach(btn => {
    btn.classList.remove('active-mode');
  });
  const activeBtn = bar.querySelector(`[onclick*="${activeMode}"]`);
  if (activeBtn) activeBtn.classList.add('active-mode');
}

// 清除所有路线和起终点
function clearAllRoutes() {
  clearRoutes();
  routeStart = null;
  routeEnd = null;
  const bar = document.getElementById('route-bar');
  if (bar) bar.classList.remove('active');
  showToast('已清除路线');
}

// 清除已绘制的路线
function clearRoutes() {
  if (walkingRoute) { walkingRoute.clear(); walkingRoute = null; }
  if (drivingRoute) { drivingRoute.clear(); drivingRoute = null; }
}

// 导航功能 —— 在地图上直接绘制路线
function navigateTo(lng, lat, mode) {
  mode = mode || 'walking';
  const start = currentPosition || YNNU_CENTER;
  const end = [lng, lat];

  // 清除旧路线
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

// 轻提示
function showToast(msg) {
  const toast = document.createElement('div');
  toast.className = 'route-toast';
  toast.textContent = msg;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}

// 显示错误提示
function showError(msg) {
  const toast = document.createElement('div');
  toast.className = 'toast-error';
  toast.textContent = msg;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// 页面加载完成后初始化地图
window.onload = initMap;
