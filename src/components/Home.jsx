import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useContext, useState } from "react";
import FilterContext from "../context/searchContext";
import ProductsList from "./ProductsList";

const Home = () => {
  const { searchTerm, setSearchTerm } = useContext(FilterContext);
  const [localSearch, setLocalSearch] = useState(searchTerm || "");

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchTerm(localSearch);
  };

  const clearSearch = () => {
    setSearchTerm("");
    setLocalSearch("");
  };

  return (
    <div className="py-6">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-2xl font-semibold tracking-tight text-main">
          Inicio
        </h2>

        <form
          onSubmit={handleSearch}
          className="mt-6 flex flex-col sm:flex-row gap-3"
        >
          <input
            type="text"
            placeholder="Buscar productos..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="flex-1 rounded-md border border-border bg-surface text-main px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 rounded-md bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium px-4 py-2 transition-colors focus:outline-none focus-visible:ring focus-visible:ring-primary-500/40"
          >
            <MagnifyingGlassIcon className="w-5 h-5" />
            Buscar
          </button>
        </form>

        {searchTerm && (
          <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-3">
            <span className="text-xs font-medium uppercase tracking-wide text-sub">
              Búsqueda activa:
            </span>
            <div className="inline-flex items-center gap-2 rounded-full border border-primary-500/30 bg-primary-500/10 px-4 py-1.5">
              <span className="text-sm font-medium text-primary-500 max-w-[220px] truncate">
                "{searchTerm}"
              </span>
              <button
                type="button"
                onClick={clearSearch}
                aria-label="Limpiar búsqueda"
                className="size-7 inline-flex items-center justify-center rounded-full hover:bg-primary-500/20 text-primary-500 focus:outline-none focus-visible:ring focus-visible:ring-primary-500/40"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="mt-8">
        <ProductsList />
      </div>
    </div>
  );
};

export default Home;
