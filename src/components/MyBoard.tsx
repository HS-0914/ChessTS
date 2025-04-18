import { Chessboard } from "react-chessboard";
import ChessSection from "./ChessSection";
import { Chess, DEFAULT_POSITION } from "chess.js";
import { useEffect, useRef, useState } from "react";
import { Piece, Square } from "react-chessboard/dist/chessboard/types";
import axios from "axios";

function MyBoard() {
  const [game, setGame] = useState(new Chess());
  const [fromSquare, setFromSquare] = useState<Square | null>(null);
  const [toSquare, setToSquare] = useState<Square | null>(null);
  // const [clickedSquare, setClickedSquare] = useState<Square | null>(null);
  // const [moves, setMoves] = useState<Move[]>([]);
  const [focusSquare, setFocusSquare] = useState({});
  const hasRun = useRef(false);
  useEffect(() => {
    if (!hasRun.current) {
      hasRun.current = true;
    }
  }, []);

  useEffect(() => {
    if (fromSquare && toSquare) {
      apiTurn();
      setFromSquare(null);
      setToSquare(null);
    }
  }, [fromSquare, toSquare]);

  async function apiTurn() {
    try {
      const res = await axios.post("https://chess-api.com/v1");
    } catch {
      console.log();
    }
  }

  function onSquareClick(square: Square, piece: Piece | undefined) {
    if (piece) {
      colorSquares(square);
      // setClickedSquare(square);
    }
    if (piece && piece.startsWith("w") && !fromSquare) {
      setFromSquare(square);
      return;
    }
    if (fromSquare && !toSquare) {
      setToSquare(square);
      // apiTurn();
      // setFromSquare(null);
      // setToSquare(null);
    }

    // moves 활용해서 이동 완성하기
  }

  function colorSquares(square: Square | null) {
    if (!square) {
      setFocusSquare({});
      return;
    }
    const colors: { [key: string]: { background: string } } = {};
    const possibleMoves = game.moves({ square, verbose: true });
    for (const square of possibleMoves) {
      if (
        game.get(square.to) &&
        game.get(square.to)?.color !== game.get(square.from)?.color
      ) {
        colors[square.to] = {
          background:
            "radial-gradient(circle, rgba(0,0,0,.2) 65%, transparent 70%)",
        };
      } else {
        colors[square.to] = {
          background:
            "radial-gradient(circle, rgba(0,0,0,.2) 25%, transparent 30%)",
        };
      }
    }

    colors[square] = {
      background: "rgba(255, 255, 0, 0.4)",
    };

    setFocusSquare(colors);
  }

  function isDraggablePiece({ piece }: { piece: Piece }) {
    // if (game.turn() === "b" || piece.startsWith("b")) return false;
    return true;
  }

  function onMouseOverSquare(square: Square) {
    colorSquares(square);
  }

  function onMouseOutSquare() {
    colorSquares(null);
  }

  function onPieceDrop(sourceSquare: Square, targetSquare: Square): boolean {
    const move = game.move({
      from: sourceSquare,
      to: targetSquare,
      promotion: "q",
    });

    return move ? true : false;
  }

  return (
    <ChessSection>
      <h2>🆚 AI와 1:1 체스 게임</h2>

      {/* 체스판 컨테이너 */}
      <div className="board">
        <Chessboard
          id="myBoard"
          position={game.fen()}
          onSquareClick={onSquareClick}
          onMouseOverSquare={onMouseOverSquare}
          onMouseOutSquare={onMouseOutSquare}
          onPieceDrop={onPieceDrop}
          isDraggablePiece={isDraggablePiece}
          customBoardStyle={{
            borderRadius: "4px",
            boxShadow: "0px 2px 10px rgba(0, 0, 0, 0.5)",
          }}
          customSquareStyles={{
            ...focusSquare,
          }}
        ></Chessboard>
      </div>
      {/* 컨트롤 패널 */}
      <div className="mt-6">
        <div className="flex justify-evenly">
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
            className="bg-amber-400 text-white text-md py-2 px-4 rounded-md hover:bg-amber-600"
          >
            <span>되돌리기</span>
          </button>
        </div>
      </div>
    </ChessSection>
  );
}

export default MyBoard;
