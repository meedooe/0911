/**
 * =============================================================================
 * 05-main.js — 부트스트랩 / 이벤트 바인딩 / 타이머 루프
 * =============================================================================
 * ★ 경량 모델 주의 ★
 * - 이벤트는 전부 여기서만 붙인다. 렌더 파일에 addEventListener 를 넣지 마라.
 * - 상태를 바꾼 뒤에는 반드시 saveState() 와 관련 render 함수를 호출해라.
 * - 2026-09-24: 탭/현상수배/치트시트/막힘 가이드 이벤트는 guide.html 쪽으로
 *   이전됐다. 여기 남은 건 스피드런 타이머 하나뿐이다.
 * =============================================================================
 */

/* eslint-disable no-unused-vars */

/** @type {number|null} 타이머 인터벌 핸들 */
let TICK_HANDLE = null;

/**
 * 화면 전체를 다시 그린다. 상태가 크게 바뀐 뒤 호출한다.
 * @returns {void}
 */
function renderAll() {
  renderTimerStats(STATE, META_DATA);
  // [TODO: LITE_MODEL_INSERT_FEATURE_HERE — 새 렌더 함수 호출을 여기 추가]
}

/**
 * 랩 버튼: 정지 상태면 시작, 측정 중이면 랩 기록 후 즉시 다음 런 시작.
 * @returns {void}
 */
function handleLap() {
  const now = Date.now();
  if (!STATE.timer.running) {
    STATE.timer.running = true;
    STATE.timer.startedAt = now;
    $('btn-lap').textContent = '랩 기록 / 다음 런';
  } else {
    STATE.timer.runs.push({
      index: STATE.timer.runs.length + 1,
      ms: now - STATE.timer.startedAt,
      zoneId: STATE.tz.selectedZoneId,
      at: now
    });
    STATE.timer.startedAt = now;
    renderTimerStats(STATE, META_DATA);
  }
  saveState();
}

/**
 * 측정을 중단한다. 진행 중이던 런은 기록하지 않는다.
 * @returns {void}
 */
function handleStop() {
  STATE.timer.running = false;
  STATE.timer.startedAt = 0;
  $('btn-lap').textContent = '런 시작';
  renderTimerTick(STATE, Date.now());
  saveState();
}

/**
 * 앱 초기화. DOMContentLoaded 이후 1회 실행.
 * @returns {void}
 */
function init() {
  loadState();

  $('data-date').textContent = META_DATA.lastResearched;
  $('storage-note').textContent = STORAGE.available
    ? '저장소: localStorage 사용 중'
    : '저장소를 쓸 수 없는 환경이라 기록이 새로고침 시 사라진다';

  renderZoneSelect(META_DATA, STATE.tz.selectedZoneId);
  renderAll();
  renderTimerTick(STATE, Date.now());

  /* ---- 랩타임 ---- */
  $('timer-zone').addEventListener('change', (e) => {
    STATE.tz.selectedZoneId = e.target.value;
    renderTimerStats(STATE, META_DATA);
    saveState();
  });
  $('btn-lap').addEventListener('click', handleLap);
  $('btn-stop').addEventListener('click', handleStop);
  $('btn-clear-runs').addEventListener('click', () => {
    if (!window.confirm('이 세션의 런 기록을 전부 지울까?')) return;
    STATE.timer.runs = [];
    handleStop();
    renderTimerStats(STATE, META_DATA);
    saveState();
  });

  /* ---- 전체 초기화 ---- */
  $('btn-reset').addEventListener('click', () => {
    if (!window.confirm('런 기록을 전부 초기화할까?')) return;
    resetState();
    renderZoneSelect(META_DATA, STATE.tz.selectedZoneId);
    handleStop();
    renderAll();
  });

  // [TODO: LITE_MODEL_INSERT_FEATURE_HERE — 새 이벤트 바인딩을 여기 추가]

  /* ---- 타이머 루프 (100ms) ---- */
  TICK_HANDLE = window.setInterval(() => {
    if (STATE.timer.running) renderTimerTick(STATE, Date.now());
  }, 100);
}

document.addEventListener('DOMContentLoaded', init);
