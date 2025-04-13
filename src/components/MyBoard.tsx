const whiteSquareGrey = "#a9a9a9";
const blackSquareGrey = "#696969";

export const boards = {};
export const state = {
  pendingPromotion: null,
};

export const chessPuzzle = {
  puzzle: [],
  index: 0,
};

function MyBoard() {
  return (
    <section className="chess-section container mx-auto">
      <div className="rounded-lg section-card">
        <div className="p-4">
          <h2 className="text-4xl font-semibold">🤖 AI와 1:1 대전</h2>
          <p className="card-text">
            인공지능 체스 엔진과 <strong>1:1 대결</strong>을 펼쳐보세요!
            <br />
            <span style={{ color: "#7a5c3b" }}>깊이(Depth)</span>와
            <span style={{ color: "#7a5c3b" }}> 생각 시간(Thinking Time)</span>
            을 자유롭게 조절해
            <br />
            나만의 난이도로 플레이할 수 있습니다.
          </p>
          {/* <!-- 체스판 컨테이너 --> */}
          <div id="aiBoard" className="board"></div>
          {/* <!-- 추가적으로 체스 퍼즐, 레슨 등 다른 버튼을 넣어도 됩니다. --> */}
          <button className="btn btn-dark btn-lg mt-3 mb-3" id="puzzleBtn">
            체스퍼즐 풀기
          </button>
          <button className="btn btn-dark btn-lg mt-3 mb-3" id="puzzleBtn">
            체스퍼즐 풀기
          </button>
        </div>
      </div>
    </section>
  );
}

export default MyBoard;
