import { useEffect, useRef, useState } from "react";
import { Chessboard } from "react-chessboard";
import { Chess } from "chess.js";

type GameReplayProps = {
  pgn: string;
  onBack: () => void;
};

function GameReplay({ pgn, onBack }: GameReplayProps) {
  const game = useRef(new Chess());
  const [fen, setFen] = useState(game.current.fen());
  const [moves, setMoves] = useState<string[]>([]);
  // const [index, setIndex] = useState(0);
  const index = useRef(0);
  const playing = useRef(false);

  useEffect(() => {
    init();
  }, [pgn]);

  const init = () => {
    game.current.reset();
    game.current.loadPgn(pgn);
    const moveList = game.current.history();
    setMoves(moveList);
    game.current.reset();
    setFen(game.current.fen());
    index.current = 0;
  };

  const nextMove = () => {
    if (index.current < moves.length) {
      game.current.move(moves[index.current++]);
      setFen(game.current.fen());
    } else {
      init();
    }
  };

  const playAll = () => {
    if (playing.current) return;
    playing.current = true;
    const play = () => {
      if (index.current < moves.length) {
        game.current.move(moves[index.current++]);
        setFen(game.current.fen());
        setTimeout(play, 800);
      } else {
        playing.current = false;
        setTimeout(init, 8000);
      }
    };
    play();
  };

  return (
    <div>
      <h2 className="text-lg font-semibold mb-2 mt-0!">♟️ 게임 리플레이</h2>
      <div className="board mb-4">
        <Chessboard position={fen} />
      </div>
      <div className="flex justify-center gap-2 mb-2 mt-4">
        <button
          onClick={nextMove}
          className="bg-emerald-500 text-white px-3 py-1 rounded hover:bg-emerald-600"
        >
          다음 수
        </button>
        <button
          onClick={playAll}
          className="bg-gray-900 text-white px-3 py-1 rounded hover:bg-gray-700"
        >
          전체 재생
        </button>
        <button
          onClick={onBack}
          className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600"
        >
          ← 목록으로
        </button>
      </div>
    </div>
  );
}

export default GameReplay;
