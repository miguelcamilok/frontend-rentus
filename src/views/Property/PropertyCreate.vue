<template>
  <div class="create-property-page">
    <!-- Background animado -->
    <div class="page-background">
      <div class="gradient-orb orb-1"></div>
      <div class="gradient-orb orb-2"></div>
      <div class="gradient-orb orb-3"></div>
    </div>

    <!-- Contenido principal -->
    <main class="property-container">
      <!-- Hero Section -->
      <div class="hero-section">
        <div class="hero-content">
          <h1 class="page-title">
            <font-awesome-icon :icon="['fas', 'home']" />
            {{ t('property.create.title') }}
          </h1>
          <p class="page-subtitle">{{ t('property.create.subtitle') }}</p>
        </div>
      </div>

      <!-- Alertas -->
      <Transition name="alert">
        <div v-if="success" class="alert alert-success">
          <font-awesome-icon :icon="['fas', 'check-circle']" />
          <span>{{ t('property.create.success') }}</span>
        </div>
      </Transition>

      <Transition name="alert">
        <div v-if="errorMessage" class="alert alert-error">
          <font-awesome-icon :icon="['fas', 'exclamation-circle']" />
          <span>{{ errorMessage }}</span>
        </div>
      </Transition>

      <!-- Formulario -->
      <div class="form-wrapper">
        <form @submit.prevent="openLocationModal">
          <!-- Información Básica -->
          <div class="content-section">
            <div class="section-header">
              <h3>
                <font-awesome-icon :icon="['fas', 'info-circle']" />
                {{ t('property.create.basicInfo') }}
              </h3>
            </div>

            <div class="form-grid">
              <div class="form-group full-width">
                <label for="title">
                  {{ t('property.fields.title') }}
                  <span class="required">*</span>
                </label>
                <input
                  id="title"
                  v-model="form.title"
                  type="text"
                  :placeholder="t('property.placeholders.title')"
                  maxlength="255"
                  required
                />
              </div>

              <div class="form-group full-width">
                <label for="description">
                  {{ t('property.fields.description') }}
                  <span class="required">*</span>
                </label>
                <textarea
                  id="description"
                  v-model="form.description"
                  rows="5"
                  :placeholder="t('property.placeholders.description')"
                  required
                ></textarea>
              </div>

              <div class="form-group">
                <label for="status">{{ t('property.fields.status') }}</label>
                <select id="status" v-model="form.status">
                  <option value="available">{{ t('property.status.available') }}</option>
                  <option value="rented">{{ t('property.status.rented') }}</option>
                  <option value="maintenance">{{ t('property.status.maintenance') }}</option>
                </select>
              </div>

              <div class="form-group">
                <label for="publication_date">{{ t('property.fields.publicationDate') }}</label>
                <input
                  id="publication_date"
                  v-model="form.publication_date"
                  type="date"
                />
              </div>
            </div>
          </div>

          <!-- Ubicación -->
          <div class="content-section">
            <div class="section-header">
              <h3>
                <font-awesome-icon :icon="['fas', 'map-marker-alt']" />
                {{ t('property.create.location') }}
              </h3>
            </div>

            <div class="form-grid">
              <div class="form-group">
                <label for="address">
                  {{ t('property.fields.address') }}
                  <span class="required">*</span>
                </label>
                <input
                  id="address"
                  v-model="form.address"
                  type="text"
                  :placeholder="t('property.placeholders.address')"
                  required
                />
              </div>

              <div class="form-group">
                <label for="city">{{ t('property.fields.city') }}</label>
                <input
                  id="city"
                  v-model="form.city"
                  type="text"
                  :placeholder="t('property.placeholders.city')"
                  maxlength="120"
                />
              </div>
            </div>

            <div class="info-banner">
              <font-awesome-icon :icon="['fas', 'lightbulb']" />
              <span>Podrás seleccionar la ubicación exacta en el mapa en el siguiente paso</span>
            </div>
          </div>

          <!-- Características -->
          <div class="content-section">
            <div class="section-header">
              <h3>
                <font-awesome-icon :icon="['fas', 'sliders-h']" />
                {{ t('property.create.features') }}
              </h3>
            </div>

            <div class="form-grid">
              <div class="form-group">
                <label for="monthly_price">
                  {{ t('property.fields.monthlyPrice') }}
                  <span class="required">*</span>
                </label>
                <div class="input-group">
                  <span class="input-addon">$</span>
                  <input
                    id="monthly_price"
                    v-model="displayPrice"
                    type="text"
                    :placeholder="t('property.placeholders.price')"
                    required
                    @input="handlePriceInput"
                    @blur="formatPriceOnBlur"
                  />
                </div>
                <span class="help-text">{{ formattedPrice }}</span>
              </div>

              <div class="form-group">
                <label for="area_m2">{{ t('property.fields.area') }}</label>
                <div class="input-group">
                  <input
                    id="area_m2"
                    v-model.number="form.area_m2"
                    type="number"
                    step="0.01"
                    min="0"
                    :placeholder="t('property.placeholders.area')"
                  />
                  <span class="input-addon">m²</span>
                </div>
              </div>

              <div class="form-group">
                <label for="num_bedrooms">{{ t('property.fields.bedrooms') }}</label>
                <div class="input-with-icon">
                  <font-awesome-icon :icon="['fas', 'bed']" class="input-icon" />
                  <input
                    id="num_bedrooms"
                    v-model.number="form.num_bedrooms"
                    type="number"
                    min="0"
                    :placeholder="t('property.placeholders.bedrooms')"
                  />
                </div>
              </div>

              <div class="form-group">
                <label for="num_bathrooms">{{ t('property.fields.bathrooms') }}</label>
                <div class="input-with-icon">
                  <font-awesome-icon :icon="['fas', 'bath']" class="input-icon" />
                  <input
                    id="num_bathrooms"
                    v-model.number="form.num_bathrooms"
                    type="number"
                    min="0"
                    :placeholder="t('property.placeholders.bathrooms')"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- ✅ SERVICIOS INCLUIDOS — ahora con checkboxes -->
          <div class="content-section">
            <div class="section-header">
              <h3>
                <font-awesome-icon :icon="['fas', 'check-square']" />
                {{ t('property.create.services') }}
              </h3>
              <p class="section-description">
                Selecciona los servicios que están incluidos en el arriendo
              </p>
            </div>

            <div class="services-checklist">
              <label
                v-for="service in AVAILABLE_SERVICES"
                :key="service.value"
                class="service-checkbox-item"
                :class="{ 'is-checked': form.included_services.includes(service.value) }"
              >
                <input
                  type="checkbox"
                  :value="service.value"
                  v-model="form.included_services"
                  class="service-hidden-checkbox"
                />
                <span class="service-check-icon">
                  <font-awesome-icon
                    :icon="form.included_services.includes(service.value)
                      ? ['fas', 'check-circle']
                      : ['far', 'circle']"
                  />
                </span>
                <span class="service-emoji">{{ service.emoji }}</span>
                <span class="service-name">{{ t(service.labelKey) }}</span>
              </label>
            </div>

            <!-- Resumen de seleccionados -->
            <div v-if="form.included_services.length > 0" class="services-summary">
              <span class="summary-label">
                <font-awesome-icon :icon="['fas', 'check']" />
                {{ form.included_services.length }}
                {{ form.included_services.length === 1 ? 'servicio seleccionado' : 'servicios seleccionados' }}
              </span>
              <button type="button" class="btn-clear-services" @click="form.included_services = []">
                Limpiar selección
              </button>
            </div>
            <div v-else class="services-empty-hint">
              <font-awesome-icon :icon="['fas', 'info-circle']" />
              <span>Ningún servicio seleccionado — opcional</span>
            </div>
          </div>
          <!-- ✅ FIN SERVICIOS -->

          <!-- Imágenes -->
          <div class="content-section">
            <div class="section-header">
              <h3>
                <font-awesome-icon :icon="['fas', 'images']" />
                Imágenes de la Propiedad
              </h3>
              <p class="section-description">
                Sube hasta 10 imágenes en formato JPG, PNG o WEBP (máx. 2MB cada una)
              </p>
            </div>

            <div class="image-upload-section">
              <input
                ref="fileInput"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                class="file-input-hidden"
                @change="handleImageSelection"
              />

              <div
                class="upload-dropzone"
                :class="{ 'is-dragging': isDragging }"
                @click="triggerFileInput"
                @dragover.prevent="isDragging = true"
                @dragleave.prevent="isDragging = false"
                @drop.prevent="handleDrop"
              >
                <div class="dropzone-content">
                  <font-awesome-icon :icon="['fas', 'cloud-upload-alt']" class="upload-icon" />
                  <h4>Arrastra imágenes aquí o haz clic para seleccionar</h4>
                  <p class="upload-hint">
                    JPG, PNG, WEBP hasta 2MB | {{ images.length }}/10 imágenes
                  </p>
                </div>
              </div>

              <div v-if="uploadProgress > 0 && uploadProgress < 100" class="upload-progress">
                <div class="progress-bar" :style="{ width: uploadProgress + '%' }"></div>
                <span class="progress-text">{{ uploadProgress }}%</span>
              </div>
            </div>

            <TransitionGroup name="image-list" tag="div" class="images-grid">
              <div
                v-for="(image, index) in images"
                :key="image.id"
                class="image-card"
                :class="{ 'is-main': index === 0 }"
              >
                <div class="image-preview">
                  <img :src="image.preview" :alt="`Imagen ${index + 1}`" />
                  <div v-if="index === 0" class="main-badge">
                    <font-awesome-icon :icon="['fas', 'star']" />
                    Principal
                  </div>
                  <div class="image-overlay">
                    <button
                      v-if="index !== 0"
                      type="button"
                      @click="setAsMain(index)"
                      class="btn-overlay"
                      title="Establecer como principal"
                    >
                      <font-awesome-icon :icon="['fas', 'star']" />
                    </button>
                    <button
                      type="button"
                      @click="removeImage(index)"
                      class="btn-overlay btn-danger"
                      title="Eliminar imagen"
                    >
                      <font-awesome-icon :icon="['fas', 'trash']" />
                    </button>
                  </div>
                </div>
                <div class="image-info">
                  <span class="image-number">#{{ index + 1 }}</span>
                  <span class="image-size">{{ formatFileSize(image.size) }}</span>
                </div>
              </div>
            </TransitionGroup>

            <div v-if="images.length === 0" class="empty-images">
              <font-awesome-icon :icon="['fas', 'image']" class="empty-icon" />
              <h4>No hay imágenes</h4>
              <p>Agrega fotos para que tu propiedad sea más atractiva</p>
            </div>
          </div>

          <!-- Botones de acción -->
          <div class="form-actions">
            <button
              type="button"
              @click="cancelForm"
              class="btn-secondary"
              :disabled="loading"
            >
              <font-awesome-icon :icon="['fas', 'times']" />
              <span>{{ t('common.cancel') }}</span>
            </button>
            <button
              type="submit"
              class="btn-primary"
              :disabled="loading || images.length === 0"
            >
              <font-awesome-icon
                :icon="loading ? ['fas', 'spinner'] : ['fas', 'map-marker-alt']"
                :spin="loading"
              />
              <span>{{ loading ? 'Procesando...' : 'Continuar a Ubicación →' }}</span>
            </button>
          </div>
        </form>
      </div>
    </main>

    <!-- Modal de ubicación -->
    <PropertyLocationModal
      :show="showLocationModal"
      :property-data="{
        title: form.title,
        city: form.city,
        address: form.address
      }"
      @confirm="handleLocationConfirm"
      @close="handleLocationCancel"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import api from '../../services/api'
import { useAlerts } from '../../composables/useAlerts'
import { useI18n } from 'vue-i18n'
import PropertyLocationModal from '../../admin/components/Properties/PropertyLocationModal.vue'

// ==================== INTERFACES ====================
interface PropertyImage {
  id: string
  file: File
  preview: string
  base64: string
  size: number
}

interface PropertyForm {
  title: string
  description: string
  address: string
  city: string
  status: string
  monthly_price: number
  area_m2: number | null
  num_bedrooms: number | null
  num_bathrooms: number | null
  included_services: string[]   // ← ahora se llena con checkboxes
  publication_date: string
}

// ==================== SERVICIOS DISPONIBLES ====================
// Lista centralizada — mismos valores que EditProperty.vue usa en selectedServices
const AVAILABLE_SERVICES = [
  { value: 'water',       emoji: '💧', labelKey: 'editProperty.services.water' },
  { value: 'electricity', emoji: '⚡', labelKey: 'editProperty.services.electricity' },
  { value: 'gas',         emoji: '🔥', labelKey: 'editProperty.services.gas' },
  { value: 'internet',    emoji: '🌐', labelKey: 'editProperty.services.internet' },
  { value: 'cableTv',     emoji: '📺', labelKey: 'editProperty.services.cableTv' },
  { value: 'security',    emoji: '🔒', labelKey: 'editProperty.services.security' },
  { value: 'parking',     emoji: '🚗', labelKey: 'editProperty.services.parking' },
  { value: 'gym',         emoji: '🏋️', labelKey: 'editProperty.services.gym' },
  { value: 'pool',        emoji: '🏊', labelKey: 'editProperty.services.pool' },
  { value: 'bbqArea',     emoji: '🍖', labelKey: 'editProperty.services.bbqArea' },
  { value: 'laundry',     emoji: '👕', labelKey: 'editProperty.services.laundry' },
  { value: 'elevator',    emoji: '🛗', labelKey: 'editProperty.services.elevator' },
]

// ==================== COMPOSABLES ====================
const { t } = useI18n()
const router = useRouter()
const { success: successAlert, error: errorAlert, confirm } = useAlerts()

// ==================== STATE ====================
const form = ref<PropertyForm>({
  title: '',
  description: '',
  address: '',
  city: '',
  status: 'available',
  monthly_price: 0,
  area_m2: null,
  num_bedrooms: null,
  num_bathrooms: null,
  included_services: [],  // ← array de valores, e.g. ['water', 'gas']
  publication_date: '',
})

const images = ref<PropertyImage[]>([])
const fileInput = ref<HTMLInputElement | null>(null)
const displayPrice = ref('')
const loading = ref(false)
const errorMessage = ref('')
const success = ref(false)
const showLocationModal = ref(false)
const isDragging = ref(false)
const uploadProgress = ref(0)

// ==================== COMPUTED ====================
const formattedPrice = computed(() => {
  if (!form.value.monthly_price || form.value.monthly_price === 0) return 'COP $0'
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(form.value.monthly_price)
})

// ==================== PRECIO ====================
const formatNumber = (value: number): string => {
  if (!value) return ''
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

const handlePriceInput = (event: Event) => {
  const input = event.target as HTMLInputElement
  const value = input.value.replace(/[^\d]/g, '')
  const numericValue = parseInt(value) || 0
  form.value.monthly_price = numericValue
  displayPrice.value = formatNumber(numericValue)
  setTimeout(() => {
    input.setSelectionRange(displayPrice.value.length, displayPrice.value.length)
  }, 0)
}

const formatPriceOnBlur = () => {
  displayPrice.value = form.value.monthly_price > 0
    ? formatNumber(form.value.monthly_price)
    : ''
}

// ==================== IMÁGENES (sin cambios) ====================
const triggerFileInput = () => fileInput.value?.click()

const handleImageSelection = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const files = Array.from(target.files || [])
  await processFiles(files)
  if (fileInput.value) fileInput.value.value = ''
}

const handleDrop = async (event: DragEvent) => {
  isDragging.value = false
  const files = Array.from(event.dataTransfer?.files || [])
  await processFiles(files)
}

const processFiles = async (files: File[]) => {
  if (files.length === 0) return
  if (images.value.length + files.length > 10) {
    errorAlert('Máximo 10 imágenes permitidas', 'Límite alcanzado')
    return
  }
  uploadProgress.value = 0
  const totalFiles = files.length
  let processedFiles = 0

  for (const file of files) {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!validTypes.includes(file.type)) {
      errorAlert(`${file.name}: Formato no válido (usa JPG, PNG o WEBP)`, 'Error')
      continue
    }
    if (file.size > 2 * 1024 * 1024) {
      errorAlert(`${file.name}: Tamaño máximo 2MB (actual: ${formatFileSize(file.size)})`, 'Error')
      continue
    }
    try {
      const base64 = await compressAndConvertToBase64(file)
      const preview = URL.createObjectURL(file)
      images.value.push({ id: `${Date.now()}-${Math.random()}`, file, preview, base64, size: file.size })
      processedFiles++
      uploadProgress.value = Math.round((processedFiles / totalFiles) * 100)
    } catch (error) {
      errorAlert(`Error procesando ${file.name}`, 'Error')
    }
  }
  setTimeout(() => { uploadProgress.value = 0 }, 1000)
}

const compressAndConvertToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        if (!ctx) { reject(new Error('No canvas context')); return }
        const maxDim = 1920
        let { width, height } = img
        if (width > height ? width > maxDim : height > maxDim) {
          if (width > height) { height *= maxDim / width; width = maxDim }
          else { width *= maxDim / height; height = maxDim }
        }
        canvas.width = width; canvas.height = height
        ctx.drawImage(img, 0, 0, width, height)
        resolve(canvas.toDataURL('image/jpeg', 0.8))
      }
      img.onerror = () => reject(new Error('Error loading image'))
      img.src = e.target?.result as string
    }
    reader.onerror = () => reject(new Error('Error reading file'))
    reader.readAsDataURL(file)
  })
}

const removeImage = (index: number) => {
  URL.revokeObjectURL(images.value[index].preview)
  images.value.splice(index, 1)
}

const setAsMain = (index: number) => {
  const image = images.value.splice(index, 1)[0]
  images.value.unshift(image)
}

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

// ==================== FORMULARIO ====================
const cancelForm = () => {
  confirm(
    t('property.create.confirmCancel'),
    () => {
      images.value.forEach(img => URL.revokeObjectURL(img.preview))
      router.back()
    },
    () => {},
    { title: t('property.create.cancelTitle'), confirmText: t('common.yes'), cancelText: t('common.no') }
  )
}

const openLocationModal = () => {
  if (!form.value.title || !form.value.description || !form.value.address) {
    errorAlert('Por favor completa todos los campos requeridos', 'Campos incompletos')
    return
  }
  if (!form.value.monthly_price || form.value.monthly_price === 0) {
    errorAlert('Por favor ingresa el precio mensual', 'Precio requerido')
    return
  }
  if (images.value.length === 0) {
    errorAlert('Por favor agrega al menos una imagen', 'Imagen requerida')
    return
  }
  showLocationModal.value = true
}

const handleLocationConfirm = async (locationData: { lat: number; lng: number; accuracy: number }) => {
  loading.value = true
  errorMessage.value = ''
  success.value = false

  try {
    const imagesBase64 = images.value.map(img => img.base64)

    const payload = {
      title: form.value.title,
      description: form.value.description,
      address: form.value.address,
      city: form.value.city || null,
      status: form.value.status,
      monthly_price: form.value.monthly_price,
      area_m2: form.value.area_m2 || null,
      num_bedrooms: form.value.num_bedrooms || null,
      num_bathrooms: form.value.num_bathrooms || null,
      // ← se envía igual que EditProperty: JSON.stringify del array de valores
      included_services: form.value.included_services.length > 0
        ? JSON.stringify(form.value.included_services)
        : null,
      publication_date: form.value.publication_date || null,
      lat: locationData.lat,
      lng: locationData.lng,
      accuracy: locationData.accuracy,
      images: JSON.stringify(imagesBase64)
    }

    await api.post('/properties', payload)

    success.value = true
    successAlert(t('property.create.successMessage'), t('property.create.successTitle'))
    showLocationModal.value = false
    images.value.forEach(img => URL.revokeObjectURL(img.preview))

    setTimeout(() => router.push('/propiedades'), 1500)

  } catch (err: any) {
    if (err.response?.data?.errors) {
      const errors = Object.values(err.response.data.errors).flat() as string[]
      errorMessage.value = errors.join(', ')
    } else if (err.response?.data?.message) {
      errorMessage.value = err.response.data.message
    } else {
      errorMessage.value = t('property.create.errorMessage')
    }
    errorAlert(errorMessage.value, t('property.create.errorTitle'))
  } finally {
    loading.value = false
  }
}

const handleLocationCancel = () => {
  showLocationModal.value = false
}
</script>

<style scoped>
@import "../../assets/css/Properties/PropertyCreate.css";

/* ==================== IMÁGENES (sin cambios) ==================== */
.file-input-hidden { display: none; }

.image-upload-section { margin-bottom: 2rem; }

.upload-dropzone {
  border: 2px dashed #cbd5e1;
  border-radius: 16px;
  padding: 3rem 2rem;
  text-align: center;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.upload-dropzone:hover,
.upload-dropzone.is-dragging {
  border-color: #3b251d;
  background: linear-gradient(135deg, #fff 0%, #f8fafc 100%);
  transform: translateY(-2px);
  box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1);
}
.dropzone-content { pointer-events: none; }
.upload-icon { font-size: 3rem; color: #8b6f47; margin-bottom: 1rem; }
.upload-dropzone h4 { font-size: 1.125rem; font-weight: 600; color: #1e293b; margin-bottom: 0.5rem; }
.upload-hint { font-size: 0.875rem; color: #64748b; }

.upload-progress {
  position: relative; height: 8px; background: #e2e8f0;
  border-radius: 4px; margin-top: 1rem; overflow: hidden;
}
.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #3b251d 0%, #8b6f47 100%);
  transition: width 0.3s ease;
}
.progress-text {
  position: absolute; top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  font-size: 0.75rem; font-weight: 700; color: #1e293b;
}

.images-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1.5rem; margin-top: 2rem;
}
.image-card {
  position: relative; border-radius: 16px; overflow: hidden;
  background: #fff;
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.image-card.is-main { box-shadow: 0 0 0 3px #3b251d, 0 10px 15px -3px rgba(0,0,0,0.2); }
.image-card:hover { transform: translateY(-4px); box-shadow: 0 10px 25px -5px rgba(0,0,0,0.2); }
.image-preview { position: relative; aspect-ratio: 4/3; overflow: hidden; }
.image-preview img { width: 100%; height: 100%; object-fit: cover; }
.main-badge {
  position: absolute; top: 0.75rem; left: 0.75rem;
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  color: #1e293b; padding: 0.375rem 0.75rem; border-radius: 8px;
  font-size: 0.75rem; font-weight: 700; display: flex; align-items: center;
  gap: 0.375rem; box-shadow: 0 2px 8px rgba(0,0,0,0.2);
}
.image-overlay {
  position: absolute; inset: 0; background: rgba(0,0,0,0.6);
  display: flex; align-items: center; justify-content: center;
  gap: 0.75rem; opacity: 0; transition: opacity 0.3s ease;
}
.image-card:hover .image-overlay { opacity: 1; }
.btn-overlay {
  display: flex; align-items: center; justify-content: center;
  width: 40px; height: 40px; background: rgba(255,255,255,0.95);
  color: #1e293b; border: none; border-radius: 50%; cursor: pointer;
  transition: all 0.3s ease; font-size: 1rem;
}
.btn-overlay:hover { transform: scale(1.1); background: #fff; }
.btn-overlay.btn-danger { background: rgba(220,38,38,0.95); color: #fff; }
.btn-overlay.btn-danger:hover { background: #dc2626; }
.image-info {
  display: flex; justify-content: space-between; align-items: center;
  padding: 0.75rem; background: #f8fafc; border-top: 1px solid #e2e8f0;
}
.image-number { font-size: 0.875rem; font-weight: 700; color: #3b251d; }
.image-size { font-size: 0.75rem; color: #64748b; }
.empty-images {
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; gap: 1rem; padding: 4rem 2rem;
  border: 2px dashed #e2e8f0; border-radius: 16px;
  background: #f8fafc; text-align: center;
}
.empty-icon { font-size: 4rem; color: #cbd5e1; }
.empty-images h4 { font-size: 1.125rem; font-weight: 600; color: #475569; margin: 0; }
.empty-images p { font-size: 0.875rem; color: #94a3b8; margin: 0; }

/* ==================== SERVICIOS CON CHECKBOXES ==================== */

.services-checklist {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 0.75rem;
  margin-bottom: 1.25rem;
}

.service-checkbox-item {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0.75rem 1rem;
  border: 1.5px solid #e2e8f0;
  border-radius: 12px;
  cursor: pointer;
  background: #f8fafc;
  transition: all 0.2s ease;
  user-select: none;
}

.service-checkbox-item:hover {
  border-color: #8b6f47;
  background: #fff;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.08);
}

.service-checkbox-item.is-checked {
  border-color: #3b251d;
  background: linear-gradient(135deg, #fdf8f5 0%, #f5ece6 100%);
  box-shadow: 0 0 0 2px rgba(59, 37, 29, 0.12);
}

/* Ocultar el checkbox nativo */
.service-hidden-checkbox {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
  pointer-events: none;
}

.service-check-icon {
  font-size: 1rem;
  color: #cbd5e1;
  flex-shrink: 0;
  transition: color 0.2s;
}

.service-checkbox-item.is-checked .service-check-icon {
  color: #3b251d;
}

.service-emoji {
  font-size: 1.125rem;
  flex-shrink: 0;
}

.service-name {
  font-size: 0.875rem;
  font-weight: 500;
  color: #475569;
  line-height: 1.2;
}

.service-checkbox-item.is-checked .service-name {
  color: #1e293b;
  font-weight: 600;
}

/* Resumen y acciones */
.services-summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  background: linear-gradient(135deg, #fdf8f5 0%, #f5ece6 100%);
  border: 1.5px solid #d4a88a;
  border-radius: 10px;
  gap: 1rem;
}

.summary-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: #3b251d;
}

.btn-clear-services {
  background: none;
  border: 1px solid #d4a88a;
  color: #8b6f47;
  font-size: 0.8rem;
  padding: 0.3rem 0.75rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}
.btn-clear-services:hover {
  background: #fff;
  border-color: #3b251d;
  color: #3b251d;
}

.services-empty-hint {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.825rem;
  color: #94a3b8;
  padding: 0.5rem 0;
}

/* Animaciones */
.image-list-enter-active,
.image-list-leave-active { transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); }
.image-list-enter-from { opacity: 0; transform: scale(0.8) translateY(20px); }
.image-list-leave-to { opacity: 0; transform: scale(0.8) translateY(-20px); }
.image-list-move { transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1); }

/* Responsive */
@media (max-width: 768px) {
  .images-grid { grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 1rem; }
  .upload-dropzone { padding: 2rem 1rem; }
  .upload-icon { font-size: 2rem; }
  .services-checklist { grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); }
}
</style>