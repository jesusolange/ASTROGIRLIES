// Single entry for the browser. The order matters while the modules still talk through window globals:
// each one registers its start-up on DOMContentLoaded, and those run in this order.
import "./storage.js";
import "./sync.js";
import "./checkup.js";
import "./exercise.js";
import "./health-indicators.js";
import "./exercise-overview.js";
import "./cover.js";
import "./profile.js";
import "./sections.js";
import "./environment.js";
import "./nutrition.js";
import "./missions.js";
import "./radiation.js";
import "./progress.js";
import "./readiness.js";
