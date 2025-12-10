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
/* ==================== ANIMATIONS ==================== */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes float {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(5deg); }
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.1); opacity: 0.8; }
}

@keyframes glow {
  0%, 100% { box-shadow: 0 0 20px rgba(218, 156, 95, 0.3); }
  50% { box-shadow: 0 0 40px rgba(218, 156, 95, 0.6); }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes particleFloat {
  0%, 100% { transform: translate(0, 0); }
  25% { transform: translate(10px, -10px); }
  50% { transform: translate(-5px, -20px); }
  75% { transform: translate(-10px, -10px); }
}

/* ==================== BASE ==================== */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.profile-page {
  min-height: 100vh;
  padding-top: 80px;
  position: relative;
  overflow-x: hidden;
}

/* ==================== BACKGROUND ==================== */
.page-background {
  position: fixed;
  inset: 0;
  background: linear-gradient(135deg, #0a0605 0%, #1a0e0a 50%, #2e1d17 100%);
  z-index: -2;
}

.page-background::before {
  content: '';
  position: absolute;
  inset: 0;
  background: url("https://i.pinimg.com/1200x/e2/d2/b7/e2d2b7877ffb88a68d6b72e5ea0bd965.jpg") center/cover;
  opacity: 0.08;
  filter: blur(5px);
}

.gradient-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.3;
  animation: float 20s ease-in-out infinite;
}

.orb-1 {
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, rgba(218, 156, 95, 0.4), transparent);
  top: -200px;
  right: -200px;
  animation-delay: 0s;
}

.orb-2 {
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, rgba(184, 121, 31, 0.3), transparent);
  bottom: -150px;
  left: -150px;
  animation-delay: 5s;
}

.orb-3 {
  width: 350px;
  height: 350px;
  background: radial-gradient(circle, rgba(218, 156, 95, 0.25), transparent);
  top: 50%;
  left: 50%;
  animation-delay: 10s;
}

/* ==================== PARTICLES ==================== */
.particles {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
}

.particle {
  position: absolute;
  width: 4px;
  height: 4px;
  background: rgba(218, 156, 95, 0.6);
  border-radius: 50%;
  animation: particleFloat infinite ease-in-out;
  box-shadow: 0 0 10px rgba(218, 156, 95, 0.8);
}

/* ==================== CONTAINER ==================== */
.profile-container {
  position: relative;
  z-index: 1;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px 60px;
}

/* ==================== HERO SECTION ==================== */
.hero-section {
  position: relative;
  margin-bottom: 40px;
  animation: fadeIn 0.8s ease-out;
}

.hero-background {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(218, 156, 95, 0.05), rgba(46, 29, 23, 0.1));
  border-radius: 32px;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(218, 156, 95, 0.1);
  overflow: hidden;
}

.hero-glow {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(218, 156, 95, 0.15), transparent 50%);
  animation: rotate 30s linear infinite;
}

.hero-content {
  position: relative;
  padding: 40px 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 28px;
}

/* ==================== AVATAR ==================== */
.avatar-container {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0;
}

.avatar-rings {
  position: absolute;
  width: 180px;
  height: 180px;
  top: 0;
  left: 0;
  pointer-events: none;
}

.ring {
  position: absolute;
  border-radius: 50%;
  border: 2px solid rgba(218, 156, 95, 0.3);
  pointer-events: none;
}

.ring-1 { 
  width: 200px;
  height: 200px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation: ringPulse1 3s ease-in-out infinite;
}

.ring-2 { 
  width: 220px;
  height: 220px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation: ringPulse2 3s ease-in-out infinite;
}

.ring-3 { 
  width: 240px;
  height: 240px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation: ringPulse3 3s ease-in-out infinite;
}

@keyframes ringPulse1 {
  0%, 100% { 
    transform: translate(-50%, -50%) scale(1);
    opacity: 1; 
  }
  50% { 
    transform: translate(-50%, -50%) scale(1.05);
    opacity: 0.8; 
  }
}

@keyframes ringPulse2 {
  0%, 100% { 
    transform: translate(-50%, -50%) scale(1);
    opacity: 1; 
  }
  50% { 
    transform: translate(-50%, -50%) scale(1.05);
    opacity: 0.7; 
  }
}

@keyframes ringPulse3 {
  0%, 100% { 
    transform: translate(-50%, -50%) scale(1);
    opacity: 1; 
  }
  50% { 
    transform: translate(-50%, -50%) scale(1.05);
    opacity: 0.6; 
  }
}

.avatar-wrapper {
  position: relative;
  width: 180px;
  height: 180px;
  border-radius: 50%;
  overflow: hidden;
  cursor: pointer;
  border: 4px solid rgba(218, 156, 95, 0.5);
  box-shadow: 0 8px 32px rgba(218, 156, 95, 0.3), 
              inset 0 0 20px rgba(218, 156, 95, 0.1);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  animation: glow 3s ease-in-out infinite;
}

.avatar-wrapper:hover {
  transform: scale(1.05);
  border-color: #da9c5f;
}

.avatar-wrapper img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  color: white;
  font-size: 32px;
}

.avatar-wrapper:hover .avatar-overlay {
  opacity: 1;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: rgba(46, 204, 113, 0.1);
  border: 1px solid rgba(46, 204, 113, 0.3);
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  color: #2ecc71;
}

.status-dot {
  width: 8px;
  height: 8px;
  background: #2ecc71;
  border-radius: 50%;
  animation: dotPulse 2s ease-in-out infinite;
  box-shadow: 0 0 10px #2ecc71;
}

@keyframes dotPulse {
  0%, 100% { 
    transform: scale(1); 
    opacity: 1; 
  }
  50% { 
    transform: scale(1.2); 
    opacity: 0.7; 
  }
}

/* ==================== PROFILE HEADER INFO ==================== */
.profile-header-info {
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.profile-name {
  font-size: 42px;
  font-weight: 900;
  color: #f0e5db;
  display: flex;
  align-items: center;
  gap: 12px;
  text-shadow: 0 4px 12px rgba(218, 156, 95, 0.4);
  letter-spacing: -1px;
}

.verified-badge {
  color: #3b82f6;
  font-size: 32px;
  filter: drop-shadow(0 2px 8px rgba(59, 130, 246, 0.5));
}

.username {
  font-size: 18px;
  color: #a0aec0;
  font-weight: 500;
  letter-spacing: 0.5px;
}

.location-badge {
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: rgba(218, 156, 95, 0.1);
  border: 1px solid rgba(218, 156, 95, 0.2);
  border-radius: 24px;
  font-size: 14px;
  font-weight: 600;
  color: #da9c5f;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.location-badge:hover {
  background: rgba(218, 156, 95, 0.2);
  border-color: rgba(218, 156, 95, 0.4);
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(218, 156, 95, 0.2);
}

/* ==================== STATS AND BIO CONTAINER ==================== */
.stats-bio-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 900px;
}

.stats-cards-compact {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.stat-card-compact {
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(218, 156, 95, 0.15);
  border-radius: 16px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.stat-card-compact:hover {
  transform: translateY(-3px);
  border-color: rgba(218, 156, 95, 0.3);
  box-shadow: 0 8px 24px rgba(218, 156, 95, 0.15);
}

.stat-icon-compact {
  font-size: 20px;
  color: #da9c5f;
  transition: all 0.3s ease;
}

.stat-card-compact:hover .stat-icon-compact {
  transform: scale(1.1);
}

.stat-value-compact {
  font-size: 24px;
  font-weight: 900;
  color: #da9c5f;
  line-height: 1;
  text-shadow: 0 2px 8px rgba(218, 156, 95, 0.3);
}

.stat-label-compact {
  font-size: 11px;
  color: #a0aec0;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.8px;
}

/* ==================== BIO SECTION INLINE ==================== */
.bio-section-inline {
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(218, 156, 95, 0.15);
  border-radius: 16px;
  padding: 20px;
}

.bio-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.bio-header h4 {
  font-size: 16px;
  font-weight: 700;
  color: #f0e5db;
  display: flex;
  align-items: center;
  gap: 8px;
}

.icon-btn-small {
  background: rgba(218, 156, 95, 0.1);
  border: 1px solid rgba(218, 156, 95, 0.2);
  width: 32px;
  height: 32px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #da9c5f;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
}

.icon-btn-small:hover {
  background: rgba(218, 156, 95, 0.2);
  transform: scale(1.05);
}

.btn-primary-small,
.btn-secondary-small {
  padding: 8px 16px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.3s ease;
}

.btn-primary-small {
  background: linear-gradient(135deg, #da9c5f, #b8791f);
  color: white;
  border: none;
  box-shadow: 0 3px 12px rgba(218, 156, 95, 0.3);
}

.btn-primary-small:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 16px rgba(218, 156, 95, 0.4);
}

.btn-secondary-small {
  background: rgba(255, 255, 255, 0.05);
  color: #cbd5e0;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.btn-secondary-small:hover {
  background: rgba(255, 255, 255, 0.1);
}

/* ==================== STATS CARDS (OLD - REMOVED) ==================== */
.stats-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  width: 100%;
  max-width: 700px;
}

.stat-card {
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(218, 156, 95, 0.15);
  border-radius: 20px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.stat-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(218, 156, 95, 0.1), transparent);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.stat-card:hover::before {
  opacity: 1;
}

.stat-card:hover {
  transform: translateY(-5px);
  border-color: rgba(218, 156, 95, 0.3);
  box-shadow: 0 12px 32px rgba(218, 156, 95, 0.15);
}

.stat-icon-wrapper {
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, rgba(218, 156, 95, 0.2), rgba(184, 121, 31, 0.2));
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: #da9c5f;
  transition: all 0.3s ease;
}

.stat-card:hover .stat-icon-wrapper {
  transform: scale(1.1) rotate(5deg);
  background: linear-gradient(135deg, #da9c5f, #b8791f);
  color: white;
}

.stat-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.stat-value {
  font-size: 32px;
  font-weight: 900;
  color: #da9c5f;
  line-height: 1;
  text-shadow: 0 2px 8px rgba(218, 156, 95, 0.3);
}

.stat-label {
  font-size: 13px;
  color: #a0aec0;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
}
.content-section {
  background: rgba(255, 255, 255, 0.02);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(218, 156, 95, 0.1);
  border-radius: 24px;
  padding: 32px;
  margin-bottom: 24px;
  animation: slideUp 0.6s ease-out;
  transition: all 0.3s ease;
}

.content-section:hover {
  border-color: rgba(218, 156, 95, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.section-header h3 {
  font-size: 24px;
  font-weight: 800;
  color: #f0e5db;
  display: flex;
  align-items: center;
  gap: 12px;
  text-shadow: 0 2px 8px rgba(218, 156, 95, 0.2);
}

.count-badge {
  background: linear-gradient(135deg, #da9c5f, #b8791f);
  color: white;
  font-size: 14px;
  padding: 4px 12px;
  border-radius: 12px;
  font-weight: 700;
  box-shadow: 0 4px 12px rgba(218, 156, 95, 0.3);
}

.icon-btn {
  background: rgba(218, 156, 95, 0.1);
  border: 1px solid rgba(218, 156, 95, 0.2);
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #da9c5f;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 16px;
}

.icon-btn:hover {
  background: rgba(218, 156, 95, 0.2);
  transform: scale(1.05);
}

/* ==================== BIO SECTION ==================== */
.bio-display {
  animation: fadeIn 0.5s ease;
}

.bio-text {
  color: #cbd5e0;
  line-height: 1.8;
  font-size: 16px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 16px;
  border: 1px solid rgba(218, 156, 95, 0.1);
}

.add-content-btn {
  width: 100%;
  padding: 20px;
  background: rgba(218, 156, 95, 0.05);
  border: 2px dashed rgba(218, 156, 95, 0.3);
  border-radius: 16px;
  color: #a0aec0;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  transition: all 0.3s ease;
}

.add-content-btn:hover {
  background: rgba(218, 156, 95, 0.1);
  border-color: rgba(218, 156, 95, 0.5);
  color: #da9c5f;
  transform: translateY(-2px);
}

.bio-edit {
  animation: fadeIn 0.5s ease;
}

.bio-input {
  width: 100%;
  padding: 20px;
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid rgba(218, 156, 95, 0.2);
  border-radius: 16px;
  color: #f0e5db;
  font-size: 15px;
  font-family: inherit;
  resize: vertical;
  min-height: 120px;
  line-height: 1.6;
  transition: all 0.3s ease;
}

.bio-input:focus {
  outline: none;
  border-color: #da9c5f;
  background: rgba(255, 255, 255, 0.08);
  box-shadow: 0 0 0 4px rgba(218, 156, 95, 0.1);
}

.bio-input::placeholder {
  color: #718096;
}

.bio-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
}

.char-count {
  font-size: 13px;
  color: #718096;
  font-weight: 500;
}

.bio-actions {
  display: flex;
  gap: 10px;
}

/* ==================== BUTTONS ==================== */
.btn-primary {
  background: linear-gradient(135deg, #da9c5f, #b8791f);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 16px rgba(218, 156, 95, 0.3);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 24px rgba(218, 156, 95, 0.4);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.05);
  color: #cbd5e0;
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 12px 24px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
}

/* ==================== INFO GRID ==================== */
.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
  animation: slideUp 0.7s ease-out;
}

.info-card {
  position: relative;
  background: rgba(255, 255, 255, 0.02);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(218, 156, 95, 0.15);
  border-radius: 20px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.info-card-glow {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 30% 50%, rgba(218, 156, 95, 0.1), transparent 70%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.info-card:hover .info-card-glow {
  opacity: 1;
}

.info-card:hover {
  transform: translateY(-4px);
  border-color: rgba(218, 156, 95, 0.3);
  box-shadow: 0 12px 32px rgba(218, 156, 95, 0.15);
}

.info-card-icon {
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, rgba(218, 156, 95, 0.15), rgba(184, 121, 31, 0.15));
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: #da9c5f;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.info-card:hover .info-card-icon {
  transform: scale(1.05) rotate(-5deg);
  background: linear-gradient(135deg, #da9c5f, #b8791f);
  color: white;
}

.info-card-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.info-label {
  font-size: 11px;
  color: #a0aec0;
  text-transform: uppercase;
  font-weight: 700;
  letter-spacing: 1px;
}

.info-value {
  font-size: 15px;
  color: #f0e5db;
  font-weight: 600;
}

/* ==================== PROPERTIES GRID ==================== */
.properties-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 24px;
}

.property-card {
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(218, 156, 95, 0.1);
  border-radius: 20px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

.property-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(218, 156, 95, 0.05), transparent);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.property-card:hover::before {
  opacity: 1;
}

.property-card:hover {
  transform: translateY(-8px);
  border-color: rgba(218, 156, 95, 0.3);
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.4);
}

.property-image {
  position: relative;
  height: 220px;
  overflow: hidden;
  background: linear-gradient(135deg, #1a1a1a, #2d2416);
}

.property-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.property-card:hover .property-image img {
  transform: scale(1.1);
}

.property-status {
  position: absolute;
  top: 16px;
  left: 16px;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
  backdrop-filter: blur(10px);
  z-index: 2;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.status-available {
  background: linear-gradient(135deg, rgba(46, 204, 113, 0.9), rgba(39, 174, 96, 0.9));
  color: white;
}

.status-rented {
  background: linear-gradient(135deg, rgba(231, 76, 60, 0.9), rgba(192, 57, 43, 0.9));
  color: white;
}

.status-maintenance {
  background: linear-gradient(135deg, rgba(243, 156, 18, 0.9), rgba(230, 126, 34, 0.9));
  color: white;
}

.property-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.8), transparent);
  display: flex;
  align-items: flex-end;
  padding: 16px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.property-card:hover .property-overlay {
  opacity: 1;
}

.property-actions {
  display: flex;
  gap: 10px;
  margin-left: auto;
}

.action-btn {
  width: 42px;
  height: 42px;
  background: rgba(255, 255, 255, 0.95);
  border: none;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 16px;
  color: #2d3748;
}

.action-btn:hover {
  transform: scale(1.1);
}

.action-btn.delete:hover {
  background: #ef4444;
  color: white;
}

.property-body {
  padding: 20px;
}

.property-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 16px;
}

.property-header h4 {
  font-size: 18px;
  font-weight: 700;
  color: #f0e5db;
  line-height: 1.3;
  flex: 1;
}

.property-price {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.amount {
  font-size: 22px;
  font-weight: 900;
  color: #2ecc71;
  line-height: 1;
  text-shadow: 0 2px 8px rgba(46, 204, 113, 0.3);
}

.period {
  font-size: 12px;
  color: #a0aec0;
  font-weight: 500;
}

.property-location {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #cbd5e0;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 16px;
}

.property-features {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.feature {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: rgba(218, 156, 95, 0.1);
  border: 1px solid rgba(218, 156, 95, 0.2);
  border-radius: 12px;
  font-size: 13px;
  font-weight: 600;
  color: #cbd5e0;
}

/* ==================== EMPTY STATE ==================== */
.empty-state {
  text-align: center;
  padding: 80px 20px;
  animation: fadeIn 0.6s ease;
}

.empty-icon {
  width: 120px;
  height: 120px;
  margin: 0 auto 24px;
  background: linear-gradient(135deg, rgba(218, 156, 95, 0.2), rgba(184, 121, 31, 0.2));
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 56px;
  color: #da9c5f;
  animation: float 4s ease-in-out infinite;
}

.empty-state h4 {
  font-size: 24px;
  font-weight: 800;
  color: #f0e5db;
  margin-bottom: 12px;
}

.empty-state p {
  color: #a0aec0;
  font-size: 16px;
  margin-bottom: 24px;
}

/* ==================== SOCIAL LINKS ==================== */
.social-links {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 40px;
  animation: slideUp 0.8s ease-out;
}

.social-btn {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 22px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
  position: relative;
  overflow: hidden;
}

.social-btn::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.2), transparent);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.social-btn:hover::before {
  opacity: 1;
}

.social-btn:hover {
  transform: translateY(-6px) scale(1.05);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
}

.facebook { background: linear-gradient(135deg, #1877f2, #0c5dc4); }
.instagram { background: linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888); }
.twitter { background: linear-gradient(135deg, #1da1f2, #0c85d0); }
.linkedin { background: linear-gradient(135deg, #0077b5, #005582); }

/* ==================== MODAL ==================== */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(10, 6, 5, 0.95);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
}

.modal {
  background: linear-gradient(135deg, rgba(59, 36, 22, 0.98), rgba(46, 29, 23, 0.98));
  backdrop-filter: blur(20px);
  border: 1px solid rgba(218, 156, 95, 0.3);
  border-radius: 24px;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.8);
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 28px;
  border-bottom: 1px solid rgba(218, 156, 95, 0.2);
}

.modal-header h3 {
  font-size: 22px;
  font-weight: 800;
  color: #da9c5f;
  text-shadow: 0 2px 8px rgba(218, 156, 95, 0.3);
}

.modal-close {
  width: 40px;
  height: 40px;
  background: rgba(231, 76, 60, 0.1);
  border: 1px solid rgba(231, 76, 60, 0.3);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #e74c3c;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 18px;
}

.modal-close:hover {
  background: rgba(231, 76, 60, 0.2);
  transform: rotate(90deg);
}

.modal-body {
  padding: 28px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-size: 14px;
  font-weight: 700;
  color: #cbd5e0;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.form-group select {
  width: 100%;
  padding: 14px 16px;
  background: rgba(255, 255, 255, 0.08);
  border: 2px solid rgba(218, 156, 95, 0.2);
  border-radius: 12px;
  color: #f0e5db;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.form-group select option {
  background: #2e1d17;
  color: #f0e5db;
  padding: 12px;
}

.form-group select:focus {
  outline: none;
  border-color: #da9c5f;
  background: rgba(255, 255, 255, 0.12);
  box-shadow: 0 0 0 4px rgba(218, 156, 95, 0.1);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px 28px;
  border-top: 1px solid rgba(218, 156, 95, 0.2);
}

/* ==================== MODAL TRANSITIONS ==================== */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .modal,
.modal-leave-active .modal {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.modal-enter-from .modal,
.modal-leave-to .modal {
  transform: scale(0.9) translateY(20px);
}

/* ==================== RESPONSIVE ==================== */
@media (max-width: 1024px) {
  .stats-cards-compact {
    grid-template-columns: repeat(3, 1fr);
  }
  
  .properties-grid {
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  }
}

@media (max-width: 768px) {
  .profile-container {
    padding: 0 16px 40px;
  }

  .hero-content {
    padding: 32px 20px;
  }

  .avatar-wrapper {
    width: 140px;
    height: 140px;
  }

  .avatar-rings {
    width: 140px;
    height: 140px;
  }

  .ring-1 { 
    width: 160px;
    height: 160px;
    top: 50%;
    left: 50%;
  }

  .ring-2 { 
    width: 180px;
    height: 180px;
    top: 50%;
    left: 50%;
  }

  .ring-3 { 
    width: 200px;
    height: 200px;
    top: 50%;
    left: 50%;
  }

  .profile-name {
    font-size: 32px;
  }

  .stats-cards-compact {
    grid-template-columns: 1fr;
  }

  .stats-bio-container {
    max-width: 100%;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .properties-grid {
    grid-template-columns: 1fr;
  }

  .content-section {
    padding: 24px;
  }

  .social-links {
    gap: 12px;
  }

  .social-btn {
    width: 52px;
    height: 52px;
    font-size: 20px;
  }
}

@media (max-width: 480px) {
  .profile-page {
    padding-top: 70px;
  }

  .hero-content {
    padding: 32px 20px;
  }

  .avatar-wrapper {
    width: 120px;
    height: 120px;
  }

  .avatar-rings {
    width: 120px;
    height: 120px;
  }

  .ring-1 { 
    width: 140px;
    height: 140px;
    top: 50%;
    left: 50%;
  }

  .ring-2 { 
    width: 160px;
    height: 160px;
    top: 50%;
    left: 50%;
  }

  .ring-3 { 
    width: 180px;
    height: 180px;
    top: 50%;
    left: 50%;
  }

  .profile-name {
    font-size: 26px;
    flex-direction: column;
    gap: 8px;
  }

  .username {
    font-size: 16px;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .content-section {
    padding: 20px;
  }

  .property-body {
    padding: 16px;
  }

  .modal {
    margin: 0 12px;
  }
}
</style>