import { Chessboard } from "react-chessboard";
import { Chess, Move } from "chess.js";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import {
  Piece,
  PromotionPieceOption,
  Square,
} from "react-chessboard/dist/chessboard/types";

function VsPlayer() {
  const game = useRef(new Chess());
  const [fen, setFen] = useState(game.current.fen());
  const [fromSquare, setFromSquare] = useState<Square | null>(null);
  const [toSquare, setToSquare] = useState<Square | null>(null);
  const [focusSquare, setFocusSquare] = useState({});
  const [possibleSquares, setPossibleSquares] = useState({});
  const [depth, setDepth] = useState(1);
  const [maxThinkingTime, setMaxThinkingTime] = useState(1);
  const [showPromotionDialog, setShowPromotionDialog] = useState(false);

  const hasRun = useRef(false);
  useEffect(() => {
    if (!hasRun.current) {
      hasRun.current = true;
    }
  }, []);

  useEffect(() => {
    if (fromSquare && toSquare) {
      const moves = game.current.moves({
        square: fromSquare,
        verbose: true,
      });
      const foundMove = moves.find(
        (m) => m.from === fromSquare && m.to === toSquare
      );
      if (foundMove) {
        // if promotion move
        if (
          (foundMove.color === "w" &&
            foundMove.piece === "p" &&
            toSquare[1] === "8") ||
          (foundMove.color === "b" &&
            foundMove.piece === "p" &&
            toSquare[1] === "1")
        ) {
          setShowPromotionDialog(true);
          return;
        }
      }
      try {
        game.current.move({
          from: fromSquare,
          to: toSquare,
          promotion: "q",
        });
        setFen(game.current.fen());
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
    if (id === "depth2" && value >= 1 && value <= 18) {
      setDepth(value);
    }
    if (id === "thinkingTime2" && value >= 1 && value <= 100) {
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

  function onSquareClick(square: Square, piece: Piece | undefined) {
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

  function onPromotionPieceSelect(piece: PromotionPieceOption | undefined) {
    if (piece && fromSquare && toSquare) {
      game.current.move({
        from: fromSquare,
        to: toSquare,
        promotion: piece[1].toLowerCase() ?? "q",
      });
      setFen(game.current.fen());
    }
    setShowPromotionDialog(false);
    setFromSquare(null);
    setToSquare(null);
    setPossibleSquares({});
    return true;
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
    if (
      (game.current.turn() === "b" && piece.startsWith("w")) ||
      (game.current.turn() === "w" && piece.startsWith("b"))
    )
      return false;
    return true;
  }

  function onMouseOverSquare(square: Square) {
    colorSquares(square);
  }

  function onMouseOutSquare() {
    colorSquares(null);
  }

  function onPieceDrop(
    sourceSquare: Square,
    targetSquare: Square,
    piece: Piece
  ): boolean {
    let move: Move | boolean = false;
    try {
      move = game.current.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: piece[1].toLowerCase() ?? "q",
      });
      setFen(game.current.fen());
    } catch (error) {
      console.error(error);
    } finally {
      setFromSquare(null);
      setToSquare(null);
      setPossibleSquares({});
    }
    console.log(game.current.pgn({ newline: "\n" }));
    return move ? true : false;
  }
  return (
    <div>
      <h2 style={{ marginTop: "0px" }}>🆚 다른 플레이어와 1:1 체스 게임</h2>

      {/* 체스판 컨테이너 */}
      <div className="board">
        <Chessboard
          position={fen}
          onSquareClick={onSquareClick}
          onMouseOverSquare={onMouseOverSquare}
          onMouseOutSquare={onMouseOutSquare}
          onPieceDrop={onPieceDrop}
          isDraggablePiece={isDraggablePiece}
          onPromotionPieceSelect={onPromotionPieceSelect}
          showPromotionDialog={showPromotionDialog}
          promotionToSquare={toSquare}
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
          <label htmlFor="depth" style={{ color: "#7a5c3b" }}>
            Depth:
          </label>
          <input
            type="number"
            id="depth2"
            value={depth}
            min="1"
            max="18"
            onChange={handleChange}
            onInput={handleInput}
          />
          <label htmlFor="thinkingTime" style={{ color: "#7a5c3b" }}>
            Max Thinking Time (ms):
          </label>
          <input
            type="number"
            id="thinkingTime2"
            value={maxThinkingTime}
            min="1"
            max="100"
            onChange={handleChange}
            onInput={handleInput}
          />
          <button
            id="undoBtn2"
            className="bg-amber-400 text-white text-md py-2 px-4 rounded-md hover:bg-amber-600"
            onClick={handleUndo}
          >
            <span>되돌리기2</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default VsPlayer;
