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
        <form @submit.prevent="submitForm">
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

              <div class="form-group">
                <label for="lat">{{ t('property.fields.latitude') }}</label>
                <input
                  id="lat"
                  v-model.number="form.lat"
                  type="number"
                  step="0.000001"
                  placeholder="4.710989"
                />
              </div>

              <div class="form-group">
                <label for="lng">{{ t('property.fields.longitude') }}</label>
                <input
                  id="lng"
                  v-model.number="form.lng"
                  type="number"
                  step="0.000001"
                  placeholder="-74.072092"
                />
              </div>
            </div>

            <div class="info-banner">
              <font-awesome-icon :icon="['fas', 'lightbulb']" />
              <span>{{ t('property.create.locationHint') }}</span>
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
                    v-model.number="form.monthly_price"
                    type="number"
                    step="0.01"
                    min="0"
                    :placeholder="t('property.placeholders.price')"
                    required
                  />
                </div>
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

          <!-- Imagen -->
          <div class="content-section">
            <div class="section-header">
              <h3>
                <font-awesome-icon :icon="['fas', 'image']" />
                {{ t('property.create.image') }}
              </h3>
            </div>

            <div class="form-group full-width">
              <label for="image_url">{{ t('property.fields.imageUrl') }}</label>
              <input
                id="image_url"
                v-model="form.image_url"
                type="text"
                :placeholder="t('property.placeholders.imageUrl')"
              />
            </div>

            <Transition name="fade">
              <div v-if="form.image_url" class="image-preview-container">
                <div class="image-preview">
                  <img 
                    :src="form.image_url" 
                    :alt="t('property.create.imagePreview')" 
                    @error="handleImageError"
                  />
                  <div class="image-overlay">
                    <font-awesome-icon :icon="['fas', 'eye']" />
                  </div>
                </div>
              </div>
            </Transition>
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
              <font-awesome-icon 
                :icon="loading ? ['fas', 'spinner'] : ['fas', 'check']" 
                :class="{ 'fa-spin': loading }"
              />
              <span v-if="loading">{{ t('property.create.publishing') }}</span>
              <span v-else>{{ t('property.create.publish') }}</span>
            </button>
          </div>
        </form>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '../../services/api'
import { useAlerts } from '../../composable/useAlerts'
import { useI18n } from 'vue-i18n'

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
  monthly_price: null as number | null,
  area_m2: null as number | null,
  num_bedrooms: null as number | null,
  num_bathrooms: null as number | null,
  included_services: [] as string[],
  publication_date: '',
  image_url: '',
  lat: null as number | null,
  lng: null as number | null
})

// Campo de texto para servicios
const servicesText = ref('')

// Estados de la UI
const loading = ref(false)
const errorMessage = ref('')
const success = ref(false)

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
 * Maneja errores de carga de imagen
 */
const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement
  target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwMCIgaGVpZ2h0PSI2MDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEyMDAiIGhlaWdodD0iNjAwIiBmaWxsPSIjZjhmOWZhIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiM2Yzc1N2QiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZW4gbm8gZGlzcG9uaWJsZTwvdGV4dD48L3N2Zz4='
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
 * Envía el formulario al backend
 */
const submitForm = async () => {
  loading.value = true
  errorMessage.value = ''
  success.value = false

  // Asegurar que los servicios estén parseados
  parseServices()

  try {
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
      included_services: form.value.included_services.length > 0 ? form.value.included_services : null,
      publication_date: form.value.publication_date || null,
      image_url: form.value.image_url || null,
      lat: form.value.lat || null,
      lng: form.value.lng || null
    }

    // Llamada al API
    const response = await api.post('/properties', payload)

    success.value = true
    successAlert(t('property.create.successMessage'), t('property.create.successTitle'))

    // Redirigir después de 1.5 segundos
    setTimeout(() => {
      router.push('/propiedades')
    }, 1500)

  } catch (err: any) {
    console.error('Error al crear propiedad:', err)
    
    if (err.response?.data?.errors) {
      // Errores de validación de Laravel
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
</script>

<style scoped>
/* Importar CSS externo con ruta relativa */
@import "../../assets/css/Properties/PropertyCreate.css";
</style>