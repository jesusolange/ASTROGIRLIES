// One icon component for the whole app. Keys map to lucide-preact icons; decorative by default.
// Props: name (key), size (px, default 20), strokeWidth (default 2), label (makes it a named image),
// className.
import "./kit.css";
import {
  Activity, AlertTriangle, Apple, Bandage, Bike, Bone, Brain, ChartLine, Check, ChevronRight,
  CircleAlert, CircleCheck, ClipboardCheck, Droplet, Dumbbell, Eye, FileText, Footprints, Gauge,
  Globe2, HeartHandshake, HeartPulse, House, Info, Menu, Moon, Pill, Radiation, Scale, Search,
  Settings, ShieldCheck, Siren, Stethoscope, Sun, Thermometer, Trash2, TriangleAlert, Trophy,
  Undo2, Upload, Download, User, Utensils, Wind, X
} from "lucide-preact";

const ICONS = {
  home: House,
  overview: Activity,
  check: ClipboardCheck,
  progress: ChartLine,
  emergency: Siren,
  heart: HeartPulse,
  heartCare: HeartHandshake,
  bones: Bone,
  kidneys: Droplet,
  immune: ShieldCheck,
  radiation: Radiation,
  mental: Brain,
  sleep: Moon,
  vision: Eye,
  nutrition: Apple,
  exercise: Dumbbell,
  bike: Bike,
  treadmill: Footprints,
  strength: Gauge,
  trophy: Trophy,
  report: FileText,
  environment: Globe2,
  food: Utensils,
  sun: Sun,
  moon: Moon,
  user: User,
  settings: Settings,
  search: Search,
  close: X,
  undo: Undo2,
  next: ChevronRight,
  menu: Menu,
  delete: Trash2,
  checkmark: Check,
  alert: AlertTriangle,
  warning: TriangleAlert,
  danger: CircleAlert,
  ok: CircleCheck,
  info: Info,
  upload: Upload,
  download: Download,
  temperature: Thermometer,
  lungs: Wind,
  medicine: Pill,
  injury: Bandage,
  clinic: Stethoscope,
  scale: Scale,
  "ic-overview": Activity,
  "ic-twin": Dumbbell,
  "ic-sim": ChartLine,
  "ic-report": FileText,
  "ic-env": Globe2,
  "ic-food": Utensils,
  "ic-trophy": Trophy,
  "ic-rad": Radiation,
  "ic-mental": Brain,
  "ic-setting": Settings,
  "ic-sun": Sun,
  "ic-moon": Moon,
  "ic-user": User
};

export const ICON_KEYS = Object.keys(ICONS);

export default function Icon({ name, size = 20, strokeWidth = 2, label, className = "" }) {
  const Glyph = ICONS[name] || Info;
  const named = Boolean(label);
  return (
    <Glyph
      size={size}
      strokeWidth={strokeWidth}
      class={`ui-icon ${className}`.trim()}
      aria-hidden={named ? undefined : "true"}
      role={named ? "img" : undefined}
      aria-label={named ? label : undefined}
      focusable="false"
    />
  );
}
