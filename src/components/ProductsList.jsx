import { useContext, useEffect, useState } from "react";
import FilterContext from "../context/searchContext";
import { formatNumber } from "../utils/format";
import Pagination from "./Pagination";
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
  const [page, setPage] = useState(1);
  const pageSize = 10;

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

  // reset page when filter set changes
  useEffect(() => setPage(1), [filtered.length, activeCategory, searchTerm]);

  if (loading)
    return <p className="text-sm text-neutral-500">Cargando productos...</p>;
  if (error) return <p className="text-sm text-red-500">Error: {error}</p>;

  return (
    <section className="space-y-6">
      <h2 className="text-xl font-semibold text-neutral-800">
        Productos Disponibles
      </h2>

      <div className="flex flex-wrap gap-2 items-center">
        <button
          className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
            activeCategory === "all"
              ? "bg-primary-500 text-white border-primary-500"
              : "bg-white text-neutral-600 hover:bg-neutral-100 border-neutral-300"
          }`}
          onClick={() => setActiveCategory("all")}
        >
          Todas
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              activeCategory === c.id
                ? "bg-primary-500 text-white border-primary-500"
                : "bg-white text-neutral-600 hover:bg-neutral-100 border-neutral-300"
            }`}
            onClick={() => setActiveCategory(c.id)}
          >
            {formatCategoryName(c.name)}
          </button>
        ))}
        <div className="ml-auto text-xs text-neutral-500">
          {`Mostrando ${formatNumber(filtered.length)} producto${
            filtered.length !== 1 ? "s" : ""
          }`}
          {activeCategory !== "all" &&
            (() => {
              const cat = categories.find((x) => x.id === activeCategory);
              return cat ? ` en ${formatCategoryName(cat.name)}` : "";
            })()}
        </div>
      </div>

      <div className="grid gap-5 sm:gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {filtered.slice((page - 1) * pageSize, page * pageSize).map((p) => {
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
              price={p.price}
              imageUrl={p.image}
              fullProduct={{ ...p, category: displayCategory }}
            />
          );
        })}
      </div>
      <Pagination
        page={page}
        totalPages={Math.max(1, Math.ceil(filtered.length / pageSize))}
        onPageChange={setPage}
      />
    </section>
  );
};

export default ProductsList;
