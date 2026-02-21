<template>
  <div v-if="isVisible" class="modal-overlay" @click.self="closeModal">
    <div class="modal-content">
      <span class="close" @click="closeModal">&times;</span>
      <h2>Solicitud de Mantenimiento</h2>
      
      <form @submit.prevent="submitMaintenanceRequest" class="maintenance-form">
        <div class="form-group">
          <label for="property">Propiedad / Inmueble:</label>
          <select 
            id="property" 
            v-model="formData.property_id" 
            required
          >
            <option value="">Seleccione una propiedad</option>
            <option v-for="contract in userContracts" :key="contract.property_id" :value="contract.property_id">
              {{ contract.property?.title || 'Propiedad ID: ' + contract.property_id }} (Contrato #{{ contract.id }})
            </option>
          </select>
        </div>

        <div class="form-group">
          <label for="title">Asunto de Mantenimiento:</label>
          <input 
            type="text" 
            id="title" 
            v-model="formData.title" 
            required
            class="form-input"
            placeholder="Ej: Fuga de agua en el baño principal"
          />
        </div>

        <div class="form-group">
          <label for="priority">Prioridad:</label>
          <select 
            id="priority" 
            v-model="formData.priority" 
            required
          >
            <option value="low">Baja</option>
            <option value="medium">Media</option>
            <option value="high">Alta</option>
            <option value="urgent">Urgente</option>
          </select>
        </div>

        <div class="form-group">
          <label for="description">Descripción del problema:</label>
          <textarea 
            id="description" 
            v-model="formData.description" 
            rows="4" 
            required
            placeholder="Describe detalladamente el problema, ubicación exacta y cualquier información relevante..."
          ></textarea>
          <div class="char-counter">{{ formData.description.length }}/500</div>
        </div>

        <div class="form-group">
          <label for="image" class="file-label">
            <span class="file-icon">📎</span>
            Adjuntar imagen del problema (opcional)
          </label>
          <input 
            type="file" 
            id="image" 
            accept="image/*"
            @change="handleImageUpload"
            class="file-input"
          />
          
          <div v-if="uploadProgress > 0 && uploadProgress < 100" class="upload-progress">
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: uploadProgress + '%' }"></div>
            </div>
            <span class="progress-text">Subiendo: {{ uploadProgress }}%</span>
          </div>

          <div v-if="formData.image && !uploading" class="image-preview">
            <img :src="imagePreviewUrl" alt="Vista previa" />
            <div class="image-info">
              <span class="image-name">{{ formData.image.name }}</span>
              <span class="image-size">{{ formatFileSize(formData.image.size) }}</span>
            </div>
            <button type="button" @click="removeImage" class="remove-image-btn">
              ×
            </button>
          </div>

          <div v-if="uploadedImageUrl" class="upload-success">
            <span class="success-icon">✅</span>
            <span>Imagen subida correctamente</span>
            <a :href="uploadedImageUrl" target="_blank" class="view-link">Ver imagen</a>
          </div>
        </div>

        <div class="form-actions">
          <button type="button" class="btn-cancel" @click="closeModal">
            Cancelar
          </button>
          <button type="submit" class="btn-submit" :disabled="loading || uploading">
            <span v-if="loading || uploading" class="loading-spinner"></span>
            {{ getSubmitButtonText }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue'
import { contractService } from '@/services/contractService'
import api from '@/services/api'

export default {
  name: 'MaintenanceModal',
  
  props: {
    isVisible: {
      type: Boolean,
      default: false
    }
  },

  emits: ['close', 'submitted'],

  setup(props, { emit }) {
    // Estado del formulario 
    const formData = reactive({
      title: '',
      property_id: '',
      priority: 'medium',
      description: '',
      image: null
    })

    // Estados de UI
    const loading = ref(false)
    const uploading = ref(false)
    const uploadProgress = ref(0)
    const uploadedImageUrl = ref('')
    const userContracts = ref([])

    onMounted(async () => {
      try {
        const response = await contractService.getUserContracts()
        // Filtrar solo contratos activos
        const contracts = Array.isArray(response.data) ? response.data : (response || [])
        userContracts.value = contracts.filter(c => c.status === 'active')
      } catch (err) {
        console.error('Error fetching contracts for maintenance:', err)
      }
    })

    // Computed properties
    const imagePreviewUrl = computed(() => {
      if (formData.image) {
        return URL.createObjectURL(formData.image)
      }
      return ''
    })

    const getSubmitButtonText = computed(() => {
      if (uploading.value) return 'Subiendo imagen...'
      if (loading.value) return 'Enviando solicitud...'
      return 'Enviar Solicitud'
    })

    const IMGBB_API_KEY = '16768ff5cf17e35243555fd8b388abd7' 
    // Métodos
    const closeModal = () => {
      emit('close')
      resetForm()
    }

    const handleImageUpload = (event) => {
      const file = event.target.files[0]
      if (file) {
        // Validar tipo de archivo
        if (!file.type.startsWith('image/')) {
          alert('Por favor, selecciona solo imágenes (JPEG, PNG, GIF)')
          event.target.value = ''
          return
        }
        
        // Validar tamaño (max 10MB para ImgBB)
        if (file.size > 10 * 1024 * 1024) {
          alert('La imagen no debe superar los 10MB')
          event.target.value = ''
          return
        }
        
        formData.image = file
        uploadedImageUrl.value = '' // Resetear URL anterior
      }
    }

    const uploadImageToImgBB = async (file) => {
      uploading.value = true
      uploadProgress.value = 10

      try {
        const formData = new FormData()
        formData.append('image', file)

        // Simular progreso de subida
        uploadProgress.value = 30
        
        const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
          method: 'POST',
          body: formData
        })

        uploadProgress.value = 80

        if (!response.ok) {
          throw new Error('Error al subir la imagen')
        }

        const data = await response.json()
        uploadProgress.value = 100

        // ImgBB devuelve la URL en data.data.url
        return data.data.url

      } catch (error) {
        console.error('Error subiendo imagen:', error)
        throw new Error('No se pudo subir la imagen. Intenta nuevamente.')
      } finally {
        uploading.value = false
        setTimeout(() => {
          uploadProgress.value = 0
        }, 1000)
      }
    }

    const removeImage = () => {
      formData.image = null
      uploadedImageUrl.value = ''
      const fileInput = document.getElementById('image')
      if (fileInput) {
        fileInput.value = ''
      }
    }

    const formatFileSize = (bytes) => {
      if (bytes === 0) return '0 Bytes'
      const k = 1024
      const sizes = ['Bytes', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }

    const resetForm = () => {
      formData.title = ''
      formData.property_id = ''
      formData.priority = 'medium'
      formData.description = ''
      formData.image = null
      loading.value = false
      uploading.value = false
      uploadProgress.value = 0
      uploadedImageUrl.value = ''
    }

    const submitMaintenanceRequest = async () => {
      // Validaciones básicas
      if (!formData.title) {
        alert('Por favor ingresa un título para el asunto')
        return
      }

      if (!formData.property_id) {
        alert('Por favor selecciona una propiedad afectada')
        return
      }

      if (!formData.description.trim()) {
        alert('Por favor describe el problema')
        return
      }

      if (formData.description.length > 500) {
        alert('La descripción no puede exceder los 500 caracteres')
        return
      }

      loading.value = true
      let imageUrl = ''

      try {
        // Subir imagen si existe
        if (formData.image) {
          imageUrl = await uploadImageToImgBB(formData.image)
          uploadedImageUrl.value = imageUrl
        }

        const payload = {
          title: formData.title,
          priority: formData.priority,
          description: formData.description + (imageUrl ? `\n\n[Imagen adjunta: ${imageUrl}]` : ''),
          property_id: formData.property_id
        }

        const res = await api.post('/maintenances', payload)
        
        // Éxito - Emitir evento con todos los datos devueltos
        emit('submitted', res.data?.data || payload)
        
        alert('¡Solicitud de mantenimiento enviada correctamente! Te contactaremos pronto.')
        closeModal()
        
      } catch (error) {
        console.error('Error enviando solicitud:', error)
        if (error.response?.status === 422 && error.response.data?.errors) {
          const errors = error.response.data.errors;
          const messages = Object.values(errors).flat().join('\n');
          alert(`Error de validación:\n${messages}`);
        } else {
          alert(error.response?.data?.message || 'Error al enviar la solicitud. Por favor intenta nuevamente.')
        }
      } finally {
        loading.value = false
      }
    }

    return {
      formData,
      loading,
      uploading,
      uploadProgress,
      uploadedImageUrl,
      imagePreviewUrl,
      userContracts,
      getSubmitButtonText,
      closeModal,
      handleImageUpload,
      removeImage,
      formatFileSize,
      submitMaintenanceRequest
    }
  }
}
</script>

<style scoped>
@import "../../../assets/css/components/MaintenanceModal.css";
</style>