import ChessSection from "./ChessSection";

function MyBoard() {
  return (
    <ChessSection>
      <h2>🆚 AI와 1:1 체스 게임</h2>

      {/* 체스판 컨테이너 */}
      <div
        id="myBoard"
        className="board"
        style={{ paddingTop: "1.5rem" }}
      ></div>
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
