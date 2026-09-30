import { useState } from "react";
import Button from "../../../../components/Button";
import ErrorMessage from "../../../../components/ErrorMessage";
import LabelInput from "../../../../components/LabelInput";

const CategoryForm = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading,
  error,
}) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    description: initialData?.description || "",
  });
  const [nameError, setNameError] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.name.trim()) {
      setNameError("El nombre es obligatorio.");
      return;
    }

    try {
      await onSubmit({
        name: formData.name.trim(),
        description: formData.description.trim(),
      });
    } catch {
      // El error del hook se muestra al final del formulario.
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <LabelInput
        id="category-name"
        name="name"
        label="Nombre"
        value={formData.name}
        onChange={(event) => {
          setFormData((current) => ({
            ...current,
            name: event.target.value,
          }));
          setNameError(null);
        }}
        error={nameError}
        required
      />

      <div>
        <label htmlFor="category-description" className="font-medium">
          Descripcion
        </label>
        <textarea
          id="category-description"
          name="description"
          value={formData.description}
          onChange={(event) =>
            setFormData((current) => ({
              ...current,
              description: event.target.value,
            }))
          }
          rows={4}
          className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 focus:border-2 focus:border-goldenHover focus:outline-none"
        />
      </div>

      <ErrorMessage message={error} />

      <div className="flex justify-end gap-3">
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
          disabled={isLoading}
        >
          {isLoading ? "Guardando..." : "Guardar categoria"}
        </Button>
      </div>
    </form>
  );
};

export default CategoryForm;
