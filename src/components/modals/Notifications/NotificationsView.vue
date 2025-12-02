<template>
  <div v-show="open" class="overlay" @click.self="close">
    <div class="modal">

      <header class="header">
        <h2>Notificaciones</h2>
        <div class="header-actions">
          <button 
            v-if="unreadCount > 0" 
            class="mark-all-btn" 
            @click="markAllAsRead"
            title="Marcar todas como leídas"
          >
            ✓ Marcar todas
          </button>
          <button class="close-btn" @click="close">&times;</button>
        </div>
      </header>

      <div class="content">
        <!-- Loading -->
        <div v-if="loading" class="loading">
          <div class="spinner"></div>
          <p>Cargando notificaciones...</p>
        </div>

        <!-- Notificaciones -->
        <div v-else-if="formattedNotifications.length > 0">
          <div 
            v-for="(group, index) in formattedNotifications" 
            :key="index"
            class="date-group"
          >
            <div class="date-label">{{ group.date }}</div>

            <div 
              v-for="notif in group.items" 
              :key="notif.id"
              class="notif-item"
              :class="{ unread: !notif.read }"
              @click="handleNotificationClick(notif)"
            >
              <div class="icon" :class="getNotificationType(notif.type)">
                <i :class="getNotificationIcon(notif.type)"></i>
              </div>

              <div class="info">
                <p class="text" v-html="notif.message"></p>
                <span class="time">{{ formatTime(notif.created_at) }}</span>
              </div>

              <button 
                class="delete-btn" 
                @click.stop="deleteNotification(notif.id)"
                title="Eliminar"
              >
                ✕
              </button>
            </div>

          </div>
        </div>

        <!-- Vacío -->
        <div v-else class="empty">
          <i class="fas fa-bell-slash"></i>
          <p>No tienes notificaciones</p>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { notificationService } from "../../../services/notificationService";
import type { NotificationItem } from "../../../services/notificationService";
import { useRouter } from "vue-router";

const props = defineProps<{
  open: boolean;
}>();

const emit = defineEmits(["close", "update"]);
const router = useRouter();

const notifications = ref<NotificationItem[]>([]);
const loading = ref(false);

const unreadCount = computed(() => 
  notifications.value.filter(n => !n.read).length
);

// Agrupar por fechas
const formattedNotifications = computed(() => {
  const groups: Record<string, NotificationItem[]> = {};
  
  notifications.value.forEach((notif) => {
    const date = getDateLabel(notif.created_at);
    if (!groups[date]) groups[date] = [];
    groups[date].push(notif);
  });

  return Object.keys(groups).map((date) => ({
    date,
    items: groups[date],
  }));
});

// Cargar notificaciones cuando se abre el modal
watch(() => props.open, async (isOpen) => {
  if (isOpen) {
    await loadNotifications();
  }
});

const loadNotifications = async () => {
  loading.value = true;
  try {
    notifications.value = await notificationService.getNotifications();
  } catch (error) {
    console.error("Error cargando notificaciones:", error);
  } finally {
    loading.value = false;
  }
};

const handleNotificationClick = async (notif: NotificationItem) => {
  // Marcar como leída si no lo está
  if (!notif.read) {
    await markAsRead(notif.id);
  }

  // Navegar según el tipo de notificación
  const data = notif.data ? JSON.parse(notif.data) : {};

  switch (notif.type) {
    case "rental_request":
      // Abrir modal de solicitudes
      close();
      emit("update", { action: "open_requests" });
      break;
    
    case "counter_proposal":
      // Abrir modal de mis solicitudes
      close();
      emit("update", { action: "open_my_requests" });
      break;
    
    case "contract_sent":
      // Ir a la página de contratos
      close();
      router.push("/contratos");
      break;
    
    case "visit_reminder":
      // Abrir detalles de la propiedad
      if (data.property_id) {
        close();
        router.push(`/propiedades/${data.property_id}`);
      }
      break;

    default:
      break;
  }
};

const markAsRead = async (notificationId: number) => {
  try {
    await notificationService.markAsRead(notificationId);
    const notif = notifications.value.find(n => n.id === notificationId);
    if (notif) {
      notif.read = true;
    }
    emit("update", { action: "refresh_count" });
  } catch (error) {
    console.error("Error marcando como leída:", error);
  }
};

const markAllAsRead = async () => {
  try {
    await notificationService.markAllAsRead();
    notifications.value.forEach(n => n.read = true);
    emit("update", { action: "refresh_count" });
  } catch (error) {
    console.error("Error marcando todas como leídas:", error);
  }
};

const deleteNotification = async (notificationId: number) => {
  try {
    await notificationService.deleteNotification(notificationId);
    notifications.value = notifications.value.filter(n => n.id !== notificationId);
    emit("update", { action: "refresh_count" });
  } catch (error) {
    console.error("Error eliminando notificación:", error);
  }
};

const getDateLabel = (dateStr: string) => {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return "Hoy";
  } else if (date.toDateString() === yesterday.toDateString()) {
    return "Ayer";
  } else {
    return date.toLocaleDateString("es-ES", { 
      day: "numeric", 
      month: "long" 
    });
  }
};

const formatTime = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleTimeString("es-ES", { 
    hour: "2-digit", 
    minute: "2-digit" 
  });
};

const getNotificationType = (type: string) => {
  const typeMap: Record<string, string> = {
    rental_request: "primary",
    counter_proposal: "warning",
    contract_sent: "success",
    contract_accepted: "success",
    visit_reminder: "info",
    payment_reminder: "warning",
    system: "info",
  };
  return typeMap[type] || "info";
};

const getNotificationIcon = (type: string) => {
  const iconMap: Record<string, string> = {
    rental_request: "fas fa-home",
    counter_proposal: "fas fa-calendar-alt",
    contract_sent: "fas fa-file-contract",
    contract_accepted: "fas fa-check-circle",
    visit_reminder: "fas fa-clock",
    payment_reminder: "fas fa-dollar-sign",
    system: "fas fa-info-circle",
  };
  return iconMap[type] || "fas fa-bell";
};

const close = () => {
  emit("close");
};
</script>

<style scoped>
@import "../../../assets/css/components/NotificationsView.css";
</style>