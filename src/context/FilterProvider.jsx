import { useState } from "react";
import FilterContext from "./searchContext";

export const FilterProvider = ({ children }) => {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <FilterContext.Provider value={{ searchTerm, setSearchTerm }}>
      {children}
    </FilterContext.Provider>
  );
};

export default FilterProvider;
