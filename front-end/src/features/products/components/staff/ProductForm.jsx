import { useState } from "react";
import Button from "../../../../components/Button";
import ErrorMessage from "../../../../components/ErrorMessage";
import LabelInput from "../../../../components/LabelInput";
import LoadingState from "../../../../components/LoadingState";
import useCategory from "../../../Home/hooks/useCategory";

const ProductForm = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading,
  error,
}) => {
  const { categories, isLoading: categoriesLoading, error: categoriesError } =
    useCategory();
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    description: initialData?.description || "",
    price: initialData?.price || "",
    stock: initialData?.stock ?? "",
    status: initialData?.status ?? true,
    category_id: initialData?.category?.id || "",
  });
  const [validationErrors, setValidationErrors] = useState({});

  const setField = (field, value) => {
    setFormData((current) => ({ ...current, [field]: value }));
    setValidationErrors((current) => ({ ...current, [field]: null }));
  };

  const validate = () => {
    const nextErrors = {};

    if (!formData.name.trim()) nextErrors.name = "El nombre es obligatorio.";
    if (!formData.description.trim()) {
      nextErrors.description = "La descripcion es obligatoria.";
    }
    if (!formData.category_id) {
      nextErrors.category_id = "Selecciona una categoria.";
    }
    if (formData.price === "" || Number(formData.price) <= 0) {
      nextErrors.price = "El precio debe ser mayor que cero.";
    }
    if (formData.stock === "" || Number(formData.stock) < 0) {
      nextErrors.stock = "El stock no puede ser negativo.";
    }

    setValidationErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;

    try {
      await onSubmit({
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: formData.price,
        stock: Number(formData.stock),
        status: formData.status,
        category_id: Number(formData.category_id),
      });
    } catch {
      // El error del hook se muestra al final del formulario.
    }
  };

  if (categoriesLoading) {
    return <LoadingState message="Cargando categorias..." />;
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <LabelInput
          id="product-name"
          name="name"
          label="Nombre"
          value={formData.name}
          onChange={(event) => setField("name", event.target.value)}
          error={validationErrors.name}
          required
        />
      </div>

      <div className="sm:col-span-2">
        <label htmlFor="product-description" className="font-medium">
          Descripcion
        </label>
        <textarea
          id="product-description"
          name="description"
          value={formData.description}
          onChange={(event) => setField("description", event.target.value)}
          rows={4}
          className={`mt-1 w-full rounded-xl border bg-white px-4 py-3 focus:border-2 focus:border-goldenHover focus:outline-none ${
            validationErrors.description
              ? "border-red-400"
              : "border-gray-200"
          }`}
          required
        />
        {validationErrors.description && (
          <p className="mt-1 text-sm text-red-600">
            {validationErrors.description}
          </p>
        )}
      </div>

      <LabelInput
        id="product-price"
        name="price"
        label="Precio"
        type="number"
        value={formData.price}
        onChange={(event) => setField("price", event.target.value)}
        error={validationErrors.price}
        min="0.01"
        step="0.01"
        required
      />
      <LabelInput
        id="product-stock"
        name="stock"
        label="Stock"
        type="number"
        value={formData.stock}
        onChange={(event) => setField("stock", event.target.value)}
        error={validationErrors.stock}
        min="0"
        step="1"
        required
      />

      <div className="flex flex-col gap-1">
        <label htmlFor="product-category" className="font-medium">
          Categoria
        </label>
        <select
          id="product-category"
          name="category_id"
          value={formData.category_id}
          onChange={(event) => setField("category_id", event.target.value)}
          className={`rounded-xl border bg-white px-4 py-3 ${
            validationErrors.category_id
              ? "border-red-400"
              : "border-gray-200"
          }`}
          required
        >
          <option value="">Selecciona una categoria</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        {validationErrors.category_id && (
          <p className="text-sm text-red-600">
            {validationErrors.category_id}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="product-status" className="font-medium">
          Estado
        </label>
        <select
          id="product-status"
          name="status"
          value={String(formData.status)}
          onChange={(event) => setField("status", event.target.value === "true")}
          className="rounded-xl border border-gray-200 bg-white px-4 py-3"
        >
          <option value="true">Activo</option>
          <option value="false">Inactivo</option>
        </select>
      </div>

      <div className="sm:col-span-2">
        <ErrorMessage message={categoriesError || error} />
      </div>

      <div className="flex justify-end gap-3 sm:col-span-2">
        <Button
          className="border border-stone-300"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          color="black"
          size="md"
          disabled={isLoading || categories.length === 0}
        >
          {isLoading ? "Guardando..." : "Guardar producto"}
        </Button>
      </div>
    </form>
  );
};

export default ProductForm;
