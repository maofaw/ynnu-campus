// 统一封装 fetch 请求
const API = {
  async getBuildings(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`/api/buildings?${query}`);
    if (!res.ok) throw new Error('获取建筑数据失败');
    return res.json();
  },

  async getBuilding(id) {
    const res = await fetch(`/api/buildings/${id}`);
    if (!res.ok) throw new Error('获取建筑详情失败');
    return res.json();
  },

  async getCanteens() {
    const res = await fetch('/api/canteens');
    if (!res.ok) throw new Error('获取食堂数据失败');
    return res.json();
  },

  async getCanteen(id) {
    const res = await fetch(`/api/canteens/${id}`);
    if (!res.ok) throw new Error('获取食堂菜单失败');
    return res.json();
  }
};
