const About = () => {
  return (
    <div className="py-8">
      <div className="max-w-5xl mx-auto px-4 space-y-12">
        <h1 className="text-3xl font-semibold tracking-tight">
          Acerca de Mi Tienda
        </h1>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <span className="material-symbols-rounded text-primary-600">
              history
            </span>
            Nuestra Historia
          </h2>
          <p className="text-sm leading-relaxed text-gray-700">
            Desde 2020, Mi Tienda se ha dedicado a ofrecer productos de calidad
            con el mejor servicio al cliente. Comenzamos como una pequeña
            empresa familiar y hemos crecido hasta convertirnos en una tienda
            online de confianza.
          </p>
        </section>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg border border-gray-200 bg-white shadow-sm p-5 flex flex-col gap-3">
            <div className="size-12 rounded-full bg-primary-50 flex items-center justify-center">
              <span className="material-symbols-rounded text-primary-600">
                local_shipping
              </span>
            </div>
            <h3 className="font-medium text-lg">Envío Gratis</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Envío gratuito en compras superiores a $50. Entrega rápida y
              segura.
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white shadow-sm p-5 flex flex-col gap-3">
            <div className="size-12 rounded-full bg-primary-50 flex items-center justify-center">
              <span className="material-symbols-rounded text-primary-600">
                verified
              </span>
            </div>
            <h3 className="font-medium text-lg">Calidad Garantizada</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Todos nuestros productos pasan por estrictos controles de calidad.
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white shadow-sm p-5 flex flex-col gap-3">
            <div className="size-12 rounded-full bg-primary-50 flex items-center justify-center">
              <span className="material-symbols-rounded text-primary-600">
                support_agent
              </span>
            </div>
            <h3 className="font-medium text-lg">Soporte 24/7</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Nuestro equipo está disponible para ayudarte cuando lo necesites.
            </p>
          </div>
        </div>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <span className="material-symbols-rounded text-primary-600">
              flag
            </span>
            Nuestra Misión
          </h2>
          <p className="text-sm leading-relaxed text-gray-700">
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
