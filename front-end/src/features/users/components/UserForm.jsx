import { useState } from "react";
import Button from "../../../components/Button";
import ErrorMessage from "../../../components/ErrorMessage";
import LabelInput from "../../../components/LabelInput";
import LoadingState from "../../../components/LoadingState";
import useRoles from "../hooks/useRoles";

const UserForm = ({
  user,
  isCurrentUser,
  onSubmit,
  onCancel,
  isLoading,
  error,
}) => {
  const { roles, isLoading: rolesLoading, error: rolesError } = useRoles();
  const [formData, setFormData] = useState({
    name: user.name || "",
    email: user.email || "",
    role_id: user.role?.id || "",
    is_active: user.is_active,
  });
  const [validationErrors, setValidationErrors] = useState({});

  const setField = (field, value) => {
    setFormData((current) => ({ ...current, [field]: value }));
    setValidationErrors((current) => ({ ...current, [field]: null }));
  };

  const validate = () => {
    const nextErrors = {};
    if (!formData.name.trim()) nextErrors.name = "El nombre es obligatorio.";
    if (!formData.email.trim()) nextErrors.email = "El correo es obligatorio.";
    if (!formData.role_id) nextErrors.role_id = "Selecciona un rol.";
    setValidationErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;

    try {
      await onSubmit({
        name: formData.name.trim(),
        email: formData.email.trim(),
        role_id: Number(formData.role_id),
        is_active: formData.is_active,
      });
    } catch {
      // El hook presenta el error de API en este formulario.
    }
  };

  if (rolesLoading) {
    return <LoadingState message="Cargando roles..." />;
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
      <LabelInput
        id="admin-user-name"
        name="name"
        label="Nombre"
        value={formData.name}
        onChange={(event) => setField("name", event.target.value)}
        error={validationErrors.name}
        required
      />
      <LabelInput
        id="admin-user-email"
        name="email"
        label="Correo"
        type="email"
        value={formData.email}
        onChange={(event) => setField("email", event.target.value)}
        error={validationErrors.email}
        required
      />

      <div className="flex flex-col gap-1">
        <label htmlFor="admin-user-role" className="font-medium">
          Rol
        </label>
        <select
          id="admin-user-role"
          name="role_id"
          value={formData.role_id}
          onChange={(event) => setField("role_id", event.target.value)}
          disabled={isCurrentUser}
          className="rounded-xl border border-gray-200 bg-white px-4 py-3 disabled:cursor-not-allowed disabled:bg-gray-100"
        >
          {roles.map((role) => (
            <option key={role.id} value={role.id}>
              {role.name}
            </option>
          ))}
        </select>
        {validationErrors.role_id && (
          <p className="text-sm text-red-600">{validationErrors.role_id}</p>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="admin-user-status" className="font-medium">
          Estado
        </label>
        <select
          id="admin-user-status"
          name="is_active"
          value={String(formData.is_active)}
          onChange={(event) =>
            setField("is_active", event.target.value === "true")
          }
          disabled={isCurrentUser}
          className="rounded-xl border border-gray-200 bg-white px-4 py-3 disabled:cursor-not-allowed disabled:bg-gray-100"
        >
          <option value="true">Activo</option>
          <option value="false">Inactivo</option>
        </select>
      </div>

      {isCurrentUser && (
        <p className="text-sm text-amber-700 sm:col-span-2">
          Por seguridad, tu propio rol y estado no se modifican desde esta
          pantalla.
        </p>
      )}
      <div className="sm:col-span-2">
        <ErrorMessage message={rolesError || error} />
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
          disabled={isLoading || roles.length === 0}
        >
          {isLoading ? "Guardando..." : "Guardar usuario"}
        </Button>
      </div>
    </form>
  );
};

export default UserForm;
