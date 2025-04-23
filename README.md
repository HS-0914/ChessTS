# ♟️ ChessTS - React 기반 실시간 체스 웹앱

> **ChessTS**는 React + Vite 기반의 체스 프로젝트입니다.
> API와의 대국, 사용자 간 1:1 대국, 퍼즐 도전, 게임 로그 확인 등 다양한 기능을 제공합니다.
> Socket.io, Chess.js, react-chessboard 라이브러리를 기반으로 구현되어 있습니다.

---

## 주요 기능

### ✅ AI 대국 (vsCom)

- chess-api.com 과의 API 통신
- Depth, Thinking Time 조정
- 체스.js 기반 룰 적용

### ✅ 사용자 간 1:1 대전 (vsPlayer)

- Socket.io 기반 방 생성 및 입장
- 실시간 수 동기화 + 턴 제어
- 되돌리기(무르기) 요청/수락/거절 기능
- 결과 저장 및 localStorage 기반 로그 기록

### ✅ 퍼즐 도전 (PuzzleBoard)

- [chess.com 퍼즐 API](https://www.chess.com/daily-chess-puzzle) 기반
- 정답 체크 및 정답 애니메이션 자동 실행

### ✅ 전적 로그 (LogViewer)

- API / 사용자 간 대국국 PGN 기록 저장
- 게임 리플레이 기능 (1수씩 보기 / 자동 재생)
- 닉네임 설정 기능 포함

---

## 💡 스택

| 구별        | 기술                                                             |
| ----------- | ---------------------------------------------------------------- |
| 프레임워크  | React + Vite                                                     |
| 체스 엔진   | [chess.js](https://github.com/jhlywa/chess.js)                   |
| 보드 UI     | [react-chessboard](https://react-chessboard.vercel.app)          |
| 실시간 통신 | Socket.IO                                                        |
| AI API      | [chess-api.com](https://chess-api.com)                           |
| 퍼즐 API    | [chess.com puzzle API](https://www.chess.com/daily-chess-puzzle) |

---

## 🗂 프로젝트 구조

```bash
📦 chess-ts
├── 📁 public
│
├── 📁 server                        # 서버 관련 폴더 (백엔드)
│   ├── 📄 server.js                 # 서버 (JS 버전, 배포)
│   ├── 📄 server.ts                 # 서버 (TS 버전, 개발)
│
├── 📁 src                           # 프론트엔드 소스
│   ├── 📁 components                # 주요 기능 컴포넌트 모음
│   │   ├── 📄 ChessSection.tsx     # 공통 레이아웃
│   │   ├── 📄 GameReplay.tsx       # 전적 수 재생 보드
│   │   ├── 📄 LogViewer.tsx        # 전적 목록 + 닉네임 입력
│   │   ├── 📄 MyBoard.tsx          # 메인 화면 (탭 포함)
│   │   ├── 📄 PuzzleBoard.tsx      # chess.com 퍼즐 API 기반 체스 퍼즐
│   │   ├── 📄 RandomBoard.tsx      # 랜덤 시연 보드
│   │   ├── 📄 RoomList.tsx         # 방 목록 / 생성 / 입장
│   │   ├── 📄 VsCom.tsx            # API 대국
│   │   ├── 📄 VsPlayer.tsx         # 1:1 사용자 대국
│
├── 📄 App.tsx                       # 루트 컴포넌트
├── 📄 App.css
├── 📄 index.tsx                     # 진입점
├── 📄 main.tsx                      # Vite 엔트리

```

---

## 🖼️ 주요 화면 구성
