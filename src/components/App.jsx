import TopBar from "./shell/TopBar.jsx";
import Destinations from "./shell/Destinations.jsx";
import AreaView from "./shell/AreaView.jsx";
import Footer from "./shell/Footer.jsx";
import Toasts from "./ui/Toast.jsx";
import ProfileDialog from "./profile/ProfileDialog.jsx";
import "./shell/shell.css";

export default function App() {
  return (
    <div class="tb-app">
      <TopBar />
      <main class="tb-main" id="main">
        <AreaView />
      </main>
      <Footer />
      <Destinations variant="tabs" />
      <ProfileDialog />
      <Toasts />
    </div>
  );
}
