// 云师大坐标（呈贡校区）
const YNNU_CENTER = [102.8500, 24.8600];

let map;
let markers = [];
let allBuildings = [];

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

// 初始化地图
function initMap() {
  map = new AMap.Map('map-container', {
    center: YNNU_CENTER,
    zoom: 16,
    mapStyle: 'amap://styles/light'
  });

  // 加载建筑数据
  loadBuildings();
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
    <button class="btn-primary" onclick="navigateTo(${building.lng},${building.lat})">🧭 导航到这</button>
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

// 导航功能
function navigateTo(lng, lat) {
  // 打开高德地图网页版导航
  window.open(`https://uri.amap.com/navigation?to=${lng},${lat},目的地&mode=walk&callnative=1`, '_blank');
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
