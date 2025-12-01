import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";

const SearchForm = ({
  onSearch,
  initialValue = "",
  placeholder = "Buscar...",
  className = "",
}) => {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(value);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`flex flex-row gap-3 ${className}`}
    >
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="flex-1 rounded-md border border-border bg-surface text-main px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        aria-label={placeholder}
      />
      <button
        type="submit"
        className="inline-flex items-center justify-center rounded-md bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium px-3 py-2 gap-2 sm:px-4 sm:py-2 transition-colors focus:outline-none focus-visible:ring focus-visible:ring-primary-500/40"
      >
        <MagnifyingGlassIcon className="w-5 h-5" />
        Buscar
      </button>
    </form>
  );
};

export default SearchForm;
