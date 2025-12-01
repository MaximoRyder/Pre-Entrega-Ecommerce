import { XMarkIcon } from "@heroicons/react/24/outline";
import { useContext } from "react";
import { Helmet } from "react-helmet-async";
import FilterContext from "../context/searchContext";
import AboutSection from "./AboutSection";
import Hero from "./Hero";
import LatestProductsCarousel from "./LatestProductsCarousel";
import ProductsList from "./ProductsList";
import SearchForm from "./SearchForm";
import TrustBar from "./TrustBar";

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
      <Helmet>
        <title>Inicio | Mi Tienda</title>
        <meta
          name="description"
          content="Bienvenido a Mi Tienda. Encuentra los mejores productos a precios increíbles."
        />
      </Helmet>
      <Hero onSearch={handleSearch} initialValue={searchTerm} />

      <TrustBar />

      <LatestProductsCarousel />

      <div className="max-w-6xl mx-auto px-4 mt-8">
        <div className="bg-surface rounded-lg p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-main">Buscar</h3>
              <p className="mt-1 text-xs text-sub hidden sm:block">
                Buscar por modelo o marca
              </p>
            </div>

            <div className="w-full sm:w-[60%]">
              <SearchForm
                onSearch={handleSearch}
                initialValue={searchTerm}
                placeholder="Buscar productos, marcas o modelos..."
                className="w-full"
              />
            </div>
          </div>

          <div className="mt-4">
            <div className="text-xs text-sub mb-2">Populares:</div>
            <div className="mt-1 flex flex-wrap gap-2">
              {["Gamer", "Gama alta", "Teclado", "Monitor"].map((s) => (
                <button
                  key={s}
                  onClick={() => handleSearch(s)}
                  className="text-xs px-2 py-1 rounded-full border border-border bg-surface-hover hover:bg-surface"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {searchTerm && (
            <div className="mt-3 flex flex-col sm:flex-row sm:items-center gap-3">
              <span className="text-xs text-sub whitespace-nowrap">
                Búsqueda activa:
              </span>

              <div className="w-full sm:w-auto">
                <div className="inline-flex items-center gap-2 rounded-full border border-primary-500/30 bg-primary-500/10 px-3 py-1 min-w-0 w-full sm:w-auto">
                  <span className="text-sm font-medium text-primary-500 truncate block min-w-0">
                    "{searchTerm}"
                  </span>
                  <button
                    type="button"
                    onClick={clearSearch}
                    aria-label="Limpiar búsqueda"
                    className="ml-2 inline-flex items-center justify-center p-1 rounded-full text-primary-500 hover:bg-primary-500/10 focus:outline-none focus-visible:ring focus-visible:ring-primary-500/40"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div id="products-list" className="max-w-6xl mx-auto px-4 mt-8">
        <ProductsList />
      </div>

      <AboutSection />
    </div>
  );
};

export default Home;
