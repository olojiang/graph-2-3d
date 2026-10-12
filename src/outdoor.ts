import * as THREE from 'three'

// ---- materials ----
const grassMat    = new THREE.MeshStandardMaterial({ color: 0x4a7c40, roughness: 0.95 })
const paveMat     = new THREE.MeshStandardMaterial({ color: 0xb8b4ae, roughness: 0.9 })
const roadMat     = new THREE.MeshStandardMaterial({ color: 0x3a3a3a, roughness: 1.0 })
const curbMat     = new THREE.MeshStandardMaterial({ color: 0xd0ccc6, roughness: 0.85 })
const hedgeMat    = new THREE.MeshStandardMaterial({ color: 0x2e5a28, roughness: 0.95 })
const stoneMat    = new THREE.MeshStandardMaterial({ color: 0x8a8880, roughness: 0.95 })
const riverBedMat = new THREE.MeshStandardMaterial({ color: 0x4a5a48, roughness: 0.9 })

// ---- animated water shader ----
export const waterUniforms = {
  time:      { value: 0 },
  colorA:    { value: new THREE.Color(0x5ca8c8) },
  colorB:    { value: new THREE.Color(0x2e7090) },
  deepColor: { value: new THREE.Color(0x1a4858) },
}

const waterMat = new THREE.ShaderMaterial({
  uniforms: waterUniforms,
  transparent: true,
  depthWrite: false,
  vertexShader: /* glsl */`
    uniform float time;
    varying vec2 vUv;
    varying float vWave;
    void main() {
      vUv = uv;
      vec3 p = position;
      float wave = sin(p.z * 2.8 + time * 2.2) * 0.04
                 + sin(p.x * 4.0 + time * 1.7) * 0.018
                 + sin(p.z * 5.0 - time * 3.0) * 0.012;
      p.y += wave;
      vWave = wave;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
    }
  `,
  fragmentShader: /* glsl */`
    uniform float time;
    uniform vec3 colorA;
    uniform vec3 colorB;
    uniform vec3 deepColor;
    varying vec2 vUv;
    varying float vWave;
    float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
    float noise(vec2 p) {
      vec2 i = floor(p); vec2 f = fract(p);
      vec2 u = f * f * (3.0 - 2.0 * f);
      return mix(mix(hash(i), hash(i+vec2(1,0)), u.x),
                 mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), u.x), u.y);
    }
    void main() {
      vec2 flowUv = vec2(vUv.x * 3.0, vUv.y * 10.0 - time * 0.6);
      float n  = noise(flowUv);
      float n2 = noise(flowUv * 2.1 + vec2(1.3, 0.7));
      float n3 = noise(flowUv * 4.2 - vec2(0.5, 1.1));
      float pattern = n * 0.5 + n2 * 0.3 + n3 * 0.2;
      float foam = smoothstep(0.72, 0.82, pattern) * 0.5;
      vec3 water = mix(deepColor, colorA, pattern);
      water = mix(water, colorB, n2 * 0.4);
      water = mix(water, vec3(0.92, 0.96, 1.0), foam);
      float edge = smoothstep(0.0, 0.15, vUv.x) * smoothstep(1.0, 0.85, vUv.x);
      water = mix(deepColor * 0.6, water, edge);
      float spec = pow(max(n3 - 0.45, 0.0) * 2.0, 3.0) * 0.55;
      water += vec3(spec);
      gl_FragColor = vec4(water, 0.82 + foam * 0.15);
    }
  `,
})

// ---- tree ----
function createTree(h = 3.5, r = 1.0): THREE.Group {
  const g = new THREE.Group()
  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x6b4c30, roughness: 0.9 })
  const leafMat  = new THREE.MeshStandardMaterial({ color: 0x3a6b3a, roughness: 0.95 })
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.18, h * 0.42, 8), trunkMat)
  trunk.position.set(0, h * 0.21, 0); trunk.castShadow = true; g.add(trunk)
  const sphere = (r2: number, y: number, xOff = 0, zOff = 0) => {
    const m = new THREE.Mesh(new THREE.SphereGeometry(r2, 9, 7), leafMat)
    m.position.set(xOff, y, zOff); m.castShadow = true; m.receiveShadow = true; g.add(m)
  }
  sphere(r, h * 0.55)
  sphere(r * 0.72, h * 0.78,  r * 0.4,  r * 0.2)
  sphere(r * 0.65, h * 0.74, -r * 0.3, -r * 0.3)
  return g
}

// ---- street lamp ----
function createLamp(): THREE.Group {
  const g = new THREE.Group()
  const polMat = new THREE.MeshStandardMaterial({ color: 0x888880, roughness: 0.4, metalness: 0.7 })
  const glMat  = new THREE.MeshStandardMaterial({ color: 0xfff8e0, emissive: 0xfff060, emissiveIntensity: 0.6, roughness: 0.3 })
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 4.5, 8), polMat)
  pole.position.set(0, 2.25, 0); pole.castShadow = true; g.add(pole)
  const arm = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.06, 0.06), polMat)
  arm.position.set(0.6, 4.5, 0); g.add(arm)
  const head = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.14, 0.28, 16), glMat)
  head.position.set(1.2, 4.38, 0); g.add(head)
  return g
}

// ---- fence section ----
function fenceSection(parent: THREE.Group, x: number, z: number, ry: number, len: number) {
  const mat = new THREE.MeshStandardMaterial({ color: 0xe8e4de, roughness: 0.75 })
  const rail = new THREE.Mesh(new THREE.BoxGeometry(len, 0.06, 0.06), mat)
  rail.position.set(x, 1.0, z); rail.rotation.y = ry; rail.castShadow = true; parent.add(rail)
  const rail2 = rail.clone(); rail2.position.y = 0.55; parent.add(rail2)
  const postCount = Math.floor(len / 0.6) + 1
  for (let i = 0; i <= postCount; i++) {
    const t = postCount > 0 ? i / postCount - 0.5 : 0
    const pm = new THREE.Mesh(new THREE.BoxGeometry(0.07, 1.15, 0.07), mat)
    pm.position.set(
      x + Math.sin(ry + Math.PI / 2) * t * len * -1,
      0.57,
      z + Math.cos(ry + Math.PI / 2) * t * len * -1,
    )
    pm.castShadow = true; parent.add(pm)
  }
}

export function createOutdoor(): THREE.Group {
  const g = new THREE.Group()

  // ground
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(80, 80), grassMat)
  ground.rotation.x = -Math.PI / 2; ground.position.y = 0.001
  ground.receiveShadow = true; g.add(ground)

  // driveway
  const drive = new THREE.Mesh(new THREE.BoxGeometry(8, 0.04, 8), paveMat)
  drive.position.set(0.5, 0.02, 9.5); drive.receiveShadow = true; g.add(drive)

  // sidewalk
  const sidewalk = new THREE.Mesh(new THREE.BoxGeometry(30, 0.06, 2.5), paveMat)
  sidewalk.position.set(0, 0.03, 12.8); sidewalk.receiveShadow = true; g.add(sidewalk)

  // road
  const road = new THREE.Mesh(new THREE.BoxGeometry(40, 0.05, 5.0), roadMat)
  road.position.set(0, 0.025, 15.8); road.receiveShadow = true; g.add(road)

  // road center dashes
  const dashMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 1 })
  for (let i = -4; i <= 4; i++) {
    const dash = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.02, 0.12), dashMat)
    dash.position.set(i * 4.5, 0.04, 15.8); g.add(dash)
  }

  // curbs
  const curb1 = new THREE.Mesh(new THREE.BoxGeometry(30, 0.12, 0.22), curbMat)
  curb1.position.set(0, 0.06, 13.55); g.add(curb1)
  const curb2 = curb1.clone(); curb2.position.z = 18.1; g.add(curb2)

  // back hedge
  const backHedge = new THREE.Mesh(new THREE.BoxGeometry(20, 1.4, 0.4), hedgeMat)
  backHedge.position.set(2, 0.7, -9.0); backHedge.castShadow = true; g.add(backHedge)

  // right side hedge
  const sideHedge = new THREE.Mesh(
    new THREE.BoxGeometry(0.4, 1.2, 16),
    new THREE.MeshStandardMaterial({ color: 0x335c2e, roughness: 0.95 }))
  sideHedge.position.set(13.5, 0.6, 0); sideHedge.castShadow = true; g.add(sideHedge)

  // front low wall
  const frontWall = new THREE.Mesh(new THREE.BoxGeometry(14, 0.5, 0.25), curbMat)
  frontWall.position.set(0.5, 0.25, 11.8); frontWall.castShadow = true; g.add(frontWall)

  // gate pillars
  const pillarMat = new THREE.MeshStandardMaterial({ color: 0xe8e4de, roughness: 0.75 })
  ;[-6.5, 1.5, 6.5].forEach(px => {
    const p = new THREE.Mesh(new THREE.BoxGeometry(0.4, 1.6, 0.4), pillarMat)
    p.position.set(px, 0.8, 11.8); p.castShadow = true; g.add(p)
  })

  // fence sections flanking gate
  fenceSection(g, -4.0, 11.8, 0, 4.5)
  fenceSection(g,  4.0, 11.8, 0, 4.5)

  // ---- stream (left side, X ≈ -11, runs N-S) ----
  const riverBed = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.35, 18), riverBedMat)
  riverBed.position.set(-11.0, -0.17, -1.0); riverBed.receiveShadow = true; g.add(riverBed)

  // stone banks
  ;[-1, 1].forEach(side => {
    for (let i = -4; i <= 4; i++) {
      const sw = 0.3 + Math.abs(Math.sin(i * 2.3 + side)) * 0.25
      const sh = 0.12 + Math.abs(Math.cos(i * 1.7)) * 0.15
      const sm = new THREE.Mesh(
        new THREE.BoxGeometry(sw, sh, 0.5 + Math.abs(Math.sin(i * 0.7)) * 0.3), stoneMat)
      sm.position.set(-11.0 + side * 1.15, sh / 2, i * 2.0 + Math.sin(i * 0.9) * 0.3)
      sm.rotation.y = Math.sin(i * 1.1) * 0.25; sm.castShadow = true; g.add(sm)
    }
  })

  // water surface
  const waterGeo = new THREE.PlaneGeometry(1.8, 17, 12, 60)
  waterGeo.rotateX(-Math.PI / 2)
  const waterMesh = new THREE.Mesh(waterGeo, waterMat)
  waterMesh.position.set(-11.0, 0.03, -1.0); g.add(waterMesh)

  // rocks in stream
  for (let i = 0; i < 8; i++) {
    const rx = -11.0 + Math.sin(i * 1.3) * 0.5
    const rz = -7.0 + i * 2.0 + Math.cos(i * 0.7) * 0.4
    const rs = 0.1 + Math.abs(Math.sin(i * 2.1)) * 0.18
    const rock = new THREE.Mesh(
      new THREE.SphereGeometry(rs, 6, 5),
      new THREE.MeshStandardMaterial({ color: 0x6a6864, roughness: 0.95 }))
    rock.position.set(rx, 0.04, rz); rock.scale.y = 0.5; rock.castShadow = true; g.add(rock)
  }

  // trees
  const treePoses: Array<[number, number, number, number]> = [
    [ -8, 0,  8.5, 3.8], [  9, 0,  8.5, 3.2],
    [-11, 0,  3.0, 4.2], [ 12, 0,  1.0, 3.6],
    [-10, 0, -3.0, 3.9], [  1, 0, -7.5, 4.5],
    [ -5, 0, -7.5, 3.5], [ 10, 0, -5.0, 4.0],
    [-14, 0, 12.5, 2.8], [ 13, 0, 12.5, 3.0],
  ]
  treePoses.forEach(([x, , z, h]) => {
    const t = createTree(h, h * 0.28); t.position.set(x, 0, z); g.add(t)
  })

  // street lamps along sidewalk
  ;[-9, -4, 2, 8].forEach(lx => {
    const l = createLamp(); l.position.set(lx, 0, 12.2); g.add(l)
  })

  // backyard patio
  const patio = new THREE.Mesh(new THREE.BoxGeometry(7, 0.08, 5), paveMat)
  patio.position.set(0.5, 0.04, -7.5); patio.receiveShadow = true; g.add(patio)

  return g
}
