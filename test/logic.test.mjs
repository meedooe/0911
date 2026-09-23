/**
 * 03-logic.js 순수 함수 단위 테스트.
 * 실행: node test/logic.test.mjs
 * ★ 경량 모델: 새 로직 함수를 추가했으면 여기에 테스트를 최소 1개 추가해라.
 */
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const L = require('../js/03-logic.js');
const { META_DATA } = require('../js/02-data.js');

let pass = 0, fail = 0;

/**
 * 단언.
 * @param {string} name - 테스트 이름
 * @param {boolean} cond - 참이어야 하는 조건
 * @param {*} [detail] - 실패 시 출력할 값
 */
function ok(name, cond, detail) {
  if (cond) { pass++; console.log('  PASS  ' + name); }
  else { fail++; console.log('  FAIL  ' + name + (detail !== undefined ? '  → ' + JSON.stringify(detail) : '')); }
}

console.log('\n--- 유틸 ---');
ok('esc가 태그를 이스케이프한다', L.esc('<b>"x"</b>') === '&lt;b&gt;&quot;x&quot;&lt;/b&gt;', L.esc('<b>"x"</b>'));
ok('clamp 하한', L.clamp(-5, 0, 10) === 0);
ok('clamp 상한', L.clamp(99, 0, 10) === 10);

console.log('\n--- 시간 포맷 ---');
ok('0ms -> 0:00.0', L.formatDuration(0) === '0:00.0', L.formatDuration(0));
ok('95400ms -> 1:35.4', L.formatDuration(95400) === '1:35.4', L.formatDuration(95400));
ok('음수는 0으로', L.formatDuration(-500) === '0:00.0', L.formatDuration(-500));
ok('1시간 초과는 h:mm:ss', L.formatDuration(3725000) === '1:02:05', L.formatDuration(3725000));

console.log('\n--- 세션 통계 ---');
const empty = L.computeSessionStats([]);
ok('빈 배열이면 count 0', empty.count === 0 && empty.avgMs === 0);
const stats = L.computeSessionStats([{ ms: 100000 }, { ms: 200000 }, { ms: 120000 }]);
ok('count=3', stats.count === 3, stats);
ok('총합 420000', stats.totalMs === 420000, stats.totalMs);
ok('평균 140000', stats.avgMs === 140000, stats.avgMs);
ok('최고 100000', stats.bestMs === 100000, stats.bestMs);
ok('최악 200000', stats.worstMs === 200000, stats.worstMs);
ok('시간당 런 = 3600000/140000 ≈ 25.7', stats.runsPerHour === 25.7, stats.runsPerHour);
ok('잘못된 값은 무시', L.computeSessionStats([{ ms: 0 }, { ms: -1 }, null]).count === 0);

console.log('\n--- 페이스 평가 ---');
ok('목표보다 빠르면 빠름', L.evaluatePace(120000, 150).grade === '빠름', L.evaluatePace(120000, 150));
ok('목표 근처면 적정', L.evaluatePace(155000, 150).grade === '적정', L.evaluatePace(155000, 150));
ok('20% 이상 느리면 느림', L.evaluatePace(200000, 150).grade === '느림', L.evaluatePace(200000, 150));
ok('기록 없으면 측정없음', L.evaluatePace(0, 150).grade === '측정없음');

console.log('\n--- 공포의 영역 티어 ---');
const wsk = META_DATA.terrorZones.find((z) => z.id === 'worldstone-keep');
const at = META_DATA.terrorZones.find((z) => z.id === 'ancient-tunnels');
ok('파괴참 있으면 원래 티어 유지', L.evaluateZoneTier(wsk, true).tier === 'A', L.evaluateZoneTier(wsk, true));
ok('파괴참 없으면 한 단계 강등', L.evaluateZoneTier(wsk, false).tier === 'B', L.evaluateZoneTier(wsk, false));
ok('파괴참 불필요 지역은 영향 없음', L.evaluateZoneTier(at, false).tier === 'S');
ok('고대인의 터널 점수가 구더기 소굴보다 높다',
  L.computeZoneScore(at, false) > L.computeZoneScore(META_DATA.terrorZones.find((z) => z.id === 'maggot-lair'), false));
const view = L.buildZoneView(META_DATA.terrorZones, 'S', false);
ok('S 필터가 S만 반환', view.every((z) => z.evalTier === 'S') && view.length > 0, view.map((z) => z.id));
ok('전체 뷰는 티어 오름차순 정렬',
  (() => { const v = L.buildZoneView(META_DATA.terrorZones, 'ALL', true);
    return L.TIER_ORDER.indexOf(v[0].evalTier) <= L.TIER_ORDER.indexOf(v[v.length - 1].evalTier); })());

console.log('\n--- 현상수배 ---');
const prog0 = L.computeBountyProgress(META_DATA.bounties, {});
ok('아무것도 체크 안 하면 0%', prog0.done === 0 && prog0.pct === 0);
const prog1 = L.computeBountyProgress(META_DATA.bounties, { 'deaths-fathom': true, 'soj': true });
ok('2개 체크하면 done=2', prog1.done === 2, prog1);
ok('우선순위 집계가 총합과 맞는다',
  prog0.byPriority[1].total + prog0.byPriority[2].total + prog0.byPriority[3].total === META_DATA.bounties.length);
ok('id 중복 없음', new Set(META_DATA.bounties.map((b) => b.id)).size === META_DATA.bounties.length);
ok('지역 id 중복 없음', new Set(META_DATA.terrorZones.map((z) => z.id)).size === META_DATA.terrorZones.length);
ok('모든 지역 tier가 S/A/B/D 중 하나', META_DATA.terrorZones.every((z) => L.TIER_ORDER.includes(z.tier)));
const bview = L.buildBountyView(META_DATA.bounties, { 'deaths-fathom': true }, 'ALL', true);
ok('hideDone이 체크된 항목을 뺀다', !bview.some((b) => b.id === 'deaths-fathom'));
ok('부위 필터 동작', L.buildBountyView(META_DATA.bounties, {}, 'belt', false).every((b) => b.slot === 'belt'));

console.log('\n--- 브레이크포인트 ---');
ok('FCR 0 -> 13프레임', L.findBreakpoint(META_DATA.fcrBreakpoints, 0).frames === 13);
ok('FCR 75 -> 9프레임', L.findBreakpoint(META_DATA.fcrBreakpoints, 75).frames === 9);
ok('FCR 75의 다음 목표는 105, +30 필요',
  L.findBreakpoint(META_DATA.fcrBreakpoints, 75).nextStat === 105 && L.findBreakpoint(META_DATA.fcrBreakpoints, 75).needed === 30);
ok('FCR 105 -> 8프레임', L.findBreakpoint(META_DATA.fcrBreakpoints, 105).frames === 8);
ok('FCR 250 -> 7프레임, 다음 없음',
  L.findBreakpoint(META_DATA.fcrBreakpoints, 250).frames === 7 && L.findBreakpoint(META_DATA.fcrBreakpoints, 250).nextStat === null);
ok('8프레임은 초당 3.13회', L.framesToCastsPerSecond(8) === 3.13, L.framesToCastsPerSecond(8));

console.log('\n--- 블리자드 딜 계산 ---');
const B = META_DATA.blizzard;
ok('레벨 20은 앵커값 그대로(비보간)',
  (() => { const d = L.interpolateBlizzardDamage(B.damageAnchors, 20); return d.min === 570 && d.max === 619 && d.approximate === false; })());
ok('레벨 30은 20~40 사이 보간값',
  (() => { const d = L.interpolateBlizzardDamage(B.damageAnchors, 30); return d.approximate && d.min > 570 && d.min < 1770; })(),
  L.interpolateBlizzardDamage(B.damageAnchors, 30));
ok('면역인데 파괴참 없으면 데미지 0',
  (() => { const r = L.computeBlizzardDamage({ blizzLevel: 40, synergyLevel: 20, coldSkillDamage: 80, coldMastery: 20, monsterResist: 0, monsterImmune: true, useSunder: false, convictionMinus: 0 }, B);
    return r.blocked === true && r.finalMin === 0; })());
ok('비면역 + 저항0 + 냉숙20이면 저항이 -20%가 된다',
  L.computeEffectiveResist({ monsterResist: 0, monsterImmune: false, useSunder: false, coldMastery: 20, convictionMinus: 0 }, B).effectiveResist === -20);
ok('저항 하한 -100% 아래로 안 내려간다',
  L.computeEffectiveResist({ monsterResist: 0, monsterImmune: false, useSunder: false, coldMastery: 100, convictionMinus: 85 }, B).effectiveResist === -100);
ok('파괴참 적용 시 저항이 95에서 감소분만큼만 내려간다',
  (() => { const r = L.computeEffectiveResist({ monsterResist: 0, monsterImmune: true, useSunder: true, coldMastery: 20, convictionMinus: 85 }, B);
    return Math.abs(r.effectiveResist - (95 - 105 * 0.2)) < 0.05; })(),
  L.computeEffectiveResist({ monsterResist: 0, monsterImmune: true, useSunder: true, coldMastery: 20, convictionMinus: 85 }, B));
ok('시너지 20레벨 3종이면 +300%',
  L.computeBlizzardDamage({ blizzLevel: 20, synergyLevel: 20, coldSkillDamage: 0, coldMastery: 0, monsterResist: 0, monsterImmune: false, useSunder: false, convictionMinus: 0 }, B).synergyPct === 300);
ok('냉기 데미지 % 가 배율에 반영된다',
  (() => { const r = L.computeBlizzardDamage({ blizzLevel: 20, synergyLevel: 20, coldSkillDamage: 80, coldMastery: 0, monsterResist: 0, monsterImmune: false, useSunder: false, convictionMinus: 0 }, B);
    return r.multiplier === 4.8 && r.boostedMin === Math.round(570 * 4.8); })());
ok('저항 -20%면 최종 데미지가 증폭값보다 크다',
  (() => { const r = L.computeBlizzardDamage({ blizzLevel: 20, synergyLevel: 20, coldSkillDamage: 0, coldMastery: 20, monsterResist: 0, monsterImmune: false, useSunder: false, convictionMinus: 0 }, B);
    return r.finalMin > r.boostedMin; })());
ok('근사치 데이터에는 안내 문구가 붙는다',
  L.computeBlizzardDamage({ blizzLevel: 33, synergyLevel: 20, coldSkillDamage: 0, coldMastery: 0, monsterResist: 0, monsterImmune: false, useSunder: false, convictionMinus: 0 }, B).notes.some((n) => n.includes('근사치')));

console.log('\n--- 오늘 뭐 돌지 (목적별 지역 추천) ---');
const topTier = L.recommendZonesForGoal(META_DATA.terrorZones, 'top-tier', true);
ok('top-tier는 S/A 위주 상위 3개', topTier.length === 3 && topTier.every((z) => z.evalTier === 'S' || z.evalTier === 'A'), topTier.map((z) => z.id));
const safeDensity = L.recommendZonesForGoal(META_DATA.terrorZones, 'safe-density', false);
ok('safe-density는 냉기면역 2 이하만', safeDensity.every((z) => z.coldImmune <= 2), safeDensity.map((z) => z.coldImmune));
ok('safe-density는 밀도 내림차순', safeDensity.every((z, i) => i === 0 || safeDensity[i - 1].density >= z.density));
const fastLoop = L.recommendZonesForGoal(META_DATA.terrorZones, 'fast-loop', false);
ok('fast-loop는 런타임 오름차순', fastLoop.every((z, i) => i === 0 || fastLoop[i - 1].runTimeSec <= z.runTimeSec), fastLoop.map((z) => z.runTimeSec));
ok('todayPicker 목적 4개, strategy 값이 전부 유효', META_DATA.todayPicker.goals.length === 4 &&
  META_DATA.todayPicker.goals.every((g) => ['top-tier', 'safe-density', 'fast-loop'].includes(g.strategy)));

console.log('\n--- 진행 가이드 체크리스트 ---');
const gPath = META_DATA.stuckGuide.paths.find((p) => p.id === 'gamble-path');
const prog0g = L.computeChecklistProgress(gPath.steps, {});
ok('아무것도 체크 안 하면 0%', prog0g.done === 0 && prog0g.pct === 0, prog0g);
const prog1g = L.computeChecklistProgress(gPath.steps, { 'gp-1': true, 'gp-2': true });
ok('2개 체크하면 done=2', prog1g.done === 2, prog1g);
ok('빈 스텝 배열은 total 0, pct 0', L.computeChecklistProgress([], {}).total === 0 && L.computeChecklistProgress([], {}).pct === 0);
ok('진행 가이드 경로 2개, 각 스텝 id 중복 없음',
  META_DATA.stuckGuide.paths.length === 2 &&
  META_DATA.stuckGuide.paths.every((p) => new Set(p.steps.map((s) => s.id)).size === p.steps.length));

console.log('\n========================================');
console.log('  PASS ' + pass + ' / FAIL ' + fail);
console.log('========================================\n');
process.exit(fail ? 1 : 0);
