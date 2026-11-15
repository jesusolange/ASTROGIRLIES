import "./styles/tokens.css";
import "./styles/style.css";
import "./styles/sections.css";
import "./styles/theme.css";
import "./scripts/main.js";
import { render } from "preact";
import App from "./components/App.jsx";

render(<App />, document.getElementById("app"));
