/**
 * =============================================================================
 * 03-logic.js — 순수 비즈니스 로직
 * =============================================================================
 * ★ 경량 모델 주의 ★
 * - 이 파일 안에서는 document / window / STATE 를 **직접 쓰면 안 된다.**
 *   필요한 값은 전부 함수 인자로 받아라. 그래야 node로 테스트가 된다.
 * - 모든 함수는 "같은 입력 → 같은 출력". 부작용 금지.
 * - 새 계산 함수는 파일 맨 아래 앵커 밑에 추가하고, test/logic.test.mjs 에 테스트를 1개 추가해라.
 * =============================================================================
 */

/* eslint-disable no-unused-vars */

/* ---------------------------------------------------------------------------
 * 공통 유틸
 * ------------------------------------------------------------------------- */

/**
 * HTML 이스케이프. innerHTML에 문자열을 넣기 전 반드시 통과시킬 것.
 * @param {*} value - 임의 값
 * @returns {string} 이스케이프된 문자열
 */
function esc(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

/**
 * 값을 [min, max] 범위로 자른다.
 * @param {number} value - 입력값
 * @param {number} min - 하한
 * @param {number} max - 상한
 * @returns {number} 범위 내로 조정된 값
 */
function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

/* ---------------------------------------------------------------------------
 * 기능 2) 스피드런 랩타임 & 세션 카운터 — 시간 계산
 * ------------------------------------------------------------------------- */

/**
 * 밀리초를 "m:ss.d" 형태 문자열로 바꾼다. 1시간 넘으면 "h:mm:ss".
 * @param {number} ms - 밀리초 (음수는 0으로 처리)
 * @returns {string} 사람이 읽는 시간 문자열
 */
function formatDuration(ms) {
  const total = Math.max(0, Math.floor(ms));
  const h = Math.floor(total / 3600000);
  const m = Math.floor((total % 3600000) / 60000);
  const s = Math.floor((total % 60000) / 1000);
  const d = Math.floor((total % 1000) / 100);
  if (h > 0) return h + ':' + String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
  return m + ':' + String(s).padStart(2, '0') + '.' + d;
}

/**
 * 세션 통계 요약.
 * @typedef {Object} SessionStats
 * @property {number} count      - 완료 런 수
 * @property {number} totalMs    - 총 소요 시간(ms)
 * @property {number} avgMs      - 평균 런 타임(ms). 런이 없으면 0
 * @property {number} bestMs     - 최고 기록(ms). 런이 없으면 0
 * @property {number} worstMs    - 최악 기록(ms). 런이 없으면 0
 * @property {number} lastMs     - 마지막 런(ms). 런이 없으면 0
 * @property {number} runsPerHour- 현재 평균 기준 시간당 런 수 (소수 1자리)
 * @property {number} trendMs    - 최근 3런 평균 - 전체 평균 (음수면 빨라지는 중)
 */

/**
 * 런 기록 배열로부터 세션 통계를 계산한다.
 * @param {Array<{ms:number}>} runs - 완료된 런 기록들
 * @returns {SessionStats} 통계 객체
 */
function computeSessionStats(runs) {
  const list = Array.isArray(runs) ? runs.filter((r) => r && typeof r.ms === 'number' && r.ms > 0) : [];
  const empty = { count: 0, totalMs: 0, avgMs: 0, bestMs: 0, worstMs: 0, lastMs: 0, runsPerHour: 0, trendMs: 0 };
  if (list.length === 0) return empty;

  const times = list.map((r) => r.ms);
  const totalMs = times.reduce((a, b) => a + b, 0);
  const avgMs = totalMs / times.length;
  const recent = times.slice(-3);
  const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;

  return {
    count: times.length,
    totalMs: totalMs,
    avgMs: Math.round(avgMs),
    bestMs: Math.min.apply(null, times),
    worstMs: Math.max.apply(null, times),
    lastMs: times[times.length - 1],
    runsPerHour: avgMs > 0 ? Math.round((3600000 / avgMs) * 10) / 10 : 0,
    trendMs: Math.round(recentAvg - avgMs)
  };
}

/**
 * 목표 런타임 대비 현재 평균이 얼마나 벌어졌는지 평가한다.
 * @param {number} avgMs - 현재 평균 런타임(ms)
 * @param {number} targetSec - 목표 런타임(초). META_DATA.terrorZones[].runTimeSec
 * @returns {{deltaMs:number, ratio:number, grade:"빠름"|"적정"|"느림"|"측정없음"}} 평가 결과
 */
function evaluatePace(avgMs, targetSec) {
  if (!avgMs || !targetSec) return { deltaMs: 0, ratio: 0, grade: '측정없음' };
  const targetMs = targetSec * 1000;
  const ratio = avgMs / targetMs;
  let grade = '적정';
  if (ratio <= 0.9) grade = '빠름';
  else if (ratio >= 1.2) grade = '느림';
  return { deltaMs: Math.round(avgMs - targetMs), ratio: Math.round(ratio * 100) / 100, grade: grade };
}

/* ---------------------------------------------------------------------------
 * 기능 1) 공포의 영역 메타 분석기 — 티어 평가
 * ------------------------------------------------------------------------- */

/** 티어 순서 (좋은 것 -> 나쁜 것) */
const TIER_ORDER = ['S', 'A', 'B', 'D'];

/**
 * 파괴참 보유 여부를 반영해 지역 티어를 재평가한다.
 * 데이터의 tier는 "파괴참 보유" 기준이므로, 미보유 + needSunder면 한 단계 강등한다.
 * @param {Object} zone - META_DATA.terrorZones 항목
 * @param {boolean} hasSunder - 냉기 파괴참 보유 여부
 * @returns {{tier:string, baseTier:string, adjusted:boolean, reason:string}} 재평가 결과
 */
function evaluateZoneTier(zone, hasSunder) {
  const base = TIER_ORDER.indexOf(zone.tier) >= 0 ? zone.tier : 'B';
  if (zone.needSunder && !hasSunder) {
    const idx = Math.min(TIER_ORDER.length - 1, TIER_ORDER.indexOf(base) + 1);
    return {
      tier: TIER_ORDER[idx],
      baseTier: base,
      adjusted: true,
      reason: '냉기 파괴참 미보유 — 냉기 면역 몹 처리 불가로 한 단계 강등'
    };
  }
  return { tier: base, baseTier: base, adjusted: false, reason: '' };
}

/**
 * 지역의 파밍 효율 점수(0~100)를 계산한다. 티어 색과 별개로 정렬/비교용.
 * 가중치: 냉기면역 낮을수록 40점, 밀도 30점, 지역레벨 85 여부 20점, 런타임 짧을수록 10점.
 * @param {Object} zone - META_DATA.terrorZones 항목
 * @param {boolean} hasSunder - 냉기 파괴참 보유 여부
 * @returns {number} 0~100 점수 (정수)
 */
function computeZoneScore(zone, hasSunder) {
  const immunePenalty = hasSunder ? zone.coldImmune * 0.5 : zone.coldImmune;
  const immuneScore = clamp((5 - immunePenalty) / 5, 0, 1) * 40;
  const densityScore = clamp(zone.density / 5, 0, 1) * 30;
  const levelScore = zone.areaLevel >= 85 ? 20 : (zone.areaLevel >= 83 ? 12 : 4);
  const timeScore = clamp((360 - zone.runTimeSec) / 300, 0, 1) * 10;
  return Math.round(immuneScore + densityScore + levelScore + timeScore);
}

/**
 * 티어 필터와 정렬을 적용한 지역 목록을 만든다.
 * @param {Object[]} zones - META_DATA.terrorZones
 * @param {string} filterTier - "ALL" 또는 "S"|"A"|"B"|"D"
 * @param {boolean} hasSunder - 냉기 파괴참 보유 여부
 * @returns {Array<Object>} 평가값(evalTier/score)이 붙은 지역 목록. 점수 내림차순.
 */
function buildZoneView(zones, filterTier, hasSunder) {
  return zones
    .map((z) => {
      const ev = evaluateZoneTier(z, hasSunder);
      return Object.assign({}, z, {
        evalTier: ev.tier,
        tierAdjusted: ev.adjusted,
        tierReason: ev.reason,
        score: computeZoneScore(z, hasSunder)
      });
    })
    .filter((z) => filterTier === 'ALL' || z.evalTier === filterTier)
    .sort((a, b) => (TIER_ORDER.indexOf(a.evalTier) - TIER_ORDER.indexOf(b.evalTier)) || (b.score - a.score));
}

/* ---------------------------------------------------------------------------
 * 기능 3) 현상수배 보드 — 진행률
 * ------------------------------------------------------------------------- */

/**
 * 현상수배 달성률을 계산한다.
 * @param {Object[]} bounties - META_DATA.bounties
 * @param {Record<string, boolean>} checked - id -> 획득 여부
 * @returns {{done:number, total:number, pct:number, byPriority:Object}} 진행률 요약
 */
function computeBountyProgress(bounties, checked) {
  const map = checked || {};
  const total = bounties.length;
  const done = bounties.filter((b) => map[b.id]).length;
  const byPriority = { 1: { done: 0, total: 0 }, 2: { done: 0, total: 0 }, 3: { done: 0, total: 0 } };
  bounties.forEach((b) => {
    const p = byPriority[b.priority] || (byPriority[b.priority] = { done: 0, total: 0 });
    p.total += 1;
    if (map[b.id]) p.done += 1;
  });
  return { done: done, total: total, pct: total ? Math.round((done / total) * 100) : 0, byPriority: byPriority };
}

/**
 * 부위 필터 / 완료 숨김을 적용한 현상수배 목록을 만든다.
 * @param {Object[]} bounties - META_DATA.bounties
 * @param {Record<string, boolean>} checked - id -> 획득 여부
 * @param {string} filterSlot - "ALL" 또는 slot 값
 * @param {boolean} hideDone - 획득한 항목 숨기기
 * @returns {Array<Object>} done 플래그가 붙은 목록. 우선순위 -> 수요등급 순.
 */
function buildBountyView(bounties, checked, filterSlot, hideDone) {
  const map = checked || {};
  const tierRank = { T0: 0, T1: 1, T2: 2, T3: 3 };
  return bounties
    .map((b) => Object.assign({}, b, { done: !!map[b.id] }))
    .filter((b) => filterSlot === 'ALL' || b.slot === filterSlot)
    .filter((b) => !(hideDone && b.done))
    .sort((a, b) => (a.priority - b.priority) || ((tierRank[a.tradeTier] || 9) - (tierRank[b.tradeTier] || 9)));
}

/* ---------------------------------------------------------------------------
 * 기능 4-1) 브레이크포인트 (FCR / FHR / FBR)
 * ------------------------------------------------------------------------- */

/**
 * 현재 수치가 속한 브레이크포인트와 다음 목표를 찾는다.
 * @param {Array<{stat:number, frames:number}>} table - 브레이크포인트 표 (stat 오름차순)
 * @param {number} value - 현재 스탯 수치(%)
 * @returns {{frames:number, currentStat:number, nextStat:(number|null), nextFrames:(number|null), needed:number}}
 *          needed = 다음 구간까지 더 필요한 수치. 최대 구간이면 0.
 */
function findBreakpoint(table, value) {
  const v = Number.isFinite(value) ? value : 0;
  let current = table[0];
  for (let i = 0; i < table.length; i++) {
    if (v >= table[i].stat) current = table[i];
  }
  const idx = table.indexOf(current);
  const next = idx < table.length - 1 ? table[idx + 1] : null;
  return {
    frames: current.frames,
    currentStat: current.stat,
    nextStat: next ? next.stat : null,
    nextFrames: next ? next.frames : null,
    needed: next ? next.stat - v : 0
  };
}

/**
 * 프레임을 초당 시전 횟수로 환산한다 (D2 기준 25프레임/초).
 * @param {number} frames - 시전 프레임 수
 * @returns {number} 초당 시전 횟수 (소수 2자리)
 */
function framesToCastsPerSecond(frames) {
  if (!frames || frames <= 0) return 0;
  return Math.round((25 / frames) * 100) / 100;
}

/* ---------------------------------------------------------------------------
 * 기능 4-2) 블리자드 딜 계산기
 * ⚠ 데미지 앵커 사이 구간은 선형 보간(근사치)이다. 인게임 스킬창 수치와 오차가 있을 수 있다.
 * ------------------------------------------------------------------------- */

/**
 * 앵커 표를 선형 보간해 특정 스킬 레벨의 블리자드 기본 데미지를 구한다.
 * @param {Array<{level:number,min:number,max:number}>} anchors - 검증된 앵커 포인트들
 * @param {number} level - 블리자드 스킬 레벨 (아이템 보너스 포함)
 * @returns {{min:number, max:number, approximate:boolean}} 기본 데미지. approximate=true면 보간값.
 */
function interpolateBlizzardDamage(anchors, level) {
  const lv = clamp(Math.round(level), 1, anchors[anchors.length - 1].level);
  for (let i = 0; i < anchors.length; i++) {
    if (anchors[i].level === lv) return { min: anchors[i].min, max: anchors[i].max, approximate: false };
  }
  let lo = anchors[0];
  let hi = anchors[anchors.length - 1];
  for (let i = 0; i < anchors.length - 1; i++) {
    if (lv > anchors[i].level && lv < anchors[i + 1].level) { lo = anchors[i]; hi = anchors[i + 1]; }
  }
  const t = (lv - lo.level) / (hi.level - lo.level);
  return {
    min: Math.round(lo.min + (hi.min - lo.min) * t),
    max: Math.round(lo.max + (hi.max - lo.max) * t),
    approximate: true
  };
}

/**
 * 몬스터의 최종 냉기 저항을 계산한다.
 * 규칙: 원래 면역이 아니면 저항 감소(냉기 숙련 + 천벌)가 100% 적용된다.
 *       원래 면역이면 파괴참으로 면역을 깬 뒤, 저항 감소가 축소된 비율로만 적용된다.
 * @param {Object} cfg - 입력값
 * @param {number} cfg.monsterResist - 몬스터 기본 냉기 저항(%)
 * @param {boolean} cfg.monsterImmune - 원래 냉기 면역인가
 * @param {boolean} cfg.useSunder - 냉기 파괴참 착용 여부
 * @param {number} cfg.coldMastery - 냉기 숙련 레벨(= 저항 감소 %)
 * @param {number} cfg.convictionMinus - 천벌 오라 저항 감소(%)
 * @param {Object} consts - META_DATA.blizzard
 * @returns {{effectiveResist:number, blocked:boolean, pierceRate:number, notes:string[]}}
 *          blocked=true면 면역을 못 깨서 데미지가 들어가지 않는 상태.
 */
function computeEffectiveResist(cfg, consts) {
  const notes = [];
  const totalMinus = (cfg.coldMastery || 0) + (cfg.convictionMinus || 0);

  if (cfg.monsterImmune && !cfg.useSunder) {
    notes.push('냉기 면역 몬스터인데 파괴참이 없다 → 데미지 0. 무기 스왑이나 용병에게 맡겨라.');
    return { effectiveResist: 100, blocked: true, pierceRate: 0, notes: notes };
  }

  let baseResist = cfg.monsterResist || 0;
  let pierceRate = 1;

  if (cfg.monsterImmune && cfg.useSunder) {
    baseResist = consts.sunderedResist;
    pierceRate = consts.immunePierceEffectiveness;
    notes.push('파괴참으로 면역 해제 → 저항 ' + consts.sunderedResist + '%에서 시작, 저항 감소는 ' +
      Math.round(pierceRate * 100) + '%만 적용 (커뮤니티 통용값, 패치 확인 필요).');
  }

  const eff = Math.max(consts.minEffectiveResist, baseResist - totalMinus * pierceRate);
  return { effectiveResist: Math.round(eff * 10) / 10, blocked: false, pierceRate: pierceRate, notes: notes };
}

/**
 * 블리자드 최종 데미지를 계산한다.
 * 공식: 기본데미지 × (1 + 시너지% + 장비 냉기기술데미지%) × (1 - 최종저항/100)
 * @param {Object} cfg - STATE.calc 와 동일한 형태의 입력값
 * @param {Object} consts - META_DATA.blizzard
 * @returns {{baseMin:number, baseMax:number, boostedMin:number, boostedMax:number,
 *            finalMin:number, finalMax:number, multiplier:number, synergyPct:number,
 *            effectiveResist:number, blocked:boolean, approximate:boolean, notes:string[]}}
 */
function computeBlizzardDamage(cfg, consts) {
  const base = interpolateBlizzardDamage(consts.damageAnchors, cfg.blizzLevel);
  const synergyPct = (cfg.synergyLevel || 0) * consts.synergyPercentPerLevel * consts.synergySkills.length;
  const multiplier = 1 + (synergyPct / 100) + ((cfg.coldSkillDamage || 0) / 100);

  const boostedMin = Math.round(base.min * multiplier);
  const boostedMax = Math.round(base.max * multiplier);

  const res = computeEffectiveResist(cfg, consts);
  const resMult = res.blocked ? 0 : (1 - res.effectiveResist / 100);

  const notes = res.notes.slice();
  if (base.approximate) notes.push('기본 데미지는 위키 앵커값 사이를 선형 보간한 근사치다. 정확한 수치는 인게임 스킬창에서 확인해라.');
  notes.push('블리자드는 장판이 여러 번 히트하는 스킬이라 화면 표기 데미지와 체감 DPS는 다르다.');

  return {
    baseMin: base.min,
    baseMax: base.max,
    boostedMin: boostedMin,
    boostedMax: boostedMax,
    finalMin: Math.round(boostedMin * resMult),
    finalMax: Math.round(boostedMax * resMult),
    multiplier: Math.round(multiplier * 100) / 100,
    synergyPct: synergyPct,
    effectiveResist: res.effectiveResist,
    blocked: res.blocked,
    approximate: base.approximate,
    notes: notes
  };
}

/* ---------------------------------------------------------------------------
 * 기능 4-3) 오늘 뭐 돌지 — 목적별 지역 추천
 * ------------------------------------------------------------------------- */

/**
 * 목적(전략)에 맞는 상위 지역 3곳을 고른다.
 * - top-tier: 티어(S>A>B>D) 우선, 동률이면 점수 높은 순 (buildZoneView 정렬 그대로)
 * - safe-density: 냉기면역 2 이하(안정적으로 잡히는 곳)만 두고 밀도 높은 순
 * - fast-loop: 런타임 짧은 순
 * @param {Object[]} zones - META_DATA.terrorZones
 * @param {"top-tier"|"safe-density"|"fast-loop"} strategy - 추천 전략
 * @param {boolean} hasSunder - 냉기 파괴참 보유 여부
 * @returns {Array<Object>} evalTier/score가 붙은 상위 3개 지역 (전략에 맞는 것이 없으면 빈 배열)
 */
function recommendZonesForGoal(zones, strategy, hasSunder) {
  const view = buildZoneView(zones, 'ALL', hasSunder);
  if (strategy === 'safe-density') {
    return view.filter((z) => z.coldImmune <= 2).sort((a, b) => b.density - a.density).slice(0, 3);
  }
  if (strategy === 'fast-loop') {
    return view.slice().sort((a, b) => a.runTimeSec - b.runTimeSec).slice(0, 3);
  }
  return view.slice(0, 3);
}

/* ---------------------------------------------------------------------------
 * 기능 5) 진행 가이드 — 체크리스트 진행률
 * ------------------------------------------------------------------------- */

/**
 * 체크리스트 경로 하나의 진행률을 계산한다.
 * @param {{id:string}[]} steps - 경로의 단계들 (META_DATA.stuckGuide.paths[].steps)
 * @param {Record<string, boolean>} checked - 스텝 id -> 완료 여부
 * @returns {{done:number, total:number, pct:number}} 진행률 요약
 */
function computeChecklistProgress(steps, checked) {
  const map = checked || {};
  const list = Array.isArray(steps) ? steps : [];
  const total = list.length;
  const done = list.filter((s) => map[s.id]).length;
  return { done: done, total: total, pct: total ? Math.round((done / total) * 100) : 0 };
}

// [TODO: LITE_MODEL_INSERT_FEATURE_HERE — 새 순수 계산 함수를 여기 추가하고 test/logic.test.mjs 에 테스트를 넣어라]

// Node 테스트용 내보내기 (브라우저에서는 무시됨)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    esc, clamp, formatDuration, computeSessionStats, evaluatePace,
    evaluateZoneTier, computeZoneScore, buildZoneView,
    computeBountyProgress, buildBountyView,
    findBreakpoint, framesToCastsPerSecond,
    interpolateBlizzardDamage, computeEffectiveResist, computeBlizzardDamage,
    recommendZonesForGoal, computeChecklistProgress,
    TIER_ORDER
  };
}
