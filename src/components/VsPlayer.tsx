import { Chessboard } from "react-chessboard";
import { Chess, Color, Move } from "chess.js";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import {
  Piece,
  PromotionPieceOption,
  Square,
} from "react-chessboard/dist/chessboard/types";
import { Socket } from "socket.io-client";

type VsPlayerProps = {
  socket: Socket;
  roomId: string;
  onLeave: () => void;
};

function VsPlayer({ socket, roomId, onLeave }: VsPlayerProps) {
  const savedGames = useRef<string[]>(
    JSON.parse(localStorage.getItem("vsPlayer") ?? "[]")
  );
  const playerName = useRef<string>(
    localStorage.getItem("player") ?? `익명-${socket.id}`
  );
  const game = useRef(new Chess());
  const myColor = useRef<string>(
    sessionStorage.getItem(`color-${roomId}`) || null
  );

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
    if (hasRun.current) return;
    hasRun.current = true;
    // 초기 소켓, 방 설정
    initSocket();

    // 초기 헤더 설정
    game.current.setHeader("Event", "vsPlayer");
    game.current.setHeader("Site", "ChessTS");
    game.current.setHeader("Date", getCurrentDate());
    game.current.setHeader("Round", `${savedGames.current.length + 1}`);
    console.log(game.current.pgn());
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
        const move = game.current.move({
          from: fromSquare,
          to: toSquare,
          promotion: "q",
        });
        setFen(game.current.fen());
        console.log("move.san : ", move.san);
        sendMove(move.san);
        checkWin();
      } catch (error) {
        console.log(error);
      } finally {
        setFromSquare(null);
        setToSquare(null);
        setPossibleSquares({});
      }
    }
  }, [fromSquare, toSquare]);

  /** socket io 함수 ============================================================================= */

  function initSocket() {
    // 방 입장
    socket.emit("join", roomId);

    // pgn 로드
    socket.on("initGame", (pgn: string) => {
      try {
        game.current.loadPgn(pgn);
        setTimeout(() => {
          setFen(game.current.fen());
        }, 1000);
      } catch (err) {
        console.error("PGN 로드 실패:", err);
      }
    });

    // color 확인
    socket.on("assignColor", (color: Color) => {
      if (myColor.current) return;
      console.log("🎨 내 색:", color);
      myColor.current = color;
      sessionStorage.setItem(`color-${roomId}`, myColor.current);
      myColor.current && myColor.current === "w"
        ? game.current.setHeader("White", playerName.current)
        : game.current.setHeader("Black", playerName.current);
    });

    // 상대 수 수신
    socket.on("move", (san: string) => {
      console.log("📩 상대 수 수신", san);
      try {
        game.current.move(san);
        setFen(game.current.fen());
        checkWin();
      } catch (e) {
        console.error("상대 수 에러", e);
      }
    });

    console.log("✅ 소켓 연결 완료");
    return () => {
      socket.off("assignColor");
      socket.off("move");
      socket.off("initGame");
    };
  }

  // 기물 이동 요청
  function sendMove(san: string) {
    const pgn = game.current.pgn();
    socket.emit("move", {
      roomId: roomId,
      san,
      pgn,
    });
  }

  // 방 나가기
  function leaveRoom() {
    game.current = new Chess();
    socket.emit("leave", roomId);
    onLeave();
  }

  /** 이벤트 처리 함수 =========================================================================== */

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
    // sendUndoReq();
    game.current.undo();
    game.current.undo();
    setFen(game.current.fen()); // 다시 그려지게
  };

  function getCurrentDate(): string {
    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0"); // 월은 0부터 시작하므로 +1
    const day = String(now.getDate()).padStart(2, "0");

    return `${year}.${month}.${day}`;
  }

  function checkGame(): string | boolean {
    if (game.current.isGameOver()) {
      if (game.current.isDraw()) {
        return "1/2-1/2";
      }
      if (game.current.turn() === "w") {
        return "1-0";
      } else {
        return "0-1";
      }
    }
    return false;
  }

  function checkWin() {
    const isEnd: boolean | string = checkGame();
    if (!isEnd) return;
    game.current.setHeader("Result", isEnd as string);
    if (isEnd === "1-0") {
      alert("흰색 승리!");
    } else if (isEnd === "0-1") {
      alert("검정색 승리!");
    } else {
      alert("무승부!");
    }
    saveLog();
    game.current.setHeader("Round", `${savedGames.current.length + 1}`);
  }

  function saveLog() {
    const pgn = game.current.pgn({ newline: "\n" });
    savedGames.current.push(pgn);
    localStorage.setItem("vsPlayer", JSON.stringify(savedGames));
    console.log(pgn);
  }

  /** board 함수============================================================================= */

  function onSquareClick(square: Square, piece: Piece | undefined) {
    if (game.current.turn() !== myColor.current) return;
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
      const move = game.current.move({
        from: fromSquare,
        to: toSquare,
        promotion: piece[1].toLowerCase() ?? "q",
      });
      setFen(game.current.fen());
      console.log("move.san : ", move.san);
      sendMove(move.san);
      checkWin();
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
    return (
      game.current.turn() === myColor.current &&
      piece.startsWith(myColor.current)
    );
    /*
    if (
      (game.current.turn() === "b" && piece.startsWith("w")) ||
      (game.current.turn() === "w" && piece.startsWith("b"))
    )
    return false;
    return true;
    */
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
      console.log("move.san : ", move.san);
      sendMove(move.san);
      checkWin();
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
          boardOrientation={myColor.current === "w" ? "white" : "black"}
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
          <button
            onClick={leaveRoom}
            className="bg-red-500 hover:bg-red-700 text-white text-md py-2 px-4 rounded-md"
          >
            🔙 방 나가기
          </button>
          <button
            className="bg-amber-400 text-white text-md py-2 px-4 rounded-md hover:bg-amber-600"
            onClick={handleUndo}
          >
            <span>되돌리기</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default VsPlayer;
