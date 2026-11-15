import { useEffect } from "preact/hooks";
import { go } from "../lib/nav.js";
import TopBar from "./shell/TopBar.jsx";
import Destinations from "./shell/Destinations.jsx";
import AreaView from "./shell/AreaView.jsx";
import Footer from "./shell/Footer.jsx";
import Toasts from "./ui/Toast.jsx";
import ProfileDialog from "./profile/ProfileDialog.jsx";
import "./shell/shell.css";

function isTyping(target) {
  const tag = target && target.tagName;
  return Boolean(target && (target.isContentEditable || tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT"));
}

export default function App() {
  useEffect(() => {
    const onKey = (event) => {
      if (event.defaultPrevented || event.ctrlKey || event.metaKey || event.altKey) return;
      if (event.key !== "e" && event.key !== "E") return;
      if (isTyping(event.target)) return;
      event.preventDefault();
      go("emergency");
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div class="tb-app">
      <TopBar />
      <main class="tb-main" id="main">
        <AreaView />
        <Footer />
      </main>
      <Destinations variant="tabs" />
      <ProfileDialog />
      <Toasts />
    </div>
  );
}
