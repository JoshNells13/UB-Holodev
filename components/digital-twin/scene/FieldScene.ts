import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import type { DigitalTwinData, FieldVisualState, HoverPlantInfo, WeatherVisualType } from '../types'
import { getFieldVisualState, getPlantStatusColor } from '../types'
import { createPlantInstance } from '../plants/PlantFactory'
import { WeatherEffects } from './WeatherEffects'

export class FieldScene {
  private container: HTMLElement
  private scene: THREE.Scene
  private camera: THREE.PerspectiveCamera
  private renderer: THREE.WebGLRenderer
  private controls: OrbitControls
  private weatherEffects: WeatherEffects

  private animFrameId: number | null = null
  private clock = new THREE.Clock()

  // Scene Objects
  private platformGroup: THREE.Group
  private baseMesh!: THREE.Mesh
  private soilMesh!: THREE.Mesh
  private waterMesh!: THREE.Mesh
  private canalMesh!: THREE.Mesh
  private plantsGroup: THREE.Group
  private decorGroup: THREE.Group

  // Lighting
  private dirLight!: THREE.DirectionalLight
  private hemiLight!: THREE.HemisphereLight

  // Interaction
  private raycaster = new THREE.Raycaster()
  private mouse = new THREE.Vector2(-999, -999)
  private hoveredMesh: THREE.Object3D | null = null
  private onHoverCallback?: (info: HoverPlantInfo | null) => void

  // State
  private currentData: DigitalTwinData | null = null
  private isTransitioning = false
  private transitionProgress = 1
  private plantScaleTarget = 1
  private plantCurrentScale = 1

  constructor(
    container: HTMLElement,
    initialData: DigitalTwinData,
    onHover?: (info: HoverPlantInfo | null) => void
  ) {
    this.container = container
    this.currentData = initialData
    this.onHoverCallback = onHover

    // 1. Scene setup
    this.scene = new THREE.Scene()
    this.scene.background = new THREE.Color(0xf1f5f9) // Soft light slate clean backdrop

    // 2. Camera setup
    const width = container.clientWidth || 600
    const height = container.clientHeight || 400
    this.camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100)
    this.camera.position.set(6.8, 6.2, 7.8)
    this.camera.lookAt(0, 0.4, 0)

    // 3. Renderer setup
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      alpha: true
    })
    this.renderer.setSize(width, height)
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping
    this.renderer.toneMappingExposure = 1.1

    this.container.appendChild(this.renderer.domElement)

    // 4. OrbitControls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement)
    this.controls.enableDamping = true
    this.controls.dampingFactor = 0.08
    this.controls.minDistance = 4.5
    this.controls.maxDistance = 16.0
    this.controls.maxPolarAngle = Math.PI / 2 - 0.08 // Prevent underground clipping
    this.controls.target.set(0, 0.4, 0)

    // 5. Lighting
    this.setupLighting()

    // 6. Platform Base & Soil
    this.platformGroup = new THREE.Group()
    this.plantsGroup = new THREE.Group()
    this.decorGroup = new THREE.Group()

    this.scene.add(this.platformGroup)
    this.scene.add(this.plantsGroup)
    this.scene.add(this.decorGroup)

    this.createPlatformBase()
    this.createPerimeterDecor()

    // 7. Weather system
    this.weatherEffects = new WeatherEffects(this.dirLight, this.hemiLight)
    this.scene.add(this.weatherEffects.group)

    // 8. Populate initial plants
    this.populatePlants(initialData)
    this.applyDataState(initialData, true)

    // 9. Event Listeners
    this.setupListeners()

    // 10. Start render loop
    this.animate = this.animate.bind(this)
    this.animate()
  }

  private setupLighting() {
    // Ambient / Hemisphere light for soft cartoon illumination
    this.hemiLight = new THREE.HemisphereLight(0xe0f2fe, 0xbbf7d0, 0.85)
    this.hemiLight.position.set(0, 20, 0)
    this.scene.add(this.hemiLight)

    // Main directional sunlight
    this.dirLight = new THREE.DirectionalLight(0xfff7ed, 1.3)
    this.dirLight.position.set(6, 12, 5)
    this.dirLight.castShadow = true
    this.dirLight.shadow.mapSize.width = 1024
    this.dirLight.shadow.mapSize.height = 1024
    this.dirLight.shadow.camera.near = 0.5
    this.dirLight.shadow.camera.far = 30
    this.dirLight.shadow.camera.left = -5
    this.dirLight.shadow.camera.right = 5
    this.dirLight.shadow.camera.top = 5
    this.dirLight.shadow.camera.bottom = -5
    this.dirLight.shadow.bias = -0.0005
    this.scene.add(this.dirLight)
  }

  private createPlatformBase() {
    // 1. Lower Earth / Subsoil layer (rounded rectangular block)
    const baseGeo = new THREE.BoxGeometry(5.4, 0.55, 4.4)
    baseGeo.translate(0, -0.275, 0)
    const baseMat = new THREE.MeshLambertMaterial({
      color: 0x3e2723, // Deep rich clay / bedrock
      flatShading: true
    })
    this.baseMesh = new THREE.Mesh(baseGeo, baseMat)
    this.baseMesh.receiveShadow = true
    this.platformGroup.add(this.baseMesh)

    // 2. Fertile Topsoil layer
    const soilGeo = new THREE.BoxGeometry(5.2, 0.22, 4.2)
    soilGeo.translate(0, 0.11, 0)
    const soilMat = new THREE.MeshLambertMaterial({
      color: 0x5c3d2e,
      flatShading: true
    })
    this.soilMesh = new THREE.Mesh(soilGeo, soilMat)
    this.soilMesh.receiveShadow = true
    this.platformGroup.add(this.soilMesh)

    // 3. Irrigation Water Canal along the side
    const canalGeo = new THREE.BoxGeometry(0.5, 0.15, 3.8)
    canalGeo.translate(2.15, 0.18, 0)
    const canalMat = new THREE.MeshLambertMaterial({
      color: 0x334155,
      flatShading: true
    })
    this.canalMesh = new THREE.Mesh(canalGeo, canalMat)
    this.platformGroup.add(this.canalMesh)

    // Translucent water surface inside canal
    const waterGeo = new THREE.BoxGeometry(0.42, 0.1, 3.7)
    waterGeo.translate(2.15, 0.19, 0)
    const waterMat = new THREE.MeshLambertMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.85,
      flatShading: true
    })
    this.waterMesh = new THREE.Mesh(waterGeo, waterMat)
    this.platformGroup.add(this.waterMesh)

    // 4. Stylized planting furrows / raised beds
    const bedCount = 5
    for (let r = 0; r < bedCount; r++) {
      const zPos = -1.5 + r * 0.75
      const furrowGeo = new THREE.BoxGeometry(3.6, 0.06, 0.55)
      furrowGeo.translate(-0.35, 0.23, zPos)
      const furrowMat = new THREE.MeshLambertMaterial({
        color: 0x4e342e,
        flatShading: true
      })
      const furrow = new THREE.Mesh(furrowGeo, furrowMat)
      furrow.receiveShadow = true
      this.platformGroup.add(furrow)
    }
  }

  private createPerimeterDecor() {
    // Stylized low-poly trees at platform corners
    const treePositions = [
      { x: -2.3, z: -1.8, scale: 0.85 },
      { x: -2.3, z: 1.8, scale: 0.75 },
      { x: 2.3, z: -1.8, scale: 0.7 },
      { x: 2.3, z: 1.8, scale: 0.8 }
    ]

    const trunkGeo = new THREE.CylinderGeometry(0.06, 0.09, 0.45, 5)
    trunkGeo.translate(0, 0.225, 0)
    const trunkMat = new THREE.MeshLambertMaterial({ color: 0x5c3a21, flatShading: true })

    const foliageGeo = new THREE.ConeGeometry(0.35, 0.75, 5)
    foliageGeo.translate(0, 0.65, 0)
    const foliageMat = new THREE.MeshLambertMaterial({ color: 0x15803d, flatShading: true })

    treePositions.forEach(pos => {
      const tree = new THREE.Group()
      tree.position.set(pos.x, 0.22, pos.z)
      tree.scale.setScalar(pos.scale)

      const trunk = new THREE.Mesh(trunkGeo, trunkMat)
      trunk.castShadow = true
      tree.add(trunk)

      const f1 = new THREE.Mesh(foliageGeo, foliageMat)
      f1.castShadow = true
      tree.add(f1)

      const f2 = new THREE.Mesh(foliageGeo, foliageMat)
      f2.position.set(0, 0.25, 0)
      f2.scale.setScalar(0.75)
      f2.castShadow = true
      tree.add(f2)

      this.decorGroup.add(tree)
    })
  }

  private populatePlants(data: DigitalTwinData) {
    // Clear existing plants
    while (this.plantsGroup.children.length > 0) {
      const obj = this.plantsGroup.children[0]
      this.plantsGroup.remove(obj)
      this.disposeObject(obj)
    }

    const cropSlug = typeof data.crop === 'string' ? data.crop : data.crop.slug
    const visualState = getFieldVisualState(data.overallScore)

    // Arrange plants in 5 rows x 10 columns = 50 plants
    const rows = 5
    const cols = 10
    const startX = -1.9
    const endX = 1.2
    const startZ = -1.5
    const endZ = 1.5

    for (let r = 0; r < rows; r++) {
      const z = startZ + (r / (rows - 1)) * (endZ - startZ)
      for (let c = 0; c < cols; c++) {
        const x = startX + (c / (cols - 1)) * (endX - startX)
        
        // Slight random jitter for organic look
        const jitterX = (Math.random() - 0.5) * 0.05
        const jitterZ = (Math.random() - 0.5) * 0.05

        const plant = createPlantInstance(cropSlug, visualState)
        plant.position.set(x + jitterX, 0.25, z + jitterZ)
        plant.rotation.y = Math.random() * Math.PI * 2

        // Store metadata for hover interaction
        plant.userData = {
          isPlant: true,
          row: r + 1,
          col: c + 1,
          cropSlug,
          cropName: typeof data.crop === 'string' ? data.crop : data.crop.name
        }

        // Enable shadow casting
        plant.traverse(child => {
          if (child instanceof THREE.Mesh) {
            child.castShadow = true
            child.receiveShadow = true
          }
        })

        this.plantsGroup.add(plant)
      }
    }
  }

  public updateData(newData: DigitalTwinData, smoothTransition = true) {
    this.currentData = newData
    const visualState = getFieldVisualState(newData.overallScore)

    if (smoothTransition) {
      // Scale down current plants, re-populate, scale up
      this.isTransitioning = true
      this.transitionProgress = 0
      this.plantScaleTarget = 0

      setTimeout(() => {
        this.populatePlants(newData)
        this.applyDataState(newData)
        this.plantScaleTarget = 1
        this.plantCurrentScale = 0.05
        this.plantsGroup.scale.setScalar(0.05)
        this.isTransitioning = false
      }, 250)
    } else {
      this.populatePlants(newData)
      this.applyDataState(newData)
      this.plantsGroup.scale.setScalar(1)
    }
  }

  private applyDataState(data: DigitalTwinData, immediate = false) {
    const visualState = getFieldVisualState(data.overallScore)
    const colors = getPlantStatusColor(visualState)

    // 1. Soil Tint
    if (this.soilMesh && this.soilMesh.material instanceof THREE.MeshLambertMaterial) {
      this.soilMesh.material.color.setHex(colors.soilTint)
    }

    // 2. Water Canal & Table
    const waterScore = data.waterScore ?? 80
    const waterReq = typeof data.crop !== 'string' ? (data.crop.water_requirement_mm || 400) : 400
    
    if (this.waterMesh && this.waterMesh.material instanceof THREE.MeshLambertMaterial) {
      if (waterScore >= 70) {
        this.waterMesh.scale.set(1, 1.2, 1)
        this.waterMesh.material.opacity = 0.9
        this.waterMesh.material.color.setHex(0x38bdf8) // clear bright blue
      } else if (waterScore >= 45) {
        this.waterMesh.scale.set(1, 0.8, 1)
        this.waterMesh.material.opacity = 0.7
        this.waterMesh.material.color.setHex(0x60a5fa)
      } else {
        this.waterMesh.scale.set(1, 0.35, 1)
        this.waterMesh.material.opacity = 0.4
        this.waterMesh.material.color.setHex(0x94a3b8) // dried ditch
      }
    }

    // 3. Auto Weather selection based on risk and rainfall
    const weatherRisk = data.weatherRiskLevel || 'LOW'
    const rainfall = data.precipitation ?? data.rainfall ?? 0

    let weatherType: WeatherVisualType = 'sunny'
    if (rainfall > 30 || (weatherRisk === 'HIGH' && rainfall > 15)) {
      weatherType = 'rain'
    } else if (data.waterScore && data.waterScore < 45 && rainfall < 5) {
      weatherType = 'drought'
    }

    this.weatherEffects.setWeather(weatherType, immediate)
  }

  public setWeatherMode(mode: 'auto' | 'sunny' | 'rain' | 'drought') {
    if (mode === 'auto') {
      if (this.currentData) this.applyDataState(this.currentData)
    } else {
      this.weatherEffects.setWeather(mode)
    }
  }

  public resetCamera() {
    this.controls.target.set(0, 0.4, 0)
    this.camera.position.set(6.8, 6.2, 7.8)
    this.camera.lookAt(0, 0.4, 0)
    this.controls.update()
  }

  public setAutoRotate(enabled: boolean) {
    this.controls.autoRotate = enabled
    this.controls.autoRotateSpeed = 1.2
  }

  private setupListeners() {
    const dom = this.renderer.domElement

    const onPointerMove = (e: MouseEvent) => {
      const rect = dom.getBoundingClientRect()
      this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
      this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1

      this.checkIntersection(e.clientX, e.clientY)
    }

    const onPointerLeave = () => {
      this.mouse.x = -999
      this.mouse.y = -999
      if (this.hoveredMesh) {
        this.hoveredMesh.scale.setScalar(1.0)
        this.hoveredMesh = null
      }
      if (this.onHoverCallback) this.onHoverCallback(null)
    }

    dom.addEventListener('mousemove', onPointerMove, { passive: true })
    dom.addEventListener('mouseleave', onPointerLeave, { passive: true })
  }

  private checkIntersection(clientX: number, clientY: number) {
    if (!this.onHoverCallback || !this.currentData) return

    this.raycaster.setFromCamera(this.mouse, this.camera)
    const intersects = this.raycaster.intersectObjects(this.plantsGroup.children, true)

    if (intersects.length > 0) {
      let topPlant: THREE.Object3D | null = intersects[0].object
      while (topPlant && topPlant.parent !== this.plantsGroup) {
        topPlant = topPlant.parent
      }

      if (topPlant && topPlant !== this.hoveredMesh) {
        if (this.hoveredMesh) this.hoveredMesh.scale.setScalar(1.0)
        this.hoveredMesh = topPlant
        this.hoveredMesh.scale.setScalar(1.18) // subtle pop

        const cropName = typeof this.currentData.crop === 'string' ? this.currentData.crop : this.currentData.crop.name
        const cropSlug = typeof this.currentData.crop === 'string' ? this.currentData.crop : this.currentData.crop.slug
        const waterReq = typeof this.currentData.crop !== 'string' ? (this.currentData.crop.water_requirement_mm || 450) : 450
        const growthDays = typeof this.currentData.crop !== 'string' ? (this.currentData.crop.growth_days_max || 115) : 115

        this.onHoverCallback({
          cropName,
          cropSlug,
          stage: 'Fase Vegetatif Aktif',
          growthDays,
          waterRequirementMm: waterReq,
          healthStatus: getFieldVisualState(this.currentData.overallScore).toUpperCase(),
          score: this.currentData.overallScore,
          plantingDate: this.currentData.plantingDate,
          x: clientX,
          y: clientY,
          visible: true
        })
      }
    } else {
      if (this.hoveredMesh) {
        this.hoveredMesh.scale.setScalar(1.0)
        this.hoveredMesh = null
        this.onHoverCallback(null)
      }
    }
  }

  public handleResize() {
    if (!this.container || !this.renderer || !this.camera) return
    const width = this.container.clientWidth
    const height = this.container.clientHeight
    if (width === 0 || height === 0) return

    this.camera.aspect = width / height
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(width, height)
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
  }

  private animate() {
    this.animFrameId = requestAnimationFrame(this.animate)

    const delta = this.clock.getDelta()

    // 1. Update controls
    this.controls.update()

    // 2. Weather animations
    this.weatherEffects.update(delta)

    // 3. Smooth transition scaling
    if (this.plantCurrentScale !== this.plantScaleTarget) {
      this.plantCurrentScale += (this.plantScaleTarget - this.plantCurrentScale) * 0.18
      this.plantsGroup.scale.setScalar(this.plantCurrentScale)
    }

    // 4. Render
    this.renderer.render(this.scene, this.camera)
  }

  private disposeObject(obj: THREE.Object3D) {
    obj.traverse(child => {
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose()
        if (Array.isArray(child.material)) {
          child.material.forEach(m => m.dispose())
        } else {
          child.material.dispose()
        }
      }
    })
  }

  public dispose() {
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId)
    }

    this.weatherEffects.dispose()

    this.scene.traverse(child => {
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose()
        if (Array.isArray(child.material)) {
          child.material.forEach(m => m.dispose())
        } else {
          child.material.dispose()
        }
      }
    })

    this.controls.dispose()
    this.renderer.dispose()

    if (this.container && this.renderer.domElement && this.renderer.domElement.parentNode === this.container) {
      this.container.removeChild(this.renderer.domElement)
    }
  }
}
