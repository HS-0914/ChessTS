import { Chessboard } from "react-chessboard";
import ChessSection from "./ChessSection";
import { useEffect, useRef, useState } from "react";
import { Chess, DEFAULT_POSITION } from "chess.js";
function RandomBoard() {
  const [game, setGame] = useState(new Chess());
  const hasRun = useRef(false);
  useEffect(() => {
    // dev 환경
    if (!hasRun.current) {
      hasRun.current = true;
      randomChess();
    }
    // prod 환경
    // randomChess();
  }, []);

  const randomChess = () => {
    const possibleMoves = game.moves();
    // console.log(game.)

    // exit if the game is over
    if (game.isGameOver() || possibleMoves.length === 0) {
      game.load(DEFAULT_POSITION);
    } else {
      const randomIdx = Math.floor(Math.random() * possibleMoves.length);
      game.move(possibleMoves[randomIdx]);
      setGame(new Chess(game.fen()));
    }
    setTimeout(() => randomChess(), 2000);
  };

  function isDraggablePiece(id: string) {
    if (id === "randomBoard") return false;
    return true;
  }

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <ChessSection>
      <h2>🤖 AI와 1:1 대전</h2>
      <p className="card-text">
        인공지능 체스 엔진과 <strong>1:1 대결</strong>을 펼쳐보세요!
        <br />
        <span style={{ color: "#7a5c3b" }}>깊이(Depth)</span>와
        <span style={{ color: "#7a5c3b" }}> 생각 시간(Thinking Time)</span>
        을 자유롭게 조절해
        <br />
        나만의 난이도로 플레이할 수 있습니다.
      </p>
      {/* <!-- 체스판 컨테이너 --> */}

      <div className="board">
        <Chessboard
          id="randomBoard"
          position={game.fen()}
          customBoardStyle={{
            borderRadius: "4px",
            boxShadow: "0px 2px 10px rgba(0, 0, 0, 0.5)",
          }}
          isDraggablePiece={() => isDraggablePiece("randomBoard")}
        ></Chessboard>
      </div>
      {/* <!-- 추가적으로 체스 퍼즐, 레슨 등 다른 버튼을 넣어도 됩니다. --> */}
      <div className="mt-6 mb-3 text-white text-lg">
        <button
          className="bg-blue-600 py-2 px-4 rounded-md hover:bg-blue-700"
          id="puzzleBtn"
          onClick={() => scrollTo("myBoard")}
        >
          지금 도전하기
        </button>
        <button
          id="puzzleBtn"
          className="bg-gray-900 py-2 px-4 rounded-md ml-1.5 hover:bg-gray-700"
          onClick={() => scrollTo("puzzleBoard")}
        >
          체스퍼즐 풀기
        </button>
      </div>
    </ChessSection>
  );
}

export default RandomBoard;
