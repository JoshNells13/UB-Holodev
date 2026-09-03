import * as THREE from 'three'
import type { WeatherVisualType } from '../types'

export class WeatherEffects {
  public group: THREE.Group
  public currentWeather: WeatherVisualType = 'sunny'
  
  private sunGroup: THREE.Group
  private sunMesh: THREE.Mesh
  private sunRaysMesh: THREE.Mesh
  private cloudsGroup: THREE.Group
  private rainParticles: THREE.Points | null = null
  private rainCount = 120
  private rainPositions: Float32Array | null = null
  
  private dirLight: THREE.DirectionalLight
  private hemiLight: THREE.HemisphereLight

  constructor(dirLight: THREE.DirectionalLight, hemiLight: THREE.HemisphereLight) {
    this.group = new THREE.Group()
    this.group.name = 'WeatherEffects'
    this.dirLight = dirLight
    this.hemiLight = hemiLight

    // 1. Stylized 3D Sun
    this.sunGroup = new THREE.Group()
    this.sunGroup.position.set(4.5, 6.0, -4.0)

    const sunGeo = new THREE.SphereGeometry(0.55, 16, 16)
    const sunMat = new THREE.MeshBasicMaterial({
      color: 0xfef08a // Warm soft yellow
    })
    this.sunMesh = new THREE.Mesh(sunGeo, sunMat)
    this.sunGroup.add(this.sunMesh)

    // Sun outer halo / ring
    const ringGeo = new THREE.RingGeometry(0.7, 0.9, 24)
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xfde047,
      transparent: true,
      opacity: 0.35,
      side: THREE.DoubleSide
    })
    this.sunRaysMesh = new THREE.Mesh(ringGeo, ringMat)
    this.sunGroup.add(this.sunRaysMesh)
    this.group.add(this.sunGroup)

    // 2. Stylized Low-Poly Clouds
    this.cloudsGroup = new THREE.Group()
    this.createClouds()
    this.group.add(this.cloudsGroup)

    // 3. Gentle Rain Particle System
    this.createRain()

    // Apply default sunny
    this.setWeather('sunny', true)
  }

  private createClouds() {
    const cloudMat = new THREE.MeshLambertMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.9,
      flatShading: true
    })

    // Create 3 fluffy low-poly clouds from merged spheres/cubes
    const cloudPositions = [
      { x: -2.8, y: 4.8, z: -1.2, scale: 0.65 },
      { x: 1.5, y: 5.2, z: 1.8, scale: 0.8 },
      { x: 3.2, y: 4.5, z: -2.5, scale: 0.55 }
    ]

    cloudPositions.forEach((pos, i) => {
      const cloud = new THREE.Group()
      cloud.position.set(pos.x, pos.y, pos.z)
      cloud.scale.setScalar(pos.scale)

      const partGeo = new THREE.DodecahedronGeometry(0.45, 1)
      
      const p1 = new THREE.Mesh(partGeo, cloudMat)
      p1.position.set(0, 0, 0)
      cloud.add(p1)

      const p2 = new THREE.Mesh(partGeo, cloudMat)
      p2.position.set(0.35, -0.05, 0)
      p2.scale.setScalar(0.75)
      cloud.add(p2)

      const p3 = new THREE.Mesh(partGeo, cloudMat)
      p3.position.set(-0.35, -0.05, 0)
      p3.scale.setScalar(0.8)
      cloud.add(p3)

      const p4 = new THREE.Mesh(partGeo, cloudMat)
      p4.position.set(0.1, 0.22, 0.1)
      p4.scale.setScalar(0.7)
      cloud.add(p4)

      cloud.userData = {
        baseX: pos.x,
        speed: 0.15 + i * 0.05
      }

      this.cloudsGroup.add(cloud)
    })
  }

  private createRain() {
    const rainGeo = new THREE.BufferGeometry()
    this.rainPositions = new Float32Array(this.rainCount * 3)

    for (let i = 0; i < this.rainCount; i++) {
      this.rainPositions[i * 3] = (Math.random() - 0.5) * 6.5
      this.rainPositions[i * 3 + 1] = Math.random() * 5.0 + 0.5
      this.rainPositions[i * 3 + 2] = (Math.random() - 0.5) * 6.5
    }

    rainGeo.setAttribute('position', new THREE.BufferAttribute(this.rainPositions, 3))

    const rainMat = new THREE.PointsMaterial({
      color: 0x60a5fa,
      size: 0.06,
      transparent: true,
      opacity: 0.75
    })

    this.rainParticles = new THREE.Points(rainGeo, rainMat)
    this.rainParticles.visible = false
    this.group.add(this.rainParticles)
  }

  public setWeather(type: WeatherVisualType, immediate: boolean = false) {
    this.currentWeather = type

    if (type === 'sunny') {
      this.sunGroup.visible = true
      this.cloudsGroup.visible = true
      if (this.rainParticles) this.rainParticles.visible = false

      this.dirLight.color.setHex(0xfff7ed)
      this.dirLight.intensity = 1.3
      this.hemiLight.color.setHex(0xe0f2fe)
      this.hemiLight.groundColor.setHex(0xbbf7d0)
      this.hemiLight.intensity = 0.85
      this.sunRaysMesh.material = new THREE.MeshBasicMaterial({
        color: 0xfde047,
        transparent: true,
        opacity: 0.4,
        side: THREE.DoubleSide
      })
    } else if (type === 'rain') {
      this.sunGroup.visible = false
      this.cloudsGroup.visible = true
      if (this.rainParticles) this.rainParticles.visible = true

      this.dirLight.color.setHex(0x94a3b8)
      this.dirLight.intensity = 0.75
      this.hemiLight.color.setHex(0xcbd5e1)
      this.hemiLight.groundColor.setHex(0x475569)
      this.hemiLight.intensity = 0.65
    } else if (type === 'drought') {
      this.sunGroup.visible = true
      this.cloudsGroup.visible = false
      if (this.rainParticles) this.rainParticles.visible = false

      this.dirLight.color.setHex(0xfef08a)
      this.dirLight.intensity = 1.6
      this.hemiLight.color.setHex(0xfef3c7)
      this.hemiLight.groundColor.setHex(0xfde68a)
      this.hemiLight.intensity = 0.95
    }
  }

  public update(delta: number) {
    // 1. Slow sun rays rotation
    if (this.sunRaysMesh && this.sunGroup.visible) {
      this.sunRaysMesh.rotation.z += delta * 0.2
    }

    // 2. Cloud drift
    this.cloudsGroup.children.forEach(c => {
      const u = c.userData
      c.position.x += u.speed * delta
      if (c.position.x > 5.5) {
        c.position.x = -5.5
      }
    })

    // 3. Rain particle animation
    if (this.rainParticles && this.rainParticles.visible && this.rainPositions) {
      const positions = this.rainParticles.geometry.attributes.position.array as Float32Array
      for (let i = 0; i < this.rainCount; i++) {
        positions[i * 3 + 1] -= delta * 5.0
        if (positions[i * 3 + 1] < 0.2) {
          positions[i * 3 + 1] = 5.0 + Math.random() * 0.5
        }
      }
      this.rainParticles.geometry.attributes.position.needsUpdate = true
    }
  }

  public dispose() {
    if (this.rainParticles) {
      this.rainParticles.geometry.dispose()
      ;(this.rainParticles.material as THREE.Material).dispose()
    }
    this.cloudsGroup.traverse(child => {
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose()
        if (Array.isArray(child.material)) {
          child.material.forEach(m => m.dispose())
        } else {
          child.material.dispose()
        }
      }
    })
    this.sunMesh.geometry.dispose()
    ;(this.sunMesh.material as THREE.Material).dispose()
    this.sunRaysMesh.geometry.dispose()
    ;(this.sunRaysMesh.material as THREE.Material).dispose()
  }
}
