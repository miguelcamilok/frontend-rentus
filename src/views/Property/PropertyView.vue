<template>
    <div class="properties-view">
        <!-- Hero Banner con Parallax Effect -->
        <section class="hero-banner">
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
                    <span class="title-line">Descubre Tu</span>
                    <span class="title-line gradient-text">Próximo Hogar</span>
                </h1>
                <p class="hero-description">
                    Explora nuestra colección exclusiva de propiedades diseñadas para tu estilo de vida
                </p>

                <!-- Quick Stats -->
                <div class="quick-stats">
                    <div class="stat-box">
                        <div class="stat-inline-icon">
                            <font-awesome-icon :icon="['fas', 'home']" />
                        </div>
                        <div class="stat-content">
                            <div class="stat-value">{{ properties.length }}</div>
                            <div class="stat-label">Propiedades</div>
                        </div>
                    </div>
                    <div class="stat-box">
                        <div class="stat-inline-icon">
                            <font-awesome-icon :icon="['fas', 'check-circle']" />
                        </div>
                        <div class="stat-content">
                            <div class="stat-value">{{ availableCount }}</div>
                            <div class="stat-label">Disponibles</div>
                        </div>
                    </div>
                    <div class="stat-box">
                        <div class="stat-inline-icon">
                            <font-awesome-icon :icon="['fas', 'map-marker-alt']" />
                        </div>
                        <div class="stat-content">
                            <div class="stat-value">{{ citiesCount }}</div>
                            <div class="stat-label">Ciudades</div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Scroll Indicator -->
            <div class="scroll-indicator">
                <div class="scroll-mouse">
                    <div class="scroll-wheel"></div>
                </div>
                <span class="scroll-text">Explorar</span>
            </div>
        </section>
        <section class="search-section">
            <div class="search-wrapper">
                <font-awesome-icon :icon="['fas', 'home']" class="search-header-icon" />
                <p class="search-title">Encuentra Tu Propiedad Ideal</p>
                <div class="search-bar">
                    <!-- Search Input -->
                    <div class="search-input">
                        <input v-model="filters.search" type="text"
                            placeholder="Buscar por título, descripción o ubicación..." />
                        <span class="search-icon">🔍</span>
                    </div>

                    <!-- City Filter -->
                    <div class="search-input">
                        <input v-model="filters.city" type="text" placeholder="Ciudad" />
                        <span class="search-icon">📍</span>
                    </div>

                    <!-- Type Filter -->
                    <div class="search-input">
                        <select v-model="filters.type">
                            <option value="">Tipo de Propiedad</option>
                            <option value="casa">Casa</option>
                            <option value="apartamento">Apartamento</option>
                            <option value="local">Local Comercial</option>
                            <option value="finca">Finca</option>
                        </select>
                    </div>

                    <!-- Price Filter -->
                    <div class="search-input">
                        <input v-model.number="filters.maxPrice" type="number" min="0"
                            placeholder="Presupuesto máximo" />
                        <span class="search-icon">💰</span>
                    </div>

                    <!-- Search Button -->
                    <button @click="applyFilters" class="search-btn">
                        <span class="btn-text">Buscar Propiedades</span>
                        <span class="btn-icon">🔍</span>
                    </button>
                </div>

                <!-- Active Filters Tags -->
                <transition name="slide-fade">
                    <div v-if="hasActiveFilters" class="active-filters-bar">
                        <span class="filters-label">Filtros Activos:</span>
                        <div class="filters-chips">
                            <div v-if="filters.search" class="filter-chip">
                                <span class="chip-icon">🔍</span>
                                <span class="chip-value">{{ filters.search }}</span>
                                <button @click="filters.search = ''" class="chip-close">✕</button>
                            </div>
                            <div v-if="filters.city" class="filter-chip">
                                <span class="chip-icon">📍</span>
                                <span class="chip-value">{{ filters.city }}</span>
                                <button @click="filters.city = ''" class="chip-close">✕</button>
                            </div>
                            <div v-if="filters.type" class="filter-chip">
                                <span class="chip-icon">🏠</span>
                                <span class="chip-value">{{ filters.type }}</span>
                                <button @click="filters.type = ''" class="chip-close">✕</button>
                            </div>
                            <div v-if="filters.maxPrice" class="filter-chip">
                                <span class="chip-icon">💰</span>
                                <span class="chip-value">{{ formatPrice(filters.maxPrice) }}</span>
                                <button @click="filters.maxPrice = null" class="chip-close">✕</button>
                            </div>
                        </div>
                        <button @click="clearFilters" class="btn-clear-all-inline">
                            <span class="icon">↻</span>
                            <span>Limpiar</span>
                        </button>
                    </div>
                </transition>
            </div>

        </section>


        <!-- Main Container -->
        <div class="main-container">
            <!-- Properties Section -->
            <section class="properties-section">
                <div class="section-header">
                    <div class="header-left">
                        <h2 class="section-title">Propiedades Disponibles</h2>
                        <p class="section-subtitle">
                            <span class="results-count">{{ filteredProperties.length }}</span>
                            {{ filteredProperties.length === 1 ? 'propiedad encontrada' : 'propiedades encontradas' }}
                        </p>
                    </div>
                    <router-link v-if="authUser" to="/properties/create" class="btn-add-property">
                        <span class="btn-plus">+</span>
                        <span class="btn-text">Publicar Propiedad</span>
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
                                    class="action-btn edit-btn" title="Editar" @click.stop>
                                    <span class="btn-icon">✏️</span>
                                    <div class="btn-bg"></div>
                                </router-link>
                                <button @click.stop="deleteProperty(property.id)" class="action-btn delete-btn"
                                    title="Eliminar">
                                    <span class="btn-icon">🗑️</span>
                                    <div class="btn-bg"></div>
                                </button>
                            </div>

                            <!-- Type Tag -->
                            <div class="type-tag">
                                <font-awesome-icon :icon="['fas', getTypeIcon(property.title)]" />
                                <span class="type-text">{{ detectType(property.title) }}</span>
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
                                    <span class="price-label-small">Precio Mensual</span>
                                    <span class="price-value-header">
                                        {{ formatPrice(property.monthly_price) }}
                                    </span>
                                    <span class="price-period-small">/mes</span>
                                </div>
                            </div>

                            <!-- Features -->
                            <div class="features-container">
                                <div class="feature-item">
                                    <div class="feature-modern">
                                        <font-awesome-icon :icon="['fas', 'ruler-combined']" />
                                    </div>
                                    <div class="feature-content">
                                        <span class="feature-label">Área</span>
                                        <span class="feature-value">{{ property.area_m2 }} m²</span>
                                    </div>
                                </div>
                                <div v-if="property.num_bedrooms" class="feature-item">
                                    <div class="feature-modern">
                                        <font-awesome-icon :icon="['fas', 'bed']" />
                                    </div>
                                    <div class="feature-content">
                                        <span class="feature-label">Habitaciones</span>
                                        <span class="feature-value">{{ property.num_bedrooms }}</span>
                                    </div>
                                </div>
                                <div v-if="property.num_bathrooms" class="feature-item">
                                    <div class="feature-modern">
                                        <font-awesome-icon :icon="['fas', 'bath']" />
                                    </div>
                                    <div class="feature-content">
                                        <span class="feature-label">Baños</span>
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
                                    <span class="btn-text">Ver Detalles</span>
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
                    <h3 class="empty-title">No se encontraron propiedades</h3>
                    <p class="empty-message">
                        Intenta ajustar los filtros de búsqueda para encontrar más resultados
                    </p>
                    <button v-if="hasActiveFilters" @click="clearFilters" class="btn-reset-search">
                        <span class="btn-icon">↻</span>
                        <span class="btn-text">Reiniciar Búsqueda</span>
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
import api from "../../services/api";

const router = useRouter();

const DEFAULT_PROPERTY_IMAGE = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwMCIgaGVpZ2h0PSI2MDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEyMDAiIGhlaWdodD0iNjAwIiBmaWxsPSIjZjhmOWZhIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiM2Yzc1N2QiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZW4gbm8gZGlzcG9uaWJsZTwvdGV4dD48L3N2Zz4=";

const authUser = ref(null);
const properties = ref([]);

const filters = ref({
    search: "",
    city: "",
    type: "",
    maxPrice: null,
});

// Computed
const filteredProperties = computed(() => {
    return properties.value.filter((p) => {
        const typeFromTitle = detectType(p.title).toLowerCase();

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

const hasActiveFilters = computed(() => {
    return filters.value.search || filters.value.city || filters.value.type || filters.value.maxPrice;
});

// Methods
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
        console.error("Error cargando usuario:", err);
    }
};

const loadProperties = async () => {
    try {
        const { data } = await api.get("/properties");
        properties.value = data;
    } catch (err) {
        console.error("Error cargando propiedades", err);
    }
};

const friendlyStatus = (s) => ({
    available: "Disponible",
    rented: "Rentada",
    maintenance: "Mantenimiento",
}[s] || s);

const detectType = (title) => {
    const t = title.toLowerCase();
    if (t.includes("casa")) return "Casa";
    if (t.includes("apartamento") || t.includes("apto")) return "Apartamento";
    if (t.includes("local")) return "Local";
    if (t.includes("finca")) return "Finca";
    return "Propiedad";
};

const getTypeIcon = (title) => {
  const t = title.toLowerCase();

  if (t.includes("casa")) return "home";
  if (t.includes("apartamento") || t.includes("apto")) return "building";
  if (t.includes("local")) return "store";
  if (t.includes("finca")) return "tree";

  return "home";
};


const truncateDescription = (description, maxLength = 120) => {
    if (!description) return "Descripción no disponible";
    return description.length > maxLength
        ? description.substring(0, maxLength) + "..."
        : description;
};

const applyFilters = () => {
    // Filters apply automatically via computed
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
    if (!confirm("¿Eliminar esta propiedad permanentemente?")) return;

    try {
        await api.delete(`/properties/${id}`);
        properties.value = properties.value.filter((p) => p.id !== id);
        alert("Propiedad eliminada correctamente");
    } catch (error) {
        console.error("Error eliminando propiedad:", error);
        alert("Error al eliminar la propiedad");
    }
};

const handleImageError = (event) => {
    event.target.src = DEFAULT_PROPERTY_IMAGE;
};

onMounted(async () => {
    await loadAuthUser();
    await loadProperties();
});
</script>

<style scoped>
@import "../../assets/css/Properties/PropertyView.css";
</style>