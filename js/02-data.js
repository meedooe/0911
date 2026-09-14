/**
 * =============================================================================
 * 02-data.js — 정적 메타 데이터 (하드코딩)
 * =============================================================================
 * ★ 경량 모델 주의 ★
 * 이 파일은 "데이터만" 담는다. 함수/로직/DOM 코드를 여기 넣지 마라.
 * 아이템이나 맵을 추가할 때는 **기존 항목 하나를 통째로 복사한 뒤 값만 바꿔라.**
 * 키를 새로 만들거나 빼면 렌더러가 깨진다.
 *
 * 리서치 기준일: 2026-09-11
 * 출처: Maxroll(빌드/브레이크포인트/룬가치), DiabloBytes(공포의 영역), Diablo Wiki(스킬)
 * 주의: 실시간 시세·거래량은 의도적으로 제외. 상대 수요 등급(tradeTier)만 유지한다.
 * =============================================================================
 */

/* eslint-disable no-unused-vars */

/**
 * 공포의 영역 1개 항목.
 * @typedef {Object} TerrorZone
 * @property {string}  id          - 고유 ID (영문 소문자+하이픈). 중복 금지.
 * @property {string}  nameKo      - 한글 지역명
 * @property {string}  nameEn      - 영문 지역명
 * @property {1|2|3|4|5} act       - 액트 번호
 * @property {number}  areaLevel   - 지옥 기준 기본 지역 레벨
 * @property {"S"|"A"|"B"|"D"} tier - ★극블리 소서 기준★ 종합 티어. 이 4개 값만 허용.
 * @property {number}  density     - 몬스터 밀도 1(희박)~5(매우 조밀)
 * @property {number}  coldImmune  - 냉기 면역 비중 0(없음)~5(대부분)
 * @property {boolean} needSunder  - 냉기 파괴참(Cold Rupture)이 사실상 필수인가
 * @property {number}  runTimeSec  - 숙련자 기준 1런 예상 소요 시간(초). 랩타임 목표선으로 쓰임.
 * @property {string[]} loot       - 이 구간에서 노리는 대표 파밍 목표
 * @property {string}  note        - 한 줄 평가 / 주의사항
 */

/**
 * 현상수배(졸업 장비) 1개 항목.
 * @typedef {Object} Bounty
 * @property {string} id        - 고유 ID. 체크 상태 저장 키로 쓰이므로 중복 금지.
 * @property {string} nameKo    - 한글 아이템명
 * @property {string} nameEn    - 영문 아이템명
 * @property {"weapon"|"shield"|"helm"|"armor"|"gloves"|"belt"|"boots"|"amulet"|"ring"|"charm"|"merc"} slot
 * @property {"unique"|"set"|"runeword"|"charm"|"rare"} type
 * @property {"T0"|"T1"|"T2"|"T3"} tradeTier - T0=최상위 수요, T3=흔함. 가격이 아니라 '상대 수요 등급'.
 * @property {string[]} runes   - 룬워드일 때 룬 순서. 아니면 빈 배열.
 * @property {string} baseItem  - 룬워드/화이트 베이스. 없으면 "".
 * @property {string[]} stats   - 핵심 옵션 요약 (경량 모델이 추가할 때 3~5개면 충분)
 * @property {1|2|3} priority   - 1=최우선 졸업, 2=중간, 3=여유되면
 * @property {boolean} verified - 수치가 검증됐는가. false면 UI에 '근사치' 뱃지가 붙는다.
 * @property {string} note      - 획득 경로/주의사항
 */

/**
 * 룬 1개 항목.
 * @typedef {Object} RuneInfo
 * @property {string} nameKo
 * @property {string} nameEn
 * @property {"최상위"|"상위"|"중상위"|"중위"} tier - 상대 수요 등급 (가격 아님)
 * @property {string[]} usedIn - 이 룬을 먹는 대표 룬워드
 */

/**
 * 브레이크포인트 1개 항목.
 * @typedef {Object} Breakpoint
 * @property {number} stat   - 필요 수치(%)
 * @property {number} frames - 결과 프레임 (낮을수록 빠름)
 */

const META_DATA = {
  schemaVersion: '1.0.0',
  lastResearched: '2026-09-11',
  buildName: '극블리 소서 (Blizzard Sorceress)',

  /* =========================================================================
   * 1) 공포의 영역 — 극블리 소서 기준 티어
   * 평가 기준: 냉기 면역 비중 > 밀도 > 지역 레벨(드랍 TC) > 동선
   * ------------------------------------------------------------------------
   * [TODO: LITE_MODEL_INSERT_FEATURE_HERE — 새 공포의 영역은 아래 배열에 객체 1개 복사해서 추가]
   * ========================================================================= */
  terrorZones: [
    {
      id: 'ancient-tunnels',
      nameKo: '고대인의 터널',
      nameEn: 'Ancient Tunnels',
      act: 2,
      areaLevel: 85,
      tier: 'S',
      density: 4,
      coldImmune: 0,
      needSunder: false,
      runTimeSec: 150,
      loot: ['85렙 유니크 전반', '주얼/참', '안정적 경험치'],
      note: '지옥에서 냉기 면역이 0. 극블리 소서 전용 S티어. 파괴참 없이도 풀속도.'
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
      loot: ['85렙 유니크 전반', '고급 룬', '대형 참'],
      note: '1액트 접근성 최고. 냉면 일부 있지만 스킵 가능한 수준.'
    },
    {
      id: 'worldstone-keep',
      nameKo: '세계석 요새 2~3층',
      nameEn: 'Worldstone Keep (Lv 2-3)',
      act: 5,
      areaLevel: 85,
      tier: 'A',
      density: 5,
      coldImmune: 3,
      needSunder: true,
      runTimeSec: 240,
      loot: ['기술 대형 참(스킬러)', '최상위 룬', '85렙 TC'],
      note: '기술 대형 참이 뜨는 핵심 구간. 다만 냉면 밀집이라 파괴참/인피니티 없으면 답답하다.'
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
      loot: ['웨이브 경험치', '최상위 룬', '바알 드랍'],
      note: '경험치+아이템 동시 효율. 웨이브 특성상 랩타임 편차가 크다.'
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
      loot: ['봉인 보스 3종', '최상위 룬', '85렙 TC'],
      note: '게임 최고의 TZ지만 그건 해머딘 기준. 블리소서는 파괴참/인피니티 전제.'
    },
    {
      id: 'arcane-sanctuary',
      nameKo: '비밀의 성소',
      nameEn: 'Arcane Sanctuary',
      act: 2,
      areaLevel: 85,
      tier: 'A',
      density: 4,
      coldImmune: 1,
      needSunder: false,
      runTimeSec: 210,
      loot: ['유령 팩 경험치', '유니크 전반'],
      note: '유령류가 냉기에 잘 녹는다. 다리 구조 때문에 텔포 동선이 관건.'
    },
    {
      id: 'travincal',
      nameKo: '트라빈칼',
      nameEn: 'Travincal',
      act: 3,
      areaLevel: 85,
      tier: 'B',
      density: 3,
      coldImmune: 2,
      needSunder: false,
      runTimeSec: 90,
      loot: ['카운슬 룬 드랍', '초단타 런'],
      note: '런 1회가 매우 짧아 시간당 횟수로 승부. 단일 구간 밀도는 낮다.'
    },
    {
      id: 'tal-rasha-tombs',
      nameKo: '탈 라샤의 무덤',
      nameEn: "Tal Rasha's Tombs",
      act: 2,
      areaLevel: 85,
      tier: 'B',
      density: 3,
      coldImmune: 2,
      needSunder: false,
      runTimeSec: 240,
      loot: ['85렙 TC', '무덤 7곳 로테이션'],
      note: '무덤 7개를 도는 구조라 동선 낭비가 있다. 미라/딱정벌레는 무난.'
    },
    {
      id: 'halls-of-anguish',
      nameKo: '고뇌의 전당 / 고통의 전당',
      nameEn: 'Halls of Anguish / Pain',
      act: 5,
      areaLevel: 85,
      tier: 'B',
      density: 4,
      coldImmune: 3,
      needSunder: true,
      runTimeSec: 240,
      loot: ['니흘라탁 연계', '85렙 TC'],
      note: '밀도는 좋은데 냉면+물리 저항 조합이 껄끄럽다.'
    },
    {
      id: 'river-of-flame',
      nameKo: '불의 강',
      nameEn: 'River of Flame',
      act: 4,
      areaLevel: 85,
      tier: 'B',
      density: 3,
      coldImmune: 2,
      needSunder: false,
      runTimeSec: 150,
      loot: ['혼돈 성역 연계', '용암 몹'],
      note: '혼돈 성역 가는 길에 끼워 도는 용도. 단독 파밍 가치는 중간.'
    },
    {
      id: 'maggot-lair',
      nameKo: '구더기 소굴',
      nameEn: 'Maggot Lair',
      act: 2,
      areaLevel: 85,
      tier: 'D',
      density: 2,
      coldImmune: 2,
      needSunder: false,
      runTimeSec: 300,
      loot: ['없음(비추천)'],
      note: '일자 통로라 블리자드 장판 효율 최악. 시간만 먹는다. 스킵.'
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
      id: 'underground-passage',
      nameKo: '지하 통로',
      nameEn: 'Underground Passage',
      act: 1,
      areaLevel: 80,
      tier: 'D',
      density: 2,
      coldImmune: 1,
      needSunder: false,
      runTimeSec: 240,
      loot: ['없음(비추천)'],
      note: '지역 레벨이 낮아 상위 드랍 TC가 안 열린다. 스킵.'
    },
    {
      id: 'cold-plains',
      nameKo: '차가운 평원',
      nameEn: 'Cold Plains',
      act: 1,
      areaLevel: 80,
      tier: 'D',
      density: 2,
      coldImmune: 1,
      needSunder: false,
      runTimeSec: 210,
      loot: ['없음(비추천)'],
      note: '이름만 차갑다. 밀도·지역 레벨 둘 다 부족. 스킵.'
    }
    // [TODO: LITE_MODEL_INSERT_FEATURE_HERE — 새 공포의 영역 항목을 여기 추가]
  ],

  /* =========================================================================
   * 2) 졸업 장비 현상수배 리스트
   * tradeTier = 상대적 '수요' 등급 (T0 최상위 ~ T3 흔함). 시세 금액이 아니다.
   * ------------------------------------------------------------------------
   * [TODO: LITE_MODEL_INSERT_FEATURE_HERE — 새 현상수배 아이템은 아래 배열에 추가]
   * ========================================================================= */
  bounties: [
    {
      id: 'deaths-fathom',
      nameKo: '죽음의 깊이',
      nameEn: "Death's Fathom",
      slot: 'weapon',
      type: 'unique',
      tradeTier: 'T0',
      runes: [],
      baseItem: '차원의 파편(Dimensional Shard)',
      stats: ['+3 냉기 기술', '냉기 기술 데미지 +15~40%', '+FCR', '전 저항'],
      priority: 1,
      verified: true,
      note: '극블리 딜의 상한선을 결정하는 단일 최대 변수. 40% 롤이 진짜 졸업. 헬 난이도 바알(Act5 월드스톤 챔버) 등 고레벨 트레저클래스 몬스터 드랍.'
    },
    {
      id: 'cold-rupture',
      nameKo: '추위의 파열 (냉기 파괴참)',
      nameEn: 'Cold Rupture (Sunder Charm)',
      slot: 'charm',
      type: 'charm',
      tradeTier: 'T0',
      runes: [],
      baseItem: '',
      stats: ['몬스터 냉기 면역 파괴', '내 냉기 저항 일부 감소(패널티)'],
      priority: 1,
      verified: true,
      note: '이거 하나로 갈 수 있는 TZ 풀이 2배가 된다. 테러존 몬스터에서 드랍.'
    },
    {
      id: 'infinity',
      nameKo: '무한 (인피니티)',
      nameEn: 'Infinity',
      slot: 'merc',
      type: 'runeword',
      tradeTier: 'T0',
      runes: ['Ber', 'Mal', 'Ber', 'Ist'],
      baseItem: '4소켓 창/폴암 (거인의 도리깨 선호)',
      stats: ['공격 시 레벨12 천벌(Conviction) 오라', '적 저항 감소', '+2 전 기술'],
      priority: 1,
      verified: true,
      note: '용병 무기. 천벌 오라로 적 냉기 저항을 크게 깎는다. 파괴참과 함께 냉면 해법의 축.'
    },
    {
      id: 'enigma',
      nameKo: '수수께끼 (에니그마)',
      nameEn: 'Enigma',
      slot: 'armor',
      type: 'runeword',
      tradeTier: 'T0',
      runes: ['Jah', 'Ith', 'Ber'],
      baseItem: '3소켓 갑옷 (모나크/듀사 셸 등 가벼운 것)',
      stats: ['순간이동(Teleport)', '+2 전 기술', '레벨당 MF', '이동속도'],
      priority: 2,
      verified: true,
      note: '소서는 텔포가 기본이라 다른 클래스만큼 급하진 않다. MF/스탯 목적이면 후순위 가능.'
    },
    {
      id: 'nightwings-veil',
      nameKo: '밤날개의 너울',
      nameEn: "Nightwing's Veil",
      slot: 'helm',
      type: 'unique',
      tradeTier: 'T1',
      runes: [],
      baseItem: '첨탑 투구(Spired Helm)',
      stats: ['+2 전 기술', '냉기 기술 데미지 +5~15%', '적 냉기 저항 -X%', '+민첩'],
      priority: 1,
      verified: true,
      note: '냉기 데미지 15% + 적 냉기저항 감소 옵션이 붙은 게 졸업. 소켓에 파세공 주얼. 헬 난이도 바알/헤파스토(Act5) 등에서 드랍.'
    },
    {
      id: 'ormus-robes',
      nameKo: '오르무스의 장포 (+3 블리자드)',
      nameEn: "Ormus' Robes (+3 Blizzard)",
      slot: 'armor',
      type: 'unique',
      tradeTier: 'T1',
      runes: [],
      baseItem: '더스크 실(Dusk Shroud)',
      stats: ['+3 블리자드(랜덤 스킬)', '냉기 기술 데미지 +10~15%', '+FCR', '마나 재생'],
      priority: 1,
      verified: true,
      note: '블리자드 롤이 떠야 의미가 있다. 딜만 보면 에니그마보다 이쪽이 우위.'
    },
    {
      id: 'chains-of-honor',
      nameKo: '명예의 굴레',
      nameEn: 'Chains of Honor',
      slot: 'armor',
      type: 'runeword',
      tradeTier: 'T1',
      runes: ['Dol', 'Um', 'Ber', 'Ist'],
      baseItem: '4소켓 갑옷',
      stats: ['+2 전 기술', '전 저항 +65', '데미지 감소 8%', '+생명력'],
      priority: 2,
      verified: true,
      note: '하드코어 생존 세팅의 갑옷 선택지. 저항 65가 압도적.'
    },
    {
      id: 'arachnid-mesh',
      nameKo: '거미 그물띠',
      nameEn: 'Arachnid Mesh',
      slot: 'belt',
      type: 'unique',
      tradeTier: 'T1',
      runes: [],
      baseItem: '스파이더웹 새시',
      stats: ['+1 전 기술', '+20 FCR', '마나 +5%', '느리게 하기 저항 감소(패널티)'],
      priority: 1,
      verified: true,
      note: '벨트 슬롯에서 +1스킬+20패캐를 동시에 주는 유일한 선택. 사실상 확정. 특정 보스 전용 드랍이 아니라 헬 난이도 고레벨 몬스터 전반에서 드랍.'
    },
    {
      id: 'trang-ouls-claws',
      nameKo: '트래그울의 발톱',
      nameEn: "Trang-Oul's Claws",
      slot: 'gloves',
      type: 'set',
      tradeTier: 'T2',
      runes: [],
      baseItem: '헤비 브레이서',
      stats: ['+25% 냉기 기술 데미지', '+20 FCR', '+독 저항'],
      priority: 1,
      verified: true,
      note: '세트 2피스 없이 단독 착용해도 옵션이 다 나온다. 가성비 최고의 냉뎀 25%. 트래그울 세트 몬스터 및 헬 난이도 고레벨 몬스터 전반에서 드랍.'
    },
    {
      id: 'soj',
      nameKo: '요르단의 반지 (SoJ)',
      nameEn: 'Stone of Jordan (SoJ)',
      slot: 'ring',
      type: 'unique',
      tradeTier: 'T1',
      runes: [],
      baseItem: '반지',
      stats: ['+1 전 기술', '최대 마나 +25%', '마나 +20', '번개 데미지 1-12'],
      priority: 2,
      verified: true,
      note: '2개 착용이 이상적. 다만 FCR 10% 레어링과 브레이크포인트 상충을 먼저 계산할 것. 특정 보스 전용 드랍이 아니라 헬 난이도 고레벨 몬스터 전반에서 드랍.'
    },
    {
      id: 'maras-kaleidoscope',
      nameKo: '마라의 만화경',
      nameEn: "Mara's Kaleidoscope",
      slot: 'amulet',
      type: 'unique',
      tradeTier: 'T1',
      runes: [],
      baseItem: '목걸이',
      stats: ['+2 전 기술', '전 저항 +20~30', '전 능력치 +5'],
      priority: 2,
      verified: true,
      note: '저항 확보가 급하면 마라, 딜 극대화면 +3냉기/20FCR 레어 목걸이가 더 낫다. 특정 보스 전용 드랍이 아니라 헬 난이도 고레벨 몬스터 전반에서 드랍.'
    },
    {
      id: 'cold-skiller-gc',
      nameKo: '냉기 기술 대형 참',
      nameEn: 'Cold Skiller Grand Charm',
      slot: 'charm',
      type: 'charm',
      tradeTier: 'T1',
      runes: [],
      baseItem: '대형 참',
      stats: ['+1 냉기 기술', '부가 옵션(생명력/FHR 등)'],
      priority: 1,
      verified: true,
      note: '인벤에 여러 장 쌓는 게 딜 증가의 가장 확실한 방법. 세계석 요새에서 파밍.'
    },
    {
      id: 'annihilus',
      nameKo: '어나이얼러스',
      nameEn: 'Annihilus',
      slot: 'charm',
      type: 'charm',
      tradeTier: 'T1',
      runes: [],
      baseItem: '소형 참',
      stats: ['+1 전 기술', '전 능력치 +10~20', '전 저항 +10~20', '경험치 +5~10%'],
      priority: 2,
      verified: true,
      note: '우버 디아블로(월드스톤 이벤트) 처치 보상. 옵션 롤 차이가 크다.'
    },
    {
      id: 'hellfire-torch',
      nameKo: '지옥불 횃불 (소서)',
      nameEn: 'Hellfire Torch (Sorceress)',
      slot: 'charm',
      type: 'charm',
      tradeTier: 'T1',
      runes: [],
      baseItem: '대형 참',
      stats: ['+3 소서리스 기술', '전 능력치 +10~20', '전 저항 +10~20'],
      priority: 2,
      verified: true,
      note: '혼돈의 성역 3열쇠(카운티스/서머너/닐라댁) 퀘스트 완료 보상(통칭 우버 트리스트럼). +3 전 기술은 단일 부위 최대 스킬 보너스 중 하나.'
    },
    {
      id: 'raven-frost',
      nameKo: '칠흑 서리',
      nameEn: 'Raven Frost',
      slot: 'ring',
      type: 'unique',
      tradeTier: 'T2',
      runes: [],
      baseItem: '반지',
      stats: ['얼지 않음(Cannot Be Frozen)', '+민첩 15~20', '냉기 흡수', '+마나'],
      priority: 1,
      verified: true,
      note: '얼지 않음 확보 수단. 다른 데서 CBF가 나오면 FCR 반지로 교체. 특정 보스 전용 드랍이 아니라 헬 난이도 고레벨 몬스터 전반에서 드랍.'
    },
    {
      id: 'spirit-monarch',
      nameKo: '영혼 (모나크)',
      nameEn: 'Spirit (Monarch)',
      slot: 'shield',
      type: 'runeword',
      tradeTier: 'T3',
      runes: ['Tal', 'Thul', 'Ort', 'Amn'],
      baseItem: '4소켓 모나크',
      stats: ['+2 전 기술', '+25~35 FCR', '+55 FHR', '+112 마나'],
      priority: 1,
      verified: true,
      note: '가격 대비 성능이 말이 안 되는 방패. FCR 105 맞추는 핵심 부품.'
    },
    {
      id: 'phoenix-shield',
      nameKo: '불사조 (방패)',
      nameEn: 'Phoenix (Shield)',
      slot: 'shield',
      type: 'runeword',
      tradeTier: 'T1',
      runes: ['Vex', 'Vex', 'Lo', 'Jah'],
      baseItem: '4소켓 방패 (모나크/신성 방패)',
      stats: ['레벨 10~15 구원(Redemption) 오라', '적 화염 저항 -28%', '+350~400 방어', '흡혈/흡마'],
      priority: 3,
      verified: true,
      note: '블리소서 기준 정령보다 확실히 낫다고 보긴 어렵다. FCR 손실을 먼저 계산해라.'
    },
    {
      id: 'call-to-arms',
      nameKo: '소집 (CTA)',
      nameEn: 'Call to Arms',
      slot: 'weapon',
      type: 'runeword',
      tradeTier: 'T1',
      runes: ['Amn', 'Ral', 'Mal', 'Ist', 'Ohm'],
      baseItem: '5소켓 무기 (플레일 등 저요구 베이스)',
      stats: ['+2~6 전투 함성', '전투 명령(Battle Orders)', '+1 전 기술'],
      priority: 2,
      verified: true,
      note: '무기 교체(swap)용. 생명력/마나 뻥튀기라 하드코어면 사실상 필수.'
    },
    {
      id: 'heart-of-the-oak',
      nameKo: '참나무의 심장 (HotO)',
      nameEn: 'Heart of the Oak',
      slot: 'weapon',
      type: 'runeword',
      tradeTier: 'T1',
      runes: ['Ko', 'Vex', 'Pul', 'Thul'],
      baseItem: '4소켓 지팡이/철퇴 (플레일 선호)',
      stats: ['+3 전 기술', '+40 FCR', '전 저항 +30~40', '+마나 15%'],
      priority: 3,
      verified: true,
      note: '죽음의 깊이를 못 구했을 때의 대체 무기. 냉기 데미지 % 옵션은 없다.'
    },
    {
      id: 'insight-merc',
      nameKo: '통찰 (용병)',
      nameEn: 'Insight (Merc)',
      slot: 'merc',
      type: 'runeword',
      tradeTier: 'T3',
      runes: ['Ral', 'Tir', 'Tal', 'Sol'],
      baseItem: '4소켓 창/폴암',
      stats: ['명상(Meditation) 오라', '+1~6 전 기술', '+마나 회복'],
      priority: 1,
      verified: true,
      note: '인피니티 전까지 쓰는 용병 무기. 마나 문제를 통째로 해결해준다.'
    },
    {
      id: 'fortitude',
      nameKo: '불굴 (용병 갑옷)',
      nameEn: 'Fortitude',
      slot: 'merc',
      type: 'runeword',
      tradeTier: 'T1',
      runes: ['El', 'Sol', 'Dol', 'Lo'],
      baseItem: '4소켓 갑옷',
      stats: ['+300% 향상된 데미지', '+15 전 저항', '+200% 향상된 방어', '피격 시 소생'],
      priority: 2,
      verified: true,
      note: '용병 생존+딜 동시 해결. 내가 입어도 저항/방어 이득이 크다.'
    },
    {
      id: 'andariels-visage',
      nameKo: '안다리엘의 두개골 (용병)',
      nameEn: "Andariel's Visage (Merc)",
      slot: 'merc',
      type: 'unique',
      tradeTier: 'T2',
      runes: [],
      baseItem: '데몬헤드',
      stats: ['+2 전 기술', '+20 IAS', '흡혈 8~10%', '독 저항 -30%(패널티)'],
      priority: 2,
      verified: true,
      note: '용병 흡혈 확보용. 독저 패널티는 화염 파세공 주얼로 상쇄한다. 특정 보스 전용 드랍이 아니라 헬 난이도 고레벨 몬스터 전반에서 드랍.'
    },
    {
      id: 'sandstorm-trek',
      nameKo: '모래폭풍 여로',
      nameEn: 'Sandstorm Trek',
      slot: 'boots',
      type: 'unique',
      tradeTier: 'T2',
      runes: [],
      baseItem: '스케럽 허스크 부츠',
      stats: ['+FHR', '+힘/활력', '독 저항', '스태미나 회복'],
      priority: 2,
      verified: true,
      note: '하드코어용 생존 신발. MF를 노리면 전쟁 여행자(War Traveler)로 교체.'
    }
    // [TODO: LITE_MODEL_INSERT_FEATURE_HERE — 새 현상수배 아이템을 여기 추가]
  ],

  /* =========================================================================
   * 3) 룬워드 재료 — 상대 수요 등급
   * [TODO: LITE_MODEL_INSERT_FEATURE_HERE — 룬 추가]
   * ========================================================================= */
  runes: [
    { nameKo: '조드', nameEn: 'Zod', tier: '최상위', usedIn: ['파괴불가 옵션 부여'] },
    { nameKo: '챔',  nameEn: 'Cham', tier: '최상위', usedIn: ['둠(Doom)', '얼지않음 부여'] },
    { nameKo: '자',  nameEn: 'Jah', tier: '최상위', usedIn: ['에니그마', '피닉스'] },
    { nameKo: '베르', nameEn: 'Ber', tier: '최상위', usedIn: ['인피니티(2개)', '에니그마', '명예의 사슬'] },
    { nameKo: '서',  nameEn: 'Sur', tier: '상위', usedIn: ['브램블', '드래곤', '분노(Wrath)'] },
    { nameKo: '로',  nameEn: 'Lo', tier: '상위', usedIn: ['그리프', '불굴', '피닉스'] },
    { nameKo: '옴',  nameEn: 'Ohm', tier: '상위', usedIn: ['소집 나팔(CTA)', '둠'] },
    { nameKo: '벡스', nameEn: 'Vex', tier: '상위', usedIn: ['참나무의 심장', '피닉스(2개)', '데스'] },
    { nameKo: '굴',  nameEn: 'Gul', tier: '중상위', usedIn: ['데스', '소켓 재료'] },
    { nameKo: '이스트', nameEn: 'Ist', tier: '중상위', usedIn: ['인피니티', '명예의 사슬', 'CTA'] },
    { nameKo: '말',  nameEn: 'Mal', tier: '중상위', usedIn: ['인피니티', 'CTA', '그리프'] },
    { nameKo: '움',  nameEn: 'Um', tier: '중위', usedIn: ['명예의 사슬', '둠'] },
    { nameKo: '풀',  nameEn: 'Pul', tier: '중위', usedIn: ['참나무의 심장'] },
    { nameKo: '렘',  nameEn: 'Lem', tier: '중위', usedIn: ['부(Wealth)', 'MF 룬워드'] },
    { nameKo: '코',  nameEn: 'Ko', tier: '중위', usedIn: ['참나무의 심장'] }
    // [TODO: LITE_MODEL_INSERT_FEATURE_HERE — 룬 추가]
  ],

  /* =========================================================================
   * 4) 브레이크포인트 (소서리스 기준) — 출처: Maxroll Breakpoints
   * ========================================================================= */
  /** @type {Breakpoint[]} 패스터 캐스트 레이트 (일반 시전 프레임) */
  fcrBreakpoints: [
    { stat: 0, frames: 13 },
    { stat: 9, frames: 12 },
    { stat: 20, frames: 11 },
    { stat: 37, frames: 10 },
    { stat: 63, frames: 9 },
    { stat: 105, frames: 8 },
    { stat: 200, frames: 7 }
  ],

  /** @type {Breakpoint[]} 패스터 힛 리커버리 */
  fhrBreakpoints: [
    { stat: 0, frames: 15 }, { stat: 5, frames: 14 }, { stat: 9, frames: 13 },
    { stat: 14, frames: 12 }, { stat: 20, frames: 11 }, { stat: 30, frames: 10 },
    { stat: 42, frames: 9 }, { stat: 60, frames: 8 }, { stat: 86, frames: 7 },
    { stat: 142, frames: 6 }, { stat: 280, frames: 5 }
  ],

  /** @type {Breakpoint[]} 패스터 블록 레이트 */
  fbrBreakpoints: [
    { stat: 0, frames: 9 }, { stat: 7, frames: 8 }, { stat: 15, frames: 7 },
    { stat: 27, frames: 6 }, { stat: 48, frames: 5 }, { stat: 86, frames: 4 }
  ],

  /* =========================================================================
   * 5) 블리자드 딜 계산용 상수
   * ⚠ 주의: 아래 데미지 앵커는 위키 표에서 확인된 지점값이고,
   *    그 사이 레벨은 선형 보간(근사치)이다. 정확한 값은 인게임 스킬창에서 확인할 것.
   * ========================================================================= */
  blizzard: {
    /** 검증된 앵커 포인트 [스킬레벨, 최소뎀, 최대뎀] — 출처: Diablo Wiki */
    damageAnchors: [
      { level: 1, min: 45, max: 75 },
      { level: 20, min: 570, max: 619 },
      { level: 40, min: 1770, max: 1839 },
      { level: 60, min: 3070, max: 3159 }
    ],
    /** 시너지 1레벨당 데미지 증가율(%) — 아이스 볼트 / 아이스 블라스트 / 글레이셜 스파이크 */
    synergyPercentPerLevel: 5,
    synergySkills: ['아이스 볼트', '아이스 블라스트', '글레이셜 스파이크'],
    /** 냉기 저항 최소 하한 (D2 규칙상 저항은 -100% 아래로 내려가지 않는다) */
    minEffectiveResist: -100,
    /**
     * 원래 면역이었던 몬스터에게 저항 감소가 적용되는 비율.
     * 커뮤니티 통용값이며 패치에 따라 달라질 수 있다. verified:false.
     */
    immunePierceEffectiveness: 0.2,
    immunePierceVerified: false,
    /** 파괴참 적용 시 면역 몬스터의 냉기 저항이 세팅되는 값(%) */
    sunderedResist: 95,
    sunderedResistVerified: false
  }
  // [TODO: LITE_MODEL_INSERT_FEATURE_HERE — 새 데이터 카테고리를 여기 추가]
};

// Node 테스트에서도 쓸 수 있게 내보내기 (브라우저에서는 무시됨)
if (typeof module !== 'undefined' && module.exports) { module.exports = { META_DATA }; }
