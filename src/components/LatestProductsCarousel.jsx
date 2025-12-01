import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { useEffect, useRef, useState } from "react";
import "swiper/css";
import "swiper/css/navigation";
import { Swiper, SwiperSlide } from "swiper/react";
import ProductCard from "./ProductCard";

const PRODUCTS_API =
  import.meta.env.VITE_PRODUCTS_API ||
  "https://692842d6b35b4ffc5014e50a.mockapi.io/api/v1/products";

const LatestProductsCarousel = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const swiperRef = useRef(null);
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        const res = await fetch(PRODUCTS_API);
        if (!res.ok) throw new Error("Error fetching products");
        const data = await res.json();
        if (!mounted) return;

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
            data
              .map((p) => (p && p.category ? String(p.category).trim() : ""))
              .filter((c) => c)
          );
          categoriesData = Array.from(set).map((s) => ({ id: s, name: s }));
        }

        const sorted = Array.isArray(data)
          ? data
              .slice()
              .sort((a, b) => {
                if (a.createdAt && b.createdAt)
                  return new Date(b.createdAt) - new Date(a.createdAt);
                const ai = Number(a.id);
                const bi = Number(b.id);
                if (!Number.isNaN(ai) && !Number.isNaN(bi)) return bi - ai;
                return 0;
              })
              .slice(0, 10)
          : [];

        const mapped = sorted.map((p) => {
          const prodCat = p?.category ?? "";
          let displayCategory = prodCat;
          const byId = categoriesData.find((c) => c.id === prodCat);
          if (byId) displayCategory = byId.name;
          else {
            const byName = categoriesData.find(
              (c) => String(c.name) === String(prodCat)
            );
            if (byName) displayCategory = byName.name;
          }
          return { ...p, category: displayCategory };
        });

        setProducts(mapped);
      } catch (err) {
        console.warn(err);
        setProducts([]);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => (mounted = false);
  }, []);

  if (loading) return <p className="text-sm text-sub">Cargando novedades...</p>;
  if (!products.length) return null;

  return (
    <section className="mt-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-main">Últimos productos</h3>
        </div>

        <div className="relative">
          <button
            aria-label="Anterior"
            onClick={() => swiperRef.current && swiperRef.current.slidePrev()}
            disabled={isBeginning}
            className={`absolute -left-2 top-1/2 transform -translate-y-1/2 z-20 rounded-full p-2 border border-border bg-surface/80 text-main shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-opacity ${
              isBeginning ? "opacity-40 pointer-events-none" : "opacity-100"
            }`}
          >
            <ChevronLeftIcon className="h-5 w-5" />
          </button>

          <button
            aria-label="Siguiente"
            onClick={() => swiperRef.current && swiperRef.current.slideNext()}
            disabled={isEnd}
            className={`absolute -right-2 top-1/2 transform -translate-y-1/2 z-20 rounded-full p-2 border border-border bg-surface/80 text-main shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-opacity ${
              isEnd ? "opacity-40 pointer-events-none" : "opacity-100"
            }`}
          >
            <ChevronRightIcon className="h-5 w-5" />
          </button>

          <Swiper
            onSwiper={(s) => {
              swiperRef.current = s;
              setIsBeginning(s.isBeginning);
              setIsEnd(s.isEnd);
            }}
            onSlideChange={(s) => {
              setIsBeginning(s.isBeginning);
              setIsEnd(s.isEnd);
            }}
            keyboard
            spaceBetween={16}
            slidesPerView={1}
            breakpoints={{
              480: { slidesPerView: 1 },
              640: { slidesPerView: 2 },
              900: { slidesPerView: 3 },
              1200: { slidesPerView: 4 },
            }}
          >
            {products.map((p) => (
              <SwiperSlide key={p.id}>
                <div className="p-2">
                  <ProductCard
                    id={p.id}
                    name={p.title}
                    price={p.price}
                    imageUrl={p.image}
                    fullProduct={p}
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </section>
  );
};

export default LatestProductsCarousel;
