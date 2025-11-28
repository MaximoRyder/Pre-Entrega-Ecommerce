import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Footer from "./Footer";
import Header from "./Header";

const Layout = () => {
  const location = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col bg-neutral-100 text-neutral-900 font-sans">
      <Header />
      <main className="flex-1 w-full mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="w-full">
          <Outlet />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
