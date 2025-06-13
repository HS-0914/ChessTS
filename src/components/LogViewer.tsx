import { useEffect, useRef, useState } from "react";
import { Chess } from "chess.js";
import GameReplay from "./GameReplay";

function LogViewer() {
  const game = useRef(new Chess());
  const [nickname, setNickname] = useState(
    localStorage.getItem("player") || "익명"
  );
  const [games, setGames] = useState<string[]>([]);
  const [selected, setSelected] = useState<number | null>(null);

  useEffect(() => {
    refreshView();
  }, []);

  const handleSave = () => {
    if (nickname.length > 20) {
      alert(`닉네임이 너무 깁니다(20자 이하)`);
    } else {
      localStorage.setItem("player", nickname);
      alert(`닉네임 저장됨 : ${nickname}`);
    }
  };

  const refreshView = () => {
    const vsPlayerData = JSON.parse(localStorage.getItem("vsPlayer") ?? "{}");
    const vsComData = JSON.parse(localStorage.getItem("vsCom") ?? "{}");

    const pLogs = Array.isArray(vsPlayerData.current)
      ? vsPlayerData.current
      : [];
    const cLogs = Array.isArray(vsComData.current) ? vsComData.current : [];
    console.log(pLogs);
    console.log(cLogs);
    const logs = [...pLogs, ...cLogs];
    setGames(logs);
  };

  if (selected !== null) {
    return (
      <GameReplay pgn={games[selected]} onBack={() => setSelected(null)} />
    );
  }

  return (
    <div>
      <h2 className="text-lg font-semibold mb-2">📝 전적 로그</h2>
      <div className="mb-4">
        <label>닉네임 설정: </label>
        <input
          className="border px-2 py-1 rounded mr-2"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
        />
        <button
          onClick={handleSave}
          className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
        >
          저장
        </button>
        <button
          className="ml-2 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded"
          onClick={refreshView}
        >
          새로고침
        </button>
      </div>
      <ul className="space-y-2">
        {games.map((pgn, idx) => {
          game.current.loadPgn(pgn);
          const headers = game.current.getHeaders();
          const event = headers["Event"];
          const players = `${headers["White"]} vs ${headers["Black"]}`;

          return (
            <li key={idx}>
              <button
                onClick={() => setSelected(idx)}
                className="w-full text-left bg-gray-700 hover:bg-gray-800 text-white px-3 py-2 rounded flex justify-between items-center"
              >
                <span>{event}</span>
                <span>{players}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default LogViewer;
