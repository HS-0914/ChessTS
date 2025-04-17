import { Chessboard } from "react-chessboard";
import ChessSection from "./ChessSection";
import { Chess, DEFAULT_POSITION, Move } from "chess.js";
import { useEffect, useRef, useState } from "react";
import { Piece, Square } from "react-chessboard/dist/chessboard/types";

function MyBoard() {
  const [game, setGame] = useState(new Chess());
  const [clickedSquare, setClickedSquare] = useState<Square | null>(null);
  const [moves, setMoves] = useState<Move[]>([]);
  const [focusSquare, setFocusSquare] = useState({});
  const hasRun = useRef(false);
  useEffect(() => {
    if (!hasRun.current) {
      hasRun.current = true;
    }
  }, []);

  useEffect(() => {
    // console.log(clickedSquare);
  }, [focusSquare]);

  function onSquareClick(square: Square, piece: Piece | undefined) {
    if (piece) {
      colorSquares(square);
      setClickedSquare(square);
    }
    // moves 활용해서 이동 완성하기
  }

  function colorSquares(square: Square) {
    const colors: { [key: string]: { background: string } } = {};
    const possibleMoves = game.moves({ square, verbose: true });
    setMoves(possibleMoves);
    console.log(possibleMoves);
    for (const square of possibleMoves) {
      if (
        game.get(square.to) &&
        game.get(square.to)?.color !== game.get(square.from)?.color
      ) {
        colors[square.to] = {
          background:
            "radial-gradient(circle, rgba(0,0,0,.1) 85%, transparent 85%)",
        };
      } else {
        colors[square.to] = {
          background:
            "radial-gradient(circle, rgba(0,0,0,.1) 25%, transparent 25%)",
        };
      }
    }

    colors[square] = {
      background: "rgba(255, 255, 0, 0.4)",
    };

    setFocusSquare(colors);
  }

  function isDraggablePiece({ piece }: { piece: Piece }) {
    if (game.turn() === "b" || piece.startsWith("b")) return false;
    return true;
  }

  function onPieceDragBegin(_piece: Piece, sourceSquare: Square) {
    colorSquares(sourceSquare);
    setClickedSquare(sourceSquare);
  }

  function onPieceDragEnd() {
    console.log("DragEnd");
  }

  return (
    <ChessSection>
      <h2>🆚 AI와 1:1 체스 게임</h2>

      {/* 체스판 컨테이너 */}
      <div className="board">
        <Chessboard
          id="myBoard"
          position={DEFAULT_POSITION}
          onSquareClick={onSquareClick}
          onPieceDragBegin={onPieceDragBegin}
          onPieceDragEnd={onPieceDragEnd}
          isDraggablePiece={isDraggablePiece}
          customSquareStyles={{
            ...focusSquare,
          }}
        ></Chessboard>
      </div>
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
