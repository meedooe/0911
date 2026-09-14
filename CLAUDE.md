# CLAUDE.md — D2R 극블리 소서 파밍 대시보드

> 이 문서는 **경량 모델(Flash-Lite 등)이 이 코드베이스를 유지보수할 때 반드시 먼저 읽어야 하는 규칙서**다.
> 여기 적힌 규칙을 어기면 구조가 무너진다. 아래 규칙을 그대로 따를 것.

---

## 0. 이 프로젝트가 뭔가

로컬에서 `index.html`을 더블클릭하면 실행되는 **단일 페이지 대시보드**.
빌드 도구 없음. 번들러 없음. 프레임워크 없음. npm 설치 없음.
순수 HTML + CSS + Vanilla JS (ES2020) 뿐이다.

기능 4개:
1. 공포의 영역(Terror Zone) 메타 분석기 — 극블리 소서 기준 맵 티어(S/A/B/D)
2. 스피드런 랩타임 & 세션 카운터
3. 졸업 장비 현상수배 보드 (체크리스트)
4. 극블리 메커니즘 치트시트 (FCR 프레임 + 블리자드 딜 계산기)

---

## 1. 파일 구조와 각 파일의 책임 — 절대 섞지 말 것

```
0911/
├── index.html          # 마크업 + <script> 로드 순서. 로직 금지.
├── css/style.css       # 스타일 전부. JS에서 style 직접 조작 금지, class 토글만.
├── js/01-state.js      # [상태] 런타임 상태 객체 STATE + 저장소 어댑터. 여기만 변경 가능한 값.
├── js/02-data.js       # [데이터] META_DATA — 하드코딩 정적 데이터. ★아이템/맵 추가는 여기만★
├── js/03-logic.js      # [로직] 순수 함수만. DOM 접근 절대 금지. document/window 쓰면 안 됨.
├── js/04-render.js     # [렌더] DOM 생성/갱신만. 계산 금지. 03-logic 결과를 받아 그리기만.
├── js/05-main.js       # [부트] 초기화 + 이벤트 바인딩 + 타이머 루프.
└── test/logic.test.mjs # 03-logic 순수 함수 단위 테스트 (node test/logic.test.mjs)
```

**파일 번호는 `index.html`의 로드 순서다. 새 파일을 끼워 넣지 말고 기존 파일 안에서 작업해라.**

---

## 2. 경량 모델이 지켜야 할 5가지 규칙

### 규칙 1 — 앵커 주석 안쪽에만 코드를 넣어라
코드 곳곳에 아래 형태의 앵커가 있다.

```js
// [TODO: LITE_MODEL_INSERT_FEATURE_HERE — <설명>]
```

새 기능/새 데이터는 **관련된 앵커 바로 아래**에 추가한다.
앵커 주석 자체는 **절대 삭제하지 마라**. 추가 후에도 앵커는 남겨둔다.

### 규칙 2 — 데이터 추가는 `js/02-data.js`에서만
아이템, 맵, 룬 추가는 **코드를 짜는 게 아니라 배열에 객체 1개를 복사해 넣는 일**이다.
각 배열 바로 위에 `@typedef` JSDoc으로 스키마가 정의돼 있다.
**기존 항목 하나를 복사 → 값만 바꾸기.** 키를 새로 만들거나 빼지 마라.

### 규칙 3 — 로직과 렌더를 섞지 마라
- 숫자 계산·시간 계산·필터링 → `03-logic.js`에 **순수 함수**로 추가 (입력→출력, 부작용 없음)
- 화면에 그리는 일 → `04-render.js`
- `03-logic.js` 안에서 `document`, `window`, `STATE`를 직접 읽으면 **잘못된 코드다.** 인자로 받아라.

### 규칙 4 — JSDoc 필수
모든 함수에 아래 형식을 붙인다. 생략 금지.

```js
/**
 * 한 줄 설명.
 * @param {number} a - 설명
 * @returns {number} 설명
 */
```

### 규칙 5 — 수치를 지어내지 마라
게임 수치(데미지, 확률, 드랍률)는 검증된 것만 넣는다.
불확실하면 데이터 객체의 `verified: false` 와 `note` 필드에 근거/불확실성을 남기고,
UI에는 "근사치" 표기가 자동으로 붙는다. **없는 수치를 그럴듯하게 채우지 마라.**

---

## 3. 자주 하게 될 작업 레시피

### A. 공포의 영역(맵) 추가
`js/02-data.js` → `META_DATA.terrorZones` 배열 → 기존 항목 복사 후 값 수정.
`tier`는 `"S" | "A" | "B" | "D"` 중 하나만. 다른 값 넣으면 색이 안 나온다.

### B. 현상수배 아이템 추가
`js/02-data.js` → `META_DATA.bounties` 배열 → 기존 항목 복사 후 값 수정.
`id`는 중복되면 안 된다(체크 상태 저장 키로 쓰임).
룬워드면 `type: "runeword"` 와 `runes: ["Ber","Mal",...]` 를 채운다.

### C. 치트시트에 계산기 항목 추가
1. `03-logic.js` 하단 앵커에 순수 함수 추가
2. `04-render.js` 의 `renderCheatsheet()` 안 앵커에 출력 추가
3. `test/logic.test.mjs` 에 테스트 1개 추가

### D. 새 탭(섹션) 추가
1. `index.html` 의 `<!-- [TODO: LITE_MODEL_INSERT_FEATURE_HERE — 새 탭 버튼] -->` 에 버튼 추가
2. 같은 파일 `<!-- ... 새 탭 패널] -->` 에 `<section class="panel" id="panel-xxx">` 추가
3. `04-render.js` 에 `renderXxx()` 추가 후 `05-main.js` 의 `renderAll()` 에 호출 1줄 추가

---

## 4. 하면 안 되는 것

- ❌ 외부 CDN / 라이브러리 추가 (오프라인 로컬 실행이 전제)
- ❌ 빌드 스텝 도입 (webpack/vite/ts 등)
- ❌ `innerHTML` 에 사용자 입력을 그대로 넣기 → `esc()` 헬퍼를 써라
- ❌ `03-logic.js` 에서 DOM 접근
- ❌ 앵커 주석 삭제
- ❌ 검증 안 된 게임 수치를 확정값처럼 넣기

---

## 5. 검증 방법

```bash
node test/logic.test.mjs     # 순수 로직 테스트. 전부 PASS 떠야 한다.
```
그 다음 브라우저에서 `index.html` 열고 콘솔 에러 0개 확인.

---

## 6. 데이터 출처 (2026-09-11 기준 리서치)

- Maxroll — Blizzard Sorceress 빌드 / Breakpoints / Rune Value
- DiabloBytes — Terror Zone 가이드
- Diablo Wiki (Fandom) — Blizzard 스킬 데미지/시너지

**거래 "가격"은 의도적으로 넣지 않는다.** 시세는 시즌마다 변해서 하드코딩하면 금방 거짓말이 된다.
대신 `tradeTier`(T0~T3, 상대적 수요 등급)만 유지한다. 등급 갱신 시 `META_DATA.lastResearched` 날짜도 같이 고쳐라.
