<template>
  <div class="create-property-page">
    <!-- Animated Background -->
    <div class="page-background">
      <div class="gradient-orb orb-1"></div>
      <div class="gradient-orb orb-2"></div>
      <div class="gradient-orb orb-3"></div>
    </div>

    <!-- Floating Particles -->
    <div class="particles">
      <div v-for="i in 20" :key="i" class="particle" :style="particleStyle()"></div>
    </div>

    <!-- Main Container -->
    <main class="property-container">
      <!-- Hero Section -->
      <div class="hero-section">
        <div class="hero-background">
          <div class="hero-glow"></div>
        </div>
        <div class="hero-content">
          <div class="header-info">
            <h1 class="page-title">
              <font-awesome-icon :icon="['fas', 'home']" />
              {{ t('property.create.title') }}
            </h1>
            <p class="page-subtitle">{{ t('property.create.subtitle') }}</p>
          </div>
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

      <!-- Form Container -->
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

          <!-- Servicios Incluidos -->
          <div class="content-section">
            <div class="section-header">
              <h3>
                <font-awesome-icon :icon="['fas', 'check-square']" />
                {{ t('property.create.services') }}
              </h3>
            </div>

            <div class="form-group full-width">
              <label for="services-input">{{ t('property.fields.services') }}</label>
              <input
                id="services-input"
                v-model="servicesText"
                type="text"
                :placeholder="t('property.placeholders.services')"
                @blur="parseServices"
              />
              <span class="help-text">
                {{ t('property.create.servicesHint') }}
              </span>
            </div>

            <div class="services-tags" v-if="form.included_services.length > 0">
              <TransitionGroup name="tag">
                <div
                  v-for="(service, index) in form.included_services"
                  :key="service"
                  class="service-tag"
                >
                  <font-awesome-icon :icon="['fas', 'check']" />
                  <span>{{ service }}</span>
                  <button
                    type="button"
                    @click="removeService(index)"
                    class="remove-tag"
                  >
                    <font-awesome-icon :icon="['fas', 'times']" />
                  </button>
                </div>
              </TransitionGroup>
            </div>

            <div v-else class="empty-services">
              <font-awesome-icon :icon="['fas', 'info-circle']" />
              <span>{{ t('property.create.noServices') }}</span>
            </div>
          </div>

          <!-- 🔥 SECCIÓN DE MÚLTIPLES IMÁGENES -->
          <div class="content-section">
            <div class="section-header">
              <h3>
                <font-awesome-icon :icon="['fas', 'images']" />
                Imágenes de la Propiedad
              </h3>
            </div>

            <!-- Upload de múltiples imágenes -->
            <div class="form-group full-width">
              <label>
                <font-awesome-icon :icon="['fas', 'cloud-upload-alt']" />
                Subir Imágenes
                <span class="help-text">(Máximo 10 imágenes, 10MB cada una)</span>
              </label>
              
              <div class="image-upload-area">
                <input
                  ref="fileInput"
                  type="file"
                  accept="image/jpeg,image/png,image/jpg,image/webp"
                  multiple
                  class="file-input-hidden"
                  @change="handleMultipleImages"
                />
                <button
                  type="button"
                  class="btn-upload-images"
                  @click="triggerFileInput"
                  :disabled="uploadedImages.length >= 10"
                >
                  <font-awesome-icon :icon="['fas', 'plus']" />
                  Seleccionar Imágenes
                </button>
                <p class="upload-hint">
                  Formatos: JPG, PNG, WEBP | Máximo: 10MB por imagen
                </p>
              </div>
            </div>

            <!-- Grid de imágenes subidas -->
            <div v-if="uploadedImages.length > 0" class="images-grid">
              <TransitionGroup name="image-item">
                <div
                  v-for="(image, index) in uploadedImages"
                  :key="index"
                  class="image-item"
                >
                  <img :src="image.preview" :alt="`Imagen ${index + 1}`" />
                  <div class="image-overlay">
                    <span class="image-number">{{ index + 1 }}</span>
                    <button
                      type="button"
                      class="btn-remove-image"
                      @click="removeImage(index)"
                    >
                      <font-awesome-icon :icon="['fas', 'trash']" />
                    </button>
                  </div>
                  <div class="image-info">
                    <span class="image-size">{{ formatFileSize(image.size) }}</span>
                  </div>
                </div>
              </TransitionGroup>
            </div>

            <div v-else class="empty-images">
              <font-awesome-icon :icon="['fas', 'image']" />
              <p>No has agregado imágenes aún</p>
              <small>Las imágenes ayudan a atraer más interesados</small>
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
              :disabled="loading"
            >
              <font-awesome-icon :icon="['fas', 'map-marker-alt']" />
              <span>Continuar a Ubicación →</span>
            </button>
          </div>
        </form>
      </div>
    </main>

    <!-- 🔥 MODAL DE UBICACIÓN -->
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
import PropertyLocationModal from '../../admin/components/Properties/PropertyLocationModa.vue'

const { t } = useI18n()
const router = useRouter()
const { success: successAlert, error: errorAlert, confirm } = useAlerts()

// Estado del formulario
const form = ref({
  title: '',
  description: '',
  address: '',
  city: '',
  status: 'available',
  monthly_price: 0,
  area_m2: null as number | null,
  num_bedrooms: null as number | null,
  num_bathrooms: null as number | null,
  included_services: [] as string[],
  publication_date: '',
})

// 🔥 ESTADO PARA MÚLTIPLES IMÁGENES
interface UploadedImage {
  file: File;
  preview: string;
  base64: string;
  size: number;
}

const uploadedImages = ref<UploadedImage[]>([])
const fileInput = ref<HTMLInputElement | null>(null)

// Campo de texto para servicios
const servicesText = ref('')

// Precio con formato
const displayPrice = ref('')

// Estados de la UI
const loading = ref(false)
const errorMessage = ref('')
const success = ref(false)

// Modal de ubicación
const showLocationModal = ref(false)

// Computed para precio formateado
const formattedPrice = computed(() => {
  if (!form.value.monthly_price || form.value.monthly_price === 0) {
    return 'COP $0'
  }
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(form.value.monthly_price)
})

/**
 * Formatear número con puntos de miles
 */
const formatNumber = (value: number): string => {
  if (!value) return ''
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

/**
 * Manejar input de precio en tiempo real
 */
const handlePriceInput = (event: Event) => {
  const input = event.target as HTMLInputElement
  let value = input.value

  // Remover todo excepto números
  value = value.replace(/[^\d]/g, '')

  // Convertir a número
  const numericValue = parseInt(value) || 0

  // Actualizar valor real
  form.value.monthly_price = numericValue

  // Actualizar display con formato
  displayPrice.value = formatNumber(numericValue)

  // Mover cursor al final
  setTimeout(() => {
    input.setSelectionRange(displayPrice.value.length, displayPrice.value.length)
  }, 0)
}

/**
 * Formatear precio al perder el foco
 */
const formatPriceOnBlur = () => {
  if (form.value.monthly_price > 0) {
    displayPrice.value = formatNumber(form.value.monthly_price)
  } else {
    displayPrice.value = ''
  }
}

/**
 * Genera estilos aleatorios para las partículas
 */
const particleStyle = () => ({
  left: `${Math.random() * 100}%`,
  top: `${Math.random() * 100}%`,
  animationDelay: `${Math.random() * 10}s`,
  animationDuration: `${15 + Math.random() * 15}s`
})

/**
 * Parsea los servicios del input de texto a array
 */
const parseServices = () => {
  if (!servicesText.value.trim()) {
    form.value.included_services = []
    return
  }
  
  form.value.included_services = servicesText.value
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)
}

/**
 * Remueve un servicio específico
 */
const removeService = (index: number) => {
  form.value.included_services.splice(index, 1)
  servicesText.value = form.value.included_services.join(', ')
}

/**
 * 🔥 TRIGGER FILE INPUT
 */
const triggerFileInput = () => {
  fileInput.value?.click()
}

/**
 * 🔥 MANEJAR MÚLTIPLES IMÁGENES
 */
const handleMultipleImages = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const files = Array.from(target.files || [])

  if (files.length === 0) return

  // Validar que no exceda el máximo
  if (uploadedImages.value.length + files.length > 10) {
    errorAlert('Máximo 10 imágenes permitidas', 'Límite alcanzado')
    return
  }

  for (const file of files) {
    // Validar tipo
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp']
    if (!validTypes.includes(file.type)) {
      errorAlert(`${file.name}: Formato no válido`, 'Error')
      continue
    }

    // Validar tamaño (10MB)
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      errorAlert(`${file.name}: Tamaño máximo 10MB`, 'Error')
      continue
    }

    // Convertir a base64
    const base64 = await fileToBase64(file)
    const preview = URL.createObjectURL(file)

    uploadedImages.value.push({
      file,
      preview,
      base64,
      size: file.size
    })
  }

  // Limpiar input
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

/**
 * Convertir archivo a base64
 */
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

/**
 * 🔥 REMOVER IMAGEN
 */
const removeImage = (index: number) => {
  // Liberar URL del preview
  URL.revokeObjectURL(uploadedImages.value[index].preview)
  uploadedImages.value.splice(index, 1)
}

/**
 * Formatear tamaño de archivo
 */
const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

/**
 * Cancela el formulario y vuelve atrás
 */
const cancelForm = () => {
  confirm(
    t('property.create.confirmCancel'),
    () => {
      router.back()
    },
    () => {
      // Usuario canceló
    },
    {
      title: t('property.create.cancelTitle'),
      confirmText: t('common.yes'),
      cancelText: t('common.no')
    }
  )
}

/**
 * 🔥 ABRIR MODAL DE UBICACIÓN
 */
const openLocationModal = () => {
  // Asegurar que los servicios estén parseados
  parseServices()
  
  // Validar campos requeridos
  if (!form.value.title || !form.value.description || !form.value.address) {
    errorAlert('Por favor completa todos los campos requeridos', 'Campos incompletos')
    return
  }

  if (!form.value.monthly_price || form.value.monthly_price === 0) {
    errorAlert('Por favor ingresa el precio mensual', 'Precio requerido')
    return
  }

  // Abrir modal de ubicación
  showLocationModal.value = true
}

/**
 * 🔥 MANEJAR CONFIRMACIÓN DE UBICACIÓN Y ENVIAR FORMULARIO
 */
const handleLocationConfirm = async (locationData: { lat: number; lng: number; accuracy: number }) => {
  loading.value = true
  errorMessage.value = ''
  success.value = false

  try {
    // 🔥 Preparar imágenes en base64
    const imagesBase64 = uploadedImages.value.map(img => img.base64)

    // Preparar datos para enviar
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
      included_services: form.value.included_services.length > 0 
        ? JSON.stringify(form.value.included_services)
        : null,
      publication_date: form.value.publication_date || null,
      // 🔥 Ubicación del modal
      lat: locationData.lat,
      lng: locationData.lng,
      accuracy: locationData.accuracy,
      // 🔥 Imágenes en base64 (enviar como JSON string)
      images: JSON.stringify(imagesBase64)
    }

    console.log('📤 Enviando propiedad:', payload)

    // Llamada al API
    const response = await api.post('/properties', payload)

    success.value = true
    successAlert(t('property.create.successMessage'), t('property.create.successTitle'))

    // Cerrar modal
    showLocationModal.value = false

    // Redirigir después de 1.5 segundos
    setTimeout(() => {
      router.push('/propiedades')
    }, 1500)

  } catch (err: any) {
    console.error('Error al crear propiedad:', err)
    
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

/**
 * Cancelar modal de ubicación
 */
const handleLocationCancel = () => {
  showLocationModal.value = false
}
</script>

<style scoped>
/* Importar CSS externo con ruta relativa */
@import "../../assets/css/Properties/PropertyCreate.css";

/* 🔥 ESTILOS ADICIONALES PARA MÚLTIPLES IMÁGENES */
.file-input-hidden {
  display: none;
}

.image-upload-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 2rem;
  border: 2px dashed #cbd5e1;
  border-radius: 12px;
  background: #f8fafc;
  transition: all 0.3s ease;
}

.image-upload-area:hover {
  border-color: #3b251d;
  background: #f1f5f9;
}

.btn-upload-images {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 2rem;
  background: linear-gradient(135deg, #3b251d 0%, #8b6f47 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-upload-images:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.2);
}

.btn-upload-images:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.upload-hint {
  font-size: 0.875rem;
  color: #64748b;
  margin: 0;
}

.images-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-top: 1.5rem;
}

.image-item {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  background: #f1f5f9;
  aspect-ratio: 4/3;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.image-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.2);
}

.image-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.image-item:hover .image-overlay {
  opacity: 1;
}

.image-number {
  position: absolute;
  top: 0.5rem;
  left: 0.5rem;
  background: rgba(59, 37, 29, 0.9);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 8px;
  font-weight: 700;
  font-size: 0.875rem;
}

.btn-remove-image {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: #dc2626;
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1.25rem;
}

.btn-remove-image:hover {
  background: #b91c1c;
  transform: scale(1.1);
}

.image-info {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 0.5rem;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  font-size: 0.75rem;
  text-align: center;
}

.empty-images {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 3rem;
  border: 2px dashed #e5e7eb;
  border-radius: 12px;
  color: #94a3b8;
  text-align: center;
}

.empty-images svg {
  font-size: 3rem;
  color: #cbd5e1;
}

/* Animaciones para las imágenes */
.image-item-enter-active,
.image-item-leave-active {
  transition: all 0.3s ease;
}

.image-item-enter-from {
  opacity: 0;
  transform: scale(0.8);
}

.image-item-leave-to {
  opacity: 0;
  transform: scale(0.8);
}
</style>