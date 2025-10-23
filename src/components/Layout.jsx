import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import "../styles/Layout.css";
import Footer from "./Footer";
import Header from "./Header";

const Layout = () => {
  const location = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="layout">
      <Header />
      <div className="layout-body">
        <div className="layout-content">
          <Outlet />
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Layout;
