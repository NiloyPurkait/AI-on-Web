import Teachable from "./teachable-machine/index";

import "./App.css";

function App() {
  return (
    <div>
      <header>
        <div class="overlay">
          <h1>Teach me something !</h1>
        </div>
      </header>
      <Teachable />
    </div>
  );
}

export default App;
