import { Link } from "react-router-dom";
import "../styles/Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h3>Mi Tienda</h3>
          <p>
            Tu tienda online de confianza con los mejores productos y precios.
          </p>
        </div>

        <div className="footer-section">
          <h4>Navegación</h4>
          <ul className="footer-links">
            <li>
              <Link to="/">Inicio</Link>
            </li>
            <li>
              <Link to="/about">Nosotros</Link>
            </li>
            <li>
              <Link to="/faq">Preguntas Frecuentes</Link>
            </li>
            <li>
              <Link to="/cart">Carrito</Link>
            </li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Contacto</h4>
          <div className="contact-info">
            <p>
              <span className="material-symbols-rounded">mail</span>
              info@mitienda.com
            </p>
            <p>
              <span className="material-symbols-rounded">phone</span>
              +54 (341) 2268107
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
