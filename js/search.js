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

    // 本地过滤建筑
    const matchedBuildings = typeof allBuildings !== 'undefined'
      ? allBuildings.filter(b =>
          b.name.toLowerCase().includes(keyword.toLowerCase()) ||
          (b.tags || []).some(tag => tag.toLowerCase().includes(keyword.toLowerCase()))
        )
      : [];

    // 搜索活动
    const matchedEvents = typeof allEvents !== 'undefined'
      ? allEvents.filter(e =>
          e.title.toLowerCase().includes(keyword.toLowerCase()) ||
          e.organizer.toLowerCase().includes(keyword.toLowerCase()) ||
          (e.tags || []).some(t => t.toLowerCase().includes(keyword.toLowerCase()))
        ).slice(0, 3)
      : [];

    let html = '';

    // 建筑结果
    if (matchedBuildings.length > 0) {
      matchedBuildings.slice(0, 5).forEach(b => {
        html += `<li onclick="selectBuilding('${b.id}')">
          <span class="result-name">🏢 ${highlightMatch(b.name, keyword)}</span>
          <span class="result-category">${(typeof CATEGORY_LABELS !== 'undefined' && CATEGORY_LABELS[b.category]) || '其他'}</span>
        </li>`;
      });
    }

    // 活动结果
    matchedEvents.forEach(e => {
      const bld = typeof allBuildings !== 'undefined' ? allBuildings.find(b => (b.id || b._id) === e.buildingId) : null;
      html += `<li onclick="jumpToEvent('${e.id}')">
        <span class="result-name">📢 ${highlightMatch(e.title, keyword)}</span>
        <span class="result-category">${bld ? bld.name : e.organizer}</span>
      </li>`;
    });

    if (!html) {
      html = '<li style="color:#999">未找到匹配的建筑或活动</li>';
    }

    results.innerHTML = html;
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
