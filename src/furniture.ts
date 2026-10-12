import * as THREE from 'three'
import { box, cyl, mkMesh, woodMat, darkWoodMat, metalMat, fabricMat, colorMat, whiteMat, glassMat } from './utils'

// ---- Sofa ----
export function createSofa(w = 2.4): THREE.Group {
  const g = new THREE.Group()
  const fab = fabricMat(0xd4cfc8)
  const dark = fabricMat(0xb8b0a8)
  // seat
  g.add(mkMesh(box(w, 0.3, 0.9), fab, 0, 0.15, 0))
  // back
  g.add(mkMesh(box(w, 0.6, 0.15), dark, 0, 0.45, -0.37))
  // arms
  g.add(mkMesh(box(0.15, 0.45, 0.9), fab, w / 2 - 0.07, 0.22, 0))
  g.add(mkMesh(box(0.15, 0.45, 0.9), fab, -(w / 2 - 0.07), 0.22, 0))
  // legs
  const legM = colorMat(0x5a4535)
  ;[[-1, 1], [1, 1], [-1, -1], [1, -1]].forEach(([sx, sz]) => {
    g.add(mkMesh(box(0.07, 0.12, 0.07), legM, sx * (w / 2 - 0.12), -0.06, sz * 0.38))
  })
  return g
}

// ---- Armchair ----
export function createArmchair(): THREE.Group {
  const g = new THREE.Group()
  const fab = fabricMat(0xc8c0b8)
  g.add(mkMesh(box(0.85, 0.28, 0.8), fab, 0, 0.14, 0))
  g.add(mkMesh(box(0.85, 0.55, 0.12), fab, 0, 0.41, -0.34))
  g.add(mkMesh(box(0.12, 0.4, 0.8), fab, 0.36, 0.2, 0))
  g.add(mkMesh(box(0.12, 0.4, 0.8), fab, -0.36, 0.2, 0))
  return g
}

// ---- Coffee table ----
export function createCoffeeTable(w = 1.1, d = 0.55): THREE.Group {
  const g = new THREE.Group()
  g.add(mkMesh(box(w, 0.04, d), woodMat(), 0, 0.38, 0))
  ;[[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(([sx, sz]) => {
    g.add(mkMesh(box(0.05, 0.36, 0.05), darkWoodMat(), sx * (w / 2 - 0.07), 0.18, sz * (d / 2 - 0.07)))
  })
  return g
}

// ---- TV unit + screen ----
export function createTVUnit(): THREE.Group {
  const g = new THREE.Group()
  // cabinet
  g.add(mkMesh(box(1.8, 0.4, 0.45), darkWoodMat(), 0, 0.2, 0))
  // screen
  const screenMat = new THREE.MeshStandardMaterial({ color: 0x111318, roughness: 0.1, metalness: 0.4 })
  g.add(mkMesh(box(1.5, 0.85, 0.05), screenMat, 0, 0.82, 0.2))
  // bezel
  const bezel = new THREE.MeshStandardMaterial({ color: 0x222226, roughness: 0.3, metalness: 0.5 })
  g.add(mkMesh(box(1.55, 0.9, 0.04), bezel, 0, 0.82, 0.22))
  return g
}

// ---- Dining table ----
export function createDiningTable(w = 1.8, d = 0.9): THREE.Group {
  const g = new THREE.Group()
  g.add(mkMesh(box(w, 0.05, d), woodMat(), 0, 0.74, 0))
  ;[[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(([sx, sz]) => {
    g.add(mkMesh(box(0.06, 0.7, 0.06), darkWoodMat(), sx * (w / 2 - 0.1), 0.35, sz * (d / 2 - 0.1)))
  })
  return g
}

// ---- Dining chair ----
export function createDiningChair(): THREE.Group {
  const g = new THREE.Group()
  const w = colorMat(0xd8d0c4)
  g.add(mkMesh(box(0.45, 0.04, 0.42), woodMat(), 0, 0.46, 0))
  g.add(mkMesh(box(0.45, 0.5, 0.04), w, 0, 0.71, -0.19))
  ;[[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(([sx, sz]) => {
    g.add(mkMesh(box(0.04, 0.44, 0.04), darkWoodMat(), sx * 0.19, 0.22, sz * 0.18))
  })
  return g
}

// ---- Bed (double) ----
export function createBed(w = 1.8): THREE.Group {
  const g = new THREE.Group()
  // frame
  g.add(mkMesh(box(w, 0.18, 2.1), woodMat(), 0, 0.09, 0))
  // mattress
  g.add(mkMesh(box(w - 0.06, 0.2, 1.95), fabricMat(0xf0ece4), 0, 0.28, 0.03))
  // headboard
  g.add(mkMesh(box(w, 0.65, 0.1), darkWoodMat(), 0, 0.4, -1.0))
  // pillows
  const pilMat = fabricMat(0xfaf6f0)
  g.add(mkMesh(box(0.55, 0.12, 0.38), pilMat, -0.45, 0.44, -0.72))
  g.add(mkMesh(box(0.55, 0.12, 0.38), pilMat,  0.45, 0.44, -0.72))
  // duvet
  g.add(mkMesh(box(w - 0.08, 0.08, 1.3), fabricMat(0xe8e0d8), 0, 0.42, 0.35))
  return g
}

// ---- Bedside table ----
export function createBedsideTable(): THREE.Group {
  const g = new THREE.Group()
  g.add(mkMesh(box(0.45, 0.5, 0.4), woodMat(), 0, 0.25, 0))
  g.add(mkMesh(box(0.45, 0.02, 0.4), woodMat(), 0, 0.51, 0))
  return g
}

// ---- Wardrobe ----
export function createWardrobe(w = 1.8): THREE.Group {
  const g = new THREE.Group()
  g.add(mkMesh(box(w, 2.2, 0.6), colorMat(0xe8e4de), 0, 1.1, 0))
  // door seam
  g.add(mkMesh(box(0.02, 2.15, 0.02), colorMat(0xc8c4be), 0, 1.07, 0.31))
  // handles
  const hm = metalMat()
  g.add(mkMesh(box(0.04, 0.15, 0.03), hm, -0.1, 1.1, 0.32))
  g.add(mkMesh(box(0.04, 0.15, 0.03), hm,  0.1, 1.1, 0.32))
  return g
}

// ---- Desk ----
export function createDesk(w = 1.4): THREE.Group {
  const g = new THREE.Group()
  g.add(mkMesh(box(w, 0.04, 0.65), woodMat(), 0, 0.74, 0))
  ;[[-1, 1], [1, 1], [-1, -1], [1, -1]].forEach(([sx, sz]) => {
    g.add(mkMesh(box(0.05, 0.72, 0.05), darkWoodMat(), sx * (w / 2 - 0.06), 0.36, sz * 0.28))
  })
  // monitor
  const scm = new THREE.MeshStandardMaterial({ color: 0x1a1c22, roughness: 0.2, metalness: 0.5 })
  g.add(mkMesh(box(0.6, 0.38, 0.04), scm, 0, 1.07, -0.28))
  g.add(mkMesh(cyl(0.03, 0.03, 0.25, 8), metalMat(), 0, 0.89, -0.26))
  // keyboard
  g.add(mkMesh(box(0.38, 0.02, 0.14), colorMat(0xd0ccc8), 0, 0.77, 0.06))
  return g
}

// ---- Office chair ----
export function createOfficeChair(): THREE.Group {
  const g = new THREE.Group()
  g.add(mkMesh(box(0.5, 0.08, 0.48), fabricMat(0x888080), 0, 0.48, 0))
  g.add(mkMesh(box(0.5, 0.55, 0.06), fabricMat(0x888080), 0, 0.74, -0.21))
  g.add(mkMesh(cyl(0.03, 0.03, 0.44, 8), metalMat(), 0, 0.22, 0))
  // caster base
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2
    g.add(mkMesh(box(0.24, 0.03, 0.04), metalMat(), Math.sin(a) * 0.19, 0.015, Math.cos(a) * 0.19, '', a))
  }
  return g
}

// ---- Kitchen island / counter ----
export function createKitchenCounter(w = 1.8, d = 0.65): THREE.Group {
  const g = new THREE.Group()
  const body = colorMat(0xe0ddd8)
  const top = colorMat(0xd8d4ce, 0.4)
  g.add(mkMesh(box(w, 0.88, d), body, 0, 0.44, 0))
  g.add(mkMesh(box(w + 0.04, 0.04, d + 0.04), top, 0, 0.9, 0))
  // sink cutout approximation — just a dark inset box on top
  const sinkMat = new THREE.MeshStandardMaterial({ color: 0x888c90, roughness: 0.3, metalness: 0.6 })
  g.add(mkMesh(box(0.45, 0.06, 0.35), sinkMat, w / 2 - 0.3, 0.93, 0))
  // faucet
  g.add(mkMesh(cyl(0.015, 0.015, 0.28, 8), metalMat(), w / 2 - 0.3, 1.05, -0.06))
  return g
}

// ---- Fridge ----
export function createFridge(): THREE.Group {
  const g = new THREE.Group()
  const body = colorMat(0xe4e2de)
  g.add(mkMesh(box(0.7, 1.75, 0.68), body, 0, 0.875, 0))
  // door seam
  g.add(mkMesh(box(0.02, 1.7, 0.02), colorMat(0xcccccc), 0, 0.87, 0.35))
  // handles
  g.add(mkMesh(box(0.04, 0.3, 0.04), metalMat(), 0.32, 1.3, 0.36))
  g.add(mkMesh(box(0.04, 0.2, 0.04), metalMat(), 0.32, 0.45, 0.36))
  return g
}

// ---- Stove / hob ----
export function createStove(): THREE.Group {
  const g = new THREE.Group()
  const body = colorMat(0xdddbd8)
  g.add(mkMesh(box(0.75, 0.88, 0.65), body, 0, 0.44, 0))
  g.add(mkMesh(box(0.75, 0.02, 0.65), colorMat(0x222226), 0, 0.89, 0))
  // burners
  const bm = new THREE.MeshStandardMaterial({ color: 0x3a3a3a, roughness: 0.6, metalness: 0.3 })
  ;[[-0.18, -0.15], [0.18, -0.15], [-0.18, 0.15], [0.18, 0.15]].forEach(([bx, bz]) => {
    g.add(mkMesh(cyl(0.09, 0.09, 0.015, 16), bm, bx, 0.905, bz))
  })
  return g
}

// ---- Bookshelf ----
export function createBookshelf(w = 0.9, h = 2.0): THREE.Group {
  const g = new THREE.Group()
  g.add(mkMesh(box(w, h, 0.28), colorMat(0xe0dbd4), 0, h / 2, 0))
  // shelves
  const shelfH = h / 4
  for (let i = 1; i <= 3; i++) {
    g.add(mkMesh(box(w - 0.04, 0.03, 0.26), woodMat(), 0, shelfH * i, 0))
  }
  // book spines (colorful blocks)
  const bookColors = [0xc17a50, 0x607090, 0x6a9060, 0xb06060, 0x8060a0]
  for (let shelf = 1; shelf <= 3; shelf++) {
    let bx = -(w / 2 - 0.08)
    for (let b = 0; b < 5; b++) {
      const bw = 0.05 + Math.random() * 0.06
      g.add(mkMesh(box(bw, 0.22 + Math.random() * 0.08, 0.22),
        colorMat(bookColors[b % bookColors.length]), bx + bw / 2, shelfH * shelf + 0.13, 0))
      bx += bw + 0.01
    }
  }
  return g
}

// ---- Bathtub ----
export function createBathtub(): THREE.Group {
  const g = new THREE.Group()
  const mat = whiteMat(0.4)
  // outer shell
  g.add(mkMesh(box(1.6, 0.55, 0.75), mat, 0, 0.275, 0))
  // inner (darker)
  const inner = new THREE.MeshStandardMaterial({ color: 0xe8e6e4, roughness: 0.3 })
  g.add(mkMesh(box(1.44, 0.32, 0.6), inner, 0, 0.42, 0))
  // faucet
  g.add(mkMesh(cyl(0.02, 0.02, 0.2, 8), metalMat(), 0.65, 0.58, 0))
  return g
}

// ---- Toilet ----
export function createToilet(): THREE.Group {
  const g = new THREE.Group()
  const m = whiteMat(0.5)
  // bowl
  g.add(mkMesh(box(0.4, 0.38, 0.52), m, 0, 0.19, 0))
  // tank
  g.add(mkMesh(box(0.36, 0.34, 0.18), m, 0, 0.55, -0.17))
  return g
}

// ---- Wash basin / vanity ----
export function createVanity(): THREE.Group {
  const g = new THREE.Group()
  g.add(mkMesh(box(0.65, 0.82, 0.48), colorMat(0xe8e4e0), 0, 0.41, 0))
  g.add(mkMesh(box(0.65, 0.02, 0.48), whiteMat(0.35), 0, 0.83, 0))
  // basin
  const bm = new THREE.MeshStandardMaterial({ color: 0xdedcda, roughness: 0.25 })
  g.add(mkMesh(box(0.4, 0.06, 0.32), bm, 0, 0.86, 0))
  // mirror above
  const mirrorM = new THREE.MeshStandardMaterial({ color: 0xaac8d8, roughness: 0.05, metalness: 0.2 })
  g.add(mkMesh(box(0.6, 0.8, 0.02), mirrorM, 0, 1.32, -0.23))
  // faucet
  g.add(mkMesh(cyl(0.015, 0.015, 0.12, 8), metalMat(), 0, 0.95, -0.05))
  return g
}

// ---- Rug ----
export function createRug(w: number, d: number, color = 0xc8b8a0): THREE.Group {
  const g = new THREE.Group()
  g.add(mkMesh(box(w, 0.015, d), colorMat(color, 0.95), 0, 0.007, 0))
  return g
}

// ---- Floor lamp ----
export function createFloorLamp(): THREE.Group {
  const g = new THREE.Group()
  g.add(mkMesh(cyl(0.01, 0.01, 1.5, 8), metalMat(), 0, 0.75, 0))
  g.add(mkMesh(cyl(0.18, 0.12, 0.28, 16), colorMat(0xf0e8d0, 0.85), 0, 1.54, 0))
  g.add(mkMesh(cyl(0.12, 0.12, 0.02, 16), metalMat(), 0, 1.52, 0))
  return g
}

// ---- Wall clock (disc) ----
export function createWallClock(): THREE.Group {
  const g = new THREE.Group()
  g.add(mkMesh(cyl(0.18, 0.18, 0.04, 32), colorMat(0xf4f0e8), 0, 0, 0))
  g.add(mkMesh(cyl(0.19, 0.19, 0.01, 32), colorMat(0x888480), 0, 0.025, 0))
  return g
}

// ---- Plant pot ----
export function createPlant(): THREE.Group {
  const g = new THREE.Group()
  // pot
  g.add(mkMesh(cyl(0.15, 0.12, 0.3, 16), colorMat(0x8a7060), 0, 0.15, 0))
  // soil
  g.add(mkMesh(cyl(0.14, 0.14, 0.02, 16), colorMat(0x3a2e28), 0, 0.31, 0))
  // leaves (abstract spheroid blobs)
  const leafM = colorMat(0x3a6e3a)
  g.add(mkMesh(new THREE.SphereGeometry(0.22, 10, 8), leafM, 0, 0.58, 0))
  g.add(mkMesh(new THREE.SphereGeometry(0.15, 8, 6), leafM, 0.18, 0.65, 0.08))
  g.add(mkMesh(new THREE.SphereGeometry(0.13, 8, 6), leafM, -0.16, 0.62, 0.05))
  return g
}

// ---- Overhead light (ceiling disc) ----
export function createCeilingLight(r = 0.25): THREE.Group {
  const g = new THREE.Group()
  const m = new THREE.MeshStandardMaterial({ color: 0xfff8e8, emissive: 0xffe8a0, emissiveIntensity: 0.4, roughness: 0.9 })
  g.add(mkMesh(cyl(r, r, 0.06, 24), m, 0, 0, 0))
  return g
}

// ---- Room interior wall / floor tile (divider wall strip) ----
export function createWallStrip(w: number, h: number): THREE.Group {
  const g = new THREE.Group()
  const m = colorMat(0xede9e4, 0.88)
  g.add(mkMesh(box(w, h, 0.14), m, 0, h / 2, 0))
  return g
}

// ---- Placeholderrug below items ----
export function addRug(parent: THREE.Group, w: number, d: number, cx: number, cz: number, color = 0xc4b8a8) {
  const rug = createRug(w, d, color)
  rug.position.set(cx, 0, cz)
  parent.add(rug)
}

// re-export glassMat for building use
export { glassMat }
