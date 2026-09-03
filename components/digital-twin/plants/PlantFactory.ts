import * as THREE from 'three'
import type { FieldVisualState } from '../types'
import { createRicePlant } from './RicePlant'
import { createCornPlant } from './CornPlant'
import { createSoybeanPlant } from './SoybeanPlant'
import { createChiliPlant } from './ChiliPlant'
import { createGenericPlant } from './GenericPlant'

export function createPlantInstance(
  cropSlug: string,
  visualState: FieldVisualState = 'healthy'
): THREE.Group {
  const normalized = (cropSlug || '').toLowerCase().trim()

  if (normalized.includes('padi') || normalized.includes('rice')) {
    return createRicePlant(visualState)
  }
  if (normalized.includes('jagung') || normalized.includes('corn')) {
    return createCornPlant(visualState)
  }
  if (normalized.includes('kedelai') || normalized.includes('soybean') || normalized.includes('kacang')) {
    return createSoybeanPlant(visualState)
  }
  if (normalized.includes('cabai') || normalized.includes('chili') || normalized.includes('cabe')) {
    return createChiliPlant(visualState)
  }

  return createGenericPlant(visualState, normalized)
}
