import {
  InformationCircleIcon,
  ShieldCheckIcon,
  TruckIcon,
} from "@heroicons/react/24/outline";

const AboutSection = () => {
  return (
    <section className="mt-12 bg-surface p-6">
      <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        <div className="md:col-span-2">
          <h3 className="text-xl font-semibold text-main">
            Sobre nuestra tienda
          </h3>
          <p className="mt-3 text-sm text-sub max-w-prose">
            Somos una tienda especializada en electrónica y componentes.
            Ofrecemos productos verificados, soporte técnico y políticas claras
            de envío y garantía. Nuestro objetivo es que compres con confianza y
            recibas exactamente lo que esperás.
          </p>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex gap-3 items-start">
              <TruckIcon className="w-6 h-6 text-primary-500" />
              <div>
                <div className="text-sm font-medium">Envíos rápidos</div>
                <div className="text-xs text-sub">
                  24–48 horas en la mayoría
                </div>
              </div>
            </div>
            <div className="flex gap-3 items-start">
              <ShieldCheckIcon className="w-6 h-6 text-primary-500" />
              <div>
                <div className="text-sm font-medium">Garantía y soporte</div>
                <div className="text-xs text-sub">30 días de garantía</div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-surface rounded-md p-4 border border-border">
          <div className="flex items-center gap-3">
            <InformationCircleIcon className="w-6 h-6 text-primary-500" />
            <div>
              <div className="text-sm font-semibold text-main">¿Dudas?</div>
              <a
                href="Entrega-Ecommerce/about"
                className="text-xs text-primary-500"
              >
                Visita nuestra sección Sobre Nosotros
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
