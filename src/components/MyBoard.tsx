import { Chessboard } from "react-chessboard";
import ChessSection from "./ChessSection";
import { Chess, Move } from "chess.js";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { Piece, Square } from "react-chessboard/dist/chessboard/types";
import axios from "axios";

function MyBoard() {
  // new Chess를 useRef로?
  const game = useRef(new Chess());
  const [fen, setFen] = useState(game.current.fen());
  const [fromSquare, setFromSquare] = useState<Square | null>(null);
  const [toSquare, setToSquare] = useState<Square | null>(null);
  const [focusSquare, setFocusSquare] = useState({});
  const [possibleSquares, setPossibleSquares] = useState({});
  const [depth, setDepth] = useState(1);
  const [maxThinkingTime, setMaxThinkingTime] = useState(1);

  const hasRun = useRef(false);
  useEffect(() => {
    if (!hasRun.current) {
      hasRun.current = true;
    }
  }, []);

  useEffect(() => {
    if (fromSquare && toSquare) {
      try {
        game.current.move({
          from: fromSquare,
          to: toSquare,
          promotion: "q",
        });
        setFen(game.current.fen());
        setTimeout(() => {
          apiTurn();
        }, 1500);
      } catch (error) {
        console.log(error);
      } finally {
        setFromSquare(null);
        setToSquare(null);
        setPossibleSquares({});
      }
    }
  }, [fromSquare, toSquare]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    // 로 if문 리팩로팅 가능?
    const id: string = e.target.id;
    if (id === "depth" && value >= 1 && value <= 18) {
      setDepth(value);
    }
    if (id === "thinkingTime" && value >= 1 && value <= 100) {
      setMaxThinkingTime(value);
    }
  };

  const handleInput = (e: ChangeEvent<HTMLInputElement>) => {
    const max = Number(e.target.max);
    const min = Number(e.target.min);
    const value = Number(e.target.value);
    const id: string = e.target.id;

    // 공통 클램핑 로직
    const clamped = Math.max(min, Math.min(value || min, max));

    const setters: Record<string, (val: number) => void> = {
      depth: setDepth,
      thinkingTime: setMaxThinkingTime,
    };
    if (setters[id]) {
      setters[id](clamped);
    }
  };

  const handleUndo = () => {
    game.current.undo();
    game.current.undo();
    setFen(game.current.fen()); // 다시 그려지게
  };

  async function apiTurn() {
    try {
      const res = await axios.post(
        "https://chess-api.com/v1",
        {
          fen: game.current.fen(),
          depth,
          maxThinkingTime,
        },
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      const san = res.data.san;
      game.current.move(san);
      setFen(game.current.fen());
    } catch (e) {
      game.current.undo();
      console.log(e);
    }
  }

  function onSquareClick(square: Square, piece: Piece | undefined) {
    if (game.current.turn() === "b") return;
    const colors: { [key: string]: { background: string } } = {};
    colors[square] = { background: "rgba(255, 255, 0, 0.4)" };
    if (piece && !fromSquare) {
      setPossibleSquares(colors);
      setFromSquare(square);
      return;
    }
    if (fromSquare && !toSquare) {
      setToSquare(square);
    }
  }

  function colorSquares(square: Square | null) {
    if (!square) {
      setFocusSquare({});
      return;
    }
    const colors: { [key: string]: { background: string } } = {};
    const possibleMoves = game.current.moves({ square, verbose: true });
    for (const square of possibleMoves) {
      if (
        game.current.get(square.to) &&
        game.current.get(square.to)?.color !==
          game.current.get(square.from)?.color
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

    setFocusSquare(colors);
  }

  function isDraggablePiece({ piece }: { piece: Piece }) {
    if (game.current.turn() === "b" || piece.startsWith("b")) return false;
    return true;
  }

  function onMouseOverSquare(square: Square) {
    colorSquares(square);
  }

  function onMouseOutSquare() {
    colorSquares(null);
  }

  function onPieceDrop(sourceSquare: Square, targetSquare: Square): boolean {
    let move: Move | boolean = false;
    try {
      move = game.current.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: "q",
      });
      setFen(game.current.fen());
      setTimeout(() => {
        apiTurn();
      }, 1500);
    } catch (error) {
      console.error(error);
    } finally {
      setFromSquare(null);
      setToSquare(null);
      setPossibleSquares({});
    }
    return move ? true : false;
  }

  return (
    <div id="myBoard">
      <ChessSection>
        <h2>🆚 AI와 1:1 체스 게임</h2>

        {/* 체스판 컨테이너 */}
        <div className="board">
          <Chessboard
            position={fen}
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
              ...possibleSquares,
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
              <input
                type="number"
                id="depth"
                value={depth}
                min="1"
                max="18"
                onChange={handleChange}
                onInput={handleInput}
              />
            </div>
            <div className="col-auto">
              <label htmlFor="thinkingTime" style={{ color: "#7a5c3b" }}>
                Max Thinking Time (ms):
              </label>
              <input
                type="number"
                id="thinkingTime"
                value={maxThinkingTime}
                min="1"
                max="100"
                onChange={handleChange}
                onInput={handleInput}
              />
            </div>
            <button
              id="undoBtn"
              className="bg-amber-400 text-white text-md py-2 px-4 rounded-md hover:bg-amber-600"
              onClick={handleUndo}
            >
              <span>되돌리기</span>
            </button>
          </div>
        </div>
      </ChessSection>
    </div>
  );
}

export default MyBoard;
