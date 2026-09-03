import * as THREE from 'three'
import type { FieldVisualState } from '../types'
import { getPlantStatusColor } from '../types'

let soyStemGeo: THREE.CylinderGeometry | null = null
let soyLeafGeo: THREE.DodecahedronGeometry | null = null
let soyPodGeo: THREE.CylinderGeometry | null = null

function getGeometries() {
  if (!soyStemGeo) {
    soyStemGeo = new THREE.CylinderGeometry(0.025, 0.035, 0.45, 5)
    soyStemGeo.translate(0, 0.22, 0)

    soyLeafGeo = new THREE.DodecahedronGeometry(0.09, 0)
    soyLeafGeo.scale(1.2, 0.5, 0.9)

    soyPodGeo = new THREE.CylinderGeometry(0.02, 0.025, 0.12, 4)
    soyPodGeo.translate(0, 0.06, 0)
  }
  return { soyStemGeo, soyLeafGeo, soyPodGeo }
}

export function createSoybeanPlant(visualState: FieldVisualState = 'healthy'): THREE.Group {
  const group = new THREE.Group()
  const { soyStemGeo, soyLeafGeo, soyPodGeo } = getGeometries()
  const colors = getPlantStatusColor(visualState)

  const stemMat = new THREE.MeshLambertMaterial({
    color: colors.stem,
    flatShading: true
  })

  const leafMat = new THREE.MeshLambertMaterial({
    color: colors.foliage,
    flatShading: true
  })

  const podMat = new THREE.MeshLambertMaterial({
    color: colors.accent,
    flatShading: true
  })

  // Center stem
  const mainStem = new THREE.Mesh(soyStemGeo, stemMat)
  group.add(mainStem)

  // Side branches (bushy low-poly clusters)
  const branchCount = 3
  for (let i = 0; i < branchCount; i++) {
    const angle = (i / branchCount) * Math.PI * 2
    const sideStem = new THREE.Mesh(soyStemGeo, stemMat)
    sideStem.position.set(0, 0.12, 0)
    sideStem.rotation.z = Math.cos(angle) * 0.45
    sideStem.rotation.x = Math.sin(angle) * 0.45
    sideStem.scale.set(0.7, 0.7, 0.7)
    group.add(sideStem)

    // Bushy leaf cluster at tip of each branch
    const leafCluster = new THREE.Mesh(soyLeafGeo, leafMat)
    leafCluster.position.set(Math.cos(angle) * 0.14, 0.32, Math.sin(angle) * 0.14)
    leafCluster.rotation.y = angle + Math.random() * 0.5
    leafCluster.rotation.x = (Math.random() - 0.5) * 0.3
    group.add(leafCluster)
  }

  // Top leaf cluster
  const topLeaves = new THREE.Mesh(soyLeafGeo, leafMat)
  topLeaves.position.set(0, 0.46, 0)
  topLeaves.scale.set(1.1, 1.0, 1.1)
  group.add(topLeaves)

  // 2-3 small pods
  for (let p = 0; p < 2; p++) {
    const pod = new THREE.Mesh(soyPodGeo, podMat)
    pod.position.set(0.04 * (p === 0 ? 1 : -1), 0.22, 0.03)
    pod.rotation.z = p === 0 ? -0.6 : 0.6
    group.add(pod)
  }

  group.scale.setScalar(0.9)
  group.name = 'SoybeanPlant'
  return group
}
