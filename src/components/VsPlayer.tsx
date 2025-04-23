import { Chessboard } from "react-chessboard";
import { Chess, Color, Move } from "chess.js";
import { useEffect, useRef, useState } from "react";
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
  const [showPromotionDialog, setShowPromotionDialog] = useState(false);
  const [undoing, setUndoing] = useState(false);
  const undoingRef = useRef(false);

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
  }, [socket]);

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
        playMoveSound();
        sendMove();
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
      myColor.current = color;
      sessionStorage.setItem(`color-${roomId}`, myColor.current);
      console.log("🎨 내 색:", myColor.current);
    });

    // 상대 수 수신
    socket.on("move", (pgn: string) => {
      console.log("📩 상대 수 수신", pgn);
      try {
        game.current.loadPgn(pgn);
        setFen(game.current.fen());
        playMoveSound();
        setTimeout(() => {
          checkWin();
        }, 500);
      } catch (e) {
        console.error("상대 수 에러", e);
      }
    });

    // 되돌리기 수신 시시
    socket.on("undoRequest", () => {
      console.log("✅ undoAccept 이벤트 수신");
      const accept = confirm(
        "상대가 되돌리기를 요청했습니다. 수락하시겠습니까?"
      );
      if (accept) {
        socket.emit("undoAccept", roomId);
        handleUndo(); // 본인도 즉시 되돌리기
      } else {
        socket.emit("undoReject", roomId);
      }
    });

    // 되돌리기 수락
    socket.on("undoAccept", () => {
      console.log("✅ undoAccept 이벤트 수신");
      handleUndo(); // 나도 되돌리기
      setUndoing(false);
      undoingRef.current = false;
      alert("상대가 되돌리기를 수락했습니다.");
    });

    // 되돌리기 거절
    socket.on("undoReject", () => {
      setUndoing(false);
      undoingRef.current = false;
      alert("상대가 되돌리기를 거절했습니다.");
    });

    console.log("✅ 소켓 연결 완료");
    return () => {
      socket.off("initGame");
      socket.off("assignColor");
      socket.off("move");
      socket.off("undoRequest");
      socket.off("undoAccept");
      socket.off("undoReject");
    };
  }

  // 기물 이동 요청
  function sendMove() {
    setColorHearder();
    const pgn = game.current.pgn();
    socket.emit("move", {
      roomId: roomId,
      pgn,
    });
  }

  function setColorHearder() {
    myColor.current === "w"
      ? game.current.setHeader("White", playerName.current)
      : game.current.setHeader("Black", playerName.current);
  }

  // 방 나가기
  function leaveRoom() {
    game.current = new Chess();
    socket.emit("leave", roomId);
    onLeave();
  }

  /** 이벤트 처리 함수 =========================================================================== */

  function sendUndoRequest() {
    undoingRef.current = true;
    setUndoing(true);
    socket.emit("undoRequest", roomId);
  }

  const handleUndo = () => {
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
      if (game.current.turn() === "b") {
        // 수 두고 턴 넘어감
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
    const pgn = game.current.pgn();
    savedGames.current.push(pgn);
    localStorage.setItem("vsPlayer", JSON.stringify(savedGames.current));
  }

  function playMoveSound() {
    const audio = new Audio(`${import.meta.env.BASE_URL}move.mp3`);
    audio.volume = 0.8;
    audio.play();
  }

  /** board 함수============================================================================= */

  function onSquareClick(square: Square, piece: Piece | undefined) {
    if (undoingRef.current || game.current.turn() !== myColor.current) return;
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
      playMoveSound();
      sendMove();
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
      !undoingRef.current &&
      game.current.turn() === myColor.current &&
      piece.startsWith(myColor.current)
    );
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
      playMoveSound();
      sendMove();
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
          boardOrientation={
            myColor.current === "w" || !myColor.current ? "white" : "black"
          }
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
          <button
            onClick={leaveRoom}
            className="bg-red-500 hover:bg-red-700 text-white text-md py-2 px-4 rounded-md"
          >
            🔙 방 나가기
          </button>
          {!undoing ? (
            <button
              className="bg-amber-400 text-white text-md py-2 px-4 rounded-md hover:bg-amber-600"
              onClick={sendUndoRequest}
            >
              <span>되돌리기</span>
            </button>
          ) : (
            <button className="bg-amber-600 text-white text-md py-2 px-4 rounded-md hover:bg-amber-600">
              <span>되돌리기 중</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default VsPlayer;
