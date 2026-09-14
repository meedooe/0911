/**
 * =============================================================================
 * 01-state.js — 런타임 상태 관리 + 저장소 어댑터
 * =============================================================================
 * ★ 경량 모델 주의 ★
 * - "변하는 값"은 전부 여기 STATE 안에 있다. 다른 파일에서 전역 변수를 새로 만들지 마라.
 * - 새 상태가 필요하면 STATE의 해당 섹션 안에 키를 추가하고, DEFAULT_STATE에도 똑같이 추가해라.
 * - 로직/렌더 함수는 여기 있는 것을 읽기만 하고, 변경은 아래 setter 계열 함수로만 한다.
 * =============================================================================
 */

/* eslint-disable no-unused-vars */

/**
 * localStorage 안전 래퍼.
 * 사생활 보호 모드/파일 프로토콜 등에서 예외가 날 수 있어 전부 try/catch로 감싸고,
 * 실패하면 메모리 저장으로 자동 폴백한다. (저장이 안 돼도 앱은 정상 동작해야 한다)
 * @namespace
 */
const STORAGE = {
  /** @type {Record<string, string>} localStorage 불가 시 사용하는 메모리 폴백 */
  _memory: {},
  /** @type {boolean} localStorage 사용 가능 여부 */
  available: (() => {
    try {
      const k = '__d2r_probe__';
      window.localStorage.setItem(k, '1');
      window.localStorage.removeItem(k);
      return true;
    } catch (e) {
      return false;
    }
  })(),

  /**
   * 값 읽기.
   * @param {string} key - 저장 키
   * @param {*} fallback - 없거나 파싱 실패 시 반환할 기본값
   * @returns {*} 저장된 값 또는 fallback
   */
  get(key, fallback) {
    try {
      const raw = this.available ? window.localStorage.getItem(key) : this._memory[key];
      return raw == null ? fallback : JSON.parse(raw);
    } catch (e) {
      return fallback;
    }
  },

  /**
   * 값 쓰기.
   * @param {string} key - 저장 키
   * @param {*} value - JSON 직렬화 가능한 값
   * @returns {boolean} 저장 성공 여부
   */
  set(key, value) {
    try {
      const raw = JSON.stringify(value);
      if (this.available) window.localStorage.setItem(key, raw);
      else this._memory[key] = raw;
      return true;
    } catch (e) {
      return false;
    }
  }
};

/** 저장 키 (바꾸면 기존 기록이 날아간다) */
const STORAGE_KEY = 'd2r_blizz_dashboard_v1';

/**
 * 세션 1회 런 기록.
 * @typedef {Object} RunRecord
 * @property {number} index    - 몇 번째 런인지 (1부터)
 * @property {number} ms       - 소요 시간(밀리초)
 * @property {string} zoneId   - 당시 선택된 공포의 영역 id
 * @property {number} at       - 기록 시각 (Date.now())
 */

/**
 * 앱 전체 상태.
 * @typedef {Object} AppState
 * @property {string} activeTab                       - 현재 탭 id
 * @property {Object} tz                              - 공포의 영역 분석기 상태
 * @property {string} tz.selectedZoneId               - 선택된 지역 id
 * @property {string} tz.filterTier                   - 티어 필터 ("ALL"|"S"|"A"|"B"|"D")
 * @property {boolean} tz.hasSunder                   - 냉기 파괴참 보유 여부(티어 재평가에 사용)
 * @property {Object} timer                           - 랩타임 상태
 * @property {boolean} timer.running                  - 측정 중인가
 * @property {number} timer.startedAt                 - 현재 런 시작 시각(ms). 정지 시 0
 * @property {RunRecord[]} timer.runs                 - 완료된 런 기록들
 * @property {Object} bounty                          - 현상수배 상태
 * @property {Record<string, boolean>} bounty.checked - 아이템 id -> 획득 여부
 * @property {string} bounty.filterSlot               - 부위 필터 ("ALL" 또는 slot 값)
 * @property {boolean} bounty.hideDone                - 획득한 것 숨기기
 * @property {Object} calc                            - 딜 계산기 입력값
 * @property {number} calc.blizzLevel                 - 블리자드 스킬 레벨(아이템 포함)
 * @property {number} calc.synergyLevel               - 시너지 스킬 3종 각각의 레벨(동일 가정)
 * @property {number} calc.coldSkillDamage            - 장비 냉기 기술 데미지 합(%)
 * @property {number} calc.coldMastery                - 냉기 숙련 레벨(적 냉기저항 감소)
 * @property {number} calc.monsterResist              - 몬스터 기본 냉기 저항(%)
 * @property {boolean} calc.monsterImmune             - 몬스터가 원래 냉기 면역인가
 * @property {boolean} calc.useSunder                 - 냉기 파괴참 착용 여부
 * @property {number} calc.convictionMinus            - 인피니티 천벌 오라의 저항 감소(%)
 * @property {number} calc.fcr                        - 현재 장비 FCR 합(%)
 */

/** 기본 상태 (초기화/리셋 기준). 새 키를 STATE에 추가하면 여기에도 추가할 것. */
const DEFAULT_STATE = {
  activeTab: 'tz',
  tz: { selectedZoneId: 'ancient-tunnels', filterTier: 'ALL', hasSunder: false },
  timer: { running: false, startedAt: 0, runs: [] },
  bounty: { checked: {}, filterSlot: 'ALL', hideDone: false },
  calc: {
    blizzLevel: 40,
    synergyLevel: 20,
    coldSkillDamage: 80,
    coldMastery: 20,
    monsterResist: 0,
    monsterImmune: false,
    useSunder: false,
    convictionMinus: 0,
    fcr: 105
  }
  // [TODO: LITE_MODEL_INSERT_FEATURE_HERE — 새 기능의 기본 상태를 여기 추가]
};

/** @type {AppState} 앱 전역 상태 인스턴스 */
let STATE = JSON.parse(JSON.stringify(DEFAULT_STATE));

/**
 * 저장된 상태를 불러와 STATE에 병합한다.
 * (스키마가 바뀌어도 깨지지 않도록 섹션 단위 얕은 병합을 쓴다)
 * @returns {void}
 */
function loadState() {
  const saved = STORAGE.get(STORAGE_KEY, null);
  if (!saved || typeof saved !== 'object') return;
  Object.keys(DEFAULT_STATE).forEach((section) => {
    if (typeof DEFAULT_STATE[section] !== 'object' || DEFAULT_STATE[section] === null) {
      if (saved[section] !== undefined) STATE[section] = saved[section];
      return;
    }
    STATE[section] = Object.assign({}, DEFAULT_STATE[section], saved[section] || {});
  });
  // 타이머는 새로고침하면 멈춘 상태로 시작한다 (진행 중 런은 버린다)
  STATE.timer.running = false;
  STATE.timer.startedAt = 0;
}

/**
 * 현재 STATE를 저장소에 쓴다.
 * @returns {boolean} 저장 성공 여부
 */
function saveState() {
  return STORAGE.set(STORAGE_KEY, STATE);
}

/**
 * 상태를 전부 초기화한다 (런 기록·체크리스트 포함).
 * @returns {void}
 */
function resetState() {
  STATE = JSON.parse(JSON.stringify(DEFAULT_STATE));
  saveState();
}

// [TODO: LITE_MODEL_INSERT_FEATURE_HERE — 상태 관련 헬퍼 함수를 여기 추가]
