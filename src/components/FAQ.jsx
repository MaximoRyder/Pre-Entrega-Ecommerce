import { useState } from "react";
import "../styles/FAQ.css";

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

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="faq-page">
      <div className="faq-container">
        <h1>Preguntas Frecuentes</h1>
        <p className="faq-intro">
          Encuentra respuestas a las preguntas más comunes sobre nuestros
          productos y servicios.
        </p>

        <div className="faq-list">
          {faqs.map((faq, index) => (
            <div key={index} className="faq-item">
              <button
                className="faq-question"
                onClick={() => toggleFAQ(index)}
                aria-expanded={openIndex === index}
              >
                <span>{faq.question}</span>
                <span className="material-symbols-rounded faq-icon">
                  {openIndex === index ? "expand_less" : "expand_more"}
                </span>
              </button>
              {openIndex === index && (
                <div className="faq-answer">
                  <p>{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="faq-contact">
          <h3>¿No encontraste lo que buscabas?</h3>
          <p>Contáctanos y te ayudaremos con cualquier duda adicional.</p>
          <button className="btn" data-variant="primary" data-visual="solid">
            <span className="material-symbols-rounded">mail</span>
            Contactar Soporte
          </button>
        </div>
      </div>
    </div>
  );
};

export default FAQ;
