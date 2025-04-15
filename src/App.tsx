import "./App.css";
import MyBoard from "./components/MyBoard";
import PuzzleBoard from "./components/PuzzleBoard";
import RandomBoard from "./components/RandomBoard";

function App() {
  return (
    <>
      <nav className="navbar-chess">
        <a className="navbar-brand" href="#">
          <img src="chessLogo.png" alt="Chess Logo" />
          ChessTS
        </a>
      </nav>
      <RandomBoard></RandomBoard>
      <MyBoard></MyBoard>
      <PuzzleBoard></PuzzleBoard>
    </>
  );
}

export default App;
