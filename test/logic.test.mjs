/**
 * 03-logic.js 순수 함수 단위 테스트.
 * 실행: node test/logic.test.mjs
 * ★ 경량 모델: 새 로직 함수를 추가했으면 여기에 테스트를 최소 1개 추가해라.
 *
 * 2026-09-24: 맵 티어 평가 / 현상수배 / 딜 계산 / 체크리스트 관련 테스트는
 * 해당 기능이 guide.html로 이전되면서 함께 제거했다. 여기 남은 건
 * 스피드런 타이머가 실제로 쓰는 함수의 테스트뿐이다.
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

console.log('\n--- 지역 데이터 무결성 (타이머 선택지) ---');
ok('지역 id 중복 없음', new Set(META_DATA.terrorZones.map((z) => z.id)).size === META_DATA.terrorZones.length);
ok('모든 지역에 runTimeSec이 있다', META_DATA.terrorZones.every((z) => typeof z.runTimeSec === 'number' && z.runTimeSec > 0));

console.log('\n--- 파밍 효율 점수 (guide.html #zones 표와 대조) ---');
const findZone = (id) => META_DATA.terrorZones.find((z) => z.id === id);
ok('고대 토굴 91점', L.computeZoneScore(findZone('ancient-tunnels')) === 91, L.computeZoneScore(findZone('ancient-tunnels')));
ok('영묘 87점', L.computeZoneScore(findZone('mausoleum')) === 87, L.computeZoneScore(findZone('mausoleum')));
ok('세계석 성채 82점', L.computeZoneScore(findZone('worldstone-keep')) === 82, L.computeZoneScore(findZone('worldstone-keep')));
ok('트라빈칼 63점', L.computeZoneScore(findZone('travincal')) === 63, L.computeZoneScore(findZone('travincal')));
ok('탈 라샤의 무덤 58점', L.computeZoneScore(findZone('tal-rasha-tombs')) === 58, L.computeZoneScore(findZone('tal-rasha-tombs')));
ok('파괴참 미보유면 냉면 지역 점수가 내려간다',
  L.computeZoneScore(findZone('icy-cellar'), false) < L.computeZoneScore(findZone('icy-cellar'), true));

console.log('\n========================================');
console.log('  PASS ' + pass + ' / FAIL ' + fail);
console.log('========================================\n');
process.exit(fail ? 1 : 0);
