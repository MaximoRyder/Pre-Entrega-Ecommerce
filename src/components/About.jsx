import {
  BookOpenIcon,
  CheckBadgeIcon,
  FlagIcon,
  LifebuoyIcon,
  TruckIcon,
} from "@heroicons/react/24/outline";
import { Helmet } from "react-helmet-async";

const About = () => {
  return (
    <div className="py-8">
      <Helmet>
        <title>Nosotros | Mi Tienda</title>
        <meta
          name="description"
          content="Conoce más sobre Mi Tienda, nuestra historia y compromiso con la calidad."
        />
      </Helmet>
      <div className="max-w-5xl mx-auto px-4 space-y-12">
        <h1 className="text-3xl font-semibold tracking-tight text-main">
          Acerca de Mi Tienda
        </h1>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2 text-main">
            <BookOpenIcon className="w-6 h-6 text-primary-500" />
            Nuestra Historia
          </h2>
          <p className="text-sm leading-relaxed text-sub">
            Desde 2020, Mi Tienda se ha dedicado a ofrecer productos de calidad
            con el mejor servicio al cliente. Comenzamos como una pequeña
            empresa familiar y hemos crecido hasta convertirnos en una tienda
            online de confianza.
          </p>
        </section>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg border border-border bg-surface shadow-sm p-5 flex flex-col gap-3">
            <div className="size-12 rounded-full bg-primary-500/10 flex items-center justify-center">
              <TruckIcon className="w-6 h-6 text-primary-500" />
            </div>
            <h3 className="font-medium text-lg text-main">Envío Gratis</h3>
            <p className="text-sm text-sub leading-relaxed">
              Envío gratuito en compras superiores a $50. Entrega rápida y
              segura.
            </p>
          </div>
          <div className="rounded-lg border border-border bg-surface shadow-sm p-5 flex flex-col gap-3">
            <div className="size-12 rounded-full bg-primary-500/10 flex items-center justify-center">
              <CheckBadgeIcon className="w-6 h-6 text-primary-500" />
            </div>
            <h3 className="font-medium text-lg text-main">
              Calidad Garantizada
            </h3>
            <p className="text-sm text-sub leading-relaxed">
              Todos nuestros productos pasan por estrictos controles de calidad.
            </p>
          </div>
          <div className="rounded-lg border border-border bg-surface shadow-sm p-5 flex flex-col gap-3">
            <div className="size-12 rounded-full bg-primary-500/10 flex items-center justify-center">
              <LifebuoyIcon className="w-6 h-6 text-primary-500" />
            </div>
            <h3 className="font-medium text-lg text-main">Soporte 24/7</h3>
            <p className="text-sm text-sub leading-relaxed">
              Nuestro equipo está disponible para ayudarte cuando lo necesites.
            </p>
          </div>
        </div>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2 text-main">
            <FlagIcon className="w-6 h-6 text-primary-500" />
            Nuestra Misión
          </h2>
          <p className="text-sm leading-relaxed text-sub">
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
