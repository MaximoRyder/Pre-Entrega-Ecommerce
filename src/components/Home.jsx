import { XMarkIcon } from "@heroicons/react/24/outline";
import { useContext } from "react";
import FilterContext from "../context/searchContext";
import ProductsList from "./ProductsList";
import SearchForm from "./SearchForm";

const Home = () => {
  const { searchTerm, setSearchTerm } = useContext(FilterContext);

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  const clearSearch = () => {
    setSearchTerm("");
  };

  return (
    <div className="py-6">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-2xl font-semibold tracking-tight text-main">
          Inicio
        </h2>

        <SearchForm
          onSearch={handleSearch}
          initialValue={searchTerm}
          placeholder="Buscar productos..."
          className="mt-6"
        />

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
