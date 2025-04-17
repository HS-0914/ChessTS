import { Chessboard } from "react-chessboard";
import ChessSection from "./ChessSection";
import { DEFAULT_POSITION } from "chess.js";

function PuzzleBoard() {
  return (
    <ChessSection>
      <h2>🧩 체스 퍼즐</h2>
      <p>
        새로운 퍼즐에 도전해보세요!
        <br />
        두뇌를 자극하는 흥미로운 문제로 체스 실력을 테스트할 수 있습니다.
      </p>
      <div className="mb-3">
        <h4 id="puzzleTitle" className="font-bold text-2xl">
          test
        </h4>
        <a href="#" id="puzzleLink" target="_blank">
          퍼즐 보러 가기
        </a>
      </div>
      {/* 체스판 컨테이너 */}
      <div className="board">
        <Chessboard id="puzzleBoard" position={DEFAULT_POSITION}></Chessboard>
      </div>

      <button
        className="bg-emerald-600 text-white text-lg py-2 px-4 rounded-md mt-3 mb-3 hover:bg-emerald-700 transition"
        id="reloadPuzzle"
      >
        다른 퍼즐 보기
      </button>
      <button
        className="bg-gray-500 text-white text-lg py-2 px-4 rounded-md mt-3 mb-3 ml-1.5 hover:bg-gray-600 transition"
        id="checkPuzzle"
      >
        정답 확인
      </button>
      <p className="card-text text-muted" style={{ fontSize: "0.95rem" }}>
        퍼즐은 요청할 때마다 즉시 바뀌지 않으며, 약
        <strong>15초 정도의 대기 시간</strong>이 있을 수 있습니다.
      </p>
      <p className="card-text text-muted" style={{ fontSize: "0.9rem" }}>
        퍼즐 데이터는 <strong>Chess.com</strong>에서 제공됩니다.
        <br />
        퍼즐을 외부에 공유하거나 게시할 경우, 반드시
        <strong>
          <a href="https://www.chess.com/daily-chess-puzzle" target="_blank">
            Chess.com 퍼즐 페이지
          </a>
        </strong>
        로 연결되는 명확한 출처 표기를 해주세요.
      </p>
    </ChessSection>
  );
}

export default PuzzleBoard;
