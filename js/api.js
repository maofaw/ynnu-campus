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
