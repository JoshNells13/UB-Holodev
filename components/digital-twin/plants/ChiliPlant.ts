import * as THREE from 'three'
import type { FieldVisualState } from '../types'
import { getPlantStatusColor } from '../types'

let chiliStemGeo: THREE.CylinderGeometry | null = null
let chiliLeafGeo: THREE.ConeGeometry | null = null
let chiliPepperGeo: THREE.ConeGeometry | null = null

function getGeometries() {
  if (!chiliStemGeo) {
    chiliStemGeo = new THREE.CylinderGeometry(0.02, 0.035, 0.45, 5)
    chiliStemGeo.translate(0, 0.22, 0)

    chiliLeafGeo = new THREE.ConeGeometry(0.06, 0.22, 4)
    chiliLeafGeo.translate(0, 0.11, 0)

    chiliPepperGeo = new THREE.ConeGeometry(0.025, 0.16, 4)
    chiliPepperGeo.translate(0, -0.08, 0)
  }
  return { chiliStemGeo, chiliLeafGeo, chiliPepperGeo }
}

export function createChiliPlant(visualState: FieldVisualState = 'healthy'): THREE.Group {
  const group = new THREE.Group()
  const { chiliStemGeo, chiliLeafGeo, chiliPepperGeo } = getGeometries()
  const colors = getPlantStatusColor(visualState)

  const stemMat = new THREE.MeshLambertMaterial({
    color: colors.stem,
    flatShading: true
  })

  const leafMat = new THREE.MeshLambertMaterial({
    color: colors.foliage,
    flatShading: true
  })

  const pepperMat = new THREE.MeshLambertMaterial({
    color: 0xef4444, // Bright red chili
    flatShading: true
  })

  // Main stem
  const stem = new THREE.Mesh(chiliStemGeo, stemMat)
  group.add(stem)

  // Leaves branching around
  const leafCount = 6
  for (let i = 0; i < leafCount; i++) {
    const angle = (i / leafCount) * Math.PI * 2 + (Math.random() * 0.2)
    const height = 0.2 + (i % 3) * 0.1

    const leaf = new THREE.Mesh(chiliLeafGeo, leafMat)
    leaf.position.set(0, height, 0)
    leaf.rotation.y = angle
    leaf.rotation.z = 0.8
    leaf.scale.set(1.0, 1.0, 0.5)
    group.add(leaf)
  }

  // Hanging red chilies (3 fruits)
  for (let j = 0; j < 3; j++) {
    const angle = (j / 3) * Math.PI * 2 + 0.5
    const pepper = new THREE.Mesh(chiliPepperGeo, pepperMat)
    pepper.position.set(Math.cos(angle) * 0.08, 0.35, Math.sin(angle) * 0.08)
    pepper.rotation.z = Math.sin(angle) * 0.3
    pepper.rotation.x = Math.cos(angle) * 0.3
    group.add(pepper)
  }

  group.scale.setScalar(0.9)
  group.name = 'ChiliPlant'
  return group
}
