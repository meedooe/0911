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
 *
 * 리서치 기준일: 2026-09-11
 * 출처: Maxroll(빌드/브레이크포인트/룬가치), DiabloBytes(공포의 영역), Diablo Wiki(스킬)
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
  lastResearched: '2026-09-15',
  buildName: '극블리 소서 (Blizzard Sorceress)',

  /* =========================================================================
   * 공포의 영역 — 랩타임 측정 대상 지역 선택지
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
    },
    {
      id: 'flayer-jungle',
      nameKo: '박피자의 정글',
      nameEn: 'Flayer Jungle',
      act: 3,
      areaLevel: 79,
      tier: 'D',
      density: 3,
      coldImmune: 1,
      needSunder: false,
      runTimeSec: 240,
      loot: ['없음(비추천)'],
      note: '지역 레벨이 85 미만이라 최상위 드랍 TC가 안 열린다. 박피자(Flayer)류의 원거리 독침 공격은 명중 시 독 도트(DoT) 데미지가 누적돼 체력이 빠르게 깎이고 피격 경직으로 이동/시전이 계속 끊긴다 — 근접하지 말고 블리자드로 멀리서 끊어내거나 텔레포트로 우회해라. 독 저항을 확보하면 훨씬 수월해진다. 파밍 가치는 낮아 스킵 추천.'
    }
    // [TODO: LITE_MODEL_INSERT_FEATURE_HERE — 새 공포의 영역 항목을 여기 추가]
  ]
  // [TODO: LITE_MODEL_INSERT_FEATURE_HERE — 새 데이터 카테고리를 여기 추가]
};

// Node 테스트에서도 쓸 수 있게 내보내기 (브라우저에서는 무시됨)
if (typeof module !== 'undefined' && module.exports) { module.exports = { META_DATA }; }
