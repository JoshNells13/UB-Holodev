import * as THREE from 'three'
import type { FieldVisualState } from '../types'
import { getPlantStatusColor } from '../types'

let cornStalkGeo: THREE.CylinderGeometry | null = null
let cornLeafGeo: THREE.ConeGeometry | null = null
let cornEarGeo: THREE.CylinderGeometry | null = null
let cornTasselGeo: THREE.ConeGeometry | null = null

function getGeometries() {
  if (!cornStalkGeo) {
    cornStalkGeo = new THREE.CylinderGeometry(0.035, 0.05, 0.9, 6)
    cornStalkGeo.translate(0, 0.45, 0)
    
    cornLeafGeo = new THREE.ConeGeometry(0.08, 0.5, 4)
    cornLeafGeo.translate(0, 0.25, 0)
    
    cornEarGeo = new THREE.CylinderGeometry(0.03, 0.04, 0.18, 5)
    cornEarGeo.translate(0, 0.09, 0)

    cornTasselGeo = new THREE.ConeGeometry(0.05, 0.2, 4)
    cornTasselGeo.translate(0, 0.1, 0)
  }
  return { cornStalkGeo, cornLeafGeo, cornEarGeo, cornTasselGeo }
}

export function createCornPlant(visualState: FieldVisualState = 'healthy'): THREE.Group {
  const group = new THREE.Group()
  const { cornStalkGeo, cornLeafGeo, cornEarGeo, cornTasselGeo } = getGeometries()
  const colors = getPlantStatusColor(visualState)

  const stalkMat = new THREE.MeshLambertMaterial({
    color: colors.stem,
    flatShading: true
  })

  const leafMat = new THREE.MeshLambertMaterial({
    color: colors.foliage,
    flatShading: true
  })

  const cornMat = new THREE.MeshLambertMaterial({
    color: 0xfacc15, // Golden corn cob
    flatShading: true
  })

  const tasselMat = new THREE.MeshLambertMaterial({
    color: colors.accent,
    flatShading: true
  })

  // Stalk
  const stalk = new THREE.Mesh(cornStalkGeo, stalkMat)
  group.add(stalk)

  // Leaves branching outwards at alternating heights and angles
  const leafHeights = [0.25, 0.45, 0.65, 0.8]
  leafHeights.forEach((h, idx) => {
    const angle = idx * 1.6 + (Math.random() * 0.2 - 0.1)
    
    // Left side leaf
    const leaf1 = new THREE.Mesh(cornLeafGeo, leafMat)
    leaf1.position.set(0, h, 0)
    leaf1.rotation.y = angle
    leaf1.rotation.z = 0.8 + (Math.random() * 0.2)
    leaf1.scale.set(0.9, 1.1, 0.4)
    group.add(leaf1)

    // Opposite side leaf
    const leaf2 = new THREE.Mesh(cornLeafGeo, leafMat)
    leaf2.position.set(0, h + 0.08, 0)
    leaf2.rotation.y = angle + Math.PI + 0.3
    leaf2.rotation.z = 0.75 + (Math.random() * 0.2)
    leaf2.scale.set(0.85, 1.0, 0.4)
    group.add(leaf2)
  })

  // 1-2 Corn ears on the side
  const ear1 = new THREE.Mesh(cornEarGeo, cornMat)
  ear1.position.set(0.04, 0.42, 0.03)
  ear1.rotation.z = -0.45
  ear1.rotation.y = 0.5
  group.add(ear1)

  // Top tassel
  const tassel = new THREE.Mesh(cornTasselGeo, tasselMat)
  tassel.position.set(0, 0.9, 0)
  group.add(tassel)

  group.scale.setScalar(0.95)
  group.name = 'CornPlant'
  return group
}
