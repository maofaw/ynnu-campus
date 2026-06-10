// ============================================
// 天气系统 v2 — 实时天气 + 4日预报 + 天气动画
// 数据源：高德天气 API (extensions=base + all)
// ============================================

const WEATHER_KEY = "020ad1e9c45cbef32738d56a6c188362";
const KUNMING_ADCODE = "530100";
const REFRESH_INTERVAL = 30 * 60 * 1000;

// ── 天气 emoji 映射 ──
const WEATHER_EMOJI = {
  "晴": "☀️", "少云": "🌤️", "晴间多云": "⛅", "多云": "⛅", "阴": "☁️",
  "阵雨": "🌦️", "雷阵雨": "⛈️", "雷阵雨伴有冰雹": "⛈️",
  "小雨": "🌧️", "中雨": "🌧️", "大雨": "🌧️",
  "暴雨": "🌧️", "大暴雨": "🌧️", "特大暴雨": "🌧️", "冻雨": "🌨️",
  "雨夹雪": "🌨️", "阵雪": "🌨️",
  "小雪": "❄️", "中雪": "❄️", "大雪": "❄️", "暴雪": "❄️",
  "浮尘": "🌫️", "扬沙": "🌫️", "沙尘暴": "🌫️", "强沙尘暴": "🌫️",
  "雾": "🌫️", "霾": "🌫️", "中度霾": "🌫️", "重度霾": "🌫️", "严重霾": "🌫️",
  "有风": "💨", "微风": "🍃", "和风": "💨", "清风": "💨", "强风": "💨",
  "疾风": "💨", "大风": "💨", "烈风": "💨",
  "风暴": "🌪️", "狂爆风": "🌪️", "飓风": "🌪️", "热带风暴": "🌪️",
  "热": "🔥", "冷": "🥶", "未知": "🌈"
};

// ── 天气动画类型 ──
function getAnimationType(weather) {
  if (/雨|雷|阵雨/.test(weather)) return "rain";
  if (/雪/.test(weather)) return "snow";
  if (/晴/.test(weather)) return "sun";
  if (/暴|飓|台风/.test(weather)) return "storm";
  if (/霾|雾|尘|沙/.test(weather)) return "haze";
  if (/风/.test(weather)) return "wind";
  return "";
}

// ── 周几映射 ──
const WEEKDAYS = { "1": "周一", "2": "周二", "3": "周三", "4": "周四", "5": "周五", "6": "周六", "7": "周日" };

/** 获取天气 emoji */
function getWeatherEmoji(weather) {
  for (const [k, e] of Object.entries(WEATHER_EMOJI)) {
    if (weather.includes(k)) return e;
  }
  return "🌈";
}

// ── API ──
async function fetchCurrentWeather() {
  const url = `https://restapi.amap.com/v3/weather/weatherInfo?key=${WEATHER_KEY}&city=${KUNMING_ADCODE}&extensions=base`;
  try {
    const r = await fetch(url);
    if (!r.ok) throw 0;
    const d = await r.json();
    return d.status === "1" && d.lives ? d.lives[0] : null;
  } catch { return null; }
}

async function fetchForecast() {
  const url = `https://restapi.amap.com/v3/weather/weatherInfo?key=${WEATHER_KEY}&city=${KUNMING_ADCODE}&extensions=all`;
  try {
    const r = await fetch(url);
    if (!r.ok) throw 0;
    const d = await r.json();
    return d.status === "1" && d.forecasts ? d.forecasts[0].casts : null;
  } catch { return null; }
}

// ── 展开状态（刷新时保持） ──
let weatherExpanded = false;

// ── 渲染 ──
function renderWeather(live, casts) {
  const widget = document.getElementById("weather-widget");
  if (!widget) return;
  if (!live) { widget.style.display = "none"; return; }

  const weather = live.weather || "未知";
  const temp = live.temperature || "--";
  const wind = live.winddirection || "";
  const windPower = live.windpower || "";
  const humidity = live.humidity || "";
  const reporttime = live.reporttime || "";
  // 将高德 reporttime 转为时间戳，用于显示相对时间
  const reportTS = reporttime ? new Date(reporttime.replace(/-/g, "/")).getTime() : 0;

  const emoji = getWeatherEmoji(weather);
  const anim = getAnimationType(weather);

  widget.className = "weather-widget weather-loaded" + (weatherExpanded ? " expanded" : "");
  widget.setAttribute("data-anim", anim);
  widget.setAttribute("data-report-ts", reportTS);

  // 主卡片内容
  let html = `
    <div class="weather-row" id="weather-toggle">
      <div class="weather-main">
        <span class="weather-emoji">${emoji}</span>
        <span class="weather-temp">${temp}°C</span>
        <span class="weather-status">${weather}</span>
      </div>
      <span class="weather-chevron">▾</span>
    </div>
    <div class="weather-detail">
      <div class="weather-meta">
        ${wind ? `<span>🌬️ ${wind} ${windPower}级</span>` : ""}
        ${humidity ? `<span>💧 ${humidity}%</span>` : ""}
        <span class="weather-time" id="weather-time">${relativeTime(reportTS)}</span>
      </div>`;

  // 未来预报条
  if (casts && casts.length > 0) {
    html += '<div class="weather-forecast">';
    casts.forEach((c, i) => {
      const dayLabel = i === 0 ? "今天" : (i === 1 ? "明天" : WEEKDAYS[c.week] || c.week);
      html += `
        <div class="forecast-day">
          <span class="forecast-label">${dayLabel}</span>
          <span class="forecast-emoji">${getWeatherEmoji(c.dayweather)}</span>
          <span class="forecast-temp">${c.nighttemp}~${c.daytemp}°</span>
          <span class="forecast-weather">${c.dayweather}</span>
        </div>`;
    });
    html += '</div>';
  }

  html += '</div>';
  widget.innerHTML = html;

  // 天气动画粒子
  applyAnimation(anim, widget);

  // 绑定点击事件
  bindToggle(widget);
}

/** 点击展开/收起 */
function bindToggle(widget) {
  const toggle = widget.querySelector("#weather-toggle");
  if (!toggle) return;

  toggle.addEventListener("click", () => {
    weatherExpanded = !weatherExpanded;
    widget.classList.toggle("expanded", weatherExpanded);
  });
}

/** CSS 天气动画 */
function applyAnimation(type, widget) {
  // 清除旧粒子
  const old = widget.querySelector(".weather-particles");
  if (old) old.remove();
  if (!type) return;

  const particles = document.createElement("div");
  particles.className = `weather-particles particles-${type}`;

  if (type === "rain") {
    particles.innerHTML = Array.from({ length: 20 }, () =>
      `<span class="drop" style="left:${Math.random() * 100}%;animation-delay:${Math.random() * 2}s;animation-duration:${0.5 + Math.random() * 0.8}s"></span>`
    ).join("");
  } else if (type === "snow") {
    particles.innerHTML = Array.from({ length: 15 }, () =>
      `<span class="flake" style="left:${Math.random() * 100}%;animation-delay:${Math.random() * 4}s;animation-duration:${2 + Math.random() * 3}s;font-size:${6 + Math.random() * 10}px">❄</span>`
    ).join("");
  } else if (type === "sun") {
    particles.innerHTML = Array.from({ length: 6 }, (_, i) =>
      `<span class="ray" style="animation-delay:${i * 0.3}s"></span>`
    ).join("");
  }

  widget.appendChild(particles);
}

/** 相对时间："刚刚更新" / "5分钟前更新" / "1小时前更新" */
function relativeTime(ts) {
  if (!ts) return "";
  const diff = Math.max(0, Math.floor((Date.now() - ts) / 1000));
  if (diff < 60) return "刚刚更新";
  if (diff < 3600) return `${Math.floor(diff / 60)}分钟前更新`;
  return `${Math.floor(diff / 3600)}小时前更新`;
}

/** 定时刷新页面上的时间文字（不重新请求 API） */
function startTimeTicker() {
  setInterval(() => {
    const widget = document.getElementById("weather-widget");
    const el = document.getElementById("weather-time");
    if (!widget || !el) return;
    const ts = parseInt(widget.getAttribute("data-report-ts")) || 0;
    el.textContent = relativeTime(ts);
  }, 60000); // 每分钟更新
}

// ── 初始化 ──
async function initWeather() {
  const [live, casts] = await Promise.all([fetchCurrentWeather(), fetchForecast()]);
  if (live) console.log(`🌤️ 天气: ${live.weather} ${live.temperature}°C`);
  if (casts) console.log(`📅 预报: ${casts.length}天`);
  renderWeather(live, casts);
  startTimeTicker();

  setInterval(async () => {
    const [l, c] = await Promise.all([fetchCurrentWeather(), fetchForecast()]);
    renderWeather(l, c);
  }, REFRESH_INTERVAL);
}

document.addEventListener("DOMContentLoaded", initWeather);
