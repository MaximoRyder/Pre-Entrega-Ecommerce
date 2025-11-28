import { ChevronDownIcon, EnvelopeIcon } from "@heroicons/react/24/outline";
import { useState } from "react";

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: "¿Cómo puedo realizar un pedido?",
      answer:
        "Puedes realizar un pedido navegando por nuestros productos, agregándolos al carrito y siguiendo el proceso de checkout. Es muy sencillo y seguro.",
    },
    {
      question: "¿Qué métodos de pago aceptan?",
      answer:
        "Aceptamos tarjetas de crédito y débito (Visa, MasterCard, American Express), PayPal, transferencias bancarias y pagos en efectivo contra entrega.",
    },
    {
      question: "¿Cuánto tiempo tarda la entrega?",
      answer:
        "Los tiempos de entrega varían según tu ubicación. Generalmente, las entregas dentro de la ciudad tardan 1-2 días hábiles, y las entregas nacionales de 3-7 días hábiles.",
    },
    {
      question: "¿Puedo devolver un producto?",
      answer:
        "Sí, aceptamos devoluciones dentro de los 30 días posteriores a la compra. El producto debe estar en su estado original y con el empaque original.",
    },
    {
      question: "¿Hay costos de envío?",
      answer:
        "Ofrecemos envío gratuito para pedidos superiores a $50. Para pedidos menores, el costo de envío se calcula según el peso y la distancia.",
    },
    {
      question: "¿Cómo puedo rastrear mi pedido?",
      answer:
        "Una vez que tu pedido sea enviado, recibirás un email con el número de seguimiento y un enlace para rastrear tu paquete en tiempo real.",
    },
    {
      question: "¿Ofrecen garantía en los productos?",
      answer:
        "Todos nuestros productos cuentan con garantía del fabricante. Además, ofrecemos nuestra propia garantía de satisfacción por 30 días.",
    },
    {
      question: "¿Puedo cambiar o cancelar mi pedido?",
      answer:
        "Puedes cambiar o cancelar tu pedido dentro de las primeras 2 horas después de haberlo realizado. Después de ese tiempo, contacta nuestro servicio al cliente.",
    },
  ];

  const toggleFAQ = (index) => setOpenIndex(openIndex === index ? null : index);

  return (
    <div className="py-8">
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-3xl font-semibold tracking-tight">
          Preguntas Frecuentes
        </h1>
        <p className="mt-4 text-sm text-gray-600 leading-relaxed">
          Encuentra respuestas a las preguntas más comunes sobre nuestros
          productos y servicios.
        </p>

        <div className="mt-8 space-y-4">
          {faqs.map((faq, index) => {
            const open = openIndex === index;
            return (
              <div
                key={index}
                className="rounded-lg border border-gray-200 bg-white shadow-sm"
              >
                <button
                  className="w-full flex items-center justify-between px-4 py-3 text-left focus:outline-none focus-visible:ring focus-visible:ring-primary-500/40"
                  onClick={() => toggleFAQ(index)}
                  aria-expanded={open}
                >
                  <span className="font-medium text-sm md:text-base pr-4">
                    {faq.question}
                  </span>
                  <ChevronDownIcon
                    className={
                      "w-5 h-5 text-gray-500 transition-transform " +
                      (open ? "rotate-180" : "rotate-0")
                    }
                  />
                </button>
                {open && (
                  <div className="px-4 pb-4 -mt-1 text-sm text-gray-600 leading-relaxed border-t border-gray-100">
                    <p>{faq.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-12 rounded-xl bg-gradient-to-r from-primary-50 to-primary-100 p-6 flex flex-col gap-3">
          <h3 className="text-lg font-semibold">
            ¿No encontraste lo que buscabas?
          </h3>
          <p className="text-sm text-gray-700">
            Contáctanos y te ayudaremos con cualquier duda adicional.
          </p>
          <button className="inline-flex items-center gap-2 rounded-md bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium px-4 py-2 transition-colors focus:outline-none focus-visible:ring focus-visible:ring-primary-500/40">
            <EnvelopeIcon className="w-5 h-5" />
            Contactar Soporte
          </button>
        </div>
      </div>
    </div>
  );
};

export default FAQ;
