let currentBuilding = null;
let allBuildingData = [];
let allCanteenData = [];

const CATEGORY_OPTIONS = [
  { value: 'teaching', label: '教学楼' },
  { value: 'canteen', label: '食堂' },
  { value: 'dormitory', label: '宿舍楼' },
  { value: 'landmark', label: '地标/广场' },
  { value: 'sports', label: '体育场馆' },
  { value: 'office', label: '行政楼' },
  { value: 'library', label: '图书馆' },
  { value: 'other', label: '其他' }
];

// ============ 登录 ============
async function doLogin() {
  const username = document.getElementById('login-username').value;
  const password = document.getElementById('login-password').value;

  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    if (!res.ok) {
      document.getElementById('login-error').style.display = 'block';
      return;
    }

    document.getElementById('login-page').style.display = 'none';
    document.getElementById('admin-page').style.display = 'block';
    await loadAdminData();
  } catch (err) {
    document.getElementById('login-error').style.display = 'block';
  }
}

async function doLogout() {
  await fetch('/api/auth/logout', { method: 'POST' });
  document.getElementById('login-page').style.display = 'block';
  document.getElementById('admin-page').style.display = 'none';
  document.getElementById('login-username').value = '';
  document.getElementById('login-password').value = '';
  document.getElementById('login-error').style.display = 'none';
}

// ============ 数据加载 ============
async function loadAdminData() {
  try {
    allBuildingData = await API.getBuildings();
    allCanteenData = await API.getCanteens();
    renderBuildingList();
  } catch (err) {
    showToast('加载数据失败', 'error');
  }
}

// ============ 建筑列表 ============
function renderBuildingList() {
  const list = document.getElementById('building-list');
  list.innerHTML = allBuildingData.map(b => `
    <div class="building-list-item ${currentBuilding && currentBuilding.id === b.id ? 'active' : ''}"
         onclick="selectBuilding('${b.id}')">
      <span>${b.name}</span>
      <button class="delete-btn" onclick="event.stopPropagation();deleteBuilding('${b.id}')">×</button>
    </div>
  `).join('');
}

function selectBuilding(id) {
  currentBuilding = allBuildingData.find(b => b.id === id);
  if (!currentBuilding) return;
  renderBuildingList();
  renderEditPanel();
}

function newBuilding() {
  currentBuilding = {
    id: '',
    name: '',
    category: 'teaching',
    description: '',
    lng: 102.85,
    lat: 24.86,
    images: [],
    tags: []
  };
  renderBuildingList();
  renderEditPanel();
}

async function deleteBuilding(id) {
  if (!confirm('确定要删除这栋建筑吗？此操作不可撤销。')) return;

  try {
    const res = await fetch(`/api/admin/buildings/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('删除失败');
    showToast('删除成功');
    currentBuilding = null;
    await loadAdminData();
    document.getElementById('edit-panel').innerHTML = '<p style="color:#999;">← 从左侧选择一栋建筑开始编辑</p>';
  } catch (err) {
    showToast('删除失败', 'error');
  }
}

// ============ 编辑面板 ============
function renderEditPanel() {
  const panel = document.getElementById('edit-panel');
  const b = currentBuilding;
  if (!b) return;

  const isNew = !b.id;

  panel.innerHTML = `
    <h3>${isNew ? '新增建筑' : '编辑：' + b.name}</h3>

    <div class="form-group">
      <label>建筑名称 *</label>
      <input type="text" id="edit-name" value="${escapeHtml(b.name)}">
    </div>

    <div class="form-group">
      <label>分类 *</label>
      <select id="edit-category">
        ${CATEGORY_OPTIONS.map(opt => `
          <option value="${opt.value}" ${b.category === opt.value ? 'selected' : ''}>${opt.label}</option>
        `).join('')}
      </select>
    </div>

    <div class="form-group">
      <label>坐标（经度, 纬度）*</label>
      <div class="coords-row">
        <input type="number" step="0.000001" id="edit-lng" value="${b.lng}" placeholder="经度">
        <input type="number" step="0.000001" id="edit-lat" value="${b.lat}" placeholder="纬度">
      </div>
    </div>

    <div class="form-group">
      <label>介绍</label>
      <textarea id="edit-desc">${escapeHtml(b.description || '')}</textarea>
    </div>

    <div class="form-group">
      <label>标签</label>
      <div>
        <div class="tags-input-wrapper" id="tags-wrapper">
          ${(b.tags || []).map((tag, i) => `
            <span class="tag-editable">${escapeHtml(tag)}<span class="tag-remove" onclick="removeTag(${i})">×</span></span>
          `).join('')}
        </div>
        <input type="text" id="tag-input" placeholder="输入标签后回车添加"
               style="margin-top:6px;width:100%;padding:6px;border:1px solid #ddd;border-radius:6px;font-size:13px;"
               onkeydown="if(event.key==='Enter'){event.preventDefault();addTag();}">
      </div>
    </div>

    ${b.category === 'canteen' ? renderCanteenEditor(b.id) : ''}

    <div class="btn-row">
      <button class="btn-save" onclick="saveBuilding()">保存</button>
      <button class="btn-cancel" onclick="cancelEdit()">取消</button>
    </div>
  `;

  // 为标签输入绑定失焦事件
  const tagInput = document.getElementById('tag-input');
  if (tagInput) {
    tagInput.addEventListener('blur', addTag);
  }
}

// 转义 HTML 防 XSS
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// 标签管理
function addTag() {
  const input = document.getElementById('tag-input');
  if (!input) return;
  const value = input.value.trim();
  if (!value) return;
  if (!currentBuilding.tags) currentBuilding.tags = [];
  if (!currentBuilding.tags.includes(value)) {
    currentBuilding.tags.push(value);
    renderEditPanel();
  }
  input.value = '';
}

function removeTag(index) {
  currentBuilding.tags.splice(index, 1);
  renderEditPanel();
}

// ============ 保存 ============
async function saveBuilding() {
  const name = document.getElementById('edit-name').value.trim();
  const category = document.getElementById('edit-category').value;
  const lng = parseFloat(document.getElementById('edit-lng').value);
  const lat = parseFloat(document.getElementById('edit-lat').value);
  const description = document.getElementById('edit-desc').value.trim();

  if (!name || isNaN(lng) || isNaN(lat)) {
    showToast('请填写名称和有效坐标', 'error');
    return;
  }

  const body = { name, category, description, lng, lat, tags: currentBuilding.tags || [] };

  try {
    const isNew = !currentBuilding.id;
    const url = isNew ? '/api/admin/buildings' : `/api/admin/buildings/${currentBuilding.id}`;
    const method = isNew ? 'POST' : 'PUT';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      const err = await res.json();
      showToast(err.error || '保存失败', 'error');
      return;
    }

    // 如果是食堂，也保存菜单
    if (category === 'canteen' && !isNew) {
      await saveCanteenMenuFromForm(currentBuilding.id);
    }

    showToast('保存成功');
    await loadAdminData();
    const saved = await res.json();
    currentBuilding = allBuildingData.find(b => b.id === (saved.id || currentBuilding.id));
    renderBuildingList();
    renderEditPanel();
  } catch (err) {
    showToast('保存失败：' + err.message, 'error');
  }
}

function cancelEdit() {
  currentBuilding = null;
  renderBuildingList();
  document.getElementById('edit-panel').innerHTML = '<p style="color:#999;">← 从左侧选择一栋建筑开始编辑</p>';
}

// ============ 食堂菜单编辑 ============
function renderCanteenEditor(buildingId) {
  const canteenData = allCanteenData.filter(c => c.buildingId === buildingId);

  if (canteenData.length === 0) {
    return `<div class="section-title">🍜 食堂菜单</div><p style="color:#999;">该建筑没有关联的食堂数据。保存后可在食堂管理中添加。</p>`;
  }

  return canteenData.map(c => `
    <div class="section-title">🍜 食堂菜单：${escapeHtml(c.name)}</div>
    <div id="canteen-edit-${c.id}">
      ${c.stalls.map((stall, si) => `
        <div class="stall-block">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
            <strong>窗口名称：</strong>
            <input type="text" value="${escapeHtml(stall.name)}"
                   onchange="updateStallName('${c.id}',${si},this.value)"
                   style="padding:4px 8px;border:1px solid #ddd;border-radius:6px;font-size:13px;flex:1;margin-left:8px;">
            <button class="btn-small btn-small-del" onclick="deleteStall('${c.id}',${si})">删除窗口</button>
          </div>
          ${stall.items.map((item, ii) => `
            <div class="menu-item-row">
              <input type="text" value="${escapeHtml(item.name)}"
                     onchange="updateMenuItem('${c.id}',${si},${ii},'name',this.value)"
                     placeholder="菜品名">
              <input type="number" step="0.5" value="${item.price}"
                     onchange="updateMenuItem('${c.id}',${si},${ii},'price',parseFloat(this.value))"
                     class="price-input" placeholder="价格">
              <span>¥</span>
              <button class="btn-small btn-small-del" onclick="deleteMenuItem('${c.id}',${si},${ii})">删</button>
            </div>
          `).join('')}
          <button class="btn-small btn-small-add" onclick="addMenuItem('${c.id}',${si})">+ 菜品</button>
        </div>
      `).join('')}
      <button class="btn-small btn-small-add" onclick="addStall('${c.id}')">+ 窗口</button>
    </div>
  `).join('');
}

function updateStallName(canteenId, stallIndex, value) {
  const canteen = allCanteenData.find(c => c.id === canteenId);
  if (canteen && canteen.stalls[stallIndex]) {
    canteen.stalls[stallIndex].name = value;
  }
}

function updateMenuItem(canteenId, stallIndex, itemIndex, field, value) {
  const canteen = allCanteenData.find(c => c.id === canteenId);
  if (canteen && canteen.stalls[stallIndex] && canteen.stalls[stallIndex].items[itemIndex]) {
    canteen.stalls[stallIndex].items[itemIndex][field] = value;
  }
}

function addMenuItem(canteenId, stallIndex) {
  const canteen = allCanteenData.find(c => c.id === canteenId);
  if (canteen && canteen.stalls[stallIndex]) {
    canteen.stalls[stallIndex].items.push({ name: '新菜品', price: 0 });
    renderEditPanel();
  }
}

function deleteMenuItem(canteenId, stallIndex, itemIndex) {
  const canteen = allCanteenData.find(c => c.id === canteenId);
  if (canteen && canteen.stalls[stallIndex]) {
    canteen.stalls[stallIndex].items.splice(itemIndex, 1);
    renderEditPanel();
  }
}

function addStall(canteenId) {
  const canteen = allCanteenData.find(c => c.id === canteenId);
  if (canteen) {
    canteen.stalls.push({ name: '新窗口', items: [] });
    renderEditPanel();
  }
}

function deleteStall(canteenId, stallIndex) {
  const canteen = allCanteenData.find(c => c.id === canteenId);
  if (canteen && canteen.stalls[stallIndex]) {
    canteen.stalls.splice(stallIndex, 1);
    renderEditPanel();
  }
}

async function saveCanteenMenuFromForm(buildingId) {
  const canteens = allCanteenData.filter(c => c.buildingId === buildingId);
  for (const c of canteens) {
    await fetch(`/api/admin/canteens/${c.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: c.name, stalls: c.stalls })
    });
  }
}

// ============ 工具 ============
function showToast(msg, type = 'success') {
  const toast = document.createElement('div');
  toast.className = type === 'error' ? 'toast-error' : 'toast-success';
  toast.textContent = msg;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2000);
}

// ============ 初始化 ============
document.addEventListener('DOMContentLoaded', async () => {
  // 检查是否已登录
  try {
    const res = await fetch('/api/auth/status');
    const data = await res.json();
    if (data.loggedIn) {
      document.getElementById('login-page').style.display = 'none';
      document.getElementById('admin-page').style.display = 'block';
      await loadAdminData();
    }
  } catch (err) {
    // 未登录，保持登录页显示
  }
});
