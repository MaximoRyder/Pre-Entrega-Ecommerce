import {
  CreditCardIcon,
  ShieldCheckIcon,
  TruckIcon,
} from "@heroicons/react/24/outline";

const TrustBar = () => {
  return (
    <div className="w-full mt-8 py-3">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-surface border border-border rounded-md px-3 py-3 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
          <div className="flex flex-col sm:flex-row items-center sm:items-center text-center sm:text-left gap-2">
            <TruckIcon className="w-6 h-6 text-primary-500" />
            <div className="text-xs text-sub">
              Envío gratis desde <span className="font-medium">$50</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center sm:items-center text-center sm:text-left gap-2">
            <CreditCardIcon className="w-6 h-6 text-primary-500" />
            <div className="text-xs text-sub">Pagos 100% seguros</div>
          </div>

          <div className="flex flex-col sm:flex-row items-center sm:items-center text-center sm:text-left gap-2">
            <ShieldCheckIcon className="w-6 h-6 text-primary-500" />
            <div className="text-xs text-sub">30 días de garantía</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrustBar;
