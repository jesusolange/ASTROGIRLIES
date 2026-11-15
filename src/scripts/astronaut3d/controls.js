const TURN_STEP = Math.PI / 8;

// Drag or arrow keys turn the camera around the body; a click without dragging picks a part.
export function bindControls(canvas, { picking, turnBy, onClick, onEnter }) {
  const drag = { active: false, moved: false, startX: 0, lastX: 0 };

  const down = (event) => {
    drag.active = true;
    drag.moved = false;
    drag.startX = event.clientX;
    drag.lastX = event.clientX;
    canvas.setPointerCapture?.(event.pointerId);
  };

  const move = (event) => {
    if (drag.active) {
      if (Math.abs(event.clientX - drag.startX) > 4) drag.moved = true;
      if (drag.moved) turnBy(-(event.clientX - drag.lastX) * 0.01);
      drag.lastX = event.clientX;
      canvas.style.cursor = "grabbing";
      return;
    }
    picking.aim(event);
    canvas.style.cursor = picking.pick() ? "pointer" : "grab";
  };

  const up = (event) => {
    const moved = drag.moved;
    drag.active = false;
    drag.moved = false;
    canvas.style.cursor = "grab";
    if (moved) return;
    picking.aim(event);
    onClick(picking.pick());
  };

  const key = (event) => {
    if (event.key === "ArrowLeft") turnBy(-TURN_STEP);
    else if (event.key === "ArrowRight") turnBy(TURN_STEP);
    else if (event.key === "Enter" || event.key === " ") onEnter();
    else return;
    event.preventDefault();
  };

  canvas.addEventListener("pointerdown", down);
  canvas.addEventListener("pointermove", move);
  canvas.addEventListener("pointerup", up);
  canvas.addEventListener("keydown", key);

  return () => {
    canvas.removeEventListener("pointerdown", down);
    canvas.removeEventListener("pointermove", move);
    canvas.removeEventListener("pointerup", up);
    canvas.removeEventListener("keydown", key);
  };
}
