// ============================================
// 搜索增强 — 支持中文、拼音全拼、拼音首字母、模糊匹配
// ============================================

// 汉字→拼音 映射表（覆盖 38 栋建筑名称中出现的全部汉字，共 89 字）
const PINYIN_MAP = {
  一:"yi", 与:"yu", 业:"ye", 东:"dong", 中:"zhong", 主:"zhu", 义:"yi",
  书:"shu", 仿:"fang", 众:"zhong", 传:"chuan", 体:"ti", 作:"zuo",
  健:"jian", 儿:"er", 克:"ke", 公:"gong", 创:"chuang", 动:"dong",
  区:"qu", 历:"li", 史:"shi", 号:"hao", 启:"qi", 和:"he", 哲:"zhe",
  园:"yuan", 国:"guo", 图:"tu", 场:"chang", 堂:"tang", 处:"chu",
  外:"wai", 大:"da", 媒:"mei", 学:"xue", 实:"shi", 寓:"yu",
  察:"cha", 就:"jiu", 属:"shu", 工:"gong", 幼:"you", 广:"guang",
  德:"de", 心:"xin", 思:"si", 拟:"ni", 政:"zheng", 教:"jiao",
  文:"wen", 明:"ming", 检:"jian", 楼:"lou", 汇:"hui", 法:"fa",
  泳:"yong", 活:"huo", 济:"ji", 游:"you", 烛:"zhu", 球:"qiu",
  理:"li", 生:"sheng", 监:"jian", 真:"zhen", 研:"yan", 究:"jiu",
  管:"guan", 红:"hong", 纪:"ji", 练:"lian", 经:"jing", 育:"yu",
  虚:"xu", 行:"xing", 西:"xi", 计:"ji", 训:"xun", 设:"she",
  语:"yu", 足:"zu", 部:"bu", 附:"fu", 院:"yuan", 食:"shi",
  馆:"guan", 马:"ma", 验:"yan"
};

/**
 * 获取汉字的拼音全拼（无声调），不在映射表中返回原字符
 */
function toPinyin(str) {
  let result = "";
  for (const ch of str) {
    result += PINYIN_MAP[ch] || ch.toLowerCase();
  }
  return result;
}

/**
 * 获取拼音首字母
 */
function toPinyinInitials(str) {
  let result = "";
  for (const ch of str) {
    const py = PINYIN_MAP[ch];
    if (py) {
      result += py[0];
    } else {
      const lower = ch.toLowerCase();
      result += /[a-z]/.test(lower) ? lower : "";
    }
  }
  return result;
}

/**
 * 判断 query 是否为拼音搜索（全小写字母）
 */
function isPinyinQuery(query) {
  return /^[a-z]+$/.test(query);
}

/**
 * 模糊匹配：query 的字符在 target 中按顺序出现（子序列匹配）
 * 例如 "图收馆" 中 "图" 和 "馆" 出现在 "图书馆" 中
 */
function fuzzySequenceMatch(query, target) {
  let qi = 0;
  for (let ti = 0; ti < target.length && qi < query.length; ti++) {
    if (target[ti] === query[qi]) qi++;
  }
  return qi === query.length;
}

/**
 * 编辑距离（Levenshtein Distance）
 */
function levenshtein(a, b) {
  const m = a.length, n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;

  let prev = Array.from({ length: n + 1 }, (_, i) => i);
  let curr = new Array(n + 1);
  for (let i = 1; i <= m; i++) {
    curr[0] = i;
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost);
    }
    [prev, curr] = [curr, prev];
  }
  return prev[n];
}

/**
 * 滑动窗口编辑距离匹配：target 中任一与 query 等长的子串编辑距离 ≤ maxDist
 */
function levenshteinMatch(query, target, maxDist) {
  const qlen = query.length, tlen = target.length;
  if (qlen > tlen) return levenshtein(query, target) <= maxDist;
  for (let i = 0; i <= tlen - qlen; i++) {
    if (levenshtein(query, target.slice(i, i + qlen)) <= maxDist) return true;
  }
  return false;
}

/**
 * 判断建筑是否匹配关键词
 */
function matchesBuilding(b, kw, kwLower, isPinyin) {
  const name = b.name;

  if (isPinyin) {
    // 拼音全拼匹配
    if (toPinyin(name).includes(kwLower)) return true;
    // 拼音首字母匹配
    if (toPinyinInitials(name).includes(kwLower)) return true;
    return false;
  }

  // 中文搜索 — 只匹配建筑名字
  // 1. 精确子串匹配
  if (name.toLowerCase().includes(kwLower)) return true;

  // 2. 子序列匹配（容忍少字/多字）
  if (kw.length >= 2) {
    if (fuzzySequenceMatch(kw, name)) return true;
  }

  // 3. 编辑距离容错（1 个错别字）
  if (kw.length >= 2 && kw.length <= 6) {
    if (levenshteinMatch(kw, name, 1)) return true;
  }

  return false;
}

/**
 * 判断活动是否匹配关键词
 */
function matchesEvent(e, kw, kwLower, isPinyin) {
  const title = e.title;
  const org = e.organizer || "";
  const etags = (e.tags || []).join(" ");

  if (isPinyin) {
    if (toPinyin(title).includes(kwLower)) return true;
    if (toPinyinInitials(title).includes(kwLower)) return true;
    if (toPinyin(org).includes(kwLower)) return true;
    for (const t of (e.tags || [])) {
      if (toPinyin(t).includes(kwLower)) return true;
      if (toPinyinInitials(t).includes(kwLower)) return true;
    }
    return false;
  }

  if (title.toLowerCase().includes(kwLower)) return true;
  if (org.toLowerCase().includes(kwLower)) return true;
  if (etags.toLowerCase().includes(kwLower)) return true;

  if (kw.length >= 2) {
    if (fuzzySequenceMatch(kw, title)) return true;
    if (fuzzySequenceMatch(kw, etags)) return true;
  }
  if (kw.length >= 2 && kw.length <= 6) {
    if (levenshteinMatch(kw, title, 1)) return true;
  }

  return false;
}

/**
 * 核心搜索：返回 { buildings, events }
 */
function performSearch(keyword) {
  const results = { buildings: [], events: [] };
  if (!keyword || keyword.length === 0) return results;

  const kw = keyword.trim();
  const kwLower = kw.toLowerCase();
  const isPinyin = isPinyinQuery(kwLower);

  if (typeof allBuildings !== "undefined") {
    for (const b of allBuildings) {
      if (matchesBuilding(b, kw, kwLower, isPinyin)) {
        results.buildings.push(b);
      }
    }
    // 自然排序（汇学楼1区 < 汇学楼2区 < 汇学楼3区）
    results.buildings.sort((a, b) => a.name.localeCompare(b.name, 'zh-CN', { numeric: true }));
    results.buildings = results.buildings.slice(0, 8);
  }

  if (typeof allEvents !== "undefined") {
    for (const e of allEvents) {
      if (matchesEvent(e, kw, kwLower, isPinyin)) {
        results.events.push(e);
      }
    }
    results.events = results.events.slice(0, 3);
  }

  return results;
}

// ============================================
// DOM 事件绑定
// ============================================
document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("search-input");
  const results = document.getElementById("search-results");
  if (!input || !results) return;

  let searchTimer;

  input.addEventListener("input", () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      const keyword = input.value.trim();

      if (keyword.length === 0) {
        results.classList.remove("show");
        results.innerHTML = "";
        return;
      }

      const matched = performSearch(keyword);
      let html = "";

      if (matched.buildings.length > 0) {
        matched.buildings.forEach((b) => {
          html += `<li onclick="selectBuilding('${b.id}')">
            <span class="result-name">🏢 ${highlightMatch(b.name, keyword)}</span>
            <span class="result-category">${(typeof CATEGORY_LABELS !== "undefined" && CATEGORY_LABELS[b.category]) || "其他"}</span>
          </li>`;
        });
      }

      matched.events.forEach((e) => {
        const bld = typeof allBuildings !== "undefined"
          ? allBuildings.find((b) => (b.id || b._id) === e.buildingId)
          : null;
        html += `<li onclick="jumpToEvent('${e.id}')">
          <span class="result-name">📢 ${highlightMatch(e.title, keyword)}</span>
          <span class="result-category">${bld ? bld.name : e.organizer}</span>
        </li>`;
      });

      if (!html) {
        html = '<li class="no-result">未找到匹配的建筑或活动</li>';
      }

      results.innerHTML = html;
      results.classList.add("show");
    }, 150);
  });

  // 键盘导航
  let selectedIndex = -1;
  input.addEventListener("keydown", (e) => {
    const items = results.querySelectorAll("li:not(.no-result)");
    if (items.length === 0) { selectedIndex = -1; return; }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      selectedIndex = Math.min(selectedIndex + 1, items.length - 1);
      items.forEach((item, i) => item.classList.toggle("selected", i === selectedIndex));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      selectedIndex = Math.max(selectedIndex - 1, 0);
      items.forEach((item, i) => item.classList.toggle("selected", i === selectedIndex));
    } else if (e.key === "Enter" && selectedIndex >= 0) {
      e.preventDefault();
      items[selectedIndex].click();
    } else {
      selectedIndex = -1;
    }
  });

  // 输入变化时重置选中
  input.addEventListener("input", () => { selectedIndex = -1; });

  document.addEventListener("click", (e) => {
    if (!e.target.closest(".search-box")) {
      results.classList.remove("show");
      selectedIndex = -1;
    }
  });
});

// ============================================
// 辅助函数
// ============================================

function selectBuilding(id) {
  const building = allBuildings.find((b) => b.id === id || b._id === id);
  if (!building) return;

  map.setZoomAndCenter(18, [building.lng, building.lat]);

  document.querySelectorAll(".building-card").forEach((c) => c.classList.remove("active-card"));
  const card = document.querySelector(`.building-card[data-id="${id}"]`);
  if (card) {
    card.classList.add("active-card");
    card.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  showDetail(building);

  document.getElementById("search-results").classList.remove("show");
  document.getElementById("search-input").value = building.name;
}

function highlightMatch(text, keyword) {
  if (!keyword) return text;
  const regex = new RegExp(`(${escapeRegExp(keyword)})`, "gi");
  return text.replace(regex, "<mark>$1</mark>");
}

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
