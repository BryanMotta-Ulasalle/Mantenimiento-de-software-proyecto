import { useEffect, useRef, useState } from "react";
import Button from "../../../../components/Button";
import LabelInput from "../../../../components/LabelInput";

const ProductFilters = ({
  filters,
  categories,
  onChange,
  onClear,
  showStatus = false,
  showStock = false,
  orderingOptions = [],
}) => {
  const [searchValue, setSearchValue] = useState(filters.search);
  const searchTimeout = useRef(null);

  useEffect(
    () => () => {
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
    },
    [],
  );

  const updateFilter = (event) => {
    const { name, value } = event.target;
    onChange((current) => ({ ...current, [name]: value }));
  };

  const updateSearch = (event) => {
    const { value } = event.target;
    setSearchValue(value);

    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      onChange((current) => ({ ...current, search: value }));
    }, 300);
  };

  const clearFilters = () => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    setSearchValue("");
    onClear();
  };

  return (
    <section className="rounded-2xl border border-stone-200 bg-white p-4">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        <LabelInput
          id="product-search"
          name="search"
          label="Buscar por nombre"
          value={searchValue}
          onChange={updateSearch}
          placeholder="Ej. mouse"
        />

        <div className="flex flex-col gap-1">
          <label htmlFor="product-category-filter" className="font-medium">
            Categoría
          </label>
          <select
            id="product-category-filter"
            name="category"
            value={filters.category}
            onChange={updateFilter}
            className="rounded-xl border border-gray-200 bg-white px-4 py-3"
          >
            <option value="">Todas las categorías</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {showStatus && (
          <div className="flex flex-col gap-1">
            <label htmlFor="product-status-filter" className="font-medium">
              Estado
            </label>
            <select
              id="product-status-filter"
              name="is_active"
              value={filters.is_active}
              onChange={updateFilter}
              className="rounded-xl border border-gray-200 bg-white px-4 py-3"
            >
              <option value="">Todos los estados</option>
              <option value="true">Activo</option>
              <option value="false">Inactivo</option>
            </select>
          </div>
        )}

        {showStock && (
          <div className="flex flex-col gap-1">
            <label htmlFor="product-stock-filter" className="font-medium">
              Disponibilidad
            </label>
            <select
              id="product-stock-filter"
              name="stock"
              value={filters.stock}
              onChange={updateFilter}
              className="rounded-xl border border-gray-200 bg-white px-4 py-3"
            >
              <option value="">Todo el stock</option>
              <option value="available">Con stock</option>
              <option value="out">Sin stock</option>
            </select>
          </div>
        )}

        {orderingOptions.length > 0 && (
          <div className="flex flex-col gap-1">
            <label htmlFor="product-ordering-filter" className="font-medium">
              Ordenar por
            </label>
            <select
              id="product-ordering-filter"
              name="ordering"
              value={filters.ordering}
              onChange={updateFilter}
              className="rounded-xl border border-gray-200 bg-white px-4 py-3"
            >
              {orderingOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="flex items-end">
          <Button
            type="button"
            className="w-full border border-stone-300"
            onClick={clearFilters}
          >
            Limpiar filtros
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ProductFilters;
