import { Chessboard } from "react-chessboard";
import ChessSection from "./ChessSection";
import { Chess, DEFAULT_POSITION, Move } from "chess.js";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import {
  BoardOrientation,
  Piece,
  Square,
} from "react-chessboard/dist/chessboard/types";

function PuzzleBoard() {
  let sessionFen = sessionStorage.getItem("fen") ?? DEFAULT_POSITION;
  const game = useRef(new Chess(sessionFen));
  const [puzzleFen, setPuzzleFen] = useState(game.current.fen());
  const [puzzleTitle, setPuzzleTitle] = useState("title");
  const [puzzleUrl, setPuzzleUrl] = useState("");
  const [answer, setAnswer] = useState<string[]>([]);
  const answerIndex = useRef(0);
  const [boardOrientation, setBoardOrientation] =
    useState<BoardOrientation>("white");
  const [focusSquare, setFocusSquare] = useState({});
  const [possibleSquares, setPossibleSquares] = useState({});
  const [fromSquare, setFromSquare] = useState<Square | null>(null);
  const [toSquare, setToSquare] = useState<Square | null>(null);
  const [runCheck, setRunCheck] = useState(false);

  const getGame = () => game.current;

  const hasRun = useRef(false);
  useEffect(() => {
    if (!hasRun.current) {
      console.log("run");
      hasRun.current = true;
      loadPuzzle();
    }
  }, []);

  useEffect(() => {
    if (fromSquare && toSquare) {
      try {
        const move = game.current.move({
          from: fromSquare,
          to: toSquare,
          promotion: "q",
        });
        checkMove(move.san);
        setPuzzleFen(game.current.fen());
      } catch (error) {
        console.log(error);
      } finally {
        setFromSquare(null);
        setToSquare(null);
        setPossibleSquares({});
      }
    }
  }, [fromSquare, toSquare]);

  async function loadPuzzle() {
    const game = getGame();
    const res = await axios.get("https://api.chess.com/pub/puzzle/random");
    const { fen, title, url, pgn } = res.data;
    const { mainMoves, variations } = parsePGNWithVariations(pgn);
    console.log(mainMoves);
    console.log("variations : ", variations);
    sessionStorage.setItem("fen", fen);

    game.load(fen);
    setAnswer(mainMoves);
    answerIndex.current = 0;
    setPuzzleTitle(title);
    setPuzzleUrl(url);
    setTimeout(() => {
      setPuzzleFen(fen);
    }, 100);

    if (game.turn() === "b") {
      setBoardOrientation("black");
    } else {
      setBoardOrientation("white");
    }

    // chessPuzzle.puzzle = mainMoves;
    // chessPuzzle.index = 0;
  }
  const cleanText = (text: string) => {
    return text
      .replace(/\r?\n/g, " ") // 줄바꿈 → 공백
      .replace(/\[.*?\]/g, "") // PGN 메타데이터 제거
      .replace(/\$\d+/g, "") // $3 같은 평가기호 제거
      .replaceAll(/(1-0|0-1|1\/2-1\/2|\*)/g, "") // 결과 제거
      .replace(/\s+/g, " ") // 연속 공백 → 하나로
      .replace(/\d+\.+/g, "") // 수 번호 제거 (1. 2... 등)
      .replace(/\.\.\./g, "")
      .trim();
  };

  function parsePGNWithVariations(pgn: string) {
    const cleaned = cleanText(pgn);
    const variations = [];

    // 괄호 안 variation 추출
    const variationRegex = /\((.*?)\)/g;
    for (const match of cleaned.matchAll(variationRegex)) {
      const variationMoves = match[1].split(" ").filter(Boolean);
      variations.push(variationMoves);
    }

    // 메인 수만 남기고 파싱
    const mainMoves = cleaned
      .replaceAll(/\(.*?\)/g, "") // 모든 괄호 내용 제거
      .split(" ")
      .filter(Boolean);

    return {
      mainMoves,
      variations,
    };
  }

  function checkMove(san: string) {
    const game = getGame();
    if (san === answer[answerIndex.current]) {
      if (++answerIndex.current === answer.length) {
        alert("Clear!");
        return;
      }
      setTimeout(() => {
        game.move(answer[answerIndex.current++]);
        setPuzzleFen(game.fen());
      }, 1000);
    } else {
      alert("다시 생각해보세요!");
      game.undo();
      setPuzzleFen(game.fen());
    }
  }

  function checkPuzzles() {
    setRunCheck(true);
    if (answerIndex.current == answer.length) {
      setTimeout(() => {
        answer.forEach(() => game.current.undo());
        answerIndex.current = 0;
        setPuzzleFen(game.current.fen());
        setRunCheck(false);
      }, 6000);
    } else {
      setTimeout(() => {
        game.current.move(answer[answerIndex.current++]);
        setPuzzleFen(game.current.fen());
        checkPuzzles();
      }, 1000);
    }
  }
  function checkPuzzle() {
    setRunCheck(true);
    if (answerIndex.current === answer.length) {
      answer.forEach(() => game.current.undo());
      answerIndex.current = 0;
      setPuzzleFen(game.current.fen());
      setRunCheck(false);
      return;
    }
    game.current.move(answer[answerIndex.current++]);
    setPuzzleFen(game.current.fen());
    if (answerIndex.current === answer.length) {
      setRunCheck(false);
      return;
    }
    setTimeout(() => {
      game.current.move(answer[answerIndex.current++]);
      setPuzzleFen(game.current.fen());
      setRunCheck(false);
    }, 500);
  }

  function isDraggablePiece() {
    return boardOrientation.startsWith(game.current.turn());
  }

  function onMouseOverSquare(square: Square) {
    colorSquares(square);
  }

  function onMouseOutSquare() {
    colorSquares(null);
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

  function onSquareClick(square: Square, piece: Piece | undefined) {
    if (!boardOrientation.startsWith(game.current.turn())) return;
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

  function onPieceDrop(sourceSquare: Square, targetSquare: Square): boolean {
    let move: Move | boolean = false;
    const game = getGame();
    try {
      move = game.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: "q",
      });
      checkMove(move.san);
      setPuzzleFen(game.fen());
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
    <div id="puzzleBoard">
      <ChessSection>
        <h2>🧩 체스 퍼즐</h2>
        <p>
          새로운 퍼즐에 도전해보세요!
          <br />
          두뇌를 자극하는 흥미로운 문제로 체스 실력을 테스트할 수 있습니다.
        </p>
        <div className="mb-3">
          <h4 id="puzzleTitle" className="font-bold text-2xl">
            {puzzleTitle}
          </h4>
          <a href={puzzleUrl} id="puzzleLink" target="_blank">
            퍼즐 보러 가기
          </a>
        </div>
        {/* 체스판 컨테이너 */}
        <div className="board">
          <Chessboard
            position={puzzleFen}
            boardOrientation={boardOrientation}
            customBoardStyle={{
              borderRadius: "4px",
              boxShadow: "0px 2px 10px rgba(0, 0, 0, 0.5)",
            }}
            customSquareStyles={{
              ...focusSquare,
              ...possibleSquares,
            }}
            isDraggablePiece={isDraggablePiece}
            onMouseOverSquare={onMouseOverSquare}
            onMouseOutSquare={onMouseOutSquare}
            onSquareClick={onSquareClick}
            onPieceDrop={onPieceDrop}
          ></Chessboard>
        </div>
        <div className="mt-6 mb-3 text-white text-lg">
          <button
            className="bg-emerald-600 py-2 px-4 rounded-md hover:bg-emerald-700"
            id="reloadPuzzle"
            onClick={loadPuzzle}
          >
            다른 퍼즐 보기
          </button>
          <button
            className="bg-gray-500 py-2 px-4 rounded-md ml-1.5 hover:bg-gray-600"
            id="checkPuzzle"
            onClick={checkPuzzle}
            disabled={runCheck}
          >
            정답 확인
          </button>
          <button
            className="bg-gray-500 py-2 px-4 rounded-md ml-1.5 hover:bg-gray-600"
            id="checkPuzzle"
            onClick={checkPuzzles}
            disabled={runCheck}
          >
            정답 모두 확인
          </button>
        </div>
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
    </div>
  );
}

export default PuzzleBoard;
