import * as THREE from 'three'
import { ROOMS, type RoomInfo } from './rooms'
import { buildFloor1Interior, buildFloor2Interior } from './interiors'

// ---- material factories ----

function whiteMat(roughness = 0.85): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({ color: 0xf4f2ee, roughness, metalness: 0.0 })
}

function glassMat(): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color: 0x90c0d8,
    roughness: 0.05,
    metalness: 0.1,
    transparent: true,
    opacity: 0.3,
  })
}

function texturedRoofMat(): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({ color: 0xb8b0a0, roughness: 0.9, metalness: 0.0 })
}

function zoneMat(color: number): THREE.MeshStandardMaterial {
  // Transparent click zone - visible for raycasting, invisible visually
  return new THREE.MeshStandardMaterial({
    color,
    transparent: true,
    opacity: 0.0,
    depthWrite: false,
  })
}

// ---- geometry helper ----
function box(w: number, h: number, d: number): THREE.BoxGeometry {
  return new THREE.BoxGeometry(w, h, d)
}

// ---- Building layout ----
//
// Top-down (X = right, Z = forward):
//
//   +---- 9 ----+
//   |           |
// 10|   MAIN    |
//   |           +-- 5 --+
//   +-----+     |  WING | 4.5
//         +-----+-------+
//
// MAIN center: (0, y, 0)
// WING center: (7, y, -3.5)   (right of main, front half)

const FLOOR_H = 3.2
const SLAB_H = 0.3
const BASE_H = 0.4
const BASE_PAD = 0.7

const MAIN_W = 9
const MAIN_D = 10
const WING_W = 5
const WING_D = 4.5
const WING_CX = MAIN_W / 2 + WING_W / 2   // 4.5 + 2.5 = 7
const WING_CZ = -MAIN_D / 2 + WING_D / 2  // -5 + 2.25 = -2.75

// Floor Y baselines
const Y_BASE_TOP = BASE_H
const Y_F1 = Y_BASE_TOP + SLAB_H        // 0.7
const Y_F2 = Y_F1 + FLOOR_H + SLAB_H   // 4.2

export interface BuildingPart {
  mesh: THREE.Mesh
  roomId: string | null
  label: string
  floor: number
  baseY: number
}

export interface Building {
  root: THREE.Group
  parts: BuildingPart[]
  floorGroups: THREE.Group[]
}

export function createBuilding(): Building {
  const root = new THREE.Group()
  const parts: BuildingPart[] = []

  const baseGroup  = new THREE.Group(); baseGroup.name  = 'base'
  const floor1Group = new THREE.Group(); floor1Group.name = 'floor1'
  const floor2Group = new THREE.Group(); floor2Group.name = 'floor2'
  const roofGroup  = new THREE.Group(); roofGroup.name  = 'roof'
  root.add(baseGroup, floor1Group, floor2Group, roofGroup)

  // ---------- base platform ----------
  const baseMesh = new THREE.Mesh(box(MAIN_W + BASE_PAD * 2, BASE_H, MAIN_D + BASE_PAD * 2), whiteMat(0.9))
  baseMesh.name = 'base_main'
  baseMesh.position.set(0, BASE_H / 2, 0)
  baseMesh.receiveShadow = true
  baseGroup.add(baseMesh)

  const baseWing = new THREE.Mesh(box(WING_W + BASE_PAD, BASE_H, WING_D + BASE_PAD), whiteMat(0.9))
  baseWing.name = 'base_wing'
  baseWing.position.set(WING_CX, BASE_H / 2, WING_CZ)
  baseWing.receiveShadow = true
  baseGroup.add(baseWing)

  // entrance steps (front centre of main block)
  const stepConfigs = [
    { w: 2.6, z: MAIN_D / 2 + 0.2,  yOff: 0 },
    { w: 2.2, z: MAIN_D / 2 + 0.55, yOff: 0.12 },
    { w: 1.8, z: MAIN_D / 2 + 0.9,  yOff: 0.24 },
  ]
  stepConfigs.forEach((s, i) => {
    const sm = new THREE.Mesh(box(s.w, 0.12, 0.34), whiteMat(0.9))
    sm.name = `step_${i}`
    sm.position.set(0.5, BASE_H + 0.06 + s.yOff, s.z)
    sm.castShadow = true
    baseGroup.add(sm)
  })

  // ---------- helper: build one floor (visual solid + click zones) ----------
  function addFloor(
    group: THREE.Group,
    floorNum: number,
    yBase: number,
    rooms: Array<{ info: RoomInfo; x: number; z: number; w: number; d: number }>,
  ) {
    // Visual geometry: two solid boxes for main + wing
    const solidMain = new THREE.Mesh(box(MAIN_W, FLOOR_H, MAIN_D), whiteMat(0.85))
    solidMain.name = `solid_main_f${floorNum}`
    solidMain.position.set(0, yBase + FLOOR_H / 2, 0)
    solidMain.castShadow = true
    solidMain.receiveShadow = true
    solidMain.userData.whiteboxMat = whiteMat(0.85)
    solidMain.userData.texturedMat = new THREE.MeshStandardMaterial({ color: 0xd6cfc4, roughness: 0.8 })
    group.add(solidMain)
    parts.push({ mesh: solidMain, roomId: null, label: `主楼 ${floorNum}F`, floor: floorNum, baseY: yBase + FLOOR_H / 2 })

    if (floorNum === 1 || floorNum === 2) {
      const solidWing = new THREE.Mesh(box(WING_W, FLOOR_H, WING_D), whiteMat(0.85))
      solidWing.name = `solid_wing_f${floorNum}`
      solidWing.position.set(WING_CX, yBase + FLOOR_H / 2, WING_CZ)
      solidWing.castShadow = true
      solidWing.receiveShadow = true
      solidWing.userData.whiteboxMat = whiteMat(0.85)
      solidWing.userData.texturedMat = new THREE.MeshStandardMaterial({ color: 0xd6cfc4, roughness: 0.8 })
      group.add(solidWing)
      parts.push({ mesh: solidWing, roomId: null, label: `翼楼 ${floorNum}F`, floor: floorNum, baseY: yBase + FLOOR_H / 2 })
    }

    // Floor slab
    const slabMain = new THREE.Mesh(box(MAIN_W, SLAB_H, MAIN_D), whiteMat(0.9))
    slabMain.name = `slab_main_f${floorNum}`
    slabMain.position.set(0, yBase - SLAB_H / 2, 0)
    slabMain.receiveShadow = true
    group.add(slabMain)

    const slabWing = new THREE.Mesh(box(WING_W, SLAB_H, WING_D), whiteMat(0.9))
    slabWing.name = `slab_wing_f${floorNum}`
    slabWing.position.set(WING_CX, yBase - SLAB_H / 2, WING_CZ)
    slabWing.receiveShadow = true
    group.add(slabWing)

    // Glass window panels (thin, on exterior faces)
    const glassM = glassMat()
    const windowSets: Array<{ x: number; z: number; ry: number; w: number; d: number; h: number }> = [
      // front face of main block
      { x: -1.5, z: MAIN_D / 2 + 0.05, ry: 0,        w: 5.5, d: 0.08, h: FLOOR_H * 0.68 },
      // right face of main block
      { x: MAIN_W / 2 + 0.05, z: 1.5,  ry: 0,        w: 0.08, d: 4, h: FLOOR_H * 0.68 },
      // front of wing
      { x: WING_CX, z: WING_CZ + WING_D / 2 + 0.05, ry: 0, w: 3.5, d: 0.08, h: FLOOR_H * 0.65 },
    ]
    windowSets.forEach((wp, i) => {
      const gm = new THREE.Mesh(box(wp.w, wp.h, wp.d), glassM)
      gm.name = `glass_f${floorNum}_${i}`
      gm.position.set(wp.x, yBase + FLOOR_H / 2, wp.z)
      group.add(gm)
    })

    // Invisible click zones for rooms
    rooms.forEach(({ info, x, z, w, d }) => {
      const zm = new THREE.Mesh(box(w, FLOOR_H * 0.9, d), zoneMat(info.color))
      zm.name = `zone_${info.id}_f${floorNum}`
      zm.position.set(x, yBase + FLOOR_H / 2, z)
      zm.userData.whiteboxMat = zoneMat(info.color)
      zm.userData.texturedMat = new THREE.MeshStandardMaterial({ color: info.color, roughness: 0.7, transparent: true, opacity: 0.7, depthWrite: false })
      group.add(zm)
      parts.push({ mesh: zm, roomId: info.id, label: info.name, floor: floorNum, baseY: yBase + FLOOR_H / 2 })
    })
  }

  // ---------- floor 1 rooms ----------
  const f1Rooms = [
    { info: ROOMS.find(r => r.id === 'living')!,   x: -2,   z: 0,     w: 4.5, d: 6   },
    { info: ROOMS.find(r => r.id === 'dining')!,   x: 2.5,  z: 1,     w: 4,   d: 4   },
    { info: ROOMS.find(r => r.id === 'kitchen')!,  x: WING_CX, z: WING_CZ, w: WING_W * 0.8, d: WING_D * 0.8 },
    { info: ROOMS.find(r => r.id === 'entry')!,    x: 0.5,  z: 4,     w: 3,   d: 2   },
    { info: ROOMS.find(r => r.id === 'storage1')!, x: -3.5, z: -3,    w: 2,   d: 3   },
  ]
  addFloor(floor1Group, 1, Y_F1, f1Rooms)

  // interior furniture for floor 1
  const int1 = buildFloor1Interior()
  int1.position.set(0, Y_F1, 0)
  floor1Group.add(int1)

  // ---------- floor 2 rooms ----------
  const f2Rooms = [
    { info: ROOMS.find(r => r.id === 'master')!,   x: -2,    z: -1,    w: 4.5, d: 7   },
    { info: ROOMS.find(r => r.id === 'bedroom2')!, x: 2.5,   z: -0.5,  w: 4,   d: 5   },
    { info: ROOMS.find(r => r.id === 'bedroom3')!, x: WING_CX, z: WING_CZ, w: WING_W * 0.8, d: WING_D * 0.8 },
    { info: ROOMS.find(r => r.id === 'study')!,    x: -3.5,  z: 3,     w: 2,   d: 3.5 },
    { info: ROOMS.find(r => r.id === 'bath2')!,    x: 0.5,   z: 3.5,   w: 3,   d: 2.5 },
  ]
  addFloor(floor2Group, 2, Y_F2, f2Rooms)

  // interior furniture for floor 2
  const int2 = buildFloor2Interior()
  int2.position.set(0, Y_F2, 0)
  floor2Group.add(int2)

  // ---------- roof ----------
  const roofY = Y_F2 + FLOOR_H + SLAB_H / 2
  const roofMain = new THREE.Mesh(box(MAIN_W + 0.3, SLAB_H, MAIN_D + 0.3), whiteMat(0.88))
  roofMain.name = 'roof_main'
  roofMain.position.set(0, roofY, 0)
  roofMain.castShadow = true
  roofMain.userData.whiteboxMat = whiteMat(0.88)
  roofMain.userData.texturedMat = texturedRoofMat()
  roofGroup.add(roofMain)
  parts.push({ mesh: roofMain, roomId: null, label: '屋顶', floor: 3, baseY: roofY })

  const roofWing = new THREE.Mesh(box(WING_W + 0.2, SLAB_H, WING_D + 0.2), whiteMat(0.88))
  roofWing.name = 'roof_wing'
  roofWing.position.set(WING_CX, roofY, WING_CZ)
  roofWing.castShadow = true
  roofWing.userData.whiteboxMat = whiteMat(0.88)
  roofWing.userData.texturedMat = texturedRoofMat()
  roofGroup.add(roofWing)
  parts.push({ mesh: roofWing, roomId: null, label: '翼楼屋顶', floor: 3, baseY: roofY })

  // ---- roof details ----
  const roofTop = roofY + SLAB_H / 2   // top surface of roof slab
  const roofMat = whiteMat(0.8)
  const metalM  = new THREE.MeshStandardMaterial({ color: 0x9a9890, roughness: 0.4, metalness: 0.7 })
  const darkM   = new THREE.MeshStandardMaterial({ color: 0x4a4844, roughness: 0.7 })
  const glassRM = new THREE.MeshStandardMaterial({ color: 0x90c8d8, roughness: 0.05, metalness: 0.15, transparent: true, opacity: 0.45 })

  // Rooftop staircase access box (replaces basic util box)
  const stairBox = new THREE.Mesh(box(2.0, 2.2, 2.0), roofMat)
  stairBox.name = 'roof_stairbox'
  stairBox.position.set(-2.8, roofTop + 1.1, -2.5)
  stairBox.castShadow = true
  roofGroup.add(stairBox)
  // stair box door
  const doorM = darkM.clone()
  const stairDoor = new THREE.Mesh(box(0.7, 1.5, 0.06), doorM)
  stairDoor.position.set(-2.8, roofTop + 0.75, -1.47)
  roofGroup.add(stairDoor)

  // Skylight window (over study below)
  const skylightFrame = new THREE.Mesh(box(1.8, 0.1, 1.2), metalM)
  skylightFrame.position.set(-3.2, roofTop + 0.05, 3.2)
  skylightFrame.castShadow = false
  roofGroup.add(skylightFrame)
  const skylightGlass = new THREE.Mesh(box(1.5, 0.04, 0.95), glassRM)
  skylightGlass.position.set(-3.2, roofTop + 0.06, 3.2)
  roofGroup.add(skylightGlass)

  // Solar panel array (south-facing lean, 3×2 grid)
  const panelMat = new THREE.MeshStandardMaterial({ color: 0x1a2a3a, roughness: 0.25, metalness: 0.5 })
  const frameMat = new THREE.MeshStandardMaterial({ color: 0xb0aca8, roughness: 0.5, metalness: 0.6 })
  for (let row = 0; row < 2; row++) {
    for (let col = 0; col < 3; col++) {
      // support riser on south edge
      const riser = new THREE.Mesh(box(0.06, 0.18 + row * 0.04, 0.06), frameMat)
      riser.position.set(0.8 + col * 1.05, roofTop + 0.09 + row * 0.04, -3.5 + row * 1.1)
      roofGroup.add(riser)
      // panel (slightly tilted)
      const panel = new THREE.Mesh(box(0.9, 0.04, 0.65), panelMat)
      panel.position.set(0.8 + col * 1.05, roofTop + 0.22 + row * 0.06, -3.5 + row * 1.1)
      panel.rotation.x = -0.22
      panel.castShadow = true
      roofGroup.add(panel)
      // panel frame
      const pf = new THREE.Mesh(box(0.92, 0.03, 0.67), frameMat)
      pf.position.copy(panel.position)
      pf.rotation.x = panel.rotation.x
      pf.position.y -= 0.01
      roofGroup.add(pf)
    }
  }

  // AC condenser units (×2)
  ;[[3.5, -1.5], [3.5, 0.5]].forEach(([px, pz]) => {
    const unit = new THREE.Mesh(box(0.9, 0.55, 0.65), new THREE.MeshStandardMaterial({ color: 0xd8d4ce, roughness: 0.6 }))
    unit.position.set(px, roofTop + 0.275, pz)
    unit.castShadow = true
    roofGroup.add(unit)
    // fan grille face
    const grille = new THREE.Mesh(box(0.88, 0.53, 0.04), darkM)
    grille.position.set(px, roofTop + 0.275, pz - 0.325)
    roofGroup.add(grille)
    // pipe connection
    const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.4, 8), metalM)
    pipe.rotation.z = Math.PI / 2
    pipe.position.set(px - 0.5, roofTop + 0.12, pz)
    roofGroup.add(pipe)
  })

  // Water tank / header tank
  const tank = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.72, 16), metalM)
  tank.position.set(-0.8, roofTop + 0.36, -1.0)
  tank.castShadow = true
  roofGroup.add(tank)
  const tankLid = new THREE.Mesh(new THREE.CylinderGeometry(0.40, 0.40, 0.06, 16), metalM)
  tankLid.position.set(-0.8, roofTop + 0.75, -1.0)
  roofGroup.add(tankLid)

  // Rooftop railing along perimeter (simplified as thin posts + top rail)
  const railMat = new THREE.MeshStandardMaterial({ color: 0xc8c4be, roughness: 0.5, metalness: 0.3 })
  function addRailing(x1: number, z1: number, x2: number, z2: number) {
    const dx = x2 - x1, dz = z2 - z1
    const len = Math.sqrt(dx * dx + dz * dz)
    const ry  = Math.atan2(dx, dz)
    const cx  = (x1 + x2) / 2, cz = (z1 + z2) / 2
    const topRail = new THREE.Mesh(box(len, 0.06, 0.06), railMat)
    topRail.position.set(cx, roofTop + 1.0, cz)
    topRail.rotation.y = ry
    roofGroup.add(topRail)
    const postCount = Math.max(2, Math.round(len / 1.2))
    for (let k = 0; k <= postCount; k++) {
      const t = k / postCount
      const post = new THREE.Mesh(box(0.05, 1.0, 0.05), railMat)
      post.position.set(x1 + dx * t, roofTop + 0.5, z1 + dz * t)
      roofGroup.add(post)
    }
  }
  // main block perimeter (inset slightly)
  const mh = MAIN_W / 2 - 0.2, md = MAIN_D / 2 - 0.2
  addRailing(-mh, -md,  mh, -md)   // back
  addRailing( mh, -md,  mh,  md)   // right
  addRailing( mh,  md, -mh,  md)   // front
  addRailing(-mh,  md, -mh, -md)   // left

  // vertical slat motif on entry facade
  const slatMat = new THREE.MeshStandardMaterial({ color: 0xdedad4, roughness: 0.75 })
  for (let i = 0; i < 5; i++) {
    const slat = new THREE.Mesh(box(0.1, FLOOR_H * 0.75, 0.1), slatMat)
    slat.name = `slat_${i}`
    slat.position.set(-0.8 + i * 0.4, Y_F1 + FLOOR_H / 2, MAIN_D / 2 + 0.08)
    floor1Group.add(slat)
    const slat2 = new THREE.Mesh(box(0.1, FLOOR_H * 0.75, 0.1), slatMat)
    slat2.name = `slat2_${i}`
    slat2.position.set(-0.8 + i * 0.4, Y_F2 + FLOOR_H / 2, MAIN_D / 2 + 0.08)
    floor2Group.add(slat2)
  }

  return {
    root,
    parts,
    floorGroups: [baseGroup, floor1Group, floor2Group, roofGroup],
  }
}

// ---- material mode switch ----
export type MaterialMode = 'whitebox' | 'textured'

export function applyMaterialMode(building: Building, mode: MaterialMode) {
  building.parts.forEach(({ mesh }) => {
    const wm = mesh.userData.whiteboxMat as THREE.MeshStandardMaterial | undefined
    const tm = mesh.userData.texturedMat as THREE.MeshStandardMaterial | undefined
    if (!wm && !tm) return
    mesh.material = mode === 'whitebox' ? (wm ?? mesh.material) : (tm ?? wm ?? mesh.material)
  })
}

// ---- explode / collapse ----
const EXPLODE_OFFSETS = [0, 0, 5.5, 11.5]

export function setExplode(building: Building, t: number) {
  building.floorGroups.forEach((group, i) => {
    group.position.y = EXPLODE_OFFSETS[i] * t
  })
  // Explode mode: hide exterior walls entirely, keep slabs semi-visible as floor plates
  const exploding = t > 0.05
  building.root.traverse((obj) => {
    if (!(obj instanceof THREE.Mesh)) return
    const isSlab  = obj.name.startsWith('slab_')
    const isSolid = obj.name.startsWith('solid_')
    if (!isSlab && !isSolid) return
    const mat = obj.material as THREE.MeshStandardMaterial
    if (exploding) {
      mat.transparent = true
      mat.opacity     = isSlab ? 0.35 : 0.0
      mat.depthWrite  = false
    } else {
      mat.transparent = false
      mat.opacity     = 1.0
      mat.depthWrite  = true
    }
    mat.needsUpdate = true
  })
}
