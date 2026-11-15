import { Raycaster, Vector2 } from "three";

export function createPicking(canvas, camera, getTargets) {
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

  function partOf(object) {
    let node = object;
    while (node && !node.userData.part) node = node.parent;
    return node ? node.userData.part : null;
  }

  function visible(object) {
    let node = object;
    while (node) {
      if (!node.visible) return false;
      node = node.parent;
    }
    return true;
  }

  // The see-through skeleton surrounds the organs, so an organ behind it wins over the bones.
  function pick() {
    const parts = raycaster
      .intersectObjects(getTargets(), true)
      .filter((item) => visible(item.object))
      .map((item) => partOf(item.object))
      .filter(Boolean);
    return parts.find((part) => part !== "bones") || parts[0] || null;
  }

  return { aim, pick };
}
