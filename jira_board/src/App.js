import TrelloBoard from "./components/TrelloBoard";
import "bootstrap/dist/css/bootstrap.min.css";

function App() {
  return (
    <div className="container py-4">
      <h1 className="text-center fw-bold mb-4">Trello Todo Board</h1>
      <TrelloBoard />
    </div>
  );
}

export default App;