<template>
  <div class="edit-property-page">
    <!-- Background decorativo -->
    <div class="page-background"></div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner">
        <font-awesome-icon :icon="['fas', 'spinner']" spin />
      </div>
      <p class="loading-text">{{ $t('editProperty.loading') }}</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-container">
      <div class="error-icon">
        <font-awesome-icon :icon="['fas', 'exclamation-triangle']" />
      </div>
      <h2>{{ $t('editProperty.errorTitle') }}</h2>
      <p>{{ error }}</p>
      <button @click="router.push('/propiedades')" class="btn-back">
        <font-awesome-icon :icon="['fas', 'arrow-left']" />
        {{ $t('editProperty.backToProperties') }}
      </button>
    </div>

    <!-- Edit Form -->
    <div v-else-if="property" class="edit-content">
      <!-- Header -->
      <div class="edit-header">
        <div class="breadcrumb">
          <router-link to="/" class="breadcrumb-item">
            <font-awesome-icon :icon="['fas', 'home']" />
          </router-link>
          <font-awesome-icon :icon="['fas', 'chevron-right']" class="breadcrumb-separator" />
          <router-link to="/propiedades" class="breadcrumb-item">
            {{ $t('editProperty.breadcrumb.properties') }}
          </router-link>
          <font-awesome-icon :icon="['fas', 'chevron-right']" class="breadcrumb-separator" />
          <router-link :to="`/properties/${property.id}`" class="breadcrumb-item">
            {{ property.title }}
          </router-link>
          <font-awesome-icon :icon="['fas', 'chevron-right']" class="breadcrumb-separator" />
          <span class="breadcrumb-current">{{ $t('editProperty.breadcrumb.edit') }}</span>
        </div>
        
        <div class="header-content">
          <div class="header-icon">
            <font-awesome-icon :icon="['fas', 'edit']" />
          </div>
          <div class="header-text">
            <h1>{{ $t('editProperty.title') }}</h1>
            <p>{{ $t('editProperty.subtitle') }}</p>
          </div>
        </div>
      </div>

      <!-- Form Container -->
      <div class="form-container">
        <form @submit.prevent="handleSubmit">
          
          <!-- Información Básica -->
          <div class="form-section">
            <div class="section-header">
              <font-awesome-icon :icon="['fas', 'info-circle']" />
              <h2>{{ $t('editProperty.sections.basicInfo') }}</h2>
            </div>
            
            <div class="form-grid">
              <div class="form-group full-width">
                <label for="title">
                  <font-awesome-icon :icon="['fas', 'heading']" />
                  {{ $t('editProperty.fields.title') }} *
                </label>
                <input
                  type="text"
                  id="title"
                  v-model="form.title"
                  :placeholder="$t('editProperty.placeholders.title')"
                  required
                />
                <span v-if="errors.title" class="error-message">{{ errors.title }}</span>
              </div>

              <div class="form-group full-width">
                <label for="description">
                  <font-awesome-icon :icon="['fas', 'file-alt']" />
                  {{ $t('editProperty.fields.description') }} *
                </label>
                <textarea
                  id="description"
                  v-model="form.description"
                  rows="5"
                  :placeholder="$t('editProperty.placeholders.description')"
                  required
                ></textarea>
                <span v-if="errors.description" class="error-message">{{ errors.description }}</span>
              </div>

              <div class="form-group">
                <label for="status">
                  <font-awesome-icon :icon="['fas', 'toggle-on']" />
                  {{ $t('editProperty.fields.status') }} *
                </label>
                <select id="status" v-model="form.status" required>
                  <option value="available">{{ $t('editProperty.status.available') }}</option>
                  <option value="rented">{{ $t('editProperty.status.rented') }}</option>
                  <option value="maintenance">{{ $t('editProperty.status.maintenance') }}</option>
                </select>
              </div>

              <div class="form-group">
                <label for="monthly_price">
                  <font-awesome-icon :icon="['fas', 'dollar-sign']" />
                  {{ $t('editProperty.fields.monthlyPrice') }} *
                </label>
                <input
                  type="number"
                  id="monthly_price"
                  v-model.number="form.monthly_price"
                  min="0"
                  step="1000"
                  placeholder="1000000"
                  required
                />
                <span v-if="errors.monthly_price" class="error-message">{{ errors.monthly_price }}</span>
              </div>
            </div>
          </div>

          <!-- Ubicación -->
          <div class="form-section">
            <div class="section-header">
              <font-awesome-icon :icon="['fas', 'map-marker-alt']" />
              <h2>{{ $t('editProperty.sections.location') }}</h2>
            </div>
            
            <div class="form-grid">
              <div class="form-group">
                <label for="address">
                  <font-awesome-icon :icon="['fas', 'road']" />
                  {{ $t('editProperty.fields.address') }} *
                </label>
                <input
                  type="text"
                  id="address"
                  v-model="form.address"
                  :placeholder="$t('editProperty.placeholders.address')"
                  required
                />
              </div>

              <div class="form-group">
                <label for="city">
                  <font-awesome-icon :icon="['fas', 'city']" />
                  {{ $t('editProperty.fields.city') }}
                </label>
                <input
                  type="text"
                  id="city"
                  v-model="form.city"
                  :placeholder="$t('editProperty.placeholders.city')"
                />
              </div>

              <div class="form-group">
                <label for="lat">
                  <font-awesome-icon :icon="['fas', 'location-dot']" />
                  {{ $t('editProperty.fields.latitude') }}
                </label>
                <input
                  type="number"
                  id="lat"
                  v-model.number="form.lat"
                  step="0.000001"
                  placeholder="2.4448"
                />
              </div>

              <div class="form-group">
                <label for="lng">
                  <font-awesome-icon :icon="['fas', 'location-dot']" />
                  {{ $t('editProperty.fields.longitude') }}
                </label>
                <input
                  type="number"
                  id="lng"
                  v-model.number="form.lng"
                  step="0.000001"
                  placeholder="-76.6147"
                />
              </div>
            </div>
          </div>

          <!-- Características -->
          <div class="form-section">
            <div class="section-header">
              <font-awesome-icon :icon="['fas', 'sliders-h']" />
              <h2>{{ $t('editProperty.sections.features') }}</h2>
            </div>
            
            <div class="form-grid">
              <div class="form-group">
                <label for="area_m2">
                  <font-awesome-icon :icon="['fas', 'ruler-combined']" />
                  {{ $t('editProperty.fields.area') }}
                </label>
                <input
                  type="number"
                  id="area_m2"
                  v-model.number="form.area_m2"
                  min="0"
                  step="1"
                  placeholder="100"
                />
              </div>

              <div class="form-group">
                <label for="num_bedrooms">
                  <font-awesome-icon :icon="['fas', 'bed']" />
                  {{ $t('editProperty.fields.bedrooms') }}
                </label>
                <input
                  type="number"
                  id="num_bedrooms"
                  v-model.number="form.num_bedrooms"
                  min="0"
                  placeholder="3"
                />
              </div>

              <div class="form-group">
                <label for="num_bathrooms">
                  <font-awesome-icon :icon="['fas', 'bath']" />
                  {{ $t('editProperty.fields.bathrooms') }}
                </label>
                <input
                  type="number"
                  id="num_bathrooms"
                  v-model.number="form.num_bathrooms"
                  min="0"
                  placeholder="2"
                />
              </div>

              <div class="form-group">
                <label for="parking_spaces">
                  <font-awesome-icon :icon="['fas', 'car']" />
                  {{ $t('editProperty.fields.parking') }}
                </label>
                <input
                  type="number"
                  id="parking_spaces"
                  v-model.number="form.parking_spaces"
                  min="0"
                  placeholder="1"
                />
              </div>
            </div>
          </div>

          <!-- Imagen -->
          <div class="form-section">
            <div class="section-header">
              <font-awesome-icon :icon="['fas', 'image']" />
              <h2>{{ $t('editProperty.sections.image') }}</h2>
            </div>
            
            <div class="form-grid">
              <div class="form-group full-width">
                <label for="image_url">
                  <font-awesome-icon :icon="['fas', 'link']" />
                  {{ $t('editProperty.fields.imageUrl') }}
                </label>
                <input
                  type="url"
                  id="image_url"
                  v-model="form.image_url"
                  :placeholder="$t('editProperty.placeholders.imageUrl')"
                />
                
                <div v-if="form.image_url" class="image-preview">
                  <img :src="form.image_url" :alt="form.title" @error="onImgError" />
                </div>
              </div>
            </div>
          </div>

          <!-- Servicios Incluidos -->
          <div class="form-section">
            <div class="section-header">
              <font-awesome-icon :icon="['fas', 'check-circle']" />
              <h2>{{ $t('editProperty.sections.services') }}</h2>
            </div>
            
            <div class="services-checklist">
              <label v-for="service in translatedServices" :key="service.value" class="service-checkbox">
                <input
                  type="checkbox"
                  :value="service.value"
                  v-model="selectedServices"
                />
                <span class="checkmark">
                  <font-awesome-icon :icon="['fas', 'check']" />
                </span>
                <span class="service-label">{{ service.label }}</span>
              </label>
            </div>
          </div>

          <!-- Botones de Acción -->
          <div class="form-actions">
            <button type="button" @click="cancelEdit" class="btn-cancel">
              <font-awesome-icon :icon="['fas', 'times']" />
              {{ $t('editProperty.buttons.cancel') }}
            </button>
            <button type="submit" class="btn-submit" :disabled="isSaving">
              <font-awesome-icon :icon="isSaving ? ['fas', 'spinner'] : ['fas', 'save']" :spin="isSaving" />
              {{ isSaving ? $t('editProperty.buttons.saving') : $t('editProperty.buttons.save') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import api from '../../services/api'

const router = useRouter()
const route = useRoute()
const { t } = useI18n()

// State
const property = ref(null)
const loading = ref(true)
const error = ref(null)
const isSaving = ref(false)
const errors = reactive({})

const form = reactive({
  title: '',
  description: '',
  address: '',
  city: '',
  status: 'available',
  monthly_price: 0,
  area_m2: null,
  num_bedrooms: null,
  num_bathrooms: null,
  parking_spaces: null,
  image_url: '',
  lat: null,
  lng: null
})

const selectedServices = ref([])

const availableServices = [
  'water',
  'electricity',
  'gas',
  'internet',
  'cableTv',
  'security',
  'parking',
  'gym',
  'pool',
  'bbqArea',
  'laundry',
  'elevator'
]

const translatedServices = computed(() => {
  return availableServices.map(service => ({
    value: service,
    label: t(`editProperty.services.${service}`)
  }))
})

const DEFAULT_IMAGE = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwMCIgaGVpZ2h0PSI2MDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEyMDAiIGhlaWdodD0iNjAwIiBmaWxsPSIjZjhmOWZhIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiM2Yzc1N2QiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZW4gbm8gZGlzcG9uaWJsZTwvdGV4dD48L3N2Zz4="

// Methods
async function fetchProperty() {
  const propertyId = route.params.id
  loading.value = true
  error.value = null
  
  try {
    const response = await api.get(`/properties/${propertyId}`)
    property.value = response.data
    
    // Verificar que el usuario sea el propietario
    const userStr = localStorage.getItem('user') || sessionStorage.getItem('user')
    if (userStr) {
      const user = JSON.parse(userStr)
      if (user.id !== property.value.user_id) {
        error.value = t('editProperty.errors.noPermission')
        return
      }
    } else {
      error.value = t('editProperty.errors.mustLogin')
      return
    }
    
    // Llenar el formulario con los datos actuales
    Object.keys(form).forEach(key => {
      if (property.value[key] !== undefined && property.value[key] !== null) {
        form[key] = property.value[key]
      }
    })
    
    // Procesar servicios incluidos
    if (property.value.included_services) {
      if (Array.isArray(property.value.included_services)) {
        selectedServices.value = property.value.included_services
      } else if (typeof property.value.included_services === 'string') {
        selectedServices.value = property.value.included_services
          .split(',')
          .map(s => s.trim())
          .filter(s => s.length > 0)
      }
    }
  } catch (err) {
    console.error('Error al cargar la propiedad:', err)
    error.value = err.response?.data?.message || t('editProperty.errors.loadError')
  } finally {
    loading.value = false
  }
}

async function handleSubmit() {
  // Limpiar errores previos
  Object.keys(errors).forEach(key => delete errors[key])
  
  isSaving.value = true
  
  try {
    const payload = {
      title: form.title,
      description: form.description,
      address: form.address,
      city: form.city || null,
      status: form.status,
      monthly_price: form.monthly_price,
      area_m2: form.area_m2 || null,
      num_bedrooms: form.num_bedrooms || null,
      num_bathrooms: form.num_bathrooms || null,
      parking_spaces: form.parking_spaces || null,
      image_url: form.image_url || null,
      lat: form.lat || null,
      lng: form.lng || null,
      included_services: selectedServices.value
    }
    
    await api.put(`/properties/${property.value.id}`, payload)
    alert(t('editProperty.messages.updateSuccess'))
    router.push(`/properties/${property.value.id}`)
  } catch (err) {
    console.error('Error al actualizar la propiedad:', err)
    
    if (err.response?.status === 422) {
      // Errores de validación
      const validationErrors = err.response.data.errors || {}
      Object.keys(validationErrors).forEach(key => {
        errors[key] = validationErrors[key][0]
      })
    } else if (err.response?.status === 403) {
      alert(t('editProperty.messages.noPermission'))
    } else {
      alert(t('editProperty.messages.updateError'))
    }
  } finally {
    isSaving.value = false
  }
}

function cancelEdit() {
  const confirmed = confirm(t('editProperty.messages.cancelConfirm'))
  if (confirmed) {
    router.push(`/properties/${property.value.id}`)
  }
}

function onImgError(event) {
  event.target.src = DEFAULT_IMAGE
}

// Lifecycle
onMounted(() => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
  fetchProperty()
})
</script>

<style scoped>
@import "../../assets/css/Properties/EditProperty.css";
</style>