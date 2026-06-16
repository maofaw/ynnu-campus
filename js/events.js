// ============================================
// 校园活动日历 + 实时更新（新10）
// ============================================

let calendarView = 'list';
let eventsUpdateTimer = null;
const UPDATE_INTERVAL = 5 * 60 * 1000; // 5分钟刷新

// ── 渲染活动视图 ──
function renderEventsView(events) {
  const container = document.getElementById('events-scroll');
  if (!container) return;

  if (calendarView === 'calendar') {
    renderCalendarView(container, events);
  } else {
    renderListView(container, events);
  }

  // 更新切换按钮文字
  const toggleBtn = document.getElementById('cal-toggle-btn');
  if (toggleBtn) {
    toggleBtn.textContent = calendarView === 'calendar' ? '📋 列表' : '📅 日历';
  }

  // 手机端底部活动横条
  renderMobileEventsBar(events);
}

// ── 手机端活动横条 ──
function renderMobileEventsBar(events) {
  const bar = document.getElementById('mobile-events-bar');
  if (!bar) return;
  if (!events || events.length === 0) {
    bar.classList.add('hidden');
    return;
  }
  bar.classList.remove('hidden');
  bar.innerHTML = events.slice(0, 5).map(e => {
    const date = new Date(e.startTime);
    const dateStr = `${date.getMonth()+1}/${date.getDate()}`;
    return `<span class="mobile-event-chip" onclick="jumpToEvent('${e.id}')">${e.title} · ${dateStr}</span>`;
  }).join('') + `<button class="mobile-events-cal-btn" onclick="toggleCalendarView()" title="日历">📅</button>`;
}

// ── 列表视图 ──
function renderListView(container, events) {
  if (!events || events.length === 0) {
    container.innerHTML = '<div class="events-loading">暂无近期活动</div>';
    return;
  }
  container.innerHTML = events.slice(0, 5).map(e => {
    const date = formatEventDate(e.startTime);
    const tag = (e.tags || [])[0] || '';
    const timeLeft = getTimeLeft(e.startTime);
    return `
      <div class="event-mini-card" onclick="jumpToEvent('${e.id}')">
        <div class="event-mini-title">${e.title}</div>
        <div class="event-mini-meta">📅 ${date} · ${e.organizer} ${timeLeft ? '· ⏰ ' + timeLeft : ''}</div>
        ${tag ? `<span class="event-mini-tag">${tag}</span>` : ''}
      </div>
    `;
  }).join('');
}

// ── 日历视图 ──
function renderCalendarView(container, events) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();

  const eventsByDay = {};
  events.forEach(e => {
    const d = new Date(e.startTime).getDate();
    if (!eventsByDay[d]) eventsByDay[d] = [];
    eventsByDay[d].push(e);
  });

  const monthNames = ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'];
  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];

  let html = `<div class="calendar-header">
    <span class="calendar-month">📅 ${monthNames[month]} ${year}</span>
    <button class="calendar-toggle" onclick="toggleCalendarView()">📋 列表</button>
  </div>`;

  html += '<div class="calendar-grid">';
  weekDays.forEach(d => { html += `<div class="cal-day-header">${d}</div>`; });

  for (let i = 0; i < firstDayOfWeek; i++) {
    html += '<div class="cal-day empty"></div>';
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const isToday = day === now.getDate();
    const dayEvents = eventsByDay[day] || [];
    html += `<div class="cal-day ${isToday ? 'today' : ''} ${dayEvents.length ? 'has-event' : ''}">
      <div class="cal-day-num">${day}</div>`;
    dayEvents.slice(0, 2).forEach(e => {
      html += `<div class="cal-event-dot" title="${e.title}" onclick="jumpToEvent('${e.id}')">${e.title.slice(0, 6)}</div>`;
    });
    if (dayEvents.length > 2) {
      html += `<div class="cal-event-more">+${dayEvents.length - 2}</div>`;
    }
    html += '</div>';
  }
  html += '</div>';

  container.innerHTML = html;
}

// ── 切换列表/日历视图 ──
function toggleCalendarView() {
  calendarView = calendarView === 'list' ? 'calendar' : 'list';
  if (typeof allEvents !== 'undefined') {
    renderEventsView(allEvents);
  }
}

// ── 实时更新 ──
function startEventsPolling() {
  if (eventsUpdateTimer) clearInterval(eventsUpdateTimer);
  eventsUpdateTimer = setInterval(async () => {
    try {
      if (typeof API !== 'undefined' && API.getEvents) {
        const freshEvents = await API.getEvents({ upcoming: true });
        if (freshEvents && freshEvents.length > 0) {
          const oldIds = (allEvents || []).map(e => e.id).sort().join(',');
          const newIds = freshEvents.map(e => e.id).sort().join(',');
          if (oldIds !== newIds) {
            allEvents = freshEvents;
            eventsByBuilding = {};
            allEvents.forEach(e => {
              if (!eventsByBuilding[e.buildingId]) eventsByBuilding[e.buildingId] = [];
              eventsByBuilding[e.buildingId].push(e);
            });
            renderEventsView(allEvents);
            if (typeof allBuildings !== 'undefined') {
              clearMarkers();
              allBuildings.forEach(b => createMarker(b));
            }
          }
        }
      }
    } catch (err) {
      console.warn('活动更新检查失败:', err.message);
    }
  }, UPDATE_INTERVAL);
}

// ── 倒计时 ──
function getTimeLeft(isoStr) {
  const now = Date.now();
  const target = new Date(isoStr).getTime();
  const diff = target - now;
  if (diff < 0) return '已开始';
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  if (days > 0) return `${days}天后`;
  if (hours > 0) return `${hours}小时后`;
  return '即将开始';
}

// ── 初始化 ──
const origRenderEventStrip = window.renderEventStrip;
window.renderEventStrip = function(events) {
  renderEventsView(events);
  startEventsPolling();
};

// 暴露全局
window.toggleCalendarView = toggleCalendarView;
