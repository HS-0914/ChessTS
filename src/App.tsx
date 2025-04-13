import "./App.css";
import MyBoard from "./components/MyBoard";

function App() {
  return (
    <>
      <nav className="navbar-chess">
        <a className="navbar-brand" href="#">
          <img src="chessLogo.png" alt="Chess Logo" />
          ChessTS
        </a>
      </nav>
      <MyBoard></MyBoard>
    </>
  );
}

export default App;
