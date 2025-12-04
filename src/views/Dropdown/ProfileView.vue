<template>
  <div class="profile-page">
    <!-- Gradient Background -->
    <div class="static-backdrop"></div>
    <div class="animated-bg"></div>

    <!-- Main Container -->
    <main class="profile-container">

      <!-- Profile Header Card -->
      <div class="profile-header-card">
        <div class="profile-content">

          <!-- Avatar Section -->
          <div class="avatar-section">
            <div class="avatar-wrapper" @click="triggerFileInput">
              <img :src="profileData.photo || defaultAvatar" @error="handleImageError" />

              <div class="avatar-overlay">
                <i class="fas fa-camera"></i>
                <span>Cambiar foto</span>
              </div>
              <input ref="fileInput" type="file" accept="image/*" @change="handlePhotoUpload" style="display: none" />
            </div>

            <div class="status-badge">
              <i class="fas fa-check-circle"></i> Verificado
            </div>
          </div>

          <!-- Profile Info -->
          <div class="profile-info">
            <div class="name-section">
              <h1>{{ profileData.name }}</h1>
              <p class="username">@{{ profileData.username }}</p>
            </div>

            <!-- Location -->
            <div class="location-section" @click="showLocationModal = true">
              <i class="fas fa-map-marker-alt"></i>
              <span v-if="profileData.department && profileData.city">
                {{ profileData.city }}, {{ profileData.department }}
              </span>
              <span v-else class="add-location">Agregar ubicación</span>
            </div>

            <!-- Bio -->
            <div class="bio-section">
              <p v-if="!editingBio && profileData.bio">{{ profileData.bio }}</p>
              <p v-if="!editingBio && !profileData.bio" class="placeholder-bio" @click="editingBio = true">
                Agrega una biografía para que otros sepan más sobre ti...
              </p>
              <textarea v-if="editingBio" v-model="bioText" class="bio-input" placeholder="Cuéntanos sobre ti..."
                maxlength="200" @blur="saveBio" @keydown.enter="saveBio"></textarea>
              <button v-if="!editingBio && profileData.bio" class="edit-bio-btn" @click="startEditBio">
                <i class="fas fa-edit"></i>
              </button>
            </div>

            <!-- Stats -->
            <div class="stats-section">
              <div class="stat-item">
                <span class="stat-value">{{ userProperties.length }}</span>
                <span class="stat-label">Propiedades</span>
              </div>
              <div class="stat-item">
                <span class="stat-value">{{ profileData.rating || '5.0' }}</span>
                <span class="stat-label">Rating</span>
              </div>
              <div class="stat-item">
                <span class="stat-value">{{ profileData.reviews || '0' }}</span>
                <span class="stat-label">Reseñas</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Contact Info Card -->
      <div class="info-cards-grid">
        <div class="info-card">
          <div class="info-icon">
            <img src="https://images.freeimages.com/fic/images/icons/734/phuzion/256/mail.png" alt="phone">
          </div>
          <div class="info-content">
            <span class="info-label">Email</span>
            <span class="info-value">{{ profileData.email }}</span>
          </div>
        </div>

        <div class="info-card">
          <div class="info-icon">
            <img src="https://img.icons8.com/ios_filled/512/FFFFFF/apple-phone.png" alt="phone">
          </div>
          <div class="info-content">
            <span class="info-label">Teléfono</span>
            <span class="info-value">{{ profileData.phone || 'No registrado' }}</span>
          </div>
        </div>

        <div class="info-card">
          <div class="info-icon">
            <img src="https://uxwing.com/wp-content/themes/uxwing/download/time-and-date/calendar-white-icon.png"
              alt="calendar">
          </div>
          <div class="info-content">
            <span class="info-label">Miembro desde</span>
            <span class="info-value">{{ formatDate(profileData.created_at) }}</span>
          </div>
        </div>
      </div>

      <!-- Properties Section -->
      <div class="properties-section">
        <div class="section-header">
          <h2>Mis Propiedades</h2>
          <button class="add-property-btn" @click="addProperty">
            <i class="fas fa-plus"></i> Nueva Propiedad
          </button>
        </div>

        <div class="properties-grid" v-if="userProperties.length > 0">
          <div v-for="property in userProperties" :key="property.id" class="property-card">
            <!-- Badge de estado -->
            <div class="property-badge">
              {{ friendlyStatus(property.status) }}
            </div>

            <!-- Imagen de la propiedad -->
            <div class="property-image-container">
              <img :src="property.image_url || defaultPropertyImage" :alt="property.title" class="property-image" @error="handlePropertyImageError" />
              <div class="property-overlay">
                <div class="property-actions">
                  <button 
                    @click.stop="editProperty(property.id)" 
                    class="action-btn edit-btn"
                    title="Editar propiedad"
                  >
                    ✏️
                  </button>
                  <button 
                    @click.stop="deleteProperty(property.id)" 
                    class="action-btn delete-btn"
                    title="Eliminar propiedad"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>

            <!-- Contenido de la propiedad -->
            <div class="property-content">
              <div class="property-header">
                <h3 class="property-title">{{ property.title }}</h3>
                <div class="property-price">
                  ${{ property.monthly_price?.toLocaleString() }}
                  <span class="price-period">/mes</span>
                </div>
              </div>

              <div class="property-location">
                📍 {{ property.city || 'Ubicación no especificada' }}
              </div>

              <div class="property-features">
                <div class="feature-item">
                  <span class="feature-icon">📐</span>
                  <span class="feature-text">{{ property.area_m2 || 'N/A' }} m²</span>
                </div>
                <div class="feature-item" v-if="property.num_bedrooms">
                  <span class="feature-icon">🛏</span>
                  <span class="feature-text">{{ property.num_bedrooms }} Habitaciones</span>
                </div>
                <div class="feature-item" v-if="property.num_bathrooms">
                  <span class="feature-icon">🛁</span>
                  <span class="feature-text">{{ property.num_bathrooms }} Baños</span>
                </div>
              </div>

              <div class="property-description">
                {{ truncateDescription(property.description) }}
              </div>

              <div class="property-tags">
                <span class="property-type-tag">{{ detectType(property.title) }}</span>
              </div>

              <div class="property-footer">
                <button class="details-btn" @click.stop="viewPropertyDetails(property.id)">
                  <span class="btn-text">Ver Detalles</span>
                  <span class="btn-arrow">→</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="empty-state">
          <i class="fas fa-home"></i>
          <p>Aún no tienes propiedades</p>
          <button @click="addProperty">Agregar primera propiedad</button>
        </div>
      </div>

      <!-- Social Media Section -->
      <div class="social-section">
        <h3>Conéctate conmigo</h3>
        <div class="social-icons">
          <a href="#" class="social-icon facebook">
            <img src="../../assets/img/facebook-logo.png" alt="Facebook">
          </a>
          <a href="#" class="social-icon instagram">
            <img src="../../assets/img/instagram-logo.png" alt="Instagram">
          </a>
          <a href="#" class="social-icon twitter">
            <img src="../../assets/img/linkedin.png" alt="Twitter">
          </a>
          <a href="#" class="social-icon linkedin">
            <img src="../../assets/img/twitter.png" alt="LinkedIn">
          </a>
        </div>
      </div>
    </main>

    <!-- Location Modal -->
    <transition name="modal">
      <div v-if="showLocationModal" class="modal-overlay" @click="showLocationModal = false">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h3>Selecciona tu ubicación</h3>
            <button class="close-btn" @click="showLocationModal = false">
              <i class="fas fa-times"></i>
            </button>
          </div>

          <div class="modal-body">
            <div class="form-group">
              <label>Departamento</label>
              <select v-model="selectedDepartment" @change="updateCities">
                <option value="">Selecciona un departamento</option>
                <option v-for="dept in departments" :key="dept.name" :value="dept.name">
                  {{ dept.name }}
                </option>
              </select>
            </div>

            <div class="form-group" v-if="selectedDepartment">
              <label>Ciudad</label>
              <select v-model="selectedCity">
                <option value="">Selecciona una ciudad</option>
                <option v-for="city in availableCities" :key="city" :value="city">
                  {{ city }}
                </option>
              </select>
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn-cancel" @click="cancelLocationModal">Cancelar</button>
            <button class="btn-save" @click="saveLocation" :disabled="!selectedCity">
              Guardar ubicación
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import api from '../../services/api'
import { eventBus, EVENTS } from '../../events/eventBus'

const router = useRouter()

// Refs
const fileInput = ref<HTMLInputElement | null>(null)
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
  created_at: '',
  address: '',
  id_documento: ''
})

const userProperties = ref<any[]>([])

const defaultAvatar = '/img/default.webp'
const defaultPropertyImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwMCIgaGVpZ2h0PSI2MDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEyMDAiIGhlaWdodD0iNjAwIiBmaWxsPSIjZjhmOWZhIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiM2Yzc1N2QiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZW4gbm8gZGlzcG9uaWJsZTwvdGV4dD48L3N2Zz4='

// Departamentos y ciudades de Colombia
const departments = ref([
  {
    name: 'Cauca',
    cities: ['Popayán', 'Santander de Quilichao', 'Puerto Tejada', 'Piendamó', 'Timbío']
  },
  {
    name: 'Valle del Cauca',
    cities: ['Cali', 'Buenaventura', 'Palmira', 'Tuluá', 'Cartago', 'Buga']
  },
  {
    name: 'Antioquia',
    cities: ['Medellín', 'Envigado', 'Itagüí', 'Bello', 'Rionegro', 'Sabaneta']
  },
  {
    name: 'Cundinamarca',
    cities: ['Bogotá', 'Soacha', 'Chía', 'Zipaquirá', 'Facatativá', 'Fusagasugá']
  },
  {
    name: 'Atlántico',
    cities: ['Barranquilla', 'Soledad', 'Malambo', 'Sabanalarga', 'Puerto Colombia']
  }
])

const availableCities = computed(() => {
  const dept = departments.value.find(d => d.name === selectedDepartment.value)
  return dept ? dept.cities : []
})

// Métodos
const triggerFileInput = () => {
  fileInput.value?.click()
}

const handlePhotoUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];

  if (!file) return;

  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    alert('La imagen es muy grande. Máximo 10MB');
    return;
  }

  const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    alert('Formato no válido. Usa JPG, PNG, GIF o WEBP');
    return;
  }

  const formData = new FormData();
  formData.append('photo', file);

  try {
    // Previsualización inmediata
    const reader = new FileReader();
    reader.onload = (e) => {
      profileData.value.photo = e.target?.result as string;
    };
    reader.readAsDataURL(file);

    // IMPORTANTE: Usar POST con _method=PUT para manejar archivos en Laravel
    formData.append('_method', 'PUT');

    // Subir la imagen usando POST (Laravel lo convertirá a PUT)
    const response = await api.post(`/users/${profileData.value.id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    // Verificar respuesta y actualizar
    if (response.data && response.data.user && response.data.user.photo) {
      profileData.value.photo = response.data.user.photo;
      eventBus.emit(EVENTS.PROFILE_PHOTO_UPDATED, response.data.user.photo);
      alert('✅ Foto actualizada correctamente');
    } else {
      alert('✅ Foto actualizada correctamente');
    }

  } catch (error: any) {
    console.error('Error al subir la foto:', error);
    if (error.response?.data?.errors) {
      const firstError = Object.values(error.response.data.errors)[0];
      alert(Array.isArray(firstError) ? firstError[0] : 'Error al subir la foto');
    } else {
      alert('Error al subir la foto. Intenta nuevamente');
    }
  } finally {
    if (fileInput.value) {
      fileInput.value.value = '';
    }
  }
};

const saveBio = async () => {
  if (bioText.value.trim() === profileData.value.bio) {
    editingBio.value = false;
    return;
  }

  try {
    await api.put(`/users/${profileData.value.id}`, {
      bio: bioText.value.trim()
    });

    profileData.value.bio = bioText.value.trim();
    editingBio.value = false;
    alert('✅ Biografía actualizada correctamente');
  } catch (error) {
    console.error('Error guardando biografía:', error);
    alert('❌ Error al guardar biografía');
  }
};

const saveLocation = async () => {
  if (!selectedCity.value || !selectedDepartment.value) {
    alert('⚠️ Selecciona departamento y ciudad');
    return;
  }

  try {
    await api.put(`/users/${profileData.value.id}`, {
      department: selectedDepartment.value,
      city: selectedCity.value
    });

    profileData.value.department = selectedDepartment.value;
    profileData.value.city = selectedCity.value;
    
    // Cerrar modal y limpiar selecciones
    showLocationModal.value = false;
    selectedDepartment.value = '';
    selectedCity.value = '';
    
    alert('✅ Ubicación actualizada correctamente');
  } catch (error) {
    console.error('Error guardando ubicación:', error);
    alert('❌ Error al guardar ubicación');
  }
};

const cancelLocationModal = () => {
  showLocationModal.value = false;
  selectedDepartment.value = '';
  selectedCity.value = '';
};

const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement
  target.src = defaultAvatar
}

const startEditBio = () => {
  bioText.value = profileData.value.bio
  editingBio.value = true
}

const updateCities = () => {
  selectedCity.value = ''
}

const formatDate = (date: string) => {
  if (!date) return 'Fecha no disponible'
  return new Date(date).toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long'
  })
}

const editProperty = (propertyId: number) => {
  // Puedes implementar navegación a edición si existe la ruta
  console.log('Editar propiedad:', propertyId);
  alert('Funcionalidad de edición en desarrollo');
}

const viewPropertyDetails = (propertyId: number) => {
  router.push(`/properties/${propertyId}`)
}

const addProperty = () => {
  router.push('/properties/create')
}

const handlePropertyImageError = (event: Event) => {
  const target = event.target as HTMLImageElement
  target.src = defaultPropertyImage
}

const friendlyStatus = (status: string) => {
  const statusMap: { [key: string]: string } = {
    available: 'Disponible',
    rented: 'Rentada',
    maintenance: 'En mantenimiento',
    sold: 'Vendida'
  }
  return statusMap[status] || status
}

const detectType = (title: string) => {
  const t = title.toLowerCase();
  if (t.includes("casa")) return "Casa";
  if (t.includes("apartamento") || t.includes("apto")) return "Apartamento";
  if (t.includes("local")) return "Local";
  if (t.includes("finca")) return "Finca";
  return "Propiedad";
}

const truncateDescription = (description: string, maxLength = 120) => {
  if (!description) return "Descripción no disponible";
  return description.length > maxLength
    ? description.substring(0, maxLength) + "..."
    : description;
}

const deleteProperty = async (id: number) => {
  if (!confirm("¿Estás seguro de eliminar esta propiedad permanentemente?")) return;

  try {
    await api.delete(`/properties/${id}`);
    userProperties.value = userProperties.value.filter((p) => p.id !== id);
    alert('✅ Propiedad eliminada correctamente');
  } catch (error) {
    console.error("Error eliminando propiedad:", error);
    alert("❌ Error al eliminar la propiedad");
  }
}

// Lifecycle - CORREGIDO para trabajar con el nuevo AuthController
onMounted(async () => {
  try {
    // Llamar al endpoint /auth/me que devuelve { success: true, user: {...} }
    const userResponse = await api.get('/auth/me')
    
    // Verificar que la respuesta sea exitosa
    if (!userResponse.data.success || !userResponse.data.user) {
      throw new Error('No se pudo obtener la información del usuario')
    }

    const userData = userResponse.data.user

    // Mapear los datos del usuario al formato de profileData
    profileData.value = {
      id: userData.id,
      name: userData.name,
      username: userData.email.split('@')[0], // Generar username desde el email
      email: userData.email,
      phone: userData.phone || '',
      photo: userData.photo || '',
      bio: userData.bio || '',
      department: userData.department || '',
      city: userData.city || '',
      rating: 0, // El backend no devuelve rating aún
      reviews: 0, // El backend no devuelve reviews aún
      created_at: userData.created_at || '',
      address: userData.address || '',
      id_documento: userData.id_documento || ''
    }

    bioText.value = profileData.value.bio

    // Cargar propiedades del usuario (sin filtrar por user_id ya que ya vienen filtradas)
    try {
      const propertiesResponse = await api.get('/properties')
      // Filtrar solo las propiedades del usuario actual
      userProperties.value = propertiesResponse.data.filter(
        (p: any) => p.user_id === userData.id
      )
    } catch (propError) {
      console.warn('No se pudieron cargar las propiedades:', propError)
      userProperties.value = []
    }
  } catch (error: any) {
    console.error('Error cargando perfil:', error)
    alert(
      error.response?.data?.message || 'Error al cargar el perfil'
    )
    
    // Si el error es 401, probablemente el token expiró
    if (error.response?.status === 401) {
      router.push('/login')
    }
  }
})
</script>

<style scoped>
@import '../../assets/css/Dropdown/ProfileView.css';
</style>