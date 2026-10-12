import * as THREE from 'three'
import {
  box,
  woodMat, wallMat, floorTileMat,
} from './utils'
import {
  createSofa, createArmchair, createCoffeeTable, createTVUnit,
  createDiningTable, createDiningChair,
  createBed, createBedsideTable, createWardrobe,
  createDesk, createOfficeChair,
  createKitchenCounter, createFridge, createStove,
  createBookshelf,
  createBathtub, createToilet, createVanity,
  createFloorLamp, createPlant, createCeilingLight,
  createRug,
} from './furniture'

// ---- constants (must match building.ts) ----
export const FLOOR_H = 3.2
export const SLAB_H  = 0.3
export const BASE_H  = 0.4
const WALL_T = 0.14
const CEIL_H = FLOOR_H // rooms are full height; ceiling = top of floor

// ---- helper: add a ceiling light at position ----
function ceilingLight(parent: THREE.Group, x: number, z: number) {
  const l = createCeilingLight(0.22)
  l.position.set(x, CEIL_H - 0.03, z)
  parent.add(l)
}

// ---- helper: thin partition wall ----
function wall(parent: THREE.Group, x: number, y: number, z: number, w: number, h: number, ry = 0) {
  const m = new THREE.Mesh(box(w, h, WALL_T), wallMat())
  m.position.set(x, y, z)
  m.rotation.y = ry
  m.castShadow = true
  m.receiveShadow = true
  parent.add(m)
}

// ---- floor tile slab ----
function floor(parent: THREE.Group, x: number, z: number, w: number, d: number, mat: THREE.Material) {
  const m = new THREE.Mesh(box(w, 0.04, d), mat)
  m.position.set(x, 0.02, z)
  m.receiveShadow = true
  parent.add(m)
}

// ---- place furniture helper ----
function place(parent: THREE.Group, item: THREE.Group, x: number, z: number, ry = 0, yOff = 0) {
  item.position.set(x, yOff, z)
  item.rotation.y = ry
  parent.add(item)
}

// ============================================================
// FLOOR 1  (Y offset = 0 inside floor1Group)
//   Main block: X ∈ [-4.5, 4.5], Z ∈ [-5, 5]
//   Wing:       X ∈ [4.5, 9.5],  Z ∈ [-5, -0.5]
//
//   Room layout:
//     Living room  : X[-4.5,-0.0], Z[-3, 5]   (front-left)
//     Dining       : X[ 0.0, 4.5], Z[ 0.5, 5] (front-right)
//     Kitchen      : wing block
//     Entry/Foyer  : X[-1.5, 1.5], Z[3.5, 5]  (front-centre)
//     Storage      : X[-4.5,-2.5], Z[-5,-2]   (back-left)
// ============================================================

export function buildFloor1Interior(): THREE.Group {
  const g = new THREE.Group()
  g.name = 'floor1_interior'

  // ---- floors ----
  // Main block: X ∈ [-4.5, 4.5], Z ∈ [-5, 5]
  const tileM  = floorTileMat()
  const woodFM = new THREE.MeshStandardMaterial({ color: 0xc8a870, roughness: 0.75 })
  floor(g,  0.0,  0.0,  9.0, 10.0, woodFM)   // main block wood floor (full footprint)
  floor(g,  7.0, -2.75, 5.0,  4.5, tileM)    // wing kitchen tile
  floor(g,  0.5,  4.2,  3.0,  1.2, tileM)    // entry tile overlay

  // ---- partition walls (interior dividers) ----
  // living / dining divider (N-S wall at X=0)
  wall(g,  0.0,  FLOOR_H / 2,  0.0,  WALL_T, FLOOR_H)
  // kitchen / dining divider at X=4.5 (boundary of main and wing)
  wall(g,  4.5,  FLOOR_H / 2, -2.75, 4.5, FLOOR_H, Math.PI / 2)
  // entry divider — frames door opening, stays within X[-4.5, 4.5]
  wall(g, -1.5,  FLOOR_H / 2,  3.5,  3.0, FLOOR_H)
  wall(g,  1.5,  FLOOR_H / 2,  3.5,  1.5, FLOOR_H)

  // ---- LIVING ROOM (left half of main: X[-4.5, 0], Z[-5, 5]) ----
  // sofa facing east wall (TV)
  const sofa = createSofa(2.4)
  place(g, sofa, -2.2, 1.2, 0)
  const chair1 = createArmchair()
  place(g, chair1, -3.8, 2.5, Math.PI / 5)
  const ct = createCoffeeTable(1.1, 0.55)
  place(g, ct, -2.2, 2.2)
  // TV unit on south wall of living room (Z=-4.6 is near back wall)
  const tv = createTVUnit()
  place(g, tv, -2.2, -4.2, Math.PI)
  const rug1 = createRug(3.0, 2.0, 0xb8a890)
  place(g, rug1, -2.2, 1.2)
  const lamp1 = createFloorLamp()
  place(g, lamp1, -4.0, -0.5)
  const plant1 = createPlant()
  place(g, plant1, -4.0, 4.0)
  ceilingLight(g, -2.2, 0.5)

  // ---- DINING ROOM (right half main: X[0, 4.5], Z[0, 5]) ----
  const dtable = createDiningTable(1.8, 0.9)
  place(g, dtable, 2.2, 2.8)
  const dchairPoses: Array<[number, number, number]> = [
    [2.2, 1.5,  0],
    [2.2, 4.1,  Math.PI],
    [1.0, 2.8,  Math.PI / 2],
    [3.4, 2.8, -Math.PI / 2],
  ]
  dchairPoses.forEach(([x, z, ry]) => {
    place(g, createDiningChair(), x, z, ry)
  })
  ceilingLight(g, 2.2, 2.8)

  // ---- KITCHEN (wing: X[4.5,9.5], Z[-5,-0.5]) ----
  // counters fit inside wing; WING_CX=7, WING_CZ=-2.75
  const kCounterL = createKitchenCounter(2.0, 0.65)
  place(g, kCounterL, 6.5, -4.4, 0)
  const kCounterR = createKitchenCounter(1.5, 0.65)
  place(g, kCounterR, 5.1, -2.75, Math.PI / 2)
  const fridge = createFridge()
  place(g, fridge, 8.8, -4.2, Math.PI)
  const stove = createStove()
  place(g, stove, 7.6, -4.2, Math.PI)
  ceilingLight(g, 7.0, -2.75)

  // ---- ENTRY / FOYER (X[-1.5, 1.5], Z[3.5, 5]) ----
  const entryRug = createRug(2.2, 1.2, 0x8a7860)
  place(g, entryRug, 0.0, 4.2)
  const consoleMat = new THREE.MeshStandardMaterial({ color: 0xd4c8b4, roughness: 0.7 })
  const console1 = new THREE.Mesh(box(1.0, 0.82, 0.36), consoleMat)
  console1.position.set(0.0, 0.41, 4.6)
  g.add(console1)
  ceilingLight(g, 0.0, 4.0)

  // ---- STORAGE (back left: X[-4.5,-2.5], Z[-5,-2]) ----
  const shelfS = createBookshelf(1.6, 1.8)
  place(g, shelfS, -3.5, -4.0, 0)

  return g
}

// ============================================================
// FLOOR 2
//   Main block: same X/Z footprint
//   Wing:       same as floor 1
//
//   Room layout:
//     Master bedroom : X[-4.5, 0.5], Z[-5, 2]   (left)
//     Bedroom A      : X[ 0.5, 4.5], Z[-5, 1]   (right-back)
//     Bedroom B      : wing block
//     Study          : X[-4.5,-2.5], Z[ 2, 5]   (front-left)
//     Bathroom       : X[-0.5, 2.5], Z[ 2.5, 5] (front-right)
// ============================================================

export function buildFloor2Interior(): THREE.Group {
  const g = new THREE.Group()
  g.name = 'floor2_interior'

  // ---- floors ----
  // Main block: X ∈ [-4.5, 4.5], Z ∈ [-5, 5]
  const tileM2  = floorTileMat()
  const woodFM2 = new THREE.MeshStandardMaterial({ color: 0xc4a878, roughness: 0.78 })

  floor(g,  0.0,  0.0,  9.0, 10.0, woodFM2)  // main block full footprint
  floor(g,  7.0, -2.75, 5.0,  4.5, woodFM2)  // bedroom B wing
  floor(g, -3.5,  3.2,  2.0,  3.5, woodFM2)  // study
  floor(g,  1.0,  3.5,  3.0,  2.5, tileM2)   // bathroom tile

  // ---- partition walls ----
  // master / bedroom A divider (X=0.5, full height)
  wall(g,  0.5, FLOOR_H / 2,  0.0, WALL_T, FLOOR_H)
  // bedroom A / upper hallway (east-west wall at Z=1.5)
  wall(g,  2.5, FLOOR_H / 2,  1.5, 4.0, FLOOR_H, Math.PI / 2)
  // study / hallway (X=-2.5 vertical wall)
  wall(g, -2.5, FLOOR_H / 2,  3.0, WALL_T, FLOOR_H)
  // bathroom divider (Z=2.8 horizontal wall)
  wall(g,  1.0, FLOOR_H / 2,  2.8, 3.0, FLOOR_H, Math.PI / 2)

  // ---- MASTER BEDROOM (X[-4.5, 0.5], Z[-5, 0]) ----
  const masterBed = createBed(1.8)
  place(g, masterBed, -2.0, -3.5, Math.PI / 2)
  place(g, createBedsideTable(), -0.8, -3.5)
  place(g, createBedsideTable(), -3.2, -3.5)
  const ward1 = createWardrobe(2.0)
  place(g, ward1, -3.5, -0.5, 0)
  const dresser = new THREE.Mesh(box(1.2, 0.8, 0.5), woodMat())
  dresser.position.set(-3.5, 0.4, 1.2)
  g.add(dresser)
  place(g, createRug(3.0, 2.0, 0xc0a888), -2.0, -3.5)
  place(g, createFloorLamp(), -0.5, -0.5)
  ceilingLight(g, -2.0, -2.0)

  // ---- BEDROOM A (X[0.5, 4.5], Z[-5, 1.5]) ----
  const bed2 = createBed(1.6)
  place(g, bed2, 2.5, -3.5, Math.PI / 2)
  place(g, createBedsideTable(), 1.4, -3.5)
  const ward2 = createWardrobe(1.6)
  place(g, ward2, 3.8, 0.5, 0)
  place(g, createBookshelf(0.9, 1.9), 1.2, -0.2, 0)
  place(g, createRug(2.4, 1.8, 0xb8a880), 2.5, -3.5)
  ceilingLight(g, 2.5, -2.0)

  // ---- BEDROOM B (wing: X[4.5,9.5], Z[-5,-0.5]) ----
  const bed3 = createBed(1.6)
  place(g, bed3, 7.0, -3.5, Math.PI / 2)
  place(g, createBedsideTable(), 5.9, -3.5)
  const ward3 = createWardrobe(1.6)
  place(g, ward3, 8.8, -1.5, 0)
  place(g, createRug(2.2, 1.8, 0xbcaa88), 7.0, -3.5)
  ceilingLight(g, 7.0, -2.5)

  // ---- STUDY (X[-4.5,-2.5], Z[2, 5]) ----
  const desk1 = createDesk(1.4)
  place(g, desk1, -3.5, 4.2, Math.PI)
  place(g, createOfficeChair(), -3.5, 3.4)
  place(g, createBookshelf(0.9, 1.8), -4.1, 3.0, 0)
  ceilingLight(g, -3.5, 3.8)

  // ---- BATHROOM (X[-0.5,2.5], Z[2.8, 5]) ----
  const tub = createBathtub()
  place(g, tub, 1.6, 4.5, 0)
  const wc = createToilet()
  place(g, wc, -0.1, 4.2, 0)
  const van = createVanity()
  place(g, van, 2.2, 3.2, Math.PI)
  ceilingLight(g, 1.0, 3.8)

  return g
}
