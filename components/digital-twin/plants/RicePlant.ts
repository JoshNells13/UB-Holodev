import * as THREE from 'three'
import type { FieldVisualState } from '../types'
import { getPlantStatusColor } from '../types'

// Reusable shared geometries
let riceStemGeo: THREE.CylinderGeometry | null = null
let riceLeafGeo: THREE.ConeGeometry | null = null
let riceGrainGeo: THREE.SphereGeometry | null = null

function getGeometries() {
  if (!riceStemGeo) {
    riceStemGeo = new THREE.CylinderGeometry(0.02, 0.035, 0.6, 5)
    riceStemGeo.translate(0, 0.3, 0)
    riceLeafGeo = new THREE.ConeGeometry(0.04, 0.45, 4)
    riceLeafGeo.translate(0, 0.22, 0)
    riceGrainGeo = new THREE.SphereGeometry(0.03, 4, 4)
    riceGrainGeo.scale(0.8, 1.8, 0.8)
  }
  return { riceStemGeo, riceLeafGeo, riceGrainGeo }
}

export function createRicePlant(visualState: FieldVisualState = 'healthy'): THREE.Group {
  const group = new THREE.Group()
  const { riceStemGeo, riceLeafGeo, riceGrainGeo } = getGeometries()
  const colors = getPlantStatusColor(visualState)

  const stemMat = new THREE.MeshLambertMaterial({
    color: colors.stem,
    flatShading: true
  })

  const leafMat = new THREE.MeshLambertMaterial({
    color: colors.foliage,
    flatShading: true
  })

  const grainMat = new THREE.MeshLambertMaterial({
    color: colors.accent,
    flatShading: true
  })

  // Center stalk cluster (3 stems)
  const stalkCount = 4
  for (let i = 0; i < stalkCount; i++) {
    const angle = (i / stalkCount) * Math.PI * 2 + (Math.random() * 0.3 - 0.15)
    const radius = 0.035

    const stemMesh = new THREE.Mesh(riceStemGeo, stemMat)
    stemMesh.position.set(Math.cos(angle) * radius, 0, Math.sin(angle) * radius)
    stemMesh.rotation.z = (Math.random() - 0.5) * 0.15
    stemMesh.rotation.x = (Math.random() - 0.5) * 0.15
    stemMesh.scale.set(0.9 + Math.random() * 0.2, 0.85 + Math.random() * 0.3, 0.9 + Math.random() * 0.2)
    group.add(stemMesh)

    // Arched leaf
    const leaf = new THREE.Mesh(riceLeafGeo, leafMat)
    leaf.position.set(Math.cos(angle) * 0.06, 0.25, Math.sin(angle) * 0.06)
    leaf.rotation.x = Math.cos(angle) * 0.55
    leaf.rotation.z = -Math.sin(angle) * 0.55
    leaf.scale.set(1, 0.9 + Math.random() * 0.3, 1)
    group.add(leaf)
  }

  // Drooping golden rice grain heads at the top
  for (let j = 0; j < 3; j++) {
    const grainAngle = (j / 3) * Math.PI * 2 + 0.5
    const grain = new THREE.Mesh(riceGrainGeo, grainMat)
    grain.position.set(Math.cos(grainAngle) * 0.05, 0.55 + Math.random() * 0.05, Math.sin(grainAngle) * 0.05)
    grain.rotation.z = Math.sin(grainAngle) * 0.45
    grain.rotation.x = Math.cos(grainAngle) * 0.45
    group.add(grain)
  }

  group.scale.setScalar(1.0)
  group.name = 'RicePlant'
  return group
}
