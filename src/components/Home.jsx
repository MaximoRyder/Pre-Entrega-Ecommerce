import { useContext, useState } from "react";
import FilterContext from "../context/searchContext";
import "../styles/Home.css";
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
    <div className="home">
      <div className="home-header">
        <h2 className="home-title">Inicio</h2>

        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder="Buscar productos..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="search-input"
          />
          <button
            type="submit"
            className="btn search-button"
            data-variant="primary"
            data-visual="solid"
          >
            <span className="material-symbols-rounded">search</span>
            Buscar
          </button>
        </form>

        {searchTerm && (
          <div className="search-active">
            <span className="search-active-label">Búsqueda activa:</span>
            <div className="search-active-tag">
              <span className="search-active-text">"{searchTerm}"</span>
              <button
                type="button"
                onClick={clearSearch}
                className="btn search-clear-button"
                data-variant="primary"
                data-visual="ghost"
                data-size="sm"
                data-shape="square"
                aria-label="Limpiar búsqueda"
              >
                <span className="material-symbols-rounded search-clear-icon">
                  close
                </span>
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="products-grid">
        <ProductsList />
      </div>
    </div>
  );
};

export default Home;
