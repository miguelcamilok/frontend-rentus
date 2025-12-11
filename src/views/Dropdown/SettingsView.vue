<template>
  <div class="settings-page">
    <div class="page-background"></div>

    <main class="settings-wrapper">
      <div class="header-section">
        <h2 class="titulo">Ajustes de Cuenta</h2>
        <p class="subtitle">Personaliza tu experiencia en la plataforma</p>
      </div>

      <div class="settings-container">
        <!-- Panel de navegación lateral -->
        <div class="settings-nav">
          <div 
            v-for="(section, index) in sections" 
            :key="index"
            class="nav-item"
            :class="{ active: activeSection === section.id }"
            @click="activeSection = section.id"
          >
            <font-awesome-icon :icon="section.icon" class="nav-icon" />
            <span class="nav-text">{{ section.title }}</span>
          </div>
        </div>

        <!-- Contenido principal -->
        <div class="settings-content">
          <div class="settings-card">
            <!-- SECCIÓN PERFIL -->
            <div v-if="activeSection === 'profile'" class="section-content">
              <h3 class="section-title">
                <font-awesome-icon :icon="['fas', 'user']" class="section-icon" />
                Perfil
              </h3>
              <div class="profile-header">
                <div class="avatar-container">
                  <div class="avatar-preview">
                    <img :src="userData.photo || defaultAvatar" alt="Avatar" class="avatar-img" @error="handleImageError" />
                  </div>
                  <div class="avatar-actions">
                    <button class="btn-secondary" @click="triggerFileInput">
                      <font-awesome-icon :icon="['fas', 'camera']" />
                      Cambiar Avatar
                    </button>
                    <input 
                      ref="fileInput"
                      type="file" 
                      accept="image/*" 
                      class="file-input"
                      @change="handlePhotoUpload"
                    />
                    <p class="avatar-hint">JPG, PNG o GIF. Máx. 5MB</p>
                  </div>
                </div>
              </div>
              <div class="form-grid">
                <div class="form-group">
                  <label>Nombre completo</label>
                  <input 
                    type="text" 
                    placeholder="Tu nombre" 
                    v-model="userData.name"
                  />
                </div>
                <div class="form-group">
                  <label>Email</label>
                  <input 
                    type="email" 
                    placeholder="correo@ejemplo.com" 
                    v-model="userData.email"
                    disabled
                    class="disabled-input"
                  />
                  <span class="field-note">El email no se puede modificar</span>
                </div>
                <div class="form-group">
                  <label>Teléfono</label>
                  <input 
                    type="tel" 
                    placeholder="+57 123 456 789" 
                    v-model="userData.phone"
                  />
                </div>
                <div class="form-group">
                  <label>Documento de Identidad</label>
                  <input 
                    type="text" 
                    placeholder="123456789" 
                    v-model="userData.id_documento"
                  />
                </div>
                <div class="form-group full-width">
                  <label>Biografía</label>
                  <textarea 
                    placeholder="Cuéntanos algo sobre ti..."
                    v-model="userData.bio"
                    maxlength="200"
                  ></textarea>
                  <span class="char-counter">{{ userData.bio?.length || 0 }}/200</span>
                </div>
                <div class="form-group">
                  <label>Departamento</label>
                  <select v-model="userData.department" @change="updateCities">
                    <option value="">Selecciona un departamento</option>
                    <option v-for="dept in departments" :key="dept.name" :value="dept.name">
                      {{ dept.name }}
                    </option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Ciudad</label>
                  <select v-model="userData.city" :disabled="!userData.department">
                    <option value="">Selecciona una ciudad</option>
                    <option v-for="city in availableCities" :key="city" :value="city">
                      {{ city }}
                    </option>
                  </select>
                </div>
              </div>
              <div class="actions">
                <button class="btn-secondary" @click="resetProfileChanges">Cancelar</button>
                <button class="btn-primary" @click="saveProfile" :disabled="!hasProfileChanges || savingProfile">
                  <font-awesome-icon v-if="savingProfile" :icon="['fas', 'spinner']" spin />
                  {{ savingProfile ? 'Guardando...' : 'Guardar Cambios' }}
                </button>
              </div>
            </div>

            <!-- SECCIÓN SEGURIDAD -->
            <div v-if="activeSection === 'security'" class="section-content">
              <h3 class="section-title">
                <font-awesome-icon :icon="['fas', 'lock']" class="section-icon" />
                Seguridad
              </h3>
              <div class="form-grid">
                <div class="form-group">
                  <label>Contraseña actual</label>
                  <div class="password-input">
                    <input 
                      :type="showCurrentPassword ? 'text' : 'password'" 
                      v-model="passwords.current"
                      placeholder="Ingresa tu contraseña actual"
                    />
                    <button 
                      class="toggle-password"
                      @click="showCurrentPassword = !showCurrentPassword"
                      type="button"
                    >
                      <font-awesome-icon :icon="showCurrentPassword ? ['fas', 'eye-slash'] : ['fas', 'eye']" />
                    </button>
                  </div>
                </div>
                <div class="form-group">
                  <label>Nueva contraseña</label>
                  <div class="password-input">
                    <input 
                      :type="showNewPassword ? 'text' : 'password'" 
                      v-model="passwords.new"
                      placeholder="Mínimo 8 caracteres"
                    />
                    <button 
                      class="toggle-password"
                      @click="showNewPassword = !showNewPassword"
                      type="button"
                    >
                      <font-awesome-icon :icon="showNewPassword ? ['fas', 'eye-slash'] : ['fas', 'eye']" />
                    </button>
                  </div>
                </div>
                <div class="form-group">
                  <label>Confirmar nueva contraseña</label>
                  <div class="password-input">
                    <input 
                      :type="showConfirmPassword ? 'text' : 'password'" 
                      v-model="passwords.confirm"
                      placeholder="Repite la nueva contraseña"
                    />
                    <button 
                      class="toggle-password"
                      @click="showConfirmPassword = !showConfirmPassword"
                      type="button"
                    >
                      <font-awesome-icon :icon="showConfirmPassword ? ['fas', 'eye-slash'] : ['fas', 'eye']" />
                    </button>
                  </div>
                </div>
              </div>
              <div class="password-strength" v-if="passwords.new">
                <div class="strength-bar" :class="passwordStrength.class"></div>
                <span class="strength-text">{{ passwordStrength.text }}</span>
              </div>
              <div class="password-requirements">
                <h4>Requisitos de contraseña:</h4>
                <ul>
                  <li :class="{ 'met': passwords.new?.length >= 8 }">
                    <font-awesome-icon :icon="passwords.new?.length >= 8 ? ['fas', 'check-circle'] : ['fas', 'times-circle']" />
                    Mínimo 8 caracteres
                  </li>
                  <li :class="{ 'met': /[A-Z]/.test(passwords.new) && /[a-z]/.test(passwords.new) }">
                    <font-awesome-icon :icon="(/[A-Z]/.test(passwords.new) && /[a-z]/.test(passwords.new)) ? ['fas', 'check-circle'] : ['fas', 'times-circle']" />
                    Letras mayúsculas y minúsculas
                  </li>
                  <li :class="{ 'met': /\d/.test(passwords.new) }">
                    <font-awesome-icon :icon="/\d/.test(passwords.new) ? ['fas', 'check-circle'] : ['fas', 'times-circle']" />
                    Al menos un número
                  </li>
                  <li :class="{ 'met': /[^A-Za-z0-9]/.test(passwords.new) }">
                    <font-awesome-icon :icon="/[^A-Za-z0-9]/.test(passwords.new) ? ['fas', 'check-circle'] : ['fas', 'times-circle']" />
                    Al menos un carácter especial (!@#$%^&*)
                  </li>
                  <li :class="{ 'met': passwords.new === passwords.confirm && passwords.confirm }">
                    <font-awesome-icon :icon="(passwords.new === passwords.confirm && passwords.confirm) ? ['fas', 'check-circle'] : ['fas', 'times-circle']" />
                    Las contraseñas coinciden
                  </li>
                </ul>
              </div>
              <div class="actions">
                <button class="btn-secondary" @click="resetPasswordFields">Cancelar</button>
                <button class="btn-primary" @click="updatePassword" :disabled="!canUpdatePassword || updatingPassword">
                  <font-awesome-icon v-if="updatingPassword" :icon="['fas', 'spinner']" spin />
                  {{ updatingPassword ? 'Actualizando...' : 'Actualizar Contraseña' }}
                </button>
              </div>
            </div>

            <!-- SECCIÓN NOTIFICACIONES -->
            <div v-if="activeSection === 'notifications'" class="section-content">
              <h3 class="section-title">
                <font-awesome-icon :icon="['fas', 'bell']" class="section-icon" />
                Notificaciones
              </h3>
              <div class="toggle-section">
                <div class="toggle-item" v-for="(notification, index) in notifications" :key="index">
                  <div class="toggle-info">
                    <span class="toggle-title">{{ notification.title }}</span>
                    <span class="toggle-description">{{ notification.description }}</span>
                  </div>
                  <label class="toggle-switch">
                    <input 
                      type="checkbox" 
                      v-model="notification.enabled"
                    />
                    <span class="slider"></span>
                  </label>
                </div>
              </div>
              <div class="actions">
                <button class="btn-secondary" @click="resetNotifications">Restablecer</button>
                <button class="btn-primary" @click="saveNotifications" :disabled="savingNotifications">
                  <font-awesome-icon v-if="savingNotifications" :icon="['fas', 'spinner']" spin />
                  {{ savingNotifications ? 'Guardando...' : 'Guardar Preferencias' }}
                </button>
              </div>
            </div>

            <!-- SECCIÓN PREFERENCIAS -->
            <div v-if="activeSection === 'preferences'" class="section-content">
              <h3 class="section-title">
                <font-awesome-icon :icon="['fas', 'palette']" class="section-icon" />
                Preferencias
              </h3>
              <div class="form-grid">
                <div class="form-group full-width">
                  <label>Tema</label>
                  <div class="theme-selector">
                    <div 
                      v-for="theme in themes" 
                      :key="theme.id"
                      class="theme-option"
                      :class="{ active: userPreferences.theme === theme.id }"
                      @click="userPreferences.theme = theme.id"
                    >
                      <div class="theme-preview" :class="theme.id">
                        <font-awesome-icon :icon="theme.icon" />
                      </div>
                      <span class="theme-name">{{ theme.name }}</span>
                    </div>
                  </div>
                </div>
                <div class="form-group">
                  <label>Idioma</label>
                  <select v-model="userPreferences.language">
                    <option value="es">🇪🇸 Español</option>
                    <option value="en">🇺🇸 English</option>
                    <option value="fr">🇫🇷 Français</option>
                    <option value="de">🇩🇪 Deutsch</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Zona horaria</label>
                  <select v-model="userPreferences.timezone">
                    <option value="America/Bogota">Colombia (GMT-5)</option>
                    <option value="Europe/Madrid">España (GMT+1)</option>
                    <option value="Europe/London">Reino Unido (GMT+0)</option>
                    <option value="America/New_York">EE.UU. Este (GMT-5)</option>
                    <option value="America/Los_Angeles">EE.UU. Oeste (GMT-8)</option>
                  </select>
                </div>
                <div class="form-group full-width">
                  <label>Unidades</label>
                  <div class="radio-group">
                    <label class="radio-option">
                      <input 
                        type="radio" 
                        value="metric" 
                        v-model="userPreferences.units"
                      />
                      <span class="radio-label">
                        <font-awesome-icon :icon="['fas', 'ruler']" />
                        Métrico (km, m²)
                      </span>
                    </label>
                    <label class="radio-option">
                      <input 
                        type="radio" 
                        value="imperial" 
                        v-model="userPreferences.units"
                      />
                      <span class="radio-label">
                        <font-awesome-icon :icon="['fas', 'ruler-combined']" />
                        Imperial (mi, ft²)
                      </span>
                    </label>
                  </div>
                </div>
              </div>
              <div class="actions">
                <button class="btn-secondary" @click="resetPreferences">Cancelar</button>
                <button class="btn-primary" @click="savePreferences" :disabled="savingPreferences">
                  <font-awesome-icon v-if="savingPreferences" :icon="['fas', 'spinner']" spin />
                  {{ savingPreferences ? 'Guardando...' : 'Guardar Preferencias' }}
                </button>
              </div>
            </div>

            <!-- CERRAR SESIÓN -->
            <div class="logout-section">
              <button class="logout-btn" @click="confirmLogout">
                <font-awesome-icon :icon="['fas', 'sign-out-alt']" class="logout-icon" />
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '../../services/api'
import { eventBus, EVENTS } from '../../events/eventBus'
import { useAlerts } from '../../composable/useAlerts'

const router = useRouter()
const { success, error: showError, confirm } = useAlerts()

// Interfaz para los datos del usuario
interface UserData {
  id: number
  name: string
  email: string
  phone: string
  photo: string
  bio: string
  department: string
  city: string
  address: string
  id_documento: string
  status: string
}

// Datos del usuario con tipo definido
const userData = ref<UserData>({
  id: 0,
  name: '',
  email: '',
  phone: '',
  photo: '',
  bio: '',
  department: '',
  city: '',
  address: '',
  id_documento: '',
  status: 'active'
})

// Copia original para detectar cambios
const originalUserData = ref<UserData>({
  id: 0,
  name: '',
  email: '',
  phone: '',
  photo: '',
  bio: '',
  department: '',
  city: '',
  address: '',
  id_documento: '',
  status: 'active'
})

// Estado de carga y guardado
const savingProfile = ref(false)
const updatingPassword = ref(false)
const savingNotifications = ref(false)
const savingPreferences = ref(false)

// Contraseñas
const passwords = ref({
  current: '',
  new: '',
  confirm: ''
})

// Estado de visibilidad de contraseñas
const showCurrentPassword = ref(false)
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)

// Notificaciones
const notifications = ref([
  {
    title: 'Correos de novedades',
    description: 'Recibe actualizaciones sobre nuevas funcionalidades',
    enabled: true
  },
  {
    title: 'Alertas de propiedades',
    description: 'Notificaciones sobre propiedades que coinciden con tus criterios',
    enabled: true
  },
  {
    title: 'Recordatorios',
    description: 'Recordatorios sobre tus citas y actividades programadas',
    enabled: false
  },
  {
    title: 'Promociones especiales',
    description: 'Ofertas y descuentos exclusivos',
    enabled: true
  }
])

// Preferencias del usuario
const userPreferences = ref({
  theme: 'light',
  language: 'es',
  timezone: 'America/Bogota',
  units: 'metric'
})

// Secciones con iconos de FontAwesome
const sections = ref([
  { id: 'profile', title: 'Perfil', icon: ['fas', 'user'] },
  { id: 'security', title: 'Seguridad', icon: ['fas', 'lock'] },
  { id: 'notifications', title: 'Notificaciones', icon: ['fas', 'bell'] },
  { id: 'preferences', title: 'Preferencias', icon: ['fas', 'palette'] }
])

const activeSection = ref('profile')

// Temas disponibles con iconos
const themes = ref([
  { id: 'light', name: 'Claro', icon: ['fas', 'sun'] },
  { id: 'dark', name: 'Oscuro', icon: ['fas', 'moon'] },
  { id: 'auto', name: 'Automático', icon: ['fas', 'adjust'] }
])

// Avatar por defecto
const defaultAvatar = '/img/default.webp'

// Referencia al input de archivo
const fileInput = ref<HTMLInputElement | null>(null)
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

// Computed
const availableCities = computed(() => {
  const dept = departments.value.find(d => d.name === userData.value.department)
  return dept ? dept.cities : []
})

const hasProfileChanges = computed(() => {
  return JSON.stringify(userData.value) !== JSON.stringify(originalUserData.value)
})

const canUpdatePassword = computed(() => {
  return passwords.value.current && 
         passwords.value.new && 
         passwords.value.confirm && 
         passwords.value.new === passwords.value.confirm &&
         passwords.value.new.length >= 8
})

const passwordStrength = computed(() => {
  const password = passwords.value.new
  if (!password) return { class: '', text: '' }
  
  let strength = 0
  
  if (password.length >= 8) strength++
  if (/\d/.test(password)) strength++
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++
  if (/[^A-Za-z0-9]/.test(password)) strength++
  
  const strengthMap = {
    0: { text: 'Muy débil', class: 'very-weak' },
    1: { text: 'Muy débil', class: 'very-weak' },
    2: { text: 'Débil', class: 'weak' },
    3: { text: 'Media', class: 'medium' },
    4: { text: 'Fuerte', class: 'strong' }
  }
  
  return strengthMap[strength as keyof typeof strengthMap]
})

// Métodos
const loadUserData = async () => {
  try {
    const userResponse = await api.get('/auth/me')
    
    if (!userResponse.data.success || !userResponse.data.user) {
      throw new Error('No se pudo obtener la información del usuario')
    }

    const user = userResponse.data.user
    
    userData.value = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      photo: user.photo || '',
      bio: user.bio || '',
      department: user.department || '',
      city: user.city || '',
      address: user.address || '',
      id_documento: user.id_documento || '',
      status: user.status || 'active'
    }
    
    originalUserData.value = { ...userData.value }
    
  } catch (err) {
    console.error('Error cargando datos del usuario:', err)
    showError('Error al cargar los datos del usuario', 'Error de carga')
  }
}

const triggerFileInput = () => {
  fileInput.value?.click()
}

const handlePhotoUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (!file) return

  const maxSize = 5 * 1024 * 1024
  if (file.size > maxSize) {
    showError('La imagen es muy grande. Máximo 5MB', 'Error de tamaño')
    return
  }

  const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp']
  if (!validTypes.includes(file.type)) {
    showError('Formato no válido. Usa JPG, PNG, GIF o WEBP', 'Formato inválido')
    return
  }

  const formData = new FormData()
  formData.append('photo', file)
  formData.append('_method', 'PUT')

  try {
    const reader = new FileReader()
    reader.onload = (e) => {
      userData.value.photo = e.target?.result as string
    }
    reader.readAsDataURL(file)

    const response = await api.post(`/users/${userData.value.id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })

    if (response.data.user && response.data.user.photo) {
      userData.value.photo = response.data.user.photo
      originalUserData.value.photo = response.data.user.photo
      eventBus.emit(EVENTS.PROFILE_PHOTO_UPDATED, response.data.user.photo)
    }

    success('Foto actualizada correctamente', '¡Éxito!')
  } catch (err: any) {
    console.error('Error al subir la foto:', err)
    showError('Error al subir la foto. Intenta nuevamente', 'Error')
  } finally {
    if (fileInput.value) {
      fileInput.value.value = ''
    }
  }
}

const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement
  target.src = defaultAvatar
}

const updateCities = () => {
  userData.value.city = ''
}

const saveProfile = async () => {
  if (!hasProfileChanges.value) return
  
  savingProfile.value = true
  try {
    await api.put(`/users/${userData.value.id}`, {
      name: userData.value.name,
      phone: userData.value.phone,
      bio: userData.value.bio,
      department: userData.value.department,
      city: userData.value.city,
      id_documento: userData.value.id_documento
    })

    originalUserData.value = { ...userData.value }
    success('Perfil actualizado correctamente', '¡Guardado!')
  } catch (err: any) {
    console.error('Error actualizando perfil:', err)
    showError('Error al actualizar perfil. Intenta nuevamente', 'Error')
  } finally {
    savingProfile.value = false
  }
}

const resetProfileChanges = () => {
  userData.value = { ...originalUserData.value }
}

const updatePassword = async () => {
  if (!canUpdatePassword.value) {
    showError('Por favor completa todos los campos correctamente', 'Campos incompletos')
    return
  }
  
  // Validar fuerza de contraseña antes de enviar
  if (passwordStrength.value.class === 'very-weak' || passwordStrength.value.class === 'weak') {
    showError('La contraseña es demasiado débil. Usa una contraseña más segura', 'Contraseña débil')
    return
  }
  
  updatingPassword.value = true
  try {
    // Endpoint correcto según el backend
    await api.put('/auth/password', {
      current_password: passwords.value.current,
      new_password: passwords.value.new,
      new_password_confirmation: passwords.value.confirm
    })

    success('Contraseña actualizada correctamente', '¡Éxito!')
    resetPasswordFields()
  } catch (err: any) {
    console.error('Error actualizando contraseña:', err)
    
    // Manejar errores específicos del backend
    if (err.response?.status === 401) {
      showError('La contraseña actual es incorrecta', 'Error de autenticación')
    } else if (err.response?.status === 422) {
      const errors = err.response?.data?.errors
      if (errors) {
        // Mostrar el primer error de validación
        const firstErrorKey = Object.keys(errors)[0]
        const firstError = errors[firstErrorKey]
        showError(Array.isArray(firstError) ? firstError[0] : firstError, 'Error de validación')
      } else {
        showError(err.response?.data?.message || 'Los datos ingresados no son válidos', 'Error de validación')
      }
    } else {
      showError(err.response?.data?.message || 'Error al actualizar contraseña. Intenta nuevamente', 'Error')
    }
  } finally {
    updatingPassword.value = false
  }
}

const resetPasswordFields = () => {
  passwords.value = {
    current: '',
    new: '',
    confirm: ''
  }
}

const saveNotifications = async () => {
  savingNotifications.value = true
  try {
    success('Preferencias de notificación guardadas', '¡Guardado!')
  } catch (err) {
    console.error('Error guardando notificaciones:', err)
    showError('Error al guardar preferencias de notificación', 'Error')
  } finally {
    savingNotifications.value = false
  }
}

const resetNotifications = () => {
  notifications.value.forEach(n => {
    if (n.title === 'Correos de novedades' || n.title === 'Alertas de propiedades' || n.title === 'Promociones especiales') {
      n.enabled = true
    } else {
      n.enabled = false
    }
  })
}

const savePreferences = async () => {
  savingPreferences.value = true
  try {
    success('Preferencias guardadas correctamente', '¡Guardado!')
  } catch (err) {
    console.error('Error guardando preferencias:', err)
    showError('Error al guardar preferencias', 'Error')
  } finally {
    savingPreferences.value = false
  }
}

const resetPreferences = () => {
  userPreferences.value = {
    theme: 'light',
    language: 'es',
    timezone: 'America/Bogota',
    units: 'metric'
  }
}

const confirmLogout = () => {
  confirm(
    '¿Estás seguro de que deseas cerrar sesión?',
    () => logoutUser(),
    () => console.log('Logout cancelado'),
    {
      title: 'Cerrar Sesión',
      confirmText: 'Sí, cerrar sesión',
      cancelText: 'Cancelar'
    }
  )
}

const logoutUser = async () => {
  try {
    await api.post('/auth/logout')
    success('Sesión cerrada correctamente', '¡Hasta pronto!')
    setTimeout(() => {
      router.push('/login')
    }, 1000)
  } catch (err) {
    console.error('Error cerrando sesión:', err)
    router.push('/login')
  }
}

// Lifecycle
onMounted(() => {
  loadUserData()
})
</script>

<style scoped>
@import '../../assets/css/Dropdown/SettingsView.css';
</style>