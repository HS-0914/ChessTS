import { Chessboard } from "react-chessboard";
import ChessSection from "./ChessSection";
import { Chess, DEFAULT_POSITION } from "chess.js";
import { useEffect, useRef, useState } from "react";
import { Piece, Square } from "react-chessboard/dist/chessboard/types";

function MyBoard() {
  const [game, setGame] = useState(new Chess());
  const [clicked, setClicked] = useState({});
  const [clickedSquare, setClickedSquare] = useState({});
  const hasRun = useRef(false);
  useEffect(() => {
    if (!hasRun.current) {
      hasRun.current = true;
    }
  }, []);

  useEffect(() => {
    console.log(clicked);
  }, [clicked]);

  function onSquareClick(square: Square, piece: Piece | undefined) {
    const newSquares: { [key: string]: { background: string } } = {};
    newSquares[square] = {
      background: "rgba(255, 255, 0, 0.4)",
    };
    setClickedSquare(newSquares);
    setClicked({
      square,
      piece,
    });
  }

  return (
    <ChessSection>
      <h2>🆚 AI와 1:1 체스 게임</h2>

      {/* 체스판 컨테이너 */}
      <Chessboard
        id="myBoard"
        position={DEFAULT_POSITION}
        onSquareClick={onSquareClick}
        customSquareStyles={{
          ...clickedSquare,
        }}
      ></Chessboard>

      {/* 컨트롤 패널 */}
      <div className="">
        <div className="">
          <div className="">
            <label htmlFor="depth" style={{ color: "#7a5c3b" }}>
              Depth:
            </label>
            <input type="number" id="depth" defaultValue="1" min="1" max="18" />
          </div>
          <div className="col-auto">
            <label htmlFor="thinkingTime" style={{ color: "#7a5c3b" }}>
              Max Thinking Time (ms):
            </label>
            <input
              type="number"
              id="thinkingTime"
              defaultValue="1"
              min="1"
              max="100"
            />
          </div>
          <button
            id="undoBtn"
            className="bg-amber-400 text-white text-md py-2 px-4 rounded-md mt-3 mb-3 hover:bg-amber-600 transition"
          >
            <span>되돌리기</span>
          </button>
        </div>
      </div>
    </ChessSection>
  );
}

export default MyBoard;
