# MVP 검증 기록

2026-09-10, Linux / Node.js 24.18.0 / npm 11.16.0 환경에서 확인했습니다.

| 항목                | 결과                                                                                      |
| ------------------- | ----------------------------------------------------------------------------------------- |
| `npm install`       | 성공, 378개 패키지 audit, 취약점 보고 0                                                   |
| `npm run dev`       | 성공, Chromium에서 실제 시작·조작·전투 확인                                               |
| `npm run lint`      | 성공                                                                                      |
| `npm run test`      | 10개 파일, 32개 테스트 통과                                                               |
| `npm run build`     | 성공, `/`, `/game`, `/icon.svg` 생성                                                      |
| `npm run typecheck` | 전체 소스와 테스트 strict 검사                                                            |
| `npm run start`     | 성공, 프로덕션 서버 E2E 3개 통과                                                          |
| Chromium E2E        | 시작·키보드·일시정지·설정·재시작, 전투·보석 수집·레벨업·게임 오버·기록 저장, 모바일·DPR 2 |

브라우저 테스트는 로컬에 설치된 Chromium 1234 revision 실행 파일을 사용했습니다. 프로덕션 서버에서 세 가지 E2E가 한 번에 통과했으며 총 실행 시간은 41.6초였습니다. 전투 테스트는 재현 가능한 랜덤 시드와 Playwright 가상 시간을 사용하고, Canvas 픽셀에서 경험치 보석을 찾아 실제 키보드로 이동합니다. 게임 상태를 외부에 노출하거나 수정하지 않습니다.

승리는 엔진 통합 테스트에서 600초 경계와 이후 시뮬레이션 정지를 확인했습니다. 사람이 실제로 10분 생존하는 장시간 밸런스 검증은 별도입니다.

## 성능 측정

`npm run perf`: 520 enemies / 220 projectiles / 320 experience orbs, 180 simulation steps.

- 중앙값: 1.46ms
- p95: 2.57ms
- 측정 범위: 엔진 업데이트만. Canvas 렌더링 제외.

이 결과는 기기별 60 FPS 보장이 아닙니다. GC와 렌더링을 포함한 실기기 측정은 향후 작업입니다.

## 미리보기

- [시작 화면](screenshots/start.png)
- [실제 레벨업 화면](screenshots/level-up.png)
- [모바일 화면](screenshots/mobile.png)
