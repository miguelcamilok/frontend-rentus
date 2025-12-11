<template>
  <div class="profile-page">
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
    <main class="profile-container">
      <!-- Hero Section with Avatar -->
      <div class="hero-section">
        <div class="hero-background">
          <div class="hero-glow"></div>
        </div>
        
        <div class="hero-content">
          <!-- Avatar with Rings -->
          <div class="avatar-container">
            <div class="avatar-rings">
              <div class="ring ring-1"></div>
              <div class="ring ring-2"></div>
              <div class="ring ring-3"></div>
            </div>
            
            <div class="avatar-wrapper" @click="triggerFileInput">
              <img :src="profileData.photo || defaultAvatar" @error="handleImageError" />
              <div class="avatar-overlay">
                <font-awesome-icon :icon="['fas', 'camera']" />
              </div>
              <input ref="fileInput" type="file" accept="image/*" @change="handlePhotoUpload" style="display: none" />
            </div>
          </div>

          <!-- Profile Header Info -->
          <div class="profile-header-info">
            <h1 class="profile-name">
              {{ profileData.name }}
              <span class="verified-badge">
                <font-awesome-icon :icon="['fas', 'check-circle']" />
              </span>
            </h1>
            <p class="username">@{{ profileData.username }}</p>
            
            <!-- Location Badge -->
            <div class="location-badge" @click="showLocationModal = true">
              <font-awesome-icon :icon="['fas', 'map-marker-alt']" />
              <span v-if="profileData.city">{{ profileData.city }}, {{ profileData.department }}</span>
              <span v-else>Agregar ubicación</span>
            </div>
          </div>

          <!-- Stats and Bio Grid -->
          <div class="stats-bio-container">
                        <div class="bio-section-inline">
              <div class="bio-header">
                <h4>
                  <font-awesome-icon :icon="['fas', 'user']" />
                  Biografía
                </h4>
                <button v-if="profileData.bio && !editingBio" @click="startEditBio" class="icon-btn-small">
                  <font-awesome-icon :icon="['fas', 'edit']" />
                </button>
              </div>

              <div v-if="!editingBio" class="bio-display">
                <p v-if="profileData.bio" class="bio-text">{{ profileData.bio }}</p>
                <button v-else @click="startEditBio" class="add-content-btn">
                  <font-awesome-icon :icon="['fas', 'plus']" />
                  <span>Agregar biografía</span>
                </button>
              </div>

              <div v-else class="bio-edit">
                <textarea 
                  v-model="bioText" 
                  ref="bioTextarea"
                  class="bio-input" 
                  placeholder="Cuéntanos sobre ti..."
                  maxlength="200"
                ></textarea>
                <div class="bio-footer">
                  <span class="char-count">{{ bioText.length }}/200</span>
                  <div class="bio-actions">
                    <button @click="cancelEditBio" class="btn-secondary-small">
                      <font-awesome-icon :icon="['fas', 'times']" />
                      Cancelar
                    </button>
                    <button @click="saveBio" class="btn-primary-small">
                      <font-awesome-icon :icon="['fas', 'check']" />
                      Guardar
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <!-- Stats Cards Compact -->
            <div class="stats-cards-compact">
              <div v-for="stat in stats" :key="stat.label" class="stat-card-compact">
                <font-awesome-icon :icon="stat.icon" class="stat-icon-compact" />
                <span class="stat-value-compact">{{ stat.value }}</span>
                <span class="stat-label-compact">{{ stat.label }}</span>
              </div>
            </div>

            <!-- Bio Section Inline -->

          </div>
        </div>
      </div>

      <!-- Contact Info Grid -->
      <div class="info-grid">
        <div v-for="info in contactInfo" :key="info.label" class="info-card">
          <div class="info-card-icon">
            <font-awesome-icon :icon="info.icon" />
          </div>
          <div class="info-card-content">
            <span class="info-label">{{ info.label }}</span>
            <span class="info-value">{{ info.value }}</span>
          </div>
          <div class="info-card-glow"></div>
        </div>
      </div>

      <!-- Properties Section -->
      <div class="content-section">
        <div class="section-header">
          <h3>
            <font-awesome-icon :icon="['fas', 'home']" />
            Mis Propiedades
            <span class="count-badge">{{ userProperties.length }}</span>
          </h3>
          <button @click="addProperty" class="btn-primary">
            <font-awesome-icon :icon="['fas', 'plus']" />
            <span>Nueva</span>
          </button>
        </div>

        <!-- Properties Grid -->
        <div v-if="userProperties.length > 0" class="properties-grid">
          <div v-for="property in userProperties" :key="property.id" class="property-card" @click="viewPropertyDetails(property.id)">
            <!-- Image -->
            <div class="property-image">
              <img :src="property.image_url || defaultPropertyImage" :alt="property.title" @error="handlePropertyImageError" />
              <div class="property-status" :class="`status-${property.status}`">
                {{ friendlyStatus(property.status) }}
              </div>
              <div class="property-overlay">
                <div class="property-actions" @click.stop>
                  <button @click="editProperty(property.id)" class="action-btn">
                    <font-awesome-icon :icon="['fas', 'edit']" />
                  </button>
                  <button @click="deleteProperty(property.id)" class="action-btn delete">
                    <font-awesome-icon :icon="['fas', 'trash']" />
                  </button>
                </div>
              </div>
            </div>

            <!-- Content -->
            <div class="property-body">
              <div class="property-header">
                <h4>{{ property.title }}</h4>
                <div class="property-price">
                  <span class="amount">${{ formatPriceWithDecimals(property.monthly_price) }}</span>
                  <span class="period">/mes</span>
                </div>
              </div>

              <div class="property-location">
                <font-awesome-icon :icon="['fas', 'map-marker-alt']" />
                <span>{{ property.city || 'Sin ubicación' }}</span>
              </div>

              <div class="property-features">
                <span v-if="property.area_m2" class="feature">
                  <font-awesome-icon :icon="['fas', 'ruler-combined']" />
                  {{ property.area_m2 }}m²
                </span>
                <span v-if="property.num_bedrooms" class="feature">
                  <font-awesome-icon :icon="['fas', 'bed']" />
                  {{ property.num_bedrooms }}
                </span>
                <span v-if="property.num_bathrooms" class="feature">
                  <font-awesome-icon :icon="['fas', 'bath']" />
                  {{ property.num_bathrooms }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else class="empty-state">
          <div class="empty-icon">
            <font-awesome-icon :icon="['fas', 'home']" />
          </div>
          <h4>No tienes propiedades</h4>
          <p>Comienza agregando tu primera propiedad</p>
          <button @click="addProperty" class="btn-primary">
            <font-awesome-icon :icon="['fas', 'plus']" />
            Agregar Propiedad
          </button>
        </div>
      </div>

      <!-- Social Links -->
      <div class="social-links">
        <a href="#" class="social-btn facebook">
          <font-awesome-icon :icon="['fab', 'facebook-f']" />
        </a>
        <a href="#" class="social-btn instagram">
          <font-awesome-icon :icon="['fab', 'instagram']" />
        </a>
        <a href="#" class="social-btn twitter">
          <font-awesome-icon :icon="['fab', 'twitter']" />
        </a>
        <a href="#" class="social-btn linkedin">
          <font-awesome-icon :icon="['fab', 'linkedin-in']" />
        </a>
      </div>
    </main>

    <!-- Location Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showLocationModal" class="modal-backdrop" @click="showLocationModal = false">
          <div class="modal" @click.stop>
            <div class="modal-header">
              <h3>Ubicación</h3>
              <button @click="showLocationModal = false" class="modal-close">
                <font-awesome-icon :icon="['fas', 'times']" />
              </button>
            </div>

            <div class="modal-body">
              <div class="form-group">
                <label>Departamento</label>
                <select v-model="selectedDepartment" @change="updateCities">
                  <option value="">Selecciona</option>
                  <option v-for="dept in departments" :key="dept.name" :value="dept.name">
                    {{ dept.name }}
                  </option>
                </select>
              </div>

              <div class="form-group" v-if="selectedDepartment">
                <label>Ciudad</label>
                <select v-model="selectedCity">
                  <option value="">Selecciona</option>
                  <option v-for="city in availableCities" :key="city" :value="city">
                    {{ city }}
                  </option>
                </select>
              </div>
            </div>

            <div class="modal-footer">
              <button @click="cancelLocationModal" class="btn-secondary">Cancelar</button>
              <button @click="saveLocation" :disabled="!selectedCity" class="btn-primary">
                Guardar
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import api from '../../services/api'
import { eventBus, EVENTS } from '../../events/eventBus'
import { useAlerts } from '../../composable/useAlerts'

const router = useRouter()
const { success, error, warning, confirm } = useAlerts()

// Refs
const fileInput = ref<HTMLInputElement | null>(null)
const bioTextarea = ref<HTMLTextAreaElement | null>(null)
const editingBio = ref(false)
const bioText = ref('')
const showLocationModal = ref(false)
const selectedDepartment = ref('')
const selectedCity = ref('')

// Data
const profileData = ref({
  id: 0,
  name: '',
  username: '',
  email: '',
  phone: '',
  photo: '',
  bio: '',
  department: '',
  city: '',
  rating: 0,
  reviews: 0,
  created_at: ''
})

const userProperties = ref<any[]>([])

const defaultAvatar = '/img/default.webp'
const defaultPropertyImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwMCIgaGVpZ2h0PSI2MDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEyMDAiIGhlaWdodD0iNjAwIiBmaWxsPSIjZjhmOWZhIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiM2Yzc1N2QiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZW4gbm8gZGlzcG9uaWJsZTwvdGV4dD48L3N2Zz4='

const departments = ref([
  { name: 'Cauca', cities: ['Popayán', 'Santander de Quilichao', 'Puerto Tejada', 'Piendamó', 'Timbío'] },
  { name: 'Valle del Cauca', cities: ['Cali', 'Buenaventura', 'Palmira', 'Tuluá', 'Cartago', 'Buga'] },
  { name: 'Antioquia', cities: ['Medellín', 'Envigado', 'Itagüí', 'Bello', 'Rionegro', 'Sabaneta'] },
  { name: 'Cundinamarca', cities: ['Bogotá', 'Soacha', 'Chía', 'Zipaquirá', 'Facatativá', 'Fusagasugá'] },
  { name: 'Atlántico', cities: ['Barranquilla', 'Soledad', 'Malambo', 'Sabanalarga', 'Puerto Colombia'] }
])

// Computed
const availableCities = computed(() => {
  const dept = departments.value.find(d => d.name === selectedDepartment.value)
  return dept ? dept.cities : []
})

const stats = computed(() => [
  { icon: ['fas', 'home'], value: userProperties.value.length, label: 'Propiedades' },
  { icon: ['fas', 'star'], value: profileData.value.rating || '5.0', label: 'Rating' },
  { icon: ['fas', 'comments'], value: profileData.value.reviews || '0', label: 'Reseñas' }
])

const contactInfo = computed(() => [
  { icon: ['fas', 'envelope'], label: 'Email', value: profileData.value.email },
  { icon: ['fas', 'phone'], label: 'Teléfono', value: profileData.value.phone || 'No registrado' },
  { icon: ['fas', 'calendar'], label: 'Miembro desde', value: formatDate(profileData.value.created_at) }
])

// Methods
const particleStyle = () => ({
  left: `${Math.random() * 100}%`,
  top: `${Math.random() * 100}%`,
  animationDelay: `${Math.random() * 10}s`,
  animationDuration: `${15 + Math.random() * 15}s`
})

const triggerFileInput = () => fileInput.value?.click()

const handlePhotoUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  const maxSize = 10 * 1024 * 1024
  if (file.size > maxSize) {
    error('La imagen es muy grande. Máximo 10MB', 'Error de tamaño')
    return
  }

  const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp']
  if (!validTypes.includes(file.type)) {
    error('Formato no válido. Usa JPG, PNG, GIF o WEBP', 'Formato inválido')
    return
  }

  const formData = new FormData()
  formData.append('photo', file)
  formData.append('_method', 'PUT')

  try {
    const reader = new FileReader()
    reader.onload = (e) => {
      profileData.value.photo = e.target?.result as string
    }
    reader.readAsDataURL(file)

    const response = await api.post(`/users/${profileData.value.id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })

    if (response.data?.user?.photo) {
      profileData.value.photo = response.data.user.photo
      eventBus.emit(EVENTS.PROFILE_PHOTO_UPDATED, response.data.user.photo)
    }
    success('Foto de perfil actualizada correctamente', 'Éxito')
  } catch (err) {
    console.error('Error:', err)
    error('No se pudo actualizar la foto. Intenta nuevamente', 'Error')
  } finally {
    if (fileInput.value) fileInput.value.value = ''
  }
}

const startEditBio = async () => {
  bioText.value = profileData.value.bio
  editingBio.value = true
  await nextTick()
  bioTextarea.value?.focus()
}

const cancelEditBio = () => {
  editingBio.value = false
  bioText.value = profileData.value.bio
}

const saveBio = async () => {
  if (bioText.value.trim() === profileData.value.bio) {
    editingBio.value = false
    return
  }

  try {
    await api.put(`/users/${profileData.value.id}`, { bio: bioText.value.trim() })
    profileData.value.bio = bioText.value.trim()
    editingBio.value = false
    success('Tu biografía ha sido actualizada', 'Biografía guardada')
  } catch (err) {
    console.error('Error:', err)
    error('No se pudo guardar la biografía', 'Error al guardar')
  }
}

const saveLocation = async () => {
  if (!selectedCity.value || !selectedDepartment.value) {
    warning('Por favor selecciona departamento y ciudad', 'Campos incompletos')
    return
  }

  try {
    await api.put(`/users/${profileData.value.id}`, {
      department: selectedDepartment.value,
      city: selectedCity.value
    })

    profileData.value.department = selectedDepartment.value
    profileData.value.city = selectedCity.value
    showLocationModal.value = false
    selectedDepartment.value = ''
    selectedCity.value = ''
    success('Tu ubicación ha sido actualizada correctamente', 'Ubicación guardada')
  } catch (err) {
    console.error('Error:', err)
    error('No se pudo actualizar la ubicación', 'Error')
  }
}

const cancelLocationModal = () => {
  showLocationModal.value = false
  selectedDepartment.value = ''
  selectedCity.value = ''
}

const updateCities = () => {
  selectedCity.value = ''
}

const handleImageError = (event: Event) => {
  (event.target as HTMLImageElement).src = defaultAvatar
}

const handlePropertyImageError = (event: Event) => {
  (event.target as HTMLImageElement).src = defaultPropertyImage
}

const formatDate = (date: string) => {
  if (!date) return 'Fecha no disponible'
  return new Date(date).toLocaleDateString('es-CO', { year: 'numeric', month: 'long' })
}

const formatPriceWithDecimals = (price: number) => {
  if (!price) return '0'
  return new Intl.NumberFormat('es-CO', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price)
}

const friendlyStatus = (status: string) => {
  const map: { [key: string]: string } = {
    available: 'Disponible',
    rented: 'Rentada',
    maintenance: 'Mantenimiento',
    sold: 'Vendida'
  }
  return map[status] || status
}

const editProperty = (id: number) => {
  console.log('Editar:', id)
  warning('La funcionalidad de edición estará disponible pronto', 'En desarrollo')
}

const viewPropertyDetails = (id: number) => router.push(`/properties/${id}`)

const addProperty = () => router.push('/properties/create')

const deleteProperty = (id: number) => {
  confirm(
    '¿Estás seguro de que deseas eliminar esta propiedad? Esta acción no se puede deshacer.',
    async () => {
      try {
        await api.delete(`/properties/${id}`)
        userProperties.value = userProperties.value.filter(p => p.id !== id)
        success('La propiedad ha sido eliminada correctamente', 'Propiedad eliminada')
      } catch (err) {
        console.error('Error:', err)
        error('No se pudo eliminar la propiedad', 'Error')
      }
    },
    () => {
      // Usuario canceló
    },
    {
      title: 'Confirmar eliminación',
      confirmText: 'Eliminar',
      cancelText: 'Cancelar'
    }
  )
}

// Lifecycle
onMounted(async () => {
  try {
    const userResponse = await api.get('/auth/me')
    
    if (!userResponse.data.success || !userResponse.data.user) {
      throw new Error('No se pudo obtener el usuario')
    }

    const userData = userResponse.data.user

    profileData.value = {
      id: userData.id,
      name: userData.name,
      username: userData.email.split('@')[0],
      email: userData.email,
      phone: userData.phone || '',
      photo: userData.photo || '',
      bio: userData.bio || '',
      department: userData.department || '',
      city: userData.city || '',
      rating: 0,
      reviews: 0,
      created_at: userData.created_at || ''
    }

    bioText.value = profileData.value.bio

    try {
      const propertiesResponse = await api.get('/properties')
      userProperties.value = propertiesResponse.data.filter((p: any) => p.user_id === userData.id)
    } catch (propError) {
      console.warn('No se pudieron cargar propiedades:', propError)
      userProperties.value = []
    }
  } catch (err: any) {
    console.error('Error:', err)
    error(
      err.response?.data?.message || 'No se pudo cargar tu perfil. Intenta nuevamente.',
      'Error al cargar perfil'
    )
    
    if (err.response?.status === 401) {
      router.push('/login')
    }
  }
})
</script>

<style scoped>
@import "../../assets/css/Dropdown/ProfileView.css";
</style>