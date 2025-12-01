import { Link } from "react-router-dom";

const ThankYou = () => {
  return (
    <div className="max-w-3xl mx-auto py-16 text-center">
      <h1 className="text-3xl font-bold text-main mb-4">
        Gracias por tu compra
      </h1>
      <p className="text-sm text-sub mb-6">
        Tu orden se ha procesado correctamente. En breve recibirás un correo con
        los detalles de la compra.
      </p>
      <div className="flex items-center justify-center gap-3">
        <Link
          to="/"
          className="inline-flex items-center justify-center rounded-md bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium px-4 py-2"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  );
};

export default ThankYou;
