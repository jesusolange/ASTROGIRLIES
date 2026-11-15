import Sidebar from "./shell/Sidebar.jsx";
import Header from "./shell/Header.jsx";
import Footer from "./shell/Footer.jsx";
import Toasts from "./shell/Toasts.jsx";
import Modal from "./shell/Modal.jsx";
import CheckupPage from "./checkup/CheckupPage.jsx";
import EmergenciesView from "./emergencies/EmergenciesView.jsx";
import EnvironmentView from "./environment/EnvironmentView.jsx";
import TodayView from "./today/TodayView.jsx";
import RiskMapView from "./riskmap/RiskMapView.jsx";
import RadiationView from "./radiation/RadiationView.jsx";
import VisionView from "./vision/VisionView.jsx";
import ImmuneView from "./immune/ImmuneView.jsx";
import MentalHealthView from "./mental/MentalHealthView.jsx";
import NutritionView from "./nutrition/NutritionView.jsx";
import ExerciseView from "./exercise/ExerciseView.jsx";
import ProgressView from "./progress/ProgressView.jsx";
import ProtocolsView from "./protocols/ProtocolsView.jsx";
import ProfileDialog from "./profile/ProfileDialog.jsx";

function IconSprite() {
  return (
    <svg width="0" height="0" style="position:absolute; overflow:hidden" aria-hidden="true">
      <defs>
        <symbol id="ic-overview" viewBox="0 0 24 24">
          <rect x="3" y="3" width="7" height="7" rx="1"/>
          <rect x="14" y="3" width="7" height="7" rx="1"/>
          <rect x="3" y="14" width="7" height="7" rx="1"/>
          <rect x="14" y="14" width="7" height="7" rx="1"/>
        </symbol>
        <symbol id="ic-twin" viewBox="0 0 24 24">
          <circle cx="12" cy="5" r="3"/>
          <path d="M7 21v-7H4v-3l4-3h8l4 3v3h-3v7M10 21v-7h4v7"/>
        </symbol>
        <symbol id="ic-sim" viewBox="0 0 24 24">
          <path d="M2 12h4l3-7 4 14 3-7h6"/>
        </symbol>
        <symbol id="ic-report" viewBox="0 0 24 24">
          <path d="M6 2h9l4 4v16H6zM15 2v5h4M9 12h7M9 16h7"/>
        </symbol>
        <symbol id="ic-env" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="9"/>
          <path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/>
        </symbol>
        <symbol id="ic-food" viewBox="0 0 24 24">
          <path d="M7 3v8M4 3v5a3 3 0 0 0 6 0V3M7 11v10M17 21V3c-2.5 1.5-3.5 4.5-3.5 8H17"/>
        </symbol>
        <symbol id="ic-trophy" viewBox="0 0 24 24">
          <path d="M8 4h8v5a4 4 0 0 1-8 0zM8 6H4v2a3 3 0 0 0 4 3M16 6h4v2a3 3 0 0 1-4 3M12 13v4M8 21h8M10 17h4"/>
        </symbol>
        <symbol id="ic-rad" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="2"/>
          <path d="M12 10L8.5 4.2A9 9 0 0 1 15.5 4.2zM13.7 13l6.8 .1a9 9 0 0 1-3.5 6.1zM10.3 13L7 19.2A9 9 0 0 1 3.5 13.1z"/>
        </symbol>
        <symbol id="ic-mental" viewBox="0 0 24 24">
          <path d="M12 21s-7-4.4-9-9a5 5 0 0 1 9-3 5 5 0 0 1 9 3c-2 4.6-9 9-9 9z"/>
        </symbol>
        <symbol id="ic-setting" viewBox="0 0 24 24">
          <path d="M10 2h4l1 3 3 1 3-1 2 4-2 2v-3L1 9l2-4 3 1 3-1z"/>
          <circle cx="12" cy="12" r="3"/>
        </symbol>
        <symbol id="ic-sun" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="4"/>
          <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>
        </symbol>
        <symbol id="ic-moon" viewBox="0 0 24 24">
          <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/>
        </symbol>
        <symbol id="ic-user" viewBox="0 0 24 24">
          <circle cx="12" cy="8" r="4"/>
          <path d="M4 21a8 8 0 0 1 16 0"/>
        </symbol>
      </defs>
    </svg>
  );
}

export default function App() {
  return (
    <>
      <IconSprite />

      <div class="shell">
        <Sidebar />

        <main class="content">
          <Header />

          <CheckupPage />

          <section id="emergenciesPage" class="am-page" hidden><EmergenciesView /></section>
          <section id="environmentPage" class="am-page" hidden><EnvironmentView /></section>
          <section id="todayPage" class="am-page" hidden><TodayView /></section>
          <section id="riskmapPage" class="am-page" hidden><RiskMapView /></section>
          <section id="radiationPage" class="am-page" hidden><RadiationView /></section>
          <section id="visionPage" class="am-page" hidden><VisionView /></section>
          <section id="immunePage" class="am-page" hidden><ImmuneView /></section>
          <section id="mentalPage" class="am-page" hidden><MentalHealthView /></section>
          <section id="nutritionPage" class="am-page" hidden><NutritionView /></section>
          <section id="exercisePage" class="am-page" hidden><ExerciseView /></section>
          <section id="progressPage" class="am-page" hidden><ProgressView /></section>
          <section id="protocolsPage" class="am-page" hidden><ProtocolsView /></section>

          <ProfileDialog />

          <Footer />
        </main>
      </div>

      <Toasts />
      <Modal />
    </>
  );
}
