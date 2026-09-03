import * as THREE from 'three'
import type { FieldVisualState } from '../types'
import { getPlantStatusColor } from '../types'

export function createGenericPlant(
  visualState: FieldVisualState = 'healthy',
  cropSlug: string = 'bawang-merah'
): THREE.Group {
  const group = new THREE.Group()
  const colors = getPlantStatusColor(visualState)
  const slug = (cropSlug || '').toLowerCase()

  const stemMat = new THREE.MeshLambertMaterial({
    color: colors.stem,
    flatShading: true
  })
  const leafMat = new THREE.MeshLambertMaterial({
    color: colors.foliage,
    flatShading: true
  })

  // 1. Tebu (Sugarcane) - Tall segmented stalk
  if (slug.includes('tebu') || slug.includes('sugarcane')) {
    const caneGeo = new THREE.CylinderGeometry(0.04, 0.05, 1.1, 6)
    caneGeo.translate(0, 0.55, 0)
    const caneMesh = new THREE.Mesh(caneGeo, new THREE.MeshLambertMaterial({ color: 0x65a30d, flatShading: true }))
    group.add(caneMesh)

    // Node rings
    for (let r = 1; r <= 3; r++) {
      const ringGeo = new THREE.TorusGeometry(0.046, 0.012, 4, 8)
      ringGeo.rotateX(Math.PI / 2)
      const ringMesh = new THREE.Mesh(ringGeo, new THREE.MeshLambertMaterial({ color: 0x3f6212 }))
      ringMesh.position.set(0, r * 0.28, 0)
      group.add(ringMesh)
    }

    // Top long cane leaves
    for (let l = 0; l < 4; l++) {
      const leafGeo = new THREE.ConeGeometry(0.06, 0.6, 4)
      leafGeo.translate(0, 0.3, 0)
      const leaf = new THREE.Mesh(leafGeo, leafMat)
      leaf.position.set(0, 0.85, 0)
      leaf.rotation.y = (l / 4) * Math.PI * 2
      leaf.rotation.z = 0.65
      group.add(leaf)
    }

    group.scale.setScalar(0.95)
    group.name = 'SugarcanePlant'
    return group
  }

  // 2. Bawang Merah (Shallot / Onion) - Purple base bulb with slender leaves
  if (slug.includes('bawang') || slug.includes('onion') || slug.includes('shallot')) {
    const bulbGeo = new THREE.SphereGeometry(0.065, 6, 6)
    bulbGeo.scale(1.0, 1.3, 1.0)
    const bulbMat = new THREE.MeshLambertMaterial({ color: 0x9333ea, flatShading: true }) // Vibrant Purple
    const bulbMesh = new THREE.Mesh(bulbGeo, bulbMat)
    bulbMesh.position.set(0, 0.08, 0)
    group.add(bulbMesh)

    // Slender green chive leaves shooting up
    for (let i = 0; i < 4; i++) {
      const chiveGeo = new THREE.ConeGeometry(0.018, 0.42, 4)
      chiveGeo.translate(0, 0.21, 0)
      const chive = new THREE.Mesh(chiveGeo, leafMat)
      chive.position.set((Math.random() - 0.5) * 0.02, 0.12, (Math.random() - 0.5) * 0.02)
      chive.rotation.y = (i / 4) * Math.PI * 2
      chive.rotation.z = (Math.random() - 0.5) * 0.2
      group.add(chive)
    }

    group.scale.setScalar(0.95)
    group.name = 'ShallotPlant'
    return group
  }

  // 3. Tomat (Tomato) - Bushy with red round tomatoes
  if (slug.includes('tomat') || slug.includes('tomato')) {
    const mainStemGeo = new THREE.CylinderGeometry(0.025, 0.04, 0.55, 5)
    mainStemGeo.translate(0, 0.275, 0)
    const stem = new THREE.Mesh(mainStemGeo, stemMat)
    group.add(stem)

    // Foliage
    for (let i = 0; i < 5; i++) {
      const leafGeo = new THREE.DodecahedronGeometry(0.08, 0)
      const leaf = new THREE.Mesh(leafGeo, leafMat)
      const angle = (i / 5) * Math.PI * 2
      leaf.position.set(Math.cos(angle) * 0.1, 0.2 + (i % 3) * 0.12, Math.sin(angle) * 0.1)
      group.add(leaf)
    }

    // Red ripe tomatoes
    const tomatoMat = new THREE.MeshLambertMaterial({ color: 0xef4444, flatShading: true })
    for (let t = 0; t < 3; t++) {
      const tomatoGeo = new THREE.SphereGeometry(0.045, 6, 6)
      const tomato = new THREE.Mesh(tomatoGeo, tomatoMat)
      const angle = t * 2.1 + 0.5
      tomato.position.set(Math.cos(angle) * 0.09, 0.28 + (t * 0.08), Math.sin(angle) * 0.09)
      group.add(tomato)
    }

    group.scale.setScalar(0.92)
    group.name = 'TomatoPlant'
    return group
  }

  // 4. Default / Kentang / Kacang Tanah
  const genericStemGeo = new THREE.CylinderGeometry(0.02, 0.03, 0.38, 5)
  genericStemGeo.translate(0, 0.19, 0)
  const stem = new THREE.Mesh(genericStemGeo, stemMat)
  group.add(stem)

  const fruitColor = slug.includes('kentang') ? 0xd97706 : colors.accent
  const fruitMat = new THREE.MeshLambertMaterial({ color: fruitColor, flatShading: true })

  for (let i = 0; i < 4; i++) {
    const leafGeo = new THREE.SphereGeometry(0.08, 4, 4)
    leafGeo.scale(1.2, 0.4, 0.8)
    const leaf = new THREE.Mesh(leafGeo, leafMat)
    const angle = (i / 4) * Math.PI * 2
    leaf.position.set(Math.cos(angle) * 0.08, 0.25, Math.sin(angle) * 0.08)
    leaf.rotation.y = angle
    leaf.rotation.z = 0.5
    group.add(leaf)
  }

  const fruitGeo = new THREE.SphereGeometry(0.04, 5, 5)
  const fruit = new THREE.Mesh(fruitGeo, fruitMat)
  fruit.position.set(0, 0.12, 0)
  group.add(fruit)

  group.scale.setScalar(0.9)
  group.name = 'GenericPlant'
  return group
}
