import "../styles/About.css";

const About = () => {
  return (
    <div className="about-page">
      <div className="about-container">
        <h1>Acerca de Mi Tienda</h1>

        <section className="hero-section">
          <h2>Nuestra Historia</h2>
          <p>
            Desde 2020, Mi Tienda se ha dedicado a ofrecer productos de calidad
            con el mejor servicio al cliente. Comenzamos como una pequeña
            empresa familiar y hemos crecido hasta convertirnos en una tienda
            online de confianza.
          </p>
        </section>

        <div className="info-grid">
          <div className="info-card">
            <div className="info-icon">
              <span className="material-symbols-rounded">local_shipping</span>
            </div>
            <h3>Envío Gratis</h3>
            <p>
              Envío gratuito en compras superiores a $50. Entrega rápida y
              segura.
            </p>
          </div>

          <div className="info-card">
            <div className="info-icon">
              <span className="material-symbols-rounded">verified</span>
            </div>
            <h3>Calidad Garantizada</h3>
            <p>
              Todos nuestros productos pasan por estrictos controles de calidad.
            </p>
          </div>

          <div className="info-card">
            <div className="info-icon">
              <span className="material-symbols-rounded">support_agent</span>
            </div>
            <h3>Soporte 24/7</h3>
            <p>
              Nuestro equipo está disponible para ayudarte cuando lo necesites.
            </p>
          </div>
        </div>

        <section className="mission-section">
          <h2>Nuestra Misión</h2>
          <p>
            Proporcionar productos de excelente calidad a precios justos,
            mientras ofrecemos una experiencia de compra excepcional que supere
            las expectativas de nuestros clientes.
          </p>
        </section>
      </div>
    </div>
  );
};

export default About;
