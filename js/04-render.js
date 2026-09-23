/**
 * =============================================================================
 * 04-render.js — DOM 렌더링 전담
 * =============================================================================
 * ★ 경량 모델 주의 ★
 * - 이 파일은 "그리기"만 한다. 숫자 계산이 필요하면 03-logic.js 에 함수를 만들어 호출해라.
 * - 문자열을 innerHTML 에 넣을 때는 반드시 esc() 를 통과시켜라.
 * - 이벤트 리스너는 여기서 붙이지 않는다. 05-main.js 의 이벤트 위임을 쓴다.
 * - 2026-09-24: 맵 티어 카드/현상수배 보드/치트시트/막힘 가이드 렌더 함수는
 *   guide.html 쪽으로 이전됐다. 여기 남은 건 스피드런 타이머 렌더뿐이다.
 * =============================================================================
 */

/* eslint-disable no-unused-vars */

/**
 * id로 엘리먼트를 가져온다.
 * @param {string} id - 엘리먼트 id
 * @returns {HTMLElement|null} 엘리먼트
 */
function $(id) { return document.getElementById(id); }

/* ---------------------------------------------------------------------------
 * 스피드런 랩타임 / 세션 카운터
 * ------------------------------------------------------------------------- */

/**
 * 측정 대상 지역 <select> 를 채운다. (최초 1회만 호출)
 * @param {Object} data - META_DATA
 * @param {string} selectedId - 선택할 지역 id
 * @returns {void}
 */
function renderZoneSelect(data, selectedId) {
  $('timer-zone').innerHTML = data.terrorZones
    .map((z) => '<option value="' + esc(z.id) + '"' + (z.id === selectedId ? ' selected' : '') + '>' +
      esc(z.nameKo) + ' (' + esc(z.tier) + ')</option>')
    .join('');
}

/**
 * 진행 중인 타이머 숫자만 갱신한다. (100ms 루프에서 호출되므로 가볍게 유지할 것)
 * @param {Object} state - STATE
 * @param {number} now - 현재 시각(ms)
 * @returns {void}
 */
function renderTimerTick(state, now) {
  const elapsed = state.timer.running ? now - state.timer.startedAt : 0;
  const el = $('timer-now');
  el.textContent = formatDuration(elapsed);
  el.classList.toggle('running', state.timer.running);
}

/**
 * 세션 통계 카드 + 랩 목록을 그린다.
 * @param {Object} state - STATE
 * @param {Object} data - META_DATA
 * @returns {void}
 */
function renderTimerStats(state, data) {
  const stats = computeSessionStats(state.timer.runs);
  const zone = data.terrorZones.find((z) => z.id === state.tz.selectedZoneId) || data.terrorZones[0];
  const pace = evaluatePace(stats.avgMs, zone.runTimeSec);

  $('timer-target').textContent = '목표: ' + zone.nameKo + ' ' + formatDuration(zone.runTimeSec * 1000) +
    (stats.count ? ' · 현재 페이스 ' + pace.grade : '');

  const cards = [
    { label: '완료 런', value: stats.count + '회' },
    { label: '평균', value: stats.count ? formatDuration(stats.avgMs) : '—' },
    { label: '최고', value: stats.count ? formatDuration(stats.bestMs) : '—' },
    { label: '총 시간', value: formatDuration(stats.totalMs) },
    { label: '시간당 런', value: stats.runsPerHour ? stats.runsPerHour + '회' : '—' },
    {
      label: '최근 3런 추세',
      value: stats.count >= 2 ? (stats.trendMs <= 0 ? '▼ ' : '▲ ') + formatDuration(Math.abs(stats.trendMs)) : '—',
      cls: stats.count >= 2 ? (stats.trendMs <= 0 ? 'good' : 'bad') : ''
    }
  ];

  $('timer-stats').innerHTML = cards.map((c) =>
    '<div class="stat-card"><span class="stat-label">' + esc(c.label) + '</span>' +
    '<span class="stat-value ' + (c.cls || '') + '">' + esc(c.value) + '</span></div>'
  ).join('');

  const runs = state.timer.runs.slice().reverse();
  $('timer-laps').innerHTML = runs.length
    ? '<table class="lap-table"><thead><tr><th>#</th><th>지역</th><th>기록</th><th>평균 대비</th></tr></thead><tbody>' +
      runs.map((r) => {
        const z = data.terrorZones.find((x) => x.id === r.zoneId);
        const diff = r.ms - stats.avgMs;
        const isBest = r.ms === stats.bestMs;
        return '<tr' + (isBest ? ' class="best"' : '') + '>' +
          '<td>' + esc(r.index) + '</td>' +
          '<td>' + esc(z ? z.nameKo : r.zoneId) + '</td>' +
          '<td>' + esc(formatDuration(r.ms)) + (isBest ? ' 🏅' : '') + '</td>' +
          '<td class="' + (diff <= 0 ? 'good' : 'bad') + '">' + (diff <= 0 ? '-' : '+') + esc(formatDuration(Math.abs(diff))) + '</td>' +
          '</tr>';
      }).join('') + '</tbody></table>'
    : '<p class="empty">아직 기록이 없다. "런 시작"을 누르고 한 바퀴 돌면 랩이 쌓인다.</p>';
  // [TODO: LITE_MODEL_INSERT_FEATURE_HERE — 랩타임 통계 항목 추가]
}

// [TODO: LITE_MODEL_INSERT_FEATURE_HERE — 새 렌더 함수를 여기 추가하고 05-main.js 의 renderAll() 에 호출을 넣어라]
