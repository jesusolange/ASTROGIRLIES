import { CanvasTexture, RepeatWrapping, SRGBColorSpace } from "three";

function canvas(width, height) {
  const node = document.createElement("canvas");
  node.width = width;
  node.height = height;
  return node;
}

export function softDotTexture() {
  const node = canvas(128, 128);
  const ctx = node.getContext("2d");
  const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  gradient.addColorStop(0, "rgba(255,255,255,1)");
  gradient.addColorStop(0.35, "rgba(255,255,255,.55)");
  gradient.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 128, 128);
  return new CanvasTexture(node);
}

export function badgeTexture() {
  const node = canvas(256, 256);
  const ctx = node.getContext("2d");
  ctx.fillStyle = "#173057";
  ctx.beginPath();
  ctx.arc(128, 128, 120, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#ee503f";
  ctx.lineWidth = 14;
  ctx.beginPath();
  ctx.arc(128, 128, 108, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.font = "700 40px Inter, Arial, sans-serif";
  ctx.fillText("ASTRO", 128, 118);
  ctx.fillText("MED", 128, 162);
  const texture = new CanvasTexture(node);
  texture.colorSpace = SRGBColorSpace;
  return texture;
}

export function noiseTexture() {
  const node = canvas(128, 16);
  const ctx = node.getContext("2d");
  for (let x = 0; x < 128; x += 1) {
    const shade = 110 + Math.floor(Math.random() * 110);
    ctx.fillStyle = `rgb(${shade},${shade},${shade})`;
    ctx.fillRect(x, 0, 1, 16);
  }
  const texture = new CanvasTexture(node);
  texture.wrapS = texture.wrapT = RepeatWrapping;
  texture.repeat.set(5, 1);
  return texture;
}

export function checkupSignTexture() {
  const node = canvas(1024, 600);
  const ctx = node.getContext("2d");
  const rounded = (x, y, width, height, radius) => {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + width, y, x + width, y + height, radius);
    ctx.arcTo(x + width, y + height, x, y + height, radius);
    ctx.arcTo(x, y + height, x, y, radius);
    ctx.arcTo(x, y, x + width, y, radius);
    ctx.closePath();
  };
  const background = ctx.createLinearGradient(0, 0, 1024, 600);
  background.addColorStop(0, "#0a1a3f");
  background.addColorStop(1, "#173a72");
  ctx.fillStyle = background;
  rounded(0, 0, 1024, 600, 64);
  ctx.fill();
  for (let i = 0; i < 46; i += 1) {
    ctx.fillStyle = `rgba(190,225,255,${0.15 + ((i * 37) % 10) / 22})`;
    ctx.beginPath();
    ctx.arc((i * 173) % 1024, (i * 97) % 600, 1 + (i % 3) * 0.7, 0, Math.PI * 2);
    ctx.fill();
  }
  const border = ctx.createLinearGradient(0, 0, 1024, 0);
  border.addColorStop(0, "#43d9ff");
  border.addColorStop(1, "#6a8cff");
  ctx.strokeStyle = border;
  ctx.lineWidth = 12;
  rounded(14, 14, 996, 572, 52);
  ctx.stroke();
  ctx.textAlign = "center";
  ctx.fillStyle = "#ffffff";
  ctx.font = "700 92px Inter, Arial, sans-serif";
  ctx.fillText("Let\u2019s do a", 512, 150);
  ctx.fillStyle = "#6fe3ff";
  ctx.fillText("checkup!", 512, 252);
  ctx.fillStyle = "rgba(111,227,255,.16)";
  rounded(262, 300, 500, 84, 42);
  ctx.fill();
  ctx.strokeStyle = "#6fe3ff";
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.fillStyle = "#d4f3ff";
  ctx.font = "600 44px Inter, Arial, sans-serif";
  ctx.fillText("Tap to start", 512, 358);
  ctx.strokeStyle = "#2fe39b";
  ctx.lineWidth = 9;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.shadowColor = "#2fe39b";
  ctx.shadowBlur = 14;
  ctx.beginPath();
  ctx.moveTo(170, 486);
  [[330, 486], [372, 436], [414, 532], [460, 452], [494, 486], [854, 486]]
    .forEach(([x, y]) => ctx.lineTo(x, y));
  ctx.stroke();
  const texture = new CanvasTexture(node);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}
