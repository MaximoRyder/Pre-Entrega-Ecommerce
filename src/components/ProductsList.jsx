import { useContext, useEffect, useState } from "react";
import FilterContext from "../context/searchContext";
import "../styles/ProductsList.css"; // Cambiar de MainContent.css a ProductsList.css
import ProductCard from "./ProductCard";

const formatCategoryName = (category) => {
  return category
    .replace(/'/g, "")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const ProductsList = () => {
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    Promise.all([
      fetch("https://fakestoreapi.com/products").then((res) => {
        if (!res.ok) throw new Error("Error al obtener productos");
        return res.json();
      }),
      fetch("https://fakestoreapi.com/products/categories").then((res) => {
        if (!res.ok) throw new Error("Error al obtener categorías");
        return res.json();
      }),
    ])
      .then(([productsData, categoriesData]) => {
        if (mounted) {
          setProducts(productsData);
          setFiltered(productsData);
          setCategories(categoriesData);
        }
      })
      .catch((err) => {
        if (mounted) setError(err.message || "Error desconocido");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => (mounted = false);
  }, []);

  useEffect(() => {
    if (activeCategory === "all") {
      setFiltered(products);
    } else {
      setFiltered(products.filter((p) => p.category === activeCategory));
    }
  }, [activeCategory, products]);

  const { searchTerm } = useContext(FilterContext);

  useEffect(() => {
    const term = (searchTerm || "").trim().toLowerCase();
    if (!term)
      return setFiltered(
        activeCategory === "all"
          ? products
          : products.filter((p) => p.category === activeCategory)
      );
    setFiltered(
      (activeCategory === "all"
        ? products
        : products.filter((p) => p.category === activeCategory)
      ).filter((p) => p.title.toLowerCase().includes(term))
    );
  }, [searchTerm, activeCategory, products]);

  if (loading) return <p>Cargando productos...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <main className="main-content">
      <h2>Productos Disponibles</h2>

      <div className="category-bar">
        <button
          className={activeCategory === "all" ? "active" : ""}
          onClick={() => setActiveCategory("all")}
        >
          Todas las categorías
        </button>
        {categories.map((c) => (
          <button
            key={c}
            className={activeCategory === c ? "active" : ""}
            onClick={() => setActiveCategory(c)}
          >
            {formatCategoryName(c)}
          </button>
        ))}

        <div className="info">
          {`Mostrando ${filtered.length} producto${
            filtered.length !== 1 ? "s" : ""
          }`}
          {activeCategory !== "all"
            ? ` en ${formatCategoryName(activeCategory)}`
            : ""}
        </div>
      </div>

      <div className="product-grid">
        {filtered.map((p) => (
          <ProductCard
            key={p.id}
            id={p.id}
            name={p.title}
            price={`$${p.price}`}
            imageUrl={p.image}
            fullProduct={p}
          />
        ))}
      </div>
    </main>
  );
};

export default ProductsList;
