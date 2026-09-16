/**
 * =============================================================================
 * 05-main.js — 부트스트랩 / 이벤트 바인딩 / 타이머 루프
 * =============================================================================
 * ★ 경량 모델 주의 ★
 * - 이벤트는 전부 여기서만 붙인다. 렌더 파일에 addEventListener 를 넣지 마라.
 * - 상태를 바꾼 뒤에는 반드시 saveState() 와 관련 render 함수를 호출해라.
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
  renderActiveTab(STATE.activeTab);
  renderTerrorZones(STATE, META_DATA);
  renderTimerStats(STATE, META_DATA);
  renderBounties(STATE, META_DATA);
  renderFcr(STATE, META_DATA);
  renderCalc(STATE, META_DATA);
  renderRunes(META_DATA);
  renderGambling(META_DATA);
  renderStuckGuide(STATE, META_DATA);
  // [TODO: LITE_MODEL_INSERT_FEATURE_HERE — 새 렌더 함수 호출을 여기 추가]
}

/**
 * 폼 입력값을 STATE.calc 에 반영한다.
 * @returns {void}
 */
function syncCalcInputsToState() {
  const num = (id, fallback) => {
    const v = parseFloat($(id).value);
    return Number.isFinite(v) ? v : fallback;
  };
  STATE.calc.fcr = num('in-fcr', 0);
  STATE.calc.blizzLevel = num('in-blizz', 1);
  STATE.calc.synergyLevel = num('in-syn', 0);
  STATE.calc.coldSkillDamage = num('in-csd', 0);
  STATE.calc.coldMastery = num('in-cm', 0);
  STATE.calc.monsterResist = num('in-mres', 0);
  STATE.calc.convictionMinus = num('in-conv', 0);
  STATE.calc.monsterImmune = $('in-immune').checked;
  STATE.calc.useSunder = $('in-sunder').checked;
}

/**
 * STATE.calc 값을 폼에 채운다. (초기 로드 시)
 * @returns {void}
 */
function syncStateToCalcInputs() {
  $('in-fcr').value = STATE.calc.fcr;
  $('in-blizz').value = STATE.calc.blizzLevel;
  $('in-syn').value = STATE.calc.synergyLevel;
  $('in-csd').value = STATE.calc.coldSkillDamage;
  $('in-cm').value = STATE.calc.coldMastery;
  $('in-mres').value = STATE.calc.monsterResist;
  $('in-conv').value = STATE.calc.convictionMinus;
  $('in-immune').checked = STATE.calc.monsterImmune;
  $('in-sunder').checked = STATE.calc.useSunder;
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

  $('toggle-sunder').checked = STATE.tz.hasSunder;
  $('toggle-hide-done').checked = STATE.bounty.hideDone;
  renderZoneSelect(META_DATA, STATE.tz.selectedZoneId);
  renderSlotSelect(META_DATA, STATE.bounty.filterSlot);
  syncStateToCalcInputs();
  renderAll();
  renderTimerTick(STATE, Date.now());

  /* ---- 탭 ---- */
  $('tabs').addEventListener('click', (e) => {
    const btn = e.target.closest('.tab');
    if (!btn) return;
    STATE.activeTab = btn.dataset.tab;
    renderActiveTab(STATE.activeTab);
    saveState();
  });

  /* ---- 공포의 영역 ---- */
  $('tz-filters').addEventListener('click', (e) => {
    const chip = e.target.closest('.chip');
    if (!chip) return;
    STATE.tz.filterTier = chip.dataset.tier;
    renderTerrorZones(STATE, META_DATA);
    saveState();
  });

  $('toggle-sunder').addEventListener('change', (e) => {
    STATE.tz.hasSunder = e.target.checked;
    STATE.calc.useSunder = e.target.checked;
    $('in-sunder').checked = e.target.checked;
    renderTerrorZones(STATE, META_DATA);
    renderCalc(STATE, META_DATA);
    saveState();
  });

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

  /* ---- 현상수배 ---- */
  $('bounty-grid').addEventListener('change', (e) => {
    const cb = e.target.closest('.bounty-check');
    if (!cb) return;
    STATE.bounty.checked[cb.dataset.bountyId] = cb.checked;
    renderBounties(STATE, META_DATA);
    saveState();
  });
  $('bounty-slot').addEventListener('change', (e) => {
    STATE.bounty.filterSlot = e.target.value;
    renderBounties(STATE, META_DATA);
    saveState();
  });
  $('toggle-hide-done').addEventListener('change', (e) => {
    STATE.bounty.hideDone = e.target.checked;
    renderBounties(STATE, META_DATA);
    saveState();
  });

  /* ---- 치트시트 입력 ---- */
  ['in-fcr', 'in-blizz', 'in-syn', 'in-csd', 'in-cm', 'in-mres', 'in-conv', 'in-immune', 'in-sunder']
    .forEach((id) => {
      $(id).addEventListener('input', () => {
        syncCalcInputsToState();
        renderFcr(STATE, META_DATA);
        renderCalc(STATE, META_DATA);
        saveState();
      });
      $(id).addEventListener('change', () => {
        syncCalcInputsToState();
        renderFcr(STATE, META_DATA);
        renderCalc(STATE, META_DATA);
        saveState();
      });
    });

  /* ---- 전체 초기화 ---- */
  $('btn-reset').addEventListener('click', () => {
    if (!window.confirm('런 기록과 현상수배 체크를 포함해 전부 초기화할까?')) return;
    resetState();
    $('toggle-sunder').checked = STATE.tz.hasSunder;
    $('toggle-hide-done').checked = STATE.bounty.hideDone;
    renderZoneSelect(META_DATA, STATE.tz.selectedZoneId);
    renderSlotSelect(META_DATA, STATE.bounty.filterSlot);
    syncStateToCalcInputs();
    handleStop();
    renderAll();
  });

  /* ---- 진행 가이드 ---- */
  $('guide-paths').addEventListener('change', (e) => {
    const cb = e.target.closest('.guide-check');
    if (!cb) return;
    STATE.guide.checked[cb.dataset.stepId] = cb.checked;
    renderStuckGuide(STATE, META_DATA);
    saveState();
  });

  // [TODO: LITE_MODEL_INSERT_FEATURE_HERE — 새 이벤트 바인딩을 여기 추가]

  /* ---- 타이머 루프 (100ms) ---- */
  TICK_HANDLE = window.setInterval(() => {
    if (STATE.timer.running) renderTimerTick(STATE, Date.now());
  }, 100);
}

document.addEventListener('DOMContentLoaded', init);
