import { useContext, useEffect, useState } from "react";
import FilterContext from "../context/searchContext";
import "../styles/ProductsList.css";
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

    async function loadData() {
      try {
        const res = await fetch(
          "https://692842d6b35b4ffc5014e50a.mockapi.io/api/v1/products"
        );
        if (!res.ok) throw new Error("Error al obtener productos");
        const productsData = await res.json();

        let categoriesData = [];
        try {
          const cRes = await fetch(
            "https://692842d6b35b4ffc5014e50a.mockapi.io/api/v1/categories"
          );
          if (cRes.ok) {
            const maybe = await cRes.json();
            if (Array.isArray(maybe)) {
              if (maybe.every((i) => typeof i === "string")) {
                categoriesData = maybe.map((s) => ({ id: s, name: s }));
              } else if (maybe.every((i) => i && (i.name || i.title))) {
                categoriesData = maybe.map((i) => ({
                  id: i.id ?? (i.name || i.title),
                  name: i.name || i.title,
                }));
              }
            }
          }
        } catch (err) {
          console.warn("No se pudo obtener /categories, usando fallback:", err);
        }

        if (!categoriesData || categoriesData.length === 0) {
          const set = new Set(
            productsData
              .map((p) => (p && p.category ? String(p.category).trim() : ""))
              .filter((c) => c)
          );
          categoriesData = Array.from(set).map((s) => ({ id: s, name: s }));
        }

        if (mounted) {
          setProducts(productsData);
          setFiltered(productsData);
          setCategories(categoriesData);
        }
      } catch (err) {
        if (mounted) setError(err.message || "Error desconocido");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadData();

    return () => (mounted = false);
  }, []);

  useEffect(() => {
    if (activeCategory === "all") {
      setFiltered(products);
    } else {
      setFiltered(
        products.filter((p) => {
          const prodCat = p?.category ?? "";
          if (categories.find((c) => c.id === prodCat))
            return prodCat === activeCategory;
          const found = categories.find(
            (c) => String(c.name) === String(prodCat)
          );
          return found ? found.id === activeCategory : false;
        })
      );
    }
  }, [activeCategory, products, categories]);

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
            key={c.id}
            className={activeCategory === c.id ? "active" : ""}
            onClick={() => setActiveCategory(c.id)}
          >
            {formatCategoryName(c.name)}
          </button>
        ))}

        <div className="info">
          {`Mostrando ${filtered.length} producto${
            filtered.length !== 1 ? "s" : ""
          }`}
          {activeCategory !== "all" &&
            (() => {
              const cat = categories.find((x) => x.id === activeCategory);
              return cat ? ` en ${formatCategoryName(cat.name)}` : "";
            })()}
        </div>
      </div>

      <div className="product-grid">
        {filtered.map((p) => {
          const prodCat = p?.category ?? "";
          let displayCategory = prodCat;
          const byId = categories.find((c) => c.id === prodCat);
          if (byId) displayCategory = byId.name;
          else {
            const byName = categories.find(
              (c) => String(c.name) === String(prodCat)
            );
            if (byName) displayCategory = byName.name;
          }
          return (
            <ProductCard
              key={p.id}
              id={p.id}
              name={p.title}
              price={`$${p.price}`}
              imageUrl={p.image}
              fullProduct={{ ...p, category: displayCategory }}
            />
          );
        })}
      </div>
    </main>
  );
};

export default ProductsList;
