import { BoxGeometry, CapsuleGeometry, Group, Mesh } from "three";
import { box, capsuleBetween, plane, sphere, torus, tube } from "./geometry.js";
import { PALETTE, basic, physical, standard } from "./materials.js";
import { badgeTexture, checkupSignTexture } from "./textures.js";

export function buildSuit(group) {
  const shell = physical(PALETTE.suit, { roughness: 0.42, clearcoat: 0.35, clearcoatRoughness: 0.4 });
  const metal = physical(PALETTE.visor, { roughness: 0.3, metalness: 0.85 });
  const dark = physical(PALETTE.dark, { roughness: 0.6 });
  const belt = physical(PALETTE.belt, { roughness: 0.4 });
  const skin = physical(PALETTE.skin, { roughness: 0.45 });
  const gold = physical(PALETTE.gold, { metalness: 1, roughness: 0.05 });
  const glow = () => physical(PALETTE.glow, {
    emissive: PALETTE.glow,
    emissiveIntensity: 1.4,
    roughness: 0.3,
  });

  group.add(
    sphere(0.44, [0, 3.52, 0], shell),
    sphere(0.385, [0, 3.52, 0.11], gold, [1, 0.95, 1]),
    torus(0.37, 0.07, [0, 3.08, 0], metal),
    box(0.1, 0.06, 0.06, [-0.24, 3.86, 0.22], glow()),
    box(0.1, 0.06, 0.06, [0.24, 3.86, 0.22], glow()),
    capsuleBetween([0.3, 3.8, -0.12], [0.34, 4.12, -0.12], 0.012, dark),
    sphere(0.43, [0, 1.78, 0], shell, [1, 0.65, 0.8]),
    torus(0.44, 0.05, [0, 1.98, 0], belt),
    box(0.78, 1.05, 0.4, [0, 2.55, -0.5], shell),
    capsuleBetween([-0.3, 2.1, -0.78], [-0.3, 2.9, -0.78], 0.09, metal),
    capsuleBetween([0.3, 2.1, -0.78], [0.3, 2.9, -0.78], 0.09, metal),
    tube([[0.2, 2.9, -0.5], [0.45, 2.95, -0.1], [0.3, 2.75, 0.3]], 0.03, dark, 24),
    tube([[-0.2, 2.9, -0.5], [-0.45, 2.95, -0.1], [-0.3, 2.75, 0.3]], 0.03, skin, 24),
    box(0.5, 0.32, 0.1, [0, 2.7, 0.34], metal),
    box(0.34, 0.13, 0.02, [0, 2.75, 0.4], glow()),
    box(0.07, 0.07, 0.05, [-0.14, 2.62, 0.4], skin),
    box(0.07, 0.07, 0.05, [0, 2.62, 0.4], physical(PALETTE.done, {
      emissive: PALETTE.done,
      emissiveIntensity: 0.8,
      roughness: 0.3,
    })),
    box(0.07, 0.07, 0.05, [0.14, 2.62, 0.4], belt),
  );

  for (let rib = 0; rib < 4; rib += 1) {
    group.add(box(0.6, 0.03, 0.02, [0, 2.2 + rib * 0.12, -0.71], dark));
  }

  const badge = plane(0.22, 0.22, basic({ map: badgeTexture(), transparent: true }));
  badge.position.set(0.3, 2.52, 0.3);
  badge.rotation.y = 0.55;
  group.add(badge);

  const waist = new Mesh(new CapsuleGeometry(0.46, 0.5, 12, 32), shell);
  waist.position.set(0, 2.4, 0);
  waist.scale.set(1, 1, 0.72);
  group.add(waist);

  [-1, 1].forEach((side) => {
    group.add(
      sphere(0.24, [side * 0.62, 2.92, 0], shell),
      torus(0.2, 0.045, [side * 0.62, 2.8, 0], metal),
      capsuleBetween([side * 0.62, 2.9, 0], [side * 0.82, 2.28, 0.22], 0.17, shell),
      sphere(0.165, [side * 0.82, 2.28, 0.22], metal, [0.9, 0.9, 0.9]),
      capsuleBetween([side * 0.82, 2.28, 0.22], [side * 0.74, 2.33, 0.8], 0.14, shell),
      torus(0.14, 0.05, [side * 0.76, 2.32, 0.66], metal, false),
      sphere(0.13, [side * 0.74, 2.33, 0.8], shell),
      capsuleBetween([side * 0.24, 1.75, 0], [side * 0.26, 0.95, 0.05], 0.22, shell),
      torus(0.21, 0.05, [side * 0.26, 0.95, 0.05], metal),
      capsuleBetween([side * 0.26, 0.95, 0.05], [side * 0.26, 0.25, 0], 0.19, shell),
      torus(0.2, 0.05, [side * 0.26, 0.3, 0], skin),
      box(0.38, 0.18, 0.62, [side * 0.26, 0.11, 0.14], metal),
      sphere(0.19, [side * 0.26, 0.1, 0.42], metal, [1, 0.55, 0.8]),
      box(0.42, 0.05, 0.72, [side * 0.26, 0.025, 0.15], dark),
    );
    for (let finger = 0; finger < 4; finger += 1) {
      group.add(capsuleBetween(
        [side * 0.74, 2.44 - finger * 0.065, 0.84],
        [side * 0.62, 2.44 - finger * 0.065, 0.86],
        0.026,
        shell,
      ));
    }
  });

  const screen = new Group();
  screen.position.set(0, 2.33, 0.8);
  screen.rotation.x = -0.1;
  const face = basic({ map: checkupSignTexture() });
  screen.add(new Mesh(
    new BoxGeometry(1.5, 0.88, 0.05),
    [metal, metal, metal, metal, face, standard(0xffffff)],
  ));
  group.add(screen);

  return { screen };
}
