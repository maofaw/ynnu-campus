// 统一封装数据请求（纯静态，直接读 JSON 文件）
const API = {
  async getBuildings(params = {}) {
    const res = await fetch('data/buildings.json');
    if (!res.ok) throw new Error('获取建筑数据失败');
    let buildings = await res.json();

    // 本地过滤（原服务端逻辑）
    if (params.category) {
      buildings = buildings.filter(b => b.category === params.category);
    }
    if (params.search) {
      const keyword = params.search.toLowerCase();
      buildings = buildings.filter(b =>
        b.name.toLowerCase().includes(keyword) ||
        (b.tags || []).some(tag => tag.toLowerCase().includes(keyword))
      );
    }
    return buildings;
  },

  async getBuilding(id) {
    const buildings = await API.getBuildings();
    const building = buildings.find(b => b.id === id);
    if (!building) throw new Error('建筑不存在');
    return building;
  },

  async getCanteens() {
    const res = await fetch('data/canteens.json');
    if (!res.ok) throw new Error('获取食堂数据失败');
    return res.json();
  },

  async getCanteen(id) {
    const canteens = await API.getCanteens();
    const item = canteens.find(c => c.id === id);
    if (!item) throw new Error('食堂不存在');
    return item;
  }
};
