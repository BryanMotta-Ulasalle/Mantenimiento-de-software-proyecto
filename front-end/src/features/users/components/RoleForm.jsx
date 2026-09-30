import { useState } from "react";
import Button from "../../../components/Button";
import ErrorMessage from "../../../components/ErrorMessage";
import LabelInput from "../../../components/LabelInput";

const RoleForm = ({ role, onSubmit, onCancel, isLoading, error }) => {
  const [name, setName] = useState(role?.name || "");
  const [validationError, setValidationError] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!name.trim()) {
      setValidationError("El nombre es obligatorio.");
      return;
    }

    try {
      await onSubmit({ name: name.trim() });
    } catch {
      // El hook presenta el error de API en este formulario.
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <LabelInput
        id="role-name"
        name="name"
        label="Nombre"
        value={name}
        onChange={(event) => {
          setName(event.target.value);
          setValidationError(null);
        }}
        error={validationError}
        required
      />
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
          {isLoading ? "Guardando..." : "Guardar rol"}
        </Button>
      </div>
    </form>
  );
};

export default RoleForm;
