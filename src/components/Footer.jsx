import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="mt-auto border-t border-neutral-300 bg-neutral-900 text-neutral-300">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-10 sm:py-12 grid gap-8 md:gap-10 md:grid-cols-3">
        <div className="space-y-3">
          <h3 className="text-primary-400 text-xl font-bold">Mi Tienda</h3>
          <p className="text-sm leading-relaxed text-neutral-400">
            Tu tienda online de confianza con los mejores productos y precios.
          </p>
        </div>
        <div className="space-y-3">
          <h4 className="text-neutral-200 text-base font-semibold">
            Navegación
          </h4>
          <ul className="flex flex-col gap-2 text-sm">
            <li>
              <Link className="hover:text-primary-400 transition-colors" to="/">
                Inicio
              </Link>
            </li>
            <li>
              <Link
                className="hover:text-primary-400 transition-colors"
                to="/about"
              >
                Nosotros
              </Link>
            </li>
            <li>
              <Link
                className="hover:text-primary-400 transition-colors"
                to="/faq"
              >
                Preguntas Frecuentes
              </Link>
            </li>
            <li>
              <Link
                className="hover:text-primary-400 transition-colors"
                to="/cart"
              >
                Carrito
              </Link>
            </li>
          </ul>
        </div>
        <div className="space-y-3">
          <h4 className="text-neutral-200 text-base font-semibold">Contacto</h4>
          <div className="flex flex-col gap-2 text-sm text-neutral-400">
            <p className="flex items-center gap-2">
              <span className="material-symbols-rounded text-primary-400 text-base">
                mail
              </span>
              info@mitienda.com
            </p>
            <p className="flex items-center gap-2">
              <span className="material-symbols-rounded text-primary-400 text-base">
                phone
              </span>
              +54 (341) 2268107
            </p>
          </div>
        </div>
      </div>
      <div className="border-t border-neutral-800 bg-neutral-950 py-4 text-center">
        <p className="text-xs text-neutral-500">
          © {new Date().getFullYear()} Mi Tienda. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
