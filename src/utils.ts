import * as THREE from 'three'

// ---- material shortcuts ----
export function whiteMat(roughness = 0.85): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({ color: 0xf4f2ee, roughness, metalness: 0.0 })
}

export function colorMat(color: number, roughness = 0.75): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({ color, roughness, metalness: 0.0 })
}

export function woodMat(): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({ color: 0xc8a97e, roughness: 0.8, metalness: 0.0 })
}

export function darkWoodMat(): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({ color: 0x6b4c30, roughness: 0.8, metalness: 0.0 })
}

export function metalMat(): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({ color: 0xaaaaaa, roughness: 0.3, metalness: 0.85 })
}

export function fabricMat(color = 0xe0d8cc): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({ color, roughness: 0.9, metalness: 0.0 })
}

export function glassMat(): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color: 0x90c0d8, roughness: 0.05, metalness: 0.1,
    transparent: true, opacity: 0.3,
  })
}

export function wallMat(): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({ color: 0xf0ece6, roughness: 0.88, metalness: 0.0 })
}

export function floorTileMat(): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({ color: 0xe8e2d8, roughness: 0.7, metalness: 0.0 })
}

export function concreteFloorMat(): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({ color: 0xd0ccc6, roughness: 0.85, metalness: 0.0 })
}

// ---- geometry helpers ----
export function box(w: number, h: number, d: number): THREE.BoxGeometry {
  return new THREE.BoxGeometry(w, h, d)
}

export function cyl(rt: number, rb: number, h: number, segs = 16): THREE.CylinderGeometry {
  return new THREE.CylinderGeometry(rt, rb, h, segs)
}

// ---- mesh helper: create & position ----
export function mkMesh(
  geo: THREE.BufferGeometry,
  mat: THREE.Material,
  x: number, y: number, z: number,
  name = '',
  ry = 0,
): THREE.Mesh {
  const m = new THREE.Mesh(geo, mat)
  m.position.set(x, y, z)
  if (ry) m.rotation.y = ry
  if (name) m.name = name
  m.castShadow = true
  m.receiveShadow = true
  return m
}
