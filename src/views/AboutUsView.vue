<template>
    <div class="nosotros-page">

        <main class="nosotros-main">
            <!-- 1. Encabezado -->
            <section class="barra-encabezado">
                <h1>{{ t('about.title') }}</h1>
                <p class="subti">{{ t('about.subtitle') }}</p>
            </section>

            <!-- 2. Nuestra Historia -->
            <section class="seccion-banner historia">
                <div class="banner-content">
                    <h2>{{ t('about.history.title') }}</h2>
                    <p>{{ t('about.history.text') }}</p>
                </div>
            </section>

            <!-- 3. Equipo y Ventajas -->
            <section class="seccion-doble-cards">
                <div class="card">
                    <img src="../assets/img/nosotros.jpg" alt="Nuestro equipo" class="card-img" />
                    <div class="card-content">
                        <h2 class="subtitulo">{{ t('about.team.title') }}</h2>
                        <p class="parrafo">{{ t('about.team.text') }}</p>
                    </div>
                </div>

                <div class="card card-lista">
                    <img src="../assets/img/casa3.webp" alt="¿Por qué Rentus?" class="card-img" />
                    <div class="card-content">
                        <h2 class="subtitulo">{{ t('about.why.title') }}</h2>
                        <ul class="lista-ventajas">
                            <li v-for="(item, i) in tm('about.why.list')" :key="i">
                                {{ item }}
                            </li>

                        </ul>
                    </div>
                </div>
            </section>

            <!-- 4. Misión y Visión -->
            <section class="seccion-banner">
                <div class="banner-content">
                    <h2>♚ {{ t('about.mission.title') }}</h2>
                    <p>{{ t('about.mission.text') }}</p>

                    <h2>✎ {{ t('about.vision.title') }}</h2>
                    <p>{{ t('about.vision.text') }}</p>
                </div>
            </section>

            <!-- 5. Testimonios -->
            <section class="seccion-testimonios">
                <h2 class="subtitulo">{{ t('about.testimonials.title') }}</h2>

                <div class="testimonios-grid">
                    <div v-for="(testimonio, i) in tm('about.testimonials.items')" :key="i" class="testimonio">
                        <p class="comentario">"{{ testimonio.text }}"</p>
                        <span class="autor">- {{ testimonio.author }}</span>
                    </div>

                </div>
            </section>
        </main>
    </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'

const { t, tm } = useI18n()
</script>

<style scoped>
@import "../assets/css/AboutUsView.css";
</style>
