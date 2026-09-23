/**
 * =============================================================================
 * 02-data.js — 정적 메타 데이터 (하드코딩)
 * =============================================================================
 * ★ 경량 모델 주의 ★
 * 이 파일은 "데이터만" 담는다. 함수/로직/DOM 코드를 여기 넣지 마라.
 * 맵을 추가할 때는 **기존 항목 하나를 통째로 복사한 뒤 값만 바꿔라.**
 * 키를 새로 만들거나 빼면 렌더러가 깨진다.
 *
 * 2026-09-24: 이 대시보드는 스피드런 랩타임 도구로 범위를 줄였다.
 * 맵 티어 평가/현상수배/치트시트/막힘 가이드/도박 안내는 guide.html(공략서)로
 * 이전됐다 — 그쪽이 캐릭터별로 갱신되는 진짜 공략서이고, 여기 terrorZones는
 * 오직 "런타임 목표(runTimeSec)를 붙인 지역 선택지" 용도로만 남아 있다.
 * nameKo/areaLevel/tier는 guide.html #zones 표(게임 데이터 파일 직접 대조,
 * 2026-09-19)와 동일하게 맞춰뒀다 — 둘이 어긋나면 guide.html 쪽을 기준으로 고쳐라.
 *
 * 리서치 기준일: 2026-09-19 (guide.html과 동기화)
 * 출처: 게임 데이터 문자열/지역 레벨 파일 대조, Maxroll(브레이크포인트/룬가치),
 *       디아블로2 레저렉션 인벤 아이템 DB
 * =============================================================================
 */

/* eslint-disable no-unused-vars */

/**
 * 공포의 영역 1개 항목 (랩타임 측정 대상 지역 선택지).
 * @typedef {Object} TerrorZone
 * @property {string}  id          - 고유 ID (영문 소문자+하이픈). 중복 금지.
 * @property {string}  nameKo      - 한글 지역명
 * @property {string}  nameEn      - 영문 지역명
 * @property {1|2|3|4|5} act       - 액트 번호
 * @property {number}  areaLevel   - 지옥 기준 기본 지역 레벨
 * @property {"S"|"A"|"B"|"D"} tier - ★극블리 소서 기준★ 종합 티어(참고용). 이 4개 값만 허용.
 * @property {number}  density     - 몬스터 밀도 1(희박)~5(매우 조밀)
 * @property {number}  coldImmune  - 냉기 면역 비중 0(없음)~5(대부분)
 * @property {boolean} needSunder  - 냉기 파괴참(Cold Rupture)이 사실상 필수인가
 * @property {number}  runTimeSec  - 숙련자 기준 1런 예상 소요 시간(초). 랩타임 목표선으로 쓰임.
 * @property {string[]} loot       - 이 구간에서 노리는 대표 파밍 목표
 * @property {string}  note        - 한 줄 평가 / 주의사항
 */

const META_DATA = {
  schemaVersion: '1.0.0',
  lastResearched: '2026-09-19',
  buildName: '극블리 소서 (Blizzard Sorceress)',

  /* =========================================================================
   * 공포의 영역 — 랩타임 측정 대상 지역 선택지
   * ------------------------------------------------------------------------
   * [TODO: LITE_MODEL_INSERT_FEATURE_HERE — 새 공포의 영역은 아래 배열에 객체 1개 복사해서 추가]
   * ========================================================================= */
  terrorZones: [
    {
      id: 'ancient-tunnels',
      nameKo: '고대 토굴',
      nameEn: 'Ancient Tunnels',
      act: 2,
      areaLevel: 85,
      tier: 'S',
      density: 4,
      coldImmune: 0,
      needSunder: false,
      runTimeSec: 150,
      loot: ['85렙 유니크 전반', '고룬', '기술 거대 부적'],
      note: '냉기 면역 0. 극블리 소서 기준 전체 1위. 추위의 파열은 빼고 들어가라(깰 면역이 없다).'
    },
    {
      id: 'mausoleum',
      nameKo: '영묘',
      nameEn: 'Mausoleum',
      act: 1,
      areaLevel: 85,
      tier: 'S',
      density: 4,
      coldImmune: 1,
      needSunder: false,
      runTimeSec: 150,
      loot: ['85렙 유니크 전반', '고룬'],
      note: '매장지에서 바로 진입하는 액트1 85지역. 언데드 위주라 냉기 면역이 거의 없다.'
    },
    {
      id: 'the-pit',
      nameKo: '구덩이 1~2층',
      nameEn: 'The Pit (Lv 1-2)',
      act: 1,
      areaLevel: 85,
      tier: 'S',
      density: 4,
      coldImmune: 2,
      needSunder: false,
      runTimeSec: 180,
      loot: ['85렙 유니크 전반', '고룬'],
      note: '외부 회랑 웨이포인트 → 타모 고원. 고전적인 1순위 파밍지, 지금도 유효하다.'
    },
    {
      id: 'underground-passage-lv2',
      nameKo: '지하 통로 2층',
      nameEn: 'Underground Passage (Lv 2)',
      act: 1,
      areaLevel: 85,
      tier: 'S',
      density: 3,
      coldImmune: 1,
      needSunder: false,
      runTimeSec: 120,
      loot: ['85렙 유니크 전반'],
      note: '1층은 지역 레벨 85가 아니고 2층만 85다. 잘 안 알려진 알짜 구간.'
    },
    {
      id: 'sewers-kurast',
      nameKo: '하수도 1~2층',
      nameEn: 'Sewers (Kurast)',
      act: 3,
      areaLevel: 85,
      tier: 'S',
      density: 4,
      coldImmune: 2,
      needSunder: false,
      runTimeSec: 180,
      loot: ['85렙 유니크 전반'],
      note: '쿠라스트 시장·상부 쿠라스트에서 진입. 통로형이라 블리자드 장판이 잘 겹친다.'
    },
    {
      id: 'forgotten-temple-group',
      nameKo: '잊힌 사원 계열',
      nameEn: 'Forgotten/Ruined Temple, Disused Fane 등',
      act: 3,
      areaLevel: 85,
      tier: 'S',
      density: 4,
      coldImmune: 2,
      needSunder: false,
      runTimeSec: 150,
      loot: ['85렙 유니크 전반'],
      note: '쿠라스트 곳곳의 작은 던전 여섯 곳이 전부 85. 맵이 작아 한 바퀴가 짧다.'
    },
    {
      id: 'worldstone-keep',
      nameKo: '세계석 성채 1~3층',
      nameEn: 'Worldstone Keep',
      act: 5,
      areaLevel: 85,
      tier: 'S',
      density: 5,
      coldImmune: 3,
      needSunder: true,
      runTimeSec: 240,
      loot: ['기술 거대 부적', '고룬', '85렙 유니크 전반'],
      note: '세 층 전부 85, 밀도 최상위라 추위의 파열(냉기 파괴 부적) 효과가 가장 크게 나는 구간.'
    },
    {
      id: 'chaos-sanctuary',
      nameKo: '혼돈의 성역',
      nameEn: 'Chaos Sanctuary',
      act: 4,
      areaLevel: 85,
      tier: 'A',
      density: 5,
      coldImmune: 3,
      needSunder: true,
      runTimeSec: 270,
      loot: ['봉인 보스 3종', '디아블로(Lv94) 드랍', '고룬'],
      note: '지옥 졸업 후에는 막힘 없이 갈 수 있는 곳. 고룬 기대값이 높다.'
    },
    {
      id: 'throne-of-destruction',
      nameKo: '파괴의 왕좌',
      nameEn: 'Throne of Destruction',
      act: 5,
      areaLevel: 85,
      tier: 'A',
      density: 5,
      coldImmune: 3,
      needSunder: true,
      runTimeSec: 300,
      loot: ['바알(Lv99) 드랍', '고룬'],
      note: '바알은 게임에서 가장 레벨이 높은 몬스터라 드랍 테이블도 가장 위. 런이 길고 편차가 크다.'
    },
    {
      id: 'river-of-flame',
      nameKo: '불길의 강',
      nameEn: 'River of Flame',
      act: 4,
      areaLevel: 85,
      tier: 'A',
      density: 3,
      coldImmune: 2,
      needSunder: false,
      runTimeSec: 150,
      loot: ['85렙 유니크 전반'],
      note: '혼돈의 성역 가는 길에 붙어 있는 85지역. 따로 갈 것까진 없고 지나가며 쓸어담는 자리.'
    },
    {
      id: 'stony-tomb',
      nameKo: '바위 무덤 1~2층',
      nameEn: 'Stony Tomb',
      act: 2,
      areaLevel: 85,
      tier: 'A',
      density: 3,
      coldImmune: 2,
      needSunder: false,
      runTimeSec: 180,
      loot: ['85렙 유니크 전반'],
      note: '바위 황무지에서 진입. 액트2에서 고대 토굴 다음으로 갈 만한 85지역.'
    },
    {
      id: 'swampy-pit',
      nameKo: '습한 구덩이 1~3층',
      nameEn: 'Swampy Pit',
      act: 3,
      areaLevel: 85,
      tier: 'A',
      density: 3,
      coldImmune: 2,
      needSunder: false,
      runTimeSec: 210,
      loot: ['85렙 유니크 전반'],
      note: '거대 습지에서 진입. 세 층 전부 85지만 길이 지저분해서 순간이동이 필수.'
    },
    {
      id: 'icy-cellar',
      nameKo: '얼음 지하실',
      nameEn: 'Icy Cellar',
      act: 5,
      areaLevel: 85,
      tier: 'A',
      density: 4,
      coldImmune: 4,
      needSunder: true,
      runTimeSec: 180,
      loot: ['85렙 유니크 전반'],
      note: '지역 레벨은 85지만 이름값대로 냉기 면역이 많다. 추위의 파열 없으면 들어가지 마라.'
    },
    {
      id: 'drifter-cavern',
      nameKo: '부랑자의 동굴',
      nameEn: 'Drifter Cavern',
      act: 5,
      areaLevel: 85,
      tier: 'A',
      density: 4,
      coldImmune: 4,
      needSunder: true,
      runTimeSec: 180,
      loot: ['85렙 유니크 전반'],
      note: '빙하의 길에서 진입하는 85지역. 얼음 지하실과 같은 문제(냉기 면역 비중) 있음.'
    },
    {
      id: 'secret-cow-level',
      nameKo: '비밀의 젖소방',
      nameEn: 'The Secret Cow Level',
      act: 1,
      areaLevel: 81,
      tier: 'A',
      density: 5,
      coldImmune: 1,
      needSunder: false,
      runTimeSec: 240,
      loot: ['룬워드 베이스', '보석/소켓 재료', '골드'],
      note: '85가 아닌데도 밀도가 전부를 상쇄하는 예외. 룬워드 베이스 모으는 날에 돈다. 호라드림의 함에 칼날 다리+붉은 포탈 두루마리 필요, 소 왕은 남겨두고 나오는 게 정석.'
    },
    {
      id: 'act5-outdoor-pits',
      nameKo: '나락 · 아케론의 구덩이 · 지옥불 구덩이',
      nameEn: 'Abaddon / Pit of Acheron / Infernal Pit',
      act: 5,
      areaLevel: 85,
      tier: 'B',
      density: 3,
      coldImmune: 3,
      needSunder: true,
      runTimeSec: 180,
      loot: ['85렙 유니크 전반'],
      note: '액트5 야외에 붙은 작은 85지역 셋. 공포의 영역이 여기로 뜨면 그날은 여기가 답.'
    },
    {
      id: 'durance-of-hate-mephisto',
      nameKo: '증오의 억류지 3층 (메피스토)',
      nameEn: 'Durance of Hate Lv3 — Mephisto',
      act: 3,
      areaLevel: 83,
      tier: 'B',
      density: 2,
      coldImmune: 1,
      needSunder: false,
      runTimeSec: 90,
      loot: ['할리퀸 관모', '망울', '전쟁 여행자', '반지/목걸이류'],
      note: '지역이 아니라 Lv87 보스 하나를 보고 가는 곳(점수는 참고용). 냉기 저항 75%, 면역 아님 — 냉기 숙련이 그대로 먹는다. 해자 건너편에서 눈보라만 깔면 안전.'
    },
    {
      id: 'halls-of-vaught-nihlathak',
      nameKo: '보트의 전당 (니흘라탁)',
      nameEn: 'Halls of Vaught — Nihlathak',
      act: 5,
      areaLevel: 84,
      tier: 'B',
      density: 3,
      coldImmune: 2,
      needSunder: false,
      runTimeSec: 180,
      loot: ['파괴의 열쇠'],
      note: '니흘라탁은 Lv92에 파괴의 열쇠를 준다. 시체 폭발이 소서를 한 방에 지운다 — 시체 쌓인 자리 피하기.'
    },
    {
      id: 'maggot-lair',
      nameKo: '구더기 굴 3층',
      nameEn: 'Maggot Lair (Lv 3)',
      act: 2,
      areaLevel: 85,
      tier: 'B',
      density: 2,
      coldImmune: 2,
      needSunder: false,
      runTimeSec: 240,
      loot: ['85렙 유니크 전반'],
      note: '3층만 85. 일자 통로라 블리자드 장판 효율이 최악이라 지역 레벨을 못 살린다. 스킵해도 된다.'
    },
    {
      id: 'travincal',
      nameKo: '트라빈칼 (의회원)',
      nameEn: 'Travincal — Council Member',
      act: 3,
      areaLevel: 82,
      tier: 'B',
      density: 3,
      coldImmune: 2,
      needSunder: false,
      runTimeSec: 90,
      loot: ['골드', '룬', '소켓 베이스'],
      note: '의회원 셋 전부 Lv88 · 냉기 저항 33% · 화염 면역. 화염 소서에겐 불리하고 극블리에겐 유리한 자리. 골드가 가장 빨리 모인다.'
    },
    {
      id: 'tower-cellar-countess',
      nameKo: '탑 지하 5층 (백작)',
      nameEn: 'Tower Cellar Lv5 — The Countess',
      act: 1,
      areaLevel: 79,
      tier: 'D',
      density: 2,
      coldImmune: 1,
      needSunder: false,
      runTimeSec: 90,
      loot: ['룬(지옥 기준 이스트까지)', '공포의 열쇠'],
      note: '점수가 의미 없는 대표 사례 — 아이템이 아니라 룬 전용 드랍을 보고 가는 곳. 그 목적에서는 전체 1위. 검은 습지 → 잊힌 탑 → 탑 지하 5층.'
    },
    {
      id: 'arcane-sanctuary',
      nameKo: '비전의 성역 (소환사)',
      nameEn: 'Arcane Sanctuary — The Summoner',
      act: 2,
      areaLevel: 79,
      tier: 'D',
      density: 2,
      coldImmune: 1,
      needSunder: false,
      runTimeSec: 120,
      loot: ['증오의 열쇠'],
      note: '지역 레벨이 85가 아니라 79다 — 이제 여긴 증오의 열쇠를 가지러 가는 곳일 뿐. 소환사 냉기 저항 75%, 면역 아님.'
    },
    {
      id: 'nihlathak-temple-pindleskin',
      nameKo: '니흘라탁의 사원 입구 (핀들스킨)',
      nameEn: "Nihlathak's Temple — Pindleskin",
      act: 5,
      areaLevel: 83,
      tier: 'D',
      density: 1,
      coldImmune: 2,
      needSunder: false,
      runTimeSec: 20,
      loot: ['85+렙 유니크(보정)'],
      note: '밀도 점수는 낮지만(몬스터 한 무리뿐) 런이 20초라 시간당으로 따지면 최상위. 하로가스 붉은 포탈에서 열 걸음.'
    },
    {
      id: 'tal-rasha-tombs',
      nameKo: '탈 라샤의 무덤',
      nameEn: "Tal Rasha's Tomb",
      act: 2,
      areaLevel: 80,
      tier: 'D',
      density: 3,
      coldImmune: 2,
      needSunder: false,
      runTimeSec: 240,
      loot: ['없음(비추천)'],
      note: '지역 레벨이 85가 아니라 80이다. 일곱 무덤을 도는 시간에 고대 토굴을 두 바퀴 도는 게 낫다. 스킵.'
    },
    {
      id: 'far-oasis',
      nameKo: '머나먼 오아시스',
      nameEn: 'Far Oasis',
      act: 2,
      areaLevel: 81,
      tier: 'D',
      density: 2,
      coldImmune: 3,
      needSunder: false,
      runTimeSec: 300,
      loot: ['없음(비추천)'],
      note: '맵이 넓고 밀도가 낮다. 지역 레벨도 85 미만. 스킵.'
    },
    {
      id: 'cold-plains',
      nameKo: '차가운 평야',
      nameEn: 'Cold Plains',
      act: 1,
      areaLevel: 68,
      tier: 'D',
      density: 2,
      coldImmune: 1,
      needSunder: false,
      runTimeSec: 210,
      loot: ['없음(비추천)'],
      note: '이름만 차갑다. 지역 레벨이 68로 한참 낮다. 스킵.'
    },
    {
      id: 'flayer-jungle',
      nameKo: '약탈자 밀림',
      nameEn: 'Flayer Jungle',
      act: 3,
      areaLevel: 80,
      tier: 'D',
      density: 3,
      coldImmune: 1,
      needSunder: false,
      runTimeSec: 240,
      loot: ['없음(비추천)'],
      note: '지역 레벨이 85 미만이라 최상위 드랍 TC가 안 열린다. 박피자(Flayer)류의 원거리 독침 공격은 명중 시 독 도트(DoT) 데미지가 누적돼 체력이 빠르게 깎이고 피격 경직으로 이동/시전이 계속 끊긴다 — 근접하지 말고 블리자드로 멀리서 끊어내거나 텔레포트로 우회해라. 해독 물약과 독 저항으로 대처. 파밍 가치는 낮아 통과만 하는 게 정석.'
    }
    // [TODO: LITE_MODEL_INSERT_FEATURE_HERE — 새 공포의 영역 항목을 여기 추가]
  ]
  // [TODO: LITE_MODEL_INSERT_FEATURE_HERE — 새 데이터 카테고리를 여기 추가]
};

// Node 테스트에서도 쓸 수 있게 내보내기 (브라우저에서는 무시됨)
if (typeof module !== 'undefined' && module.exports) { module.exports = { META_DATA }; }
