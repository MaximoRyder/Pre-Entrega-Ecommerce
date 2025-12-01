import { ArrowRightIcon } from "@heroicons/react/24/outline";

const Hero = () => {
  const scrollToProducts = () => {
    const el = document.getElementById("products-list");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      className="w-full relative bg-center bg-cover min-h-[56vh] flex items-center"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=2000&q=80')",
      }}
      aria-label="Hero"
    >
      <div className="absolute inset-0 bg-black/65" />
      <div className="max-w-6xl mx-auto px-4 relative z-10 w-full">
        <div className="bg-surface/30 backdrop-blur-sm rounded-md p-6 sm:p-10 lg:p-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight break-words max-w-xl">
                Encuentra la mejor tecnología
              </h1>
              <p className="mt-3 text-sm sm:text-base text-sub max-w-lg">
                Equipos, componentes y accesorios para gamers, profesionales y
                makers. Revisión técnica, envío rápido y soporte postventa.
              </p>

              <div className="mt-6 sm:mt-8 flex items-center gap-3">
                <button
                  onClick={scrollToProducts}
                  className="inline-flex items-center gap-2 bg-primary-500 text-white px-4 py-2 rounded-md font-medium hover:bg-primary-600"
                  aria-label="Ir a productos disponibles"
                >
                  Productos disponibles
                  <ArrowRightIcon className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="text-sm text-sub">
              <div className="mb-4">
                <strong className="text-main">¿Necesitás ayuda?</strong>
                <div className="mt-2">
                  Asesoramiento técnico y devoluciones fáciles.
                </div>
              </div>

              <ul className="space-y-2 text-xs">
                <li>• Envíos 24–48 horas en la mayoría de los productos</li>
                <li>• 30 días de garantía</li>
                <li>• Pagos 100% seguros</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
