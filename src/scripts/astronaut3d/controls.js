export function bindControls(canvas, { state, picking, startSpin, selectPart }) {
  canvas.addEventListener("pointerdown", (event) => {
    state.dragging = true;
    state.moved = false;
    state.pointerStartX = event.clientX;
    state.lastX = event.clientX;
    canvas.setPointerCapture?.(event.pointerId);
  });

  canvas.addEventListener("pointermove", (event) => {
    if (state.dragging && state.mode === "body") {
      if (Math.abs(event.clientX - state.pointerStartX) > 4) state.moved = true;
      if (state.moved) state.dragAngle += (event.clientX - state.lastX) * 0.01;
      state.lastX = event.clientX;
      canvas.style.cursor = "grabbing";
      return;
    }
    picking.aim(event);
    canvas.style.cursor = state.mode === "intro"
      ? "pointer"
      : state.mode === "body"
        ? (picking.pick() ? "pointer" : "grab")
        : "default";
  });

  canvas.addEventListener("pointerup", (event) => {
    const moved = state.moved;
    state.dragging = false;
    state.moved = false;
    if (moved) return;
    picking.aim(event);
    if (state.mode === "intro") {
      startSpin();
    } else if (state.mode === "body") {
      const part = picking.pick();
      if (part) selectPart(part, true);
    }
  });

  canvas.addEventListener("keydown", (event) => {
    if ((event.key === "Enter" || event.key === " ") && state.mode === "intro") {
      event.preventDefault();
      startSpin();
    }
  });
}
