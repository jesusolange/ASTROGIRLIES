import {
  BoxGeometry,
  CapsuleGeometry,
  CatmullRomCurve3,
  CylinderGeometry,
  LatheGeometry,
  Mesh,
  PlaneGeometry,
  RingGeometry,
  SphereGeometry,
  TorusGeometry,
  TubeGeometry,
  Vector2,
  Vector3,
} from "three";

const UP = new Vector3(0, 1, 0);

export const vec = (point) => new Vector3(point[0], point[1], point[2]);

export function sphere(radius, at, material, scale = [1, 1, 1]) {
  const node = new Mesh(new SphereGeometry(radius, 32, 24), material);
  node.position.set(at[0], at[1], at[2]);
  node.scale.set(scale[0], scale[1], scale[2]);
  return node;
}

export function torus(radius, tube, at, material, rotateX = true) {
  const geometry = new TorusGeometry(radius, tube, 12, 40);
  if (rotateX) geometry.rotateX(Math.PI / 2);
  const node = new Mesh(geometry, material);
  node.position.set(at[0], at[1], at[2]);
  return node;
}

export function box(width, height, depth, at, material) {
  const node = new Mesh(new BoxGeometry(width, height, depth), material);
  node.position.set(at[0], at[1], at[2]);
  return node;
}

export function plane(width, height, material) {
  return new Mesh(new PlaneGeometry(width, height), material);
}

export function ring(inner, outer, segments, material) {
  return new Mesh(new RingGeometry(inner, outer, segments), material);
}

export function cylinder(radiusTop, radiusBottom, height, segments, material) {
  return new Mesh(new CylinderGeometry(radiusTop, radiusBottom, height, segments), material);
}

export function capsuleBetween(from, to, radius, material) {
  const start = vec(from);
  const end = vec(to);
  const direction = end.clone().sub(start);
  const length = direction.length();
  const node = new Mesh(
    new CapsuleGeometry(radius, Math.max(length - 2 * radius, 0.001), 8, 16),
    material,
  );
  node.position.copy(start).add(end).multiplyScalar(0.5);
  node.quaternion.setFromUnitVectors(UP, direction.normalize());
  return node;
}

export function tube(points, radius, material, segments = 32) {
  const curve = new CatmullRomCurve3(points.map(vec));
  const node = new Mesh(new TubeGeometry(curve, segments, radius, 8, false), material);
  node.userData.curve = curve;
  return node;
}

export function latheStrand(from, to, radius, material) {
  const start = vec(from);
  const end = vec(to);
  const direction = end.clone().sub(start);
  const length = direction.length();
  const points = [];
  for (let step = 0; step <= 12; step += 1) {
    const t = step / 12;
    const thickness = radius * (0.3 + 0.7 * Math.pow(Math.sin(Math.PI * t), 0.7));
    points.push(new Vector2(thickness, (t - 0.5) * length));
  }
  const node = new Mesh(new LatheGeometry(points, 28), material);
  node.position.copy(start).add(end).multiplyScalar(0.5);
  node.quaternion.setFromUnitVectors(UP, direction.normalize());
  return node;
}
