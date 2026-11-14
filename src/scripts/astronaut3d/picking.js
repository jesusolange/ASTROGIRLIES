import { Raycaster, Vector2 } from "three";

export function createPicking(canvas, camera, getTargets, isAllowed) {
  const raycaster = new Raycaster();
  const pointer = new Vector2();

  function aim(event) {
    const bounds = canvas.getBoundingClientRect();
    pointer.set(
      ((event.clientX - bounds.left) / bounds.width) * 2 - 1,
      -((event.clientY - bounds.top) / bounds.height) * 2 + 1,
    );
    raycaster.setFromCamera(pointer, camera);
  }

  function pick() {
    const hits = raycaster
      .intersectObjects(getTargets(), false)
      .filter((hit) => hit.object.visible !== false)
      .filter((hit) => isAllowed(hit.object.userData.part));
    return hits.length ? hits[0].object.userData.part : null;
  }

  return { aim, pick };
}
