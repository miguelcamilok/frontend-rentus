<template>
  <footer class="footer">
    <div class="footer-top">
      <div class="footer-col">
        <h4>Sobre Nosotros</h4>
        <p>
          Somos una plataforma dedicada a ayudarle a encontrar la casa ideal
          según tu estilo de vida.
        </p>
      </div>

      <div class="footer-col">
        <h4>Enlaces Rápidos</h4>
        <ul>
          <li>
            <router-link to="/sobre-nosotros">Quiénes Somos</router-link>
          </li>
          <li><router-link to="/propiedades">Propiedades</router-link></li>
          <li><a href="#">Contacto</a></li>
          <li><a href="#">Preguntas Frecuentes</a></li>
        </ul>
      </div>

      <div class="footer-col">
        <h4>Contacto</h4>
        <ul>
          <li>
            <img
              src="https://img.icons8.com/ios-glyphs/20/ffffff/new-post.png"
            />
            <a href="mailto:soporte@RentUs.com">soporte@RentUs.com</a>
          </li>
          <li>
            <img src="https://img.icons8.com/ios-filled/20/ffffff/phone.png" />
            <span>+57 3218598902</span>
          </li>
          <li>
            <img src="https://img.icons8.com/ios-filled/20/ffffff/marker.png" />
            <span>Calle RentUs 123, Popayán</span>
          </li>
        </ul>
      </div>

      <div class="footer-col">
        <h4>Síguenos</h4>
        <div class="social-icons">
          <a href="#"
            ><img
              src="https://img.icons8.com/ios-filled/24/ffffff/facebook-new.png"
              alt="Facebook"
          /></a>
          <a href="#"
            ><img
              src="https://img.icons8.com/ios-filled/24/ffffff/instagram-new.png"
              alt="Instagram"
          /></a>
          <a href="#"
            ><img
              src="https://img.icons8.com/ios-filled/24/ffffff/twitterx--v2.png"
              alt="X"
          /></a>
        </div>
      </div>
    </div>

    <hr />

    <div class="footer-bottom">
      <p>&copy; 2025 RentUs. Todos los derechos reservados</p>
      <div class="footer-links">
        <a href="#">Aviso Legal</a>
        <span>|</span>
        <a href="#">Política de Privacidad</a>
      </div>
    </div>
  </footer>
</template>

<style scoped>
@import "../assets/css/Footer.css";
</style>