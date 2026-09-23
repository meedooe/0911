/**
 * =============================================================================
 * 04-render.js — DOM 렌더링 전담
 * =============================================================================
 * ★ 경량 모델 주의 ★
 * - 이 파일은 "그리기"만 한다. 숫자 계산이 필요하면 03-logic.js 에 함수를 만들어 호출해라.
 * - 문자열을 innerHTML 에 넣을 때는 반드시 esc() 를 통과시켜라.
 * - 이벤트 리스너는 여기서 붙이지 않는다. 05-main.js 의 이벤트 위임을 쓴다.
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
 * 1) 공포의 영역
 * ------------------------------------------------------------------------- */

/**
 * 0~5 스케일을 막대 문자열로 만든다.
 * @param {number} value - 0~5 값
 * @param {string} filled - 채운 칸 문자
 * @param {string} empty - 빈 칸 문자
 * @returns {string} 시각화 문자열
 */
function scaleBar(value, filled, empty) {
  const v = clamp(Math.round(value), 0, 5);
  return filled.repeat(v) + empty.repeat(5 - v);
}

/**
 * 공포의 영역 카드 그리드를 그린다.
 * @param {Object} state - STATE
 * @param {Object} data - META_DATA
 * @returns {void}
 */
function renderTerrorZones(state, data) {
  const view = buildZoneView(data.terrorZones, state.tz.filterTier, state.tz.hasSunder);
  const html = view.map((z) => {
    const tierCls = 'tier-' + z.evalTier.toLowerCase();
    const adjusted = z.tierAdjusted
      ? '<div class="zone-warn">⚠ ' + esc(z.tierReason) + '</div>'
      : '';
    return '' +
      '<article class="zone-card ' + tierCls + '">' +
        '<div class="zone-top">' +
          '<span class="tier-badge ' + tierCls + '">' + esc(z.evalTier) + '</span>' +
          '<div class="zone-name"><strong>' + esc(z.nameKo) + '</strong><span>' + esc(z.nameEn) + '</span></div>' +
          '<span class="zone-score" title="파밍 효율 점수 (0~100)">' + z.score + '</span>' +
        '</div>' +
        '<div class="zone-meta">' +
          '<span>액트 ' + esc(z.act) + '</span>' +
          '<span>지역 레벨 ' + esc(z.areaLevel) + '</span>' +
          '<span>목표 ' + Math.floor(z.runTimeSec / 60) + '분 ' + (z.runTimeSec % 60) + '초</span>' +
        '</div>' +
        '<div class="zone-bars">' +
          '<div><label>밀도</label><span class="bar good">' + scaleBar(z.density, '■', '□') + '</span></div>' +
          '<div><label>냉기면역</label><span class="bar bad">' + scaleBar(z.coldImmune, '■', '□') + '</span></div>' +
        '</div>' +
        adjusted +
        '<ul class="zone-loot">' + z.loot.map((l) => '<li>' + esc(l) + '</li>').join('') + '</ul>' +
        '<p class="zone-note">' + esc(z.note) + '</p>' +
      '</article>';
  }).join('');

  $('tz-grid').innerHTML = html || '<p class="empty">해당 티어의 지역이 없다.</p>';

  Array.prototype.forEach.call(document.querySelectorAll('#tz-filters .chip'), (el) => {
    el.classList.toggle('active', el.dataset.tier === state.tz.filterTier);
  });
  // [TODO: LITE_MODEL_INSERT_FEATURE_HERE — 공포의 영역 카드에 표시할 항목 추가]
}

/* ---------------------------------------------------------------------------
 * 2) 랩타임 / 세션 카운터
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

/* ---------------------------------------------------------------------------
 * 3) 현상수배 보드
 * ------------------------------------------------------------------------- */

/** 부위 코드 -> 한글 라벨 */
const SLOT_LABEL = {
  weapon: '무기', shield: '방패', helm: '투구', armor: '갑옷', gloves: '장갑',
  belt: '벨트', boots: '신발', amulet: '목걸이', ring: '반지', charm: '참', merc: '용병'
};

/**
 * 부위 필터 <select> 를 채운다. (최초 1회만)
 * @param {Object} data - META_DATA
 * @param {string} selected - 선택 값
 * @returns {void}
 */
function renderSlotSelect(data, selected) {
  const slots = ['ALL'].concat(Object.keys(SLOT_LABEL).filter((s) => data.bounties.some((b) => b.slot === s)));
  $('bounty-slot').innerHTML = slots.map((s) =>
    '<option value="' + esc(s) + '"' + (s === selected ? ' selected' : '') + '>' +
    (s === 'ALL' ? '전체 부위' : esc(SLOT_LABEL[s])) + '</option>').join('');
}

/**
 * 현상수배 진행률 + 카드 목록을 그린다.
 * @param {Object} state - STATE
 * @param {Object} data - META_DATA
 * @returns {void}
 */
function renderBounties(state, data) {
  const prog = computeBountyProgress(data.bounties, state.bounty.checked);
  $('bounty-progress').innerHTML =
    '<div class="progress-head"><strong>졸업 진행률</strong>' +
    '<span>' + prog.done + ' / ' + prog.total + ' (' + prog.pct + '%)</span></div>' +
    '<div class="progress-bar"><i style="width:' + prog.pct + '%"></i></div>' +
    '<div class="progress-sub">' +
      '최우선 ' + prog.byPriority[1].done + '/' + prog.byPriority[1].total + ' · ' +
      '중간 ' + prog.byPriority[2].done + '/' + prog.byPriority[2].total + ' · ' +
      '여유 ' + prog.byPriority[3].done + '/' + prog.byPriority[3].total +
    '</div>';

  const view = buildBountyView(data.bounties, state.bounty.checked, state.bounty.filterSlot, state.bounty.hideDone);
  $('bounty-grid').innerHTML = view.length ? view.map((b) => {
    const runes = b.runes.length
      ? '<div class="runes">' + b.runes.map((r) => '<span class="rune">' + esc(r) + '</span>').join('') + '</div>'
      : '';
    return '' +
      '<label class="bounty-card' + (b.done ? ' done' : '') + '" data-bounty-id="' + esc(b.id) + '">' +
        '<input type="checkbox" class="bounty-check" data-bounty-id="' + esc(b.id) + '"' + (b.done ? ' checked' : '') + '>' +
        '<div class="bounty-body">' +
          '<div class="bounty-top">' +
            '<span class="pill pill-' + esc(b.tradeTier.toLowerCase()) + '">' + esc(b.tradeTier) + '</span>' +
            '<span class="pill pill-slot">' + esc(SLOT_LABEL[b.slot] || b.slot) + '</span>' +
            '<span class="pill pill-p' + esc(b.priority) + '">우선순위 ' + esc(b.priority) + '</span>' +
            (b.verified ? '' : '<span class="badge badge-warn">근사치</span>') +
          '</div>' +
          '<h4>' + esc(b.nameKo) + '</h4>' +
          '<p class="en">' + esc(b.nameEn) + '</p>' +
          runes +
          (b.baseItem ? '<p class="base">베이스: ' + esc(b.baseItem) + '</p>' : '') +
          '<ul class="stats">' + b.stats.map((s) => '<li>' + esc(s) + '</li>').join('') + '</ul>' +
          '<p class="bounty-note">' + esc(b.note) + '</p>' +
        '</div>' +
      '</label>';
  }).join('') : '<p class="empty">조건에 맞는 아이템이 없다.</p>';
  // [TODO: LITE_MODEL_INSERT_FEATURE_HERE — 현상수배 카드에 표시할 항목 추가]
}

/* ---------------------------------------------------------------------------
 * 4) 치트시트
 * ------------------------------------------------------------------------- */

/**
 * FCR 결과 + 브레이크포인트 표를 그린다.
 * @param {Object} state - STATE
 * @param {Object} data - META_DATA
 * @returns {void}
 */
function renderFcr(state, data) {
  const bp = findBreakpoint(data.fcrBreakpoints, state.calc.fcr);
  const cps = framesToCastsPerSecond(bp.frames);

  $('fcr-result').innerHTML =
    '<div class="bp-result">' +
      '<div class="bp-big">' + bp.frames + '<small>프레임</small></div>' +
      '<div class="bp-side">' +
        '<p>초당 시전 약 <strong>' + cps + '회</strong></p>' +
        (bp.nextStat !== null
          ? '<p>다음 구간 <strong>' + bp.nextStat + '%</strong> → ' + bp.nextFrames + '프레임 (<strong>+' + bp.needed + '%</strong> 필요)</p>'
          : '<p class="good">최고 구간 도달. 더 올려도 프레임은 안 줄어든다.</p>') +
      '</div>' +
    '</div>';

  $('fcr-table').innerHTML =
    '<thead><tr><th>FCR %</th><th>프레임</th><th>초당 시전</th></tr></thead><tbody>' +
    data.fcrBreakpoints.map((r) =>
      '<tr' + (r.stat === bp.currentStat ? ' class="active"' : '') + '>' +
      '<td>' + r.stat + '</td><td>' + r.frames + '</td><td>' + framesToCastsPerSecond(r.frames) + '</td></tr>'
    ).join('') + '</tbody>';
}

/**
 * 블리자드 딜 계산 결과를 그린다.
 * @param {Object} state - STATE
 * @param {Object} data - META_DATA
 * @returns {void}
 */
function renderCalc(state, data) {
  const r = computeBlizzardDamage(state.calc, data.blizzard);
  const blockedCls = r.blocked ? ' blocked' : '';

  $('calc-result').innerHTML =
    '<div class="calc-out' + blockedCls + '">' +
      '<div class="calc-row"><span>기본 데미지</span><strong>' + r.baseMin + ' ~ ' + r.baseMax + '</strong></div>' +
      '<div class="calc-row"><span>시너지 +' + r.synergyPct + '% · 장비 냉뎀 +' + (state.calc.coldSkillDamage || 0) + '%</span>' +
        '<strong>×' + r.multiplier + '</strong></div>' +
      '<div class="calc-row"><span>증폭 후</span><strong>' + r.boostedMin + ' ~ ' + r.boostedMax + '</strong></div>' +
      '<div class="calc-row"><span>몬스터 최종 냉기 저항</span><strong>' + r.effectiveResist + '%</strong></div>' +
      '<div class="calc-final"><span>최종 데미지</span><strong>' + r.finalMin + ' ~ ' + r.finalMax + '</strong></div>' +
    '</div>' +
    '<ul class="calc-notes">' + r.notes.map((n) => '<li>' + esc(n) + '</li>').join('') + '</ul>';
  // [TODO: LITE_MODEL_INSERT_FEATURE_HERE — 계산기 출력 항목 추가]
}

/**
 * 룬 수요 등급 목록을 그린다.
 * @param {Object} data - META_DATA
 * @returns {void}
 */
function renderRunes(data) {
  const groups = {};
  data.runes.forEach((r) => { (groups[r.tier] = groups[r.tier] || []).push(r); });
  $('rune-list').innerHTML = Object.keys(groups).map((tier) =>
    '<div class="rune-group"><h5>' + esc(tier) + '</h5>' +
    groups[tier].map((r) =>
      '<div class="rune-row"><span class="rune">' + esc(r.nameEn) + '</span>' +
      '<span class="rune-ko">' + esc(r.nameKo) + '</span>' +
      '<span class="rune-use">' + esc(r.usedIn.join(', ')) + '</span></div>'
    ).join('') + '</div>'
  ).join('');
}

/**
 * 도박(Gheed's Gambling) 안내 카드를 그린다.
 * @param {Object} data - META_DATA
 * @returns {void}
 */
function renderGambling(data) {
  const g = data.gambling;
  const el = $('gamble-info');
  if (!el) return;

  el.innerHTML =
    '<p class="base">' + esc(g.host) + '</p>' +
    '<ul class="calc-notes">' + g.howItWorks.map((h) => '<li>' + esc(h) + '</li>').join('') + '</ul>' +
    '<p class="base">극블리 소서 기준 노려볼 부위</p>' +
    '<ul class="stats">' + g.sorcTargets.map((t) =>
      '<li><strong>' + esc(t.slot) + '</strong> — ' + esc(t.why) + '</li>').join('') + '</ul>' +
    '<p class="bounty-note">' + esc(g.caution) + '</p>' +
    (g.verified ? '' : '<p class="bounty-note">⚠ ' + esc(g.note) + '</p>');
}

/* ---------------------------------------------------------------------------
 * 5) 진행 가이드
 * ------------------------------------------------------------------------- */

/**
 * "오늘 뭐 돌지" 30초 결정 카드를 그린다. 목적 버튼 + 추천 지역 3곳.
 * @param {Object} state - STATE
 * @param {Object} data - META_DATA
 * @returns {void}
 */
function renderTodayPicker(state, data) {
  const picker = data.todayPicker;
  const goalId = state.guide.selectedGoal;
  const goal = picker.goals.find((g) => g.id === goalId) || picker.goals[0];

  $('today-intro').innerHTML =
    '<p class="guide-status-line">' + esc(picker.intro) + '</p>' +
    '<p class="hint">' + esc(picker.tzPrincipleNote) + '</p>';

  $('today-goals').innerHTML = picker.goals.map((g) =>
    '<button type="button" class="chip today-goal' + (g.id === goalId ? ' active' : '') + '" data-goal-id="' + esc(g.id) + '">' +
      esc(g.label) +
    '</button>'
  ).join('');

  const zones = recommendZonesForGoal(data.terrorZones, goal.strategy, state.tz.hasSunder);
  const list = zones.length
    ? zones.map((z) => {
        const tierCls = 'tier-' + z.evalTier.toLowerCase();
        return '' +
          '<div class="today-zone">' +
            '<span class="tier-badge ' + tierCls + '">' + esc(z.evalTier) + '</span>' +
            '<div class="today-zone-body">' +
              '<strong>' + esc(z.nameKo) + '</strong>' +
              '<span class="today-zone-meta">밀도 ' + z.density + '/5 · 목표 ' + Math.floor(z.runTimeSec / 60) + '분 ' + (z.runTimeSec % 60) + '초</span>' +
              '<p>' + esc(z.note) + '</p>' +
            '</div>' +
          '</div>';
      }).join('')
    : '<p class="empty">조건에 맞는 지역이 없다. 냉기 파괴참 확보 후 다시 확인해라.</p>';

  $('today-recommend').innerHTML =
    '<p class="hint">' + esc(goal.hint) + '</p>' +
    '<div class="today-zones">' + list + '</div>';
}

/**
 * "막혔을 때" 상태 카드 + 경로 체크리스트를 그린다.
 * @param {Object} state - STATE
 * @param {Object} data - META_DATA
 * @returns {void}
 */
function renderStuckGuide(state, data) {
  const g = data.stuckGuide;
  const checked = state.guide.checked;

  $('guide-status').innerHTML =
    '<p class="guide-status-line">' + esc(g.statusNote) + '</p>' +
    '<ul class="calc-notes">' + g.immediateTips.map((t) => '<li>' + esc(t) + '</li>').join('') + '</ul>';

  $('guide-paths').innerHTML = g.paths.map((path) => {
    const prog = computeChecklistProgress(path.steps, checked);
    const doneCls = prog.total && prog.done === prog.total ? ' done' : '';
    return '' +
      '<article class="guide-path' + doneCls + '">' +
        '<div class="progress-head"><strong>' + esc(path.title) + '</strong>' +
          '<span>' + prog.done + ' / ' + prog.total + ' (' + prog.pct + '%)</span></div>' +
        '<div class="progress-bar"><i style="width:' + prog.pct + '%"></i></div>' +
        '<p class="hint">' + esc(path.summary) + '</p>' +
        '<ul class="guide-steps">' + path.steps.map((s) => {
          const isDone = !!checked[s.id];
          return '<li class="' + (isDone ? 'done' : '') + '">' +
            '<label>' +
              '<input type="checkbox" class="guide-check" data-step-id="' + esc(s.id) + '"' + (isDone ? ' checked' : '') + '>' +
              '<span>' + esc(s.text) + '</span>' +
            '</label>' +
          '</li>';
        }).join('') + '</ul>' +
      '</article>';
  }).join('');
  // [TODO: LITE_MODEL_INSERT_FEATURE_HERE — 진행 가이드에 표시할 항목 추가]
}

/**
 * 현재 활성 탭에 맞게 패널 표시를 전환한다.
 * @param {string} tabId - 탭 id
 * @returns {void}
 */
function renderActiveTab(tabId) {
  Array.prototype.forEach.call(document.querySelectorAll('.tab'), (el) => {
    el.classList.toggle('active', el.dataset.tab === tabId);
  });
  Array.prototype.forEach.call(document.querySelectorAll('.panel'), (el) => {
    el.classList.toggle('visible', el.id === 'panel-' + tabId);
  });
}

// [TODO: LITE_MODEL_INSERT_FEATURE_HERE — 새 렌더 함수를 여기 추가하고 05-main.js 의 renderAll() 에 호출을 넣어라]
