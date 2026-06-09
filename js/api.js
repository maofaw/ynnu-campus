// ============================================
// 数据层：从 CloudBase 四个集合读取
// campus_buildings / campus_canteens / campus_depts / campus_events
// ============================================

const API = {
  // ── 通用：等待 CloudBase 就绪 ──
  async _ensureReady() {
    if (cloudbaseReady) return;
    // 轮询等待（最多 10s）
    for (let i = 0; i < 100; i++) {
      await new Promise(r => setTimeout(r, 100));
      if (cloudbaseReady) return;
    }
    throw new Error('CloudBase 初始化超时');
  },

  // ── 校园建筑主集合 ──
  async getBuildings(params = {}) {
    await this._ensureReady();
    try {
      const res = await db.collection('campus_buildings')
        .limit(200)
        .get();
      let buildings = res.data || [];

      // 服务端类别过滤
      if (params.category) {
        buildings = buildings.filter(b => b.category === params.category);
      }
      // 关键词搜索（客户端过滤）
      if (params.search) {
        const kw = params.search.toLowerCase();
        buildings = buildings.filter(b =>
          b.name.toLowerCase().includes(kw) ||
          (b.tags || []).some(t => t.toLowerCase().includes(kw))
        );
      }
      return buildings;
    } catch (err) {
      console.error('读取 campus_buildings 失败:', err);
      return [];
    }
  },

  async getBuilding(id) {
    const buildings = await this.getBuildings();
    return buildings.find(b => b._id === id || b.id === id) || null;
  },

  // ── 食堂集合 ──
  async getCanteens(params = {}) {
    await this._ensureReady();
    try {
      const res = await db.collection('campus_canteens')
        .limit(200)
        .get();
      let canteens = res.data || [];

      if (params.buildingId) {
        canteens = canteens.filter(c => c.buildingId === params.buildingId);
      }
      return canteens;
    } catch (err) {
      console.error('读取 campus_canteens 失败:', err);
      return [];
    }
  },

  async getCanteen(id) {
    const canteens = await this.getCanteens();
    return canteens.find(c => c._id === id || c.id === id) || null;
  },

  // ── 行政部门集合 ──
  async getDepts() {
    await this._ensureReady();
    try {
      const res = await db.collection('campus_depts')
        .limit(200)
        .get();
      return res.data || [];
    } catch (err) {
      console.error('读取 campus_depts 失败:', err);
      return [];
    }
  },

  // ── 场地活动集合 ──
  async getEvents(params = {}) {
    await this._ensureReady();
    try {
      let query = db.collection('campus_events').limit(200);

      // 只查未过期的活动
      if (params.upcoming) {
        query = query.where({
          status: 'upcoming'
        });
      }
      const res = await query.get();
      return res.data || [];
    } catch (err) {
      console.error('读取 campus_events 失败:', err);
      return [];
    }
  },

  // ── 聚合：地图上所有标注点（建筑 + 食堂 + 行政部门） ──
  async getAllLocations() {
    await this._ensureReady();
    const [buildings, canteens, depts] = await Promise.all([
      this.getBuildings(),
      this.getCanteens(),
      this.getDepts()
    ]);
    return [...buildings, ...canteens, ...depts];
  }
};
