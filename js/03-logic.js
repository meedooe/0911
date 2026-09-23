/**
 * =============================================================================
 * 03-logic.js — 순수 비즈니스 로직
 * =============================================================================
 * ★ 경량 모델 주의 ★
 * - 이 파일 안에서는 document / window / STATE 를 **직접 쓰면 안 된다.**
 *   필요한 값은 전부 함수 인자로 받아라. 그래야 node로 테스트가 된다.
 * - 모든 함수는 "같은 입력 → 같은 출력". 부작용 금지.
 * - 새 계산 함수는 파일 맨 아래 앵커 밑에 추가하고, test/logic.test.mjs 에 테스트를 1개 추가해라.
 * - 2026-09-24: 맵 티어 평가/딜 계산/체크리스트 진행률 등은 guide.html 쪽으로 이전됐다.
 *   여기 남은 건 스피드런 타이머가 실제로 쓰는 함수뿐이다.
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
 * 스피드런 랩타임 & 세션 카운터 — 시간 계산
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
 * 공포의 영역 — 파밍 효율 점수 (guide.html #zones 표의 점수와 같은 식)
 * ------------------------------------------------------------------------- */

/**
 * 지역의 파밍 효율 점수(0~100)를 계산한다. guide.html의 지역 표가 이 식을 그대로 쓴다고
 * 각주에 밝히고 있으므로, 점수를 바꾸려면 이 함수와 guide.html #zones 표를 같이 고쳐라.
 * 가중치: 냉기면역 낮을수록 40점, 밀도 30점, 지역레벨 85 여부 20점, 런타임 짧을수록 10점.
 * @param {{density:number, coldImmune:number, areaLevel:number, runTimeSec:number}} zone - 지역 정보
 * @param {boolean} [hasSunder=true] - 냉기 파괴참 보유 여부. guide.html 표는 보유 기준으로 계산했다.
 * @returns {number} 0~100 점수 (정수)
 */
function computeZoneScore(zone, hasSunder) {
  const sunder = hasSunder === undefined ? true : hasSunder;
  const immunePenalty = sunder ? zone.coldImmune * 0.5 : zone.coldImmune;
  const immuneScore = clamp((5 - immunePenalty) / 5, 0, 1) * 40;
  const densityScore = clamp(zone.density / 5, 0, 1) * 30;
  const levelScore = zone.areaLevel >= 85 ? 20 : (zone.areaLevel >= 83 ? 12 : 4);
  const timeScore = clamp((360 - zone.runTimeSec) / 300, 0, 1) * 10;
  return Math.round(immuneScore + densityScore + levelScore + timeScore);
}

// [TODO: LITE_MODEL_INSERT_FEATURE_HERE — 새 순수 계산 함수를 여기 추가하고 test/logic.test.mjs 에 테스트를 넣어라]

// Node 테스트용 내보내기 (브라우저에서는 무시됨)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    esc, clamp, formatDuration, computeSessionStats, evaluatePace, computeZoneScore
  };
}
