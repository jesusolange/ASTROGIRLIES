import "./styles/tokens.css";
import "./styles/base.css";
import "./scripts/main.js";
import { render } from "preact";
import App from "./components/App.jsx";

render(<App />, document.getElementById("app"));
