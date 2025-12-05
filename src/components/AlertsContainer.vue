<template>
  <Teleport to="body">
    <div class="alerts-container">
      <TransitionGroup name="alert-stack">
        <div
          v-for="(alert, index) in alerts"
          :key="alert.id"
          :class="['alert', `alert-${alert.type}`]"
          :style="getAlertStyle(index)"
          @mouseenter="pauseAlert(alert.id)"
          @mouseleave="resumeAlert(alert.id)"
        >
          <!-- Timer circular -->
          <div 
            v-if="showTimer(alert)" 
            class="alert-timer"
            :style="{ animationDuration: `${alert.duration || 4000}ms` }"
          ></div>
          
          <!-- Efecto de brillo -->
          <div class="alert-glow-effect"></div>
          
          <!-- Contenido principal -->
          <div class="alert-main">
            <!-- Ícono -->
            <div class="alert-icon-wrapper">
              <div class="icon-container">
                <component :is="getIconComponent(alert.type)" class="icon" />
              </div>
              <div class="icon-pulse"></div>
            </div>
            
            <!-- Texto de la alerta -->
            <div class="alert-content">
              <div class="alert-header">
                <h4 v-if="alert.title" class="alert-title">{{ alert.title }}</h4>
                <span class="alert-time">{{ getTimeAgo() }}</span>
              </div>
              <p class="alert-message">{{ alert.message }}</p>
            </div>
            
            <!-- Botón de cerrar -->
            <button
              v-if="alert.type !== 'confirm'"
              @click="removeAlert(alert.id)"
              class="alert-dismiss"
            >
              <CloseIcon />
            </button>
          </div>
          
          <!-- Barra de progreso -->
          <div 
            v-if="showTimer(alert)" 
            class="alert-progress-bar"
            :style="{ animationDuration: `${alert.duration || 4000}ms` }"
          ></div>
          
          <!-- Botones de confirmación -->
          <div v-if="alert.type === 'confirm'" class="alert-confirm-actions">
            <button
              @click="handleAction(alert, 'cancel')"
              class="confirm-btn cancel-btn"
            >
              {{ alert.cancelText || 'Cancelar' }}
            </button>
            <button
              @click="handleAction(alert, 'confirm')"
              class="confirm-btn accept-btn"
            >
              {{ alert.confirmText || 'Aceptar' }}
            </button>
          </div>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { useAlerts } from '../composable/useAlerts'
import type { Alert } from '../composable/useAlerts'
import { onMounted } from 'vue'

// Iconos como componentes para mejor performance
const SuccessIcon = {
  template: `<svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>`
}

const ErrorIcon = {
  template: `<svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>`
}

const WarningIcon = {
  template: `<svg viewBox="0 0 24 24"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>`
}

const InfoIcon = {
  template: `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>`
}

const ConfirmIcon = {
  template: `<svg viewBox="0 0 24 24"><path d="M8.5 12.5l2 2 5-5"/><circle cx="12" cy="12" r="10"/></svg>`
}

const CloseIcon = {
  template: `<svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>`
}

const { alerts, remove } = useAlerts()

// Computed para mejor performance
// const alertCount = computed(() => alerts.value.length)

// Funciones optimizadas
const getAlertStyle = (index: number) => ({
  transform: `translateY(${index * -12}px) scale(${1 - index * 0.04})`,
  zIndex: 1000 - index,
  opacity: 1 - index * 0.15
})

const showTimer = (alert: Alert) => 
  alert.type !== 'confirm' && alert.duration !== 0

const getIconComponent = (type: string) => {
  const icons = {
    success: SuccessIcon,
    error: ErrorIcon,
    warning: WarningIcon,
    info: InfoIcon,
    confirm: ConfirmIcon
  }
  return icons[type as keyof typeof icons] || InfoIcon
}

const handleAction = (alert: Alert, action: 'confirm' | 'cancel') => {
  if (action === 'confirm') {
    alert.onConfirm?.()
  } else {
    alert.onCancel?.()
  }
  removeAlert(alert.id)
}

const removeAlert = (id: string) => {
  playSound('close')
  remove(id)
}

const pauseAlert = (id: string) => {
  const alertEl = document.querySelector(`[data-alert-id="${id}"]`)
  if (alertEl) {
    const elements = alertEl.querySelectorAll('.alert-timer, .alert-progress-bar')
    elements.forEach(el => (el as HTMLElement).style.animationPlayState = 'paused')
  }
}

const resumeAlert = (id: string) => {
  const alertEl = document.querySelector(`[data-alert-id="${id}"]`)
  if (alertEl) {
    const elements = alertEl.querySelectorAll('.alert-timer, .alert-progress-bar')
    elements.forEach(el => (el as HTMLElement).style.animationPlayState = 'running')
  }
}

const getTimeAgo = () => 'Ahora'

// Sistema de sonidos optimizado
let audioContext: AudioContext | null = null
let hoverSound: HTMLAudioElement | null = null

const initAudio = () => {
  if (typeof window === 'undefined') return
  
  try {
    // Solo inicializar AudioContext cuando sea necesario
    if (window.AudioContext) {
      audioContext = new AudioContext()
    }
    
    // Crear sonido de hover simple
    hoverSound = new Audio()
    const soundData = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAA=='
    hoverSound.src = soundData
    hoverSound.volume = 0.03
  } catch (e) {
    // Silenciar error de audio
  }
}

const playSound = (type: 'hover' | 'close') => {
  if (typeof window === 'undefined') return
  
  try {
    if (type === 'close' && audioContext) {
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime)
      oscillator.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.1)
      
      gainNode.gain.setValueAtTime(0.05, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1)
      
      oscillator.start()
      oscillator.stop(audioContext.currentTime + 0.1)
    }
  } catch (e) {
    // Silenciar error de audio
  }
}

onMounted(() => {
  initAudio()
})
</script>

<style scoped>
/* Variables CSS con tus colores */
:root {
  --primary: #4D2F24;
  --secondary: #EFE8DD;
  --highlight: #C8A97E;
  --dark: #1E1E1E;
  --light: #FFFFFF;
  --success: #10B981;
  --error: #EF4444;
  --warning: #F59E0B;
  --info: #3B82F6;
  --confirm: #8B5CF6;
}

/* Contenedor principal - Abajo a la derecha */
.alerts-container {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 9999;
  display: flex;
  flex-direction: column-reverse;
  gap: 12px;
  pointer-events: none;
  width: 380px;
  max-width: calc(100vw - 48px);
}

/* Transiciones del grupo */
.alert-stack-enter-active,
.alert-stack-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.alert-stack-enter-from {
  opacity: 0;
  transform: translateY(100px) scale(0.9);
  filter: blur(10px);
}

.alert-stack-enter-to {
  opacity: 1;
  transform: translateY(0) scale(1);
  filter: blur(0);
}

.alert-stack-leave-active {
  position: absolute;
  right: 0;
  bottom: 0;
}

.alert-stack-leave-to {
  opacity: 0;
  transform: translateY(100px) scale(0.9);
  filter: blur(10px);
}

.alert-stack-move {
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Estructura de alerta */
.alert {
  position: relative;
  background: var(--light);
  border-radius: 16px;
  padding: 0;
  overflow: hidden;
  pointer-events: auto;
  cursor: default;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 
    0 10px 30px rgba(77, 47, 36, 0.15),
    0 4px 12px rgba(77, 47, 36, 0.1),
    0 0 0 1px rgba(77, 47, 36, 0.08);
  animation: slideInUp 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.8);
}

.alert:hover {
  transform: translateY(-2px) scale(1.01);
  box-shadow: 
    0 15px 35px rgba(77, 47, 36, 0.2),
    0 6px 15px rgba(77, 47, 36, 0.15),
    0 0 0 1px rgba(200, 169, 126, 0.2);
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(100px) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Timer circular */
.alert-timer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 16px;
  background: conic-gradient(
    var(--highlight) 0deg,
    transparent 0deg
  );
  mask: radial-gradient(circle at center, transparent 60%, black 61%);
  -webkit-mask: radial-gradient(circle at center, transparent 60%, black 61%);
  animation: timerProgress linear forwards;
  z-index: 1;
  opacity: 0.15;
}

@keyframes timerProgress {
  from {
    background: conic-gradient(
      var(--highlight) 0deg,
      transparent 0deg
    );
  }
  to {
    background: conic-gradient(
      var(--highlight) 360deg,
      transparent 360deg
    );
  }
}

/* Efecto de brillo - menos transparente */
.alert-glow-effect {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.6),  /* Más opaco */
    transparent
  );
  animation: glowShimmer 4s ease-in-out infinite;
  z-index: 1;
  opacity: 0.4; /* Más visible */
}

@keyframes glowShimmer {
  0% {
    left: -100%;
  }
  100% {
    left: 200%;
  }
}

/* Geometría decorativa - más opaca */
.alert-geometry {
  position: absolute;
  inset: 0;
  overflow: hidden;
  z-index: 0;
}

.shape {
  position: absolute;
  border-radius: 50%;
  opacity: 0.2; /* Más visible */
  animation-duration: 20s;
  animation-iteration-count: infinite;
  animation-timing-function: linear;
}

.shape-1 {
  top: -40px;
  right: -40px;
  width: 80px;
  height: 80px;
  background: radial-gradient(circle, var(--highlight) 0%, transparent 70%);
  animation-name: float1;
}

.shape-2 {
  bottom: -20px;
  left: -20px;
  width: 40px;
  height: 40px;
  background: radial-gradient(circle, var(--primary) 0%, transparent 70%);
  animation-name: float2;
}

@keyframes float1 {
  0%, 100% {
    transform: translate(0, 0) rotate(0deg);
  }
  33% {
    transform: translate(-15px, 15px) rotate(120deg);
  }
  66% {
    transform: translate(15px, -15px) rotate(240deg);
  }
}

@keyframes float2 {
  0%, 100% {
    transform: translate(0, 0) rotate(0deg);
  }
  50% {
    transform: translate(20px, -15px) rotate(180deg);
  }
}

/* Contenido principal */
.alert-main {
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 18px;
  z-index: 2;
  background: rgba(255, 255, 255, 0.9); /* Fondo más opaco */
  border-radius: 16px;
}

/* Ícono */
.alert-icon-wrapper {
  position: relative;
  flex-shrink: 0;
}

.icon-container {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--secondary);
  border: 1.5px solid;
  animation: iconPop 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes iconPop {
  0% {
    transform: scale(0) rotate(-180deg);
  }
  70% {
    transform: scale(1.2) rotate(10deg);
  }
  100% {
    transform: scale(1) rotate(0);
  }
}

.icon {
  width: 18px;
  height: 18px;
}

.icon-pulse {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 44px;
  height: 44px;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  background: var(--highlight);
  opacity: 0.3; /* Más visible */
  animation: pulse 2s ease-out infinite;
}

@keyframes pulse {
  0% {
    transform: translate(-50%, -50%) scale(0.8);
    opacity: 0.3;
  }
  70% {
    opacity: 0.15;
  }
  100% {
    transform: translate(-50%, -50%) scale(1.2);
    opacity: 0;
  }
}

/* Contenido de texto */
.alert-content {
  flex: 1;
  min-width: 0;
}

.alert-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 6px;
}

.alert-title {
  font-size: 14px;
  font-weight: 700;
  color: var(--primary);
  margin: 0;
  line-height: 1.4;
}

.alert-time {
  font-size: 11px;
  color: rgba(77, 47, 36, 0.7); /* Más oscuro */
  white-space: nowrap;
  margin-left: 8px;
  font-weight: 500;
}

.alert-message {
  font-size: 13px;
  color: var(--dark);
  margin: 0;
  line-height: 1.4;
  opacity: 0.9;
}

/* Botón de cerrar */
.alert-dismiss {
  position: absolute;
  top: 14px;
  right: 14px;
  width: 26px;
  height: 26px;
  border: none;
  background: rgba(77, 47, 36, 0.1);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  z-index: 3;
}

.alert-dismiss svg {
  width: 12px;
  height: 12px;
  fill: rgba(77, 47, 36, 0.7);
  transition: fill 0.2s ease;
}

.alert-dismiss:hover {
  background: rgba(239, 68, 68, 0.15);
  transform: rotate(90deg);
}

.alert-dismiss:hover svg {
  fill: #EF4444;
}

/* Barra de progreso */
.alert-progress-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background: linear-gradient(90deg, var(--highlight), rgba(200, 169, 126, 0.5));
  transform-origin: left;
  animation: progressShrink linear forwards;
  z-index: 2;
  opacity: 0.8; /* Más visible */
}

@keyframes progressShrink {
  from {
    transform: scaleX(1);
  }
  to {
    transform: scaleX(0);
  }
}

/* Botones de confirmación */
.alert-confirm-actions {
  display: flex;
  padding: 0 18px 18px;
  gap: 10px;
  z-index: 2;
  background: rgba(255, 255, 255, 0.9); /* Fondo más opaco */
  border-radius: 0 0 16px 16px;
}

.confirm-btn {
  flex: 1;
  padding: 9px 14px;
  font-size: 13px;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
}

.confirm-btn::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  transform: translate(-50%, -50%);
  transition: width 0.4s ease, height 0.4s ease;
}

.confirm-btn:hover::after {
  width: 200px;
  height: 200px;
}

.cancel-btn {
  background: var(--secondary);
  color: var(--primary);
  border: 1px solid rgba(77, 47, 36, 0.2);
}

.cancel-btn:hover {
  background: rgba(77, 47, 36, 0.1);
  transform: translateY(-1px);
  box-shadow: 0 3px 8px rgba(77, 47, 36, 0.1);
}

.accept-btn {
  background: var(--highlight);
  color: var(--light);
  box-shadow: 0 2px 6px rgba(200, 169, 126, 0.3);
}

.accept-btn:hover {
  background: rgba(200, 169, 126, 0.9);
  transform: translateY(-1px);
  box-shadow: 0 3px 10px rgba(200, 169, 126, 0.4);
}

/* Colores específicos por tipo */
.alert-success {
  border-left: 4px solid var(--success);
}

.alert-success .icon-container {
  background: rgba(16, 185, 129, 0.15); /* Más opaco */
  border-color: var(--success);
}

.alert-success .icon {
  fill: var(--success);
}

.alert-success .alert-progress-bar {
  background: linear-gradient(90deg, var(--success), rgba(16, 185, 129, 0.6));
}

.alert-success .alert-timer {
  background: conic-gradient(
    var(--success) 0deg,
    transparent 0deg
  );
  opacity: 0.15;
}

.alert-error {
  border-left: 4px solid var(--error);
}

.alert-error .icon-container {
  background: rgba(239, 68, 68, 0.15); /* Más opaco */
  border-color: var(--error);
}

.alert-error .icon {
  fill: var(--error);
}

.alert-error .alert-progress-bar {
  background: linear-gradient(90deg, var(--error), rgba(239, 68, 68, 0.6));
}

.alert-error .alert-timer {
  background: conic-gradient(
    var(--error) 0deg,
    transparent 0deg
  );
  opacity: 0.15;
}

.alert-warning {
  border-left: 4px solid var(--warning);
}

.alert-warning .icon-container {
  background: rgba(245, 158, 11, 0.15); /* Más opaco */
  border-color: var(--warning);
}

.alert-warning .icon {
  fill: var(--warning);
}

.alert-warning .alert-progress-bar {
  background: linear-gradient(90deg, var(--warning), rgba(245, 158, 11, 0.6));
}

.alert-warning .alert-timer {
  background: conic-gradient(
    var(--warning) 0deg,
    transparent 0deg
  );
  opacity: 0.15;
}

.alert-info {
  border-left: 4px solid var(--info);
}

.alert-info .icon-container {
  background: rgba(59, 130, 246, 0.15); /* Más opaco */
  border-color: var(--info);
}

.alert-info .icon {
  fill: var(--info);
}

.alert-info .alert-progress-bar {
  background: linear-gradient(90deg, var(--info), rgba(59, 130, 246, 0.6));
}

.alert-info .alert-timer {
  background: conic-gradient(
    var(--info) 0deg,
    transparent 0deg
  );
  opacity: 0.15;
}

.alert-info .alert-timer,
.alert-info .alert-progress-bar {
  animation-duration: 3000ms !important;
}

.alert-confirm {
  border-left: 4px solid var(--confirm);
}

.alert-confirm .icon-container {
  background: rgba(139, 92, 246, 0.15); /* Más opaco */
  border-color: var(--confirm);
}

.alert-confirm .icon {
  fill: var(--confirm);
}

.alert-confirm .alert-progress-bar {
  background: linear-gradient(90deg, var(--confirm), rgba(139, 92, 246, 0.6));
}

.alert-confirm .alert-timer {
  background: conic-gradient(
    var(--confirm) 0deg,
    transparent 0deg
  );
  opacity: 0.15;
}

/* Responsive */
@media (max-width: 640px) {
  .alerts-container {
    bottom: 16px;
    right: 16px;
    left: 16px;
    width: auto;
    max-width: none;
  }
  
  .alert {
    max-width: 100%;
  }
  
  .alert-main {
    padding: 16px;
    gap: 12px;
  }
  
  .icon-container {
    width: 34px;
    height: 34px;
  }
  
  .icon {
    width: 16px;
    height: 16px;
  }
  
  .alert-confirm-actions {
    padding: 0 16px 16px;
  }
  
  .alert-title {
    font-size: 13px;
  }
  
  .alert-message {
    font-size: 12px;
  }
}

/* Modo oscuro opcional
@media (prefers-color-scheme: dark) {
  .alert {
    background: rgba(30, 30, 30, 0.95); /* Más opaco en modo oscuro 
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: 
      0 10px 30px rgba(0, 0, 0, 0.3),
      0 4px 12px rgba(0, 0, 0, 0.2),
      0 0 0 1px rgba(255, 255, 255, 0.05);
  }
  
  .alert-main {
    background: rgba(30, 30, 30, 0.9);
  }
  
  .alert-confirm-actions {
    background: rgba(30, 30, 30, 0.9);
  }
  
  .alert-title {
    color: var(--light);
  }
  
  .alert-message {
    color: var(--secondary);
    opacity: 0.9;
  }
  
  .alert-time {
    color: rgba(239, 232, 221, 0.7);
  }
  
  .icon-container {
    background: rgba(30, 30, 30, 0.6);
  }
  
  .cancel-btn {
    background: rgba(30, 30, 30, 0.6);
    color: var(--secondary);
    border-color: rgba(255, 255, 255, 0.15);
  }
  
  .alert-dismiss {
    background: rgba(255, 255, 255, 0.1);
  }
  
  .alert-dismiss svg {
    fill: rgba(255, 255, 255, 0.7);
  }
}*/
</style>