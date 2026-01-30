<template>
    <div class="properties-view">
        <!-- Hero Banner con Parallax Effect -->
        <!-- <section class="hero-banner">
            <div class="hero-particles">
                <div class="particle" v-for="i in 20" :key="i" :style="{
                    left: Math.random() * 100 + '%',
                    animationDelay: Math.random() * 5 + 's',
                    animationDuration: (3 + Math.random() * 4) + 's'
                }"></div>
            </div>
            <div class="hero-overlay"></div>
            <div class="hero-content">
                <h1 class="hero-title">
                    <span class="title-line">{{ $t('properties.hero.title.line1') }}</span>
                    <span class="title-line gradient-text">{{ $t('properties.hero.title.line2') }}</span>
                </h1>
                <p class="hero-description">
                    {{ $t('properties.hero.description') }}
                </p>

                <div class="quick-stats">
                    <div class="stat-box">
                        <div class="stat-inline-icon">
                            <font-awesome-icon :icon="['fas', 'home']" />
                        </div>
                        <div class="stat-content">
                            <div class="stat-value">{{ properties.length }}</div>
                            <div class="stat-label">{{ $t('properties.hero.stats.properties') }}</div>
                        </div>
                    </div>
                    <div class="stat-box">
                        <div class="stat-inline-icon">
                            <font-awesome-icon :icon="['fas', 'check-circle']" />
                        </div>
                        <div class="stat-content">
                            <div class="stat-value">{{ availableCount }}</div>
                            <div class="stat-label">{{ $t('properties.hero.stats.available') }}</div>
                        </div>
                    </div>
                    <div class="stat-box">
                        <div class="stat-inline-icon">
                            <font-awesome-icon :icon="['fas', 'map-marker-alt']" />
                        </div>
                        <div class="stat-content">
                            <div class="stat-value">{{ citiesCount }}</div>
                            <div class="stat-label">{{ $t('properties.hero.stats.cities') }}</div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="scroll-indicator">
                <div class="scroll-mouse">
                    <div class="scroll-wheel"></div>
                </div>
                <span class="scroll-text">{{ $t('properties.hero.scroll') }}</span>
            </div>
        </section> -->
        
        <PropertyCarousel :properties="properties" :loading-properties="loadingProperties" />

        <!-- 🔥 COMPONENTE DE BÚSQUEDA REUTILIZABLE -->
        <PropertySearch v-model="filters" />

        <!-- Main Container -->
        <div class="main-container">
            <!-- Properties Section -->
            <section class="properties-section">
                <div class="section-header">
                    <div class="header-left">
                        <h2 class="section-title">{{ $t('properties.section.title') }}</h2>
                        <p class="section-subtitle">
                            <span class="results-count">{{ filteredProperties.length }}</span>
                            {{ filteredProperties.length === 1 
                                ? $t('properties.section.results.single') 
                                : $t('properties.section.results.multiple') 
                            }}
                        </p>
                    </div>
                    <router-link v-if="authUser" to="/properties/create" class="btn-add-property">
                        <span class="btn-plus">+</span>
                        <span class="btn-text">{{ $t('properties.section.addProperty') }}</span>
                        <div class="btn-shine"></div>
                    </router-link>
                </div>

                <!-- Properties Grid -->
                <transition-group name="stagger" tag="div" class="properties-grid" v-if="filteredProperties.length">
                    <article v-for="(property, index) in filteredProperties" :key="property.id" class="property-card"
                        :style="{ animationDelay: (index * 0.1) + 's' }" @click="goToDetail(property.id)">
                        <!-- Card Glow Effect -->
                        <div class="card-glow"></div>

                        <!-- Image Section -->
                        <div class="card-image-section">
                            <div class="image-wrapper">
                                <img :src="property.image_url || DEFAULT_PROPERTY_IMAGE" :alt="property.title"
                                    class="property-img" @error="handleImageError" />
                                <div class="image-gradient"></div>
                            </div>

                            <!-- Status Badge -->
                            <div class="status-badge" :class="property.status">
                                <span class="status-pulse"></span>
                                <span class="status-text">{{ friendlyStatus(property.status) }}</span>
                            </div>

                            <!-- Action Buttons -->
                            <div v-if="authUser?.id === property.user_id" class="action-buttons">
                                <router-link :to="{ name: 'PropertyEdit', params: { id: property.id } }"
                                    class="action-btn edit-btn" :title="$t('properties.card.edit')" @click.stop>
                                    <span class="btn-icon">✏️</span>
                                    <div class="btn-bg"></div>
                                </router-link>
                                <button @click.stop="deleteProperty(property.id)" class="action-btn delete-btn"
                                    :title="$t('properties.card.delete')">
                                    <span class="btn-icon">🗑️</span>
                                    <div class="btn-bg"></div>
                                </button>
                            </div>

                            <!-- Type Tag -->
                            <div class="type-tag">
                                <font-awesome-icon :icon="['fas', getTypeIcon(property.title)]" />
                                <span class="type-text">{{ detectTypeTranslated(property.title) }}</span>
                            </div>
                        </div>

                        <!-- Card Content -->
                        <div class="card-content">
                            <!-- Header -->
                            <div class="card-header">
                                <div class="card-header-left">
                                    <h3 class="card-title">{{ property.title }}</h3>
                                    <div class="card-location">
                                        <font-awesome-icon :icon="['fas', 'map-marker-alt']" />
                                        <span class="location-text">{{ property.city }}</span>
                                    </div>
                                </div>
                                <div class="card-header-right">
                                    <span class="price-label-small">{{ $t('properties.card.priceLabel') }}</span>
                                    <span class="price-value-header">
                                        {{ formatPrice(property.monthly_price) }}
                                    </span>
                                    <span class="price-period-small">{{ $t('properties.card.perMonth') }}</span>
                                </div>
                            </div>

                            <!-- Features -->
                            <div class="features-container">
                                <div class="feature-item">
                                    <div class="feature-modern">
                                        <font-awesome-icon :icon="['fas', 'ruler-combined']" />
                                    </div>
                                    <div class="feature-content">
                                        <span class="feature-label">{{ $t('properties.card.features.area') }}</span>
                                        <span class="feature-value">{{ property.area_m2 }} m²</span>
                                    </div>
                                </div>
                                <div v-if="property.num_bedrooms" class="feature-item">
                                    <div class="feature-modern">
                                        <font-awesome-icon :icon="['fas', 'bed']" />
                                    </div>
                                    <div class="feature-content">
                                        <span class="feature-label">{{ $t('properties.card.features.bedrooms') }}</span>
                                        <span class="feature-value">{{ property.num_bedrooms }}</span>
                                    </div>
                                </div>
                                <div v-if="property.num_bathrooms" class="feature-item">
                                    <div class="feature-modern">
                                        <font-awesome-icon :icon="['fas', 'bath']" />
                                    </div>
                                    <div class="feature-content">
                                        <span class="feature-label">{{ $t('properties.card.features.bathrooms') }}</span>
                                        <span class="feature-value">{{ property.num_bathrooms }}</span>
                                    </div>
                                </div>
                            </div>

                            <!-- Description -->
                            <p class="card-description">
                                {{ truncateDescription(property.description) }}
                            </p>

                            <!-- Card Footer -->
                            <div class="card-footer">
                                <button class="btn-view-details" @click.stop="goToDetail(property.id)">
                                    <span class="btn-text">{{ $t('properties.card.viewDetails') }}</span>
                                    <span class="btn-arrow">→</span>
                                    <div class="btn-hover-effect"></div>
                                </button>
                            </div>
                        </div>

                        <!-- Card Border Effect -->
                        <div class="card-border-effect"></div>
                    </article>
                </transition-group>

                <!-- Empty State -->
                <div v-else class="empty-state">
                    <div class="empty-animation">
                        <div class="empty-icon-container">
                            <span class="empty-icon">🏘️</span>
                            <div class="icon-rings">
                                <div class="ring ring-1"></div>
                                <div class="ring ring-2"></div>
                                <div class="ring ring-3"></div>
                            </div>
                        </div>
                    </div>
                    <h3 class="empty-title">{{ $t('properties.empty.title') }}</h3>
                    <p class="empty-message">
                        {{ $t('properties.empty.message') }}
                    </p>
                    <button @click="clearFilters" class="btn-reset-search">
                        <span class="btn-icon">↻</span>
                        <span class="btn-text">{{ $t('properties.empty.resetButton') }}</span>
                        <div class="btn-ripple"></div>
                    </button>
                </div>
            </section>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import api from "../../services/api";
import PropertyCarousel from "./PropertyCarousel.vue";
import PropertySearch from "../../components/search/PropertySearch.vue";
import { usePropertyTypes } from "../../composable/usePropertyTypes";

const DEFAULT_PROPERTY_IMAGE = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwMCIgaGVpZ2h0PSI2MDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEyMDAiIGhlaWdodD0iNjAwIiBmaWxsPSIjZjhmOWZhIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiM2Yzc1N2QiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZW4gbm8gZGlzcG9uaWJsZTwvdGV4dD48L3N2Zz4=";

// ==================== Composables ====================
const router = useRouter();
const { t } = useI18n();
const { 
  detectTypeNormalized,
  detectTypeTranslated,
  getTypeIcon 
} = usePropertyTypes();

// ==================== State ====================
const authUser = ref(null);
const properties = ref([]);
const loadingProperties = ref(false);

const filters = ref({
    search: "",
    city: "",
    type: "",
    maxPrice: null,
});

// ==================== Computed ====================

const filteredProperties = computed(() => {
    return properties.value.filter((p) => {
        // 🔥 Usa detectTypeNormalized del composable
        const typeFromTitle = detectTypeNormalized(p.title);

        const matchSearch =
            !filters.value.search ||
            p.title.toLowerCase().includes(filters.value.search.toLowerCase()) ||
            p.description.toLowerCase().includes(filters.value.search.toLowerCase()) ||
            p.city.toLowerCase().includes(filters.value.search.toLowerCase());

        const matchCity =
            !filters.value.city ||
            p.city.toLowerCase().includes(filters.value.city.toLowerCase());

        const matchType =
            !filters.value.type || filters.value.type === typeFromTitle;

        const rawMax = filters.value.maxPrice;
        const matchPrice = !rawMax || Number(p.monthly_price) <= rawMax;

        return matchSearch && matchCity && matchType && matchPrice;
    });
});

const availableCount = computed(() => {
    return properties.value.filter(p => p.status === 'available').length;
});

const citiesCount = computed(() => {
    return new Set(properties.value.map(p => p.city)).size;
});

// ==================== Methods ====================

const formatPrice = (price) => {
    if (!price && price !== 0) return '$0';
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(price);
};

const loadAuthUser = async () => {
    try {
        const token = localStorage.getItem("token");
        if (token) {
            const { data } = await api.get("/auth/me");
            authUser.value = data;
        }
    } catch (err) {
        console.error(t('properties.errors.loadUser'), err);
    }
};

const loadProperties = async () => {
    loadingProperties.value = true;
    try {
        const { data } = await api.get("/properties");
        properties.value = data;
    } catch (err) {
        console.error(t('properties.errors.loadProperties'), err);
    } finally {
        loadingProperties.value = false;
    }
};

const friendlyStatus = (s) => {
    if (!s) return t('properties.card.status.available');
    const statusKey = s.toString().trim().toLowerCase();
    
    const statusMap = {
        available: t('properties.card.status.available'),
        rented: t('properties.card.status.rented'),
        reserved: t('properties.card.status.reserved'),
        sold: t('properties.card.status.sold'),
        maintenance: t('properties.card.status.maintenance'),
    };
    
    return statusMap[statusKey] || t('properties.card.status.available');
};

const truncateDescription = (description, maxLength = 120) => {
    if (!description) return t('properties.empty.message');
    return description.length > maxLength
        ? description.substring(0, maxLength) + "..."
        : description;
};

const clearFilters = () => {
    filters.value = {
        search: "",
        city: "",
        type: "",
        maxPrice: null,
    };
};

const goToDetail = (id) => {
    router.push({ name: 'PropertyDetail', params: { id } });
};

const deleteProperty = async (id) => {
    if (!confirm(t('properties.delete.confirm'))) return;

    try {
        await api.delete(`/properties/${id}`);
        properties.value = properties.value.filter((p) => p.id !== id);
        alert(t('properties.delete.success'));
    } catch (error) {
        console.error("Error eliminando propiedad:", error);
        alert(t('properties.delete.error'));
    }
};

const handleImageError = (event) => {
    event.target.src = DEFAULT_PROPERTY_IMAGE;
};

// ==================== Lifecycle ====================
onMounted(async () => {
    await loadAuthUser();
    await loadProperties();
});
</script>

<style scoped>
@import "../../assets/css/Properties/PropertyView.css";
</style>    