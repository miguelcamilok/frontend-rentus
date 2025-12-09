<template>
    <div class="nosotros-page">

        <!-- Contenido principal -->
        <main class="nosotros-main">
            <!-- 1. Encabezado con barra translúcida -->
            <section class="barra-encabezado">
                <h1>¿Quiénes somos?</h1>
                <p class="subti">Rentus, una aplicación de Gestión Inmobiliaria</p>
            </section>

            <!-- 2. Nuestra Historia -->
            <section class="seccion-banner historia">
                <div class="banner-content">
                    <h2>Nuestra Historia</h2>
                    <p>
                        RentUs nació con la misión de simplificar el proceso de arriendo de
                        propiedades. Comenzamos como un pequeño equipo apasionado por la
                        tecnología, con la idea de crear una plataforma eficiente, segura y
                        accesible.
                    </p>
                </div>
            </section>

            <!-- 3. Cards de Equipo y Ventajas -->
            <section class="seccion-doble-cards">
                <div class="card">
                    <img src="../assets/img/nosotros.jpg" alt="Nuestro equipo" class="card-img" />
                    <div class="card-content">
                        <h2 class="subtitulo">Nuestro Equipo</h2>
                        <p class="parrafo">
                            Un equipo diverso de desarrolladores, diseñadores y gestores
                            trabaja día a día para ofrecerte una experiencia digital de
                            calidad, segura y en constante evolución.
                        </p>
                    </div>
                </div>

                <div class="card card-lista">
                    <img src="../assets/img/casa3.webp" alt="¿Por qué Rentus?" class="card-img" />
                    <div class="card-content">
                        <h2 class="subtitulo">¿Por qué elegir Rentus?</h2>
                        <ul class="lista-ventajas">
                            <li>Interfaz intuitiva y adaptable</li>
                            <li>Gestión completa de propiedades y contratos</li>
                            <li>Notificaciones automatizadas</li>
                            <li>Acceso multiusuario con roles</li>
                            <li>Totalmente responsive</li>
                        </ul>
                    </div>
                </div>
            </section>

            <!-- 4. Misión y Visión -->
            <section class="seccion-banner">
                <div class="banner-content">
                    <h2>♚ Nuestra Misión</h2>
                    <p>
                        Empoderar a propietarios e inquilinos mediante tecnología fácil,
                        rápida y segura.
                    </p>
                    <h2>✎ Nuestra Visión</h2>
                    <p>
                        Convertirnos en la plataforma #1 de arriendo digital en
                        Latinoamérica para 2030.
                    </p>
                </div>
            </section>

            <!-- 5. Testimonios -->
            <section class="seccion-testimonios">
                <h2 class="subtitulo">Lo que dicen nuestros usuarios</h2>
                <div class="testimonios-grid">
                    <div class="testimonio">
                        <p class="comentario">
                            "¡Una plataforma increíble! Me ayudó a encontrar mi apartamento en
                            menos de 2 días."
                        </p>
                        <span class="autor">- Laura Gómez</span>
                    </div>
                    <div class="testimonio">
                        <p class="comentario">
                            "Como arrendador, ahora gestiono todos mis contratos y pagos en un
                            solo lugar."
                        </p>
                        <span class="autor">- Juan Ríos</span>
                    </div>
                </div>
            </section>
        </main>
    </div>
</template>

<style scoped>
@import "../assets/css/AboutUsView.css";
</style>
