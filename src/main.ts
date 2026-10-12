import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { createBuilding, applyMaterialMode, setExplode, type BuildingPart } from './building'
import { ROOMS } from './rooms'
import { createOutdoor, waterUniforms } from './outdoor'

// ---- scene setup ----
const canvas = document.getElementById('canvas') as HTMLCanvasElement
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.toneMappingExposure = 1.1

const scene = new THREE.Scene()
scene.background = new THREE.Color(0x0d0e14)
scene.fog = new THREE.Fog(0x0d0e14, 40, 80)

const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 200)
camera.position.set(22, 18, 22)
camera.lookAt(2, 4, 0)

const controls = new OrbitControls(camera, canvas)
controls.target.set(2, 4, 0)
controls.enableDamping = true
controls.dampingFactor = 0.06
controls.minDistance = 8
controls.maxDistance = 50
controls.maxPolarAngle = Math.PI / 2.1

// ---- lights ----
const ambient = new THREE.AmbientLight(0xffffff, 0.4)
scene.add(ambient)

const sun = new THREE.DirectionalLight(0xfff4e0, 1.6)
sun.position.set(15, 22, 12)
sun.castShadow = true
sun.shadow.mapSize.set(2048, 2048)
sun.shadow.camera.near = 1
sun.shadow.camera.far = 80
sun.shadow.camera.left = -20
sun.shadow.camera.right = 20
sun.shadow.camera.top = 20
sun.shadow.camera.bottom = -20
sun.shadow.bias = -0.001
scene.add(sun)

const fill = new THREE.DirectionalLight(0xd0e8ff, 0.5)
fill.position.set(-10, 8, -8)
scene.add(fill)

// Warm interior point lights (visible in textured mode)
const interiorLights: THREE.PointLight[] = []
const interiorPositions = [
  new THREE.Vector3(-1.5, 4.2, 1.5),
  new THREE.Vector3(2.5, 4.2, 2),
  new THREE.Vector3(4.5, 4.2, 1.5),
  new THREE.Vector3(-1.5, 8.4, -1),
  new THREE.Vector3(2.5, 8.4, -0.5),
]
interiorPositions.forEach((pos) => {
  const pl = new THREE.PointLight(0xffc87a, 0, 6)
  pl.position.copy(pos)
  scene.add(pl)
  interiorLights.push(pl)
})

// ---- building ----
const building = createBuilding()
scene.add(building.root)

// ---- outdoor scene ----
const outdoor = createOutdoor()
scene.add(outdoor)

// ---- FPS counter ----
const fpsEl = document.getElementById('fps-counter')!
let fpsSamples: number[] = []
let lastFpsTime = performance.now()

function updateFps(dt: number) {
  fpsSamples.push(1 / dt)
  if (fpsSamples.length > 30) fpsSamples.shift()
  const now = performance.now()
  if (now - lastFpsTime > 250) {
    const avg = fpsSamples.reduce((a, b) => a + b, 0) / fpsSamples.length
    fpsEl.textContent = `${Math.round(avg)} FPS`
    lastFpsTime = now
  }
}

// ---- light control ----
const lightSlider = document.getElementById('light-slider') as HTMLInputElement
lightSlider.addEventListener('input', () => {
  const v = Number(lightSlider.value) / 100   // 0..1
  renderer.toneMappingExposure = 0.3 + v * 1.6
  ambient.intensity = 0.1 + v * 0.6
  sun.intensity = 0.4 + v * 2.0
  fill.intensity = 0.1 + v * 0.7
})


type AppMode = 'whitebox' | 'textured' | 'explode'
let currentMode: AppMode = 'whitebox'
let explodeT = 0
let explodeTarget = 0
let highlightedPart: BuildingPart | null = null

// ---- highlight material — wireframe outline so furniture stays visible ----
const highlightMat = new THREE.MeshStandardMaterial({
  color: 0x5bbfea,
  emissive: 0x1e7ab8,
  emissiveIntensity: 0.8,
  transparent: true,
  opacity: 0.08,
  depthWrite: false,
  wireframe: false,
})

// Separate wireframe overlay drawn on top of the zone box
const highlightWireMat = new THREE.MeshBasicMaterial({
  color: 0x5bbfea,
  wireframe: true,
  transparent: true,
  opacity: 0.6,
})

// ---- raycaster ----
const raycaster = new THREE.Raycaster()
const pointer = new THREE.Vector2()

function getRoomMeshes(): THREE.Mesh[] {
  return building.parts
    .filter((p) => p.roomId !== null)
    .map((p) => p.mesh)
}

// ---- info panel ----
const infoPanel = document.getElementById('info-panel')!
const panelTitle = document.getElementById('panel-title')!
const panelArea = document.getElementById('panel-area')!
const panelDesc = document.getElementById('panel-desc')!
const closeBtn = document.getElementById('close-panel')!

function showPanel(part: BuildingPart) {
  const room = ROOMS.find((r) => r.id === part.roomId)
  if (!room) return
  panelTitle.textContent = `${room.name}  (${room.floor}F)`
  panelArea.textContent = room.area
  panelDesc.textContent = room.desc
  infoPanel.classList.remove('hidden')
}

function hidePanel() {
  infoPanel.classList.add('hidden')
}

closeBtn.addEventListener('click', () => {
  hidePanel()
  restoreHighlight()
})

function restoreHighlight() {
  if (highlightedPart) {
    highlightedPart.mesh.material = currentMode === 'textured'
      ? (highlightedPart.mesh.userData.texturedMat ?? highlightedPart.mesh.userData.whiteboxMat)
      : highlightedPart.mesh.userData.whiteboxMat
    // remove wireframe overlay if present
    const wire = highlightedPart.mesh.userData.wireOverlay as THREE.Mesh | undefined
    if (wire) {
      highlightedPart.mesh.remove(wire)
      wire.geometry.dispose()
      delete highlightedPart.mesh.userData.wireOverlay
    }
    highlightedPart = null
  }
}

function setHighlight(part: BuildingPart) {
  restoreHighlight()
  highlightedPart = part
  part.mesh.material = highlightMat

  // add a wireframe child on top so outline is visible even at low opacity
  const wire = new THREE.Mesh(part.mesh.geometry, highlightWireMat)
  wire.name = 'highlight_wire'
  part.mesh.add(wire)
  part.mesh.userData.wireOverlay = wire
}

// ---- click handler ----
canvas.addEventListener('click', (e) => {
  const rect = canvas.getBoundingClientRect()
  pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
  pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1

  raycaster.setFromCamera(pointer, camera)
  const hits = raycaster.intersectObjects(getRoomMeshes(), false)

  if (hits.length > 0) {
    const hit = hits[0].object as THREE.Mesh
    const part = building.parts.find((p) => p.mesh === hit)
    if (part && part.roomId) {
      setHighlight(part)
      showPanel(part)
    }
  } else {
    restoreHighlight()
    hidePanel()
  }
})

// ---- toolbar ----
const buttons = document.querySelectorAll<HTMLButtonElement>('.btn[data-mode]')

function setMode(mode: AppMode) {
  currentMode = mode
  buttons.forEach((b) => b.classList.toggle('active', b.dataset.mode === mode))

  if (mode === 'whitebox') {
    applyMaterialMode(building, 'whitebox')
    interiorLights.forEach((l) => { l.intensity = 0 })
    explodeTarget = 0
  } else if (mode === 'textured') {
    applyMaterialMode(building, 'textured')
    interiorLights.forEach((l) => { l.intensity = 1.4 })
    explodeTarget = 0
  } else if (mode === 'explode') {
    applyMaterialMode(building, 'whitebox')
    interiorLights.forEach((l) => { l.intensity = 0 })
    explodeTarget = 1
  }

  hidePanel()
  restoreHighlight()
}

buttons.forEach((btn) => {
  btn.addEventListener('click', () => setMode(btn.dataset.mode as AppMode))
})

// ---- resize ----
function resize() {
  const w = canvas.clientWidth
  const h = canvas.clientHeight
  renderer.setSize(w, h, false)
  camera.aspect = w / h
  camera.updateProjectionMatrix()
}
window.addEventListener('resize', resize)
resize()

// ---- animate ----
const clock = new THREE.Clock()

function animate() {
  requestAnimationFrame(animate)
  const dt = clock.getDelta()
  controls.update()

  // smooth explode
  explodeT += (explodeTarget - explodeT) * Math.min(dt * 3, 1)
  setExplode(building, explodeT)

  // update water animation
  waterUniforms.time.value += dt

  updateFps(dt)
  renderer.render(scene, camera)
}

animate()
