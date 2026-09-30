import { LockKeyhole, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import Button from "../../../../components/Button";
import ConfirmDialog from "../../../../components/ConfirmDialog";
import EmptyState from "../../../../components/EmptyState";
import ErrorMessage from "../../../../components/ErrorMessage";
import H2 from "../../../../components/H2";
import LoadingState from "../../../../components/LoadingState";
import Modal from "../../../../components/Modal";
import TablePrivate from "../../../products/components/staff/TablePrivate";
import RoleForm from "../../components/RoleForm";
import useCreateRole from "../../hooks/useCreateRole";
import useDeleteRole from "../../hooks/useDeleteRole";
import useRoles from "../../hooks/useRoles";
import useUpdateRole from "../../hooks/useUpdateRole";

const SYSTEM_ROLES = new Set(["Admin", "Employee", "Customer"]);
const SYSTEM_ROLE_IDS = new Set([1, 2, 3]);

const isProtectedRole = (role) =>
  SYSTEM_ROLE_IDS.has(role.id) || SYSTEM_ROLES.has(role.name);

const RolesPage = () => {
  const { roles, isLoading, error, refetch } = useRoles();
  const [formRole, setFormRole] = useState(undefined);
  const [roleToDelete, setRoleToDelete] = useState(null);
  const {
    createRole,
    isLoading: isCreating,
    error: createError,
    reset: resetCreate,
  } = useCreateRole();
  const {
    updateRole,
    isLoading: isUpdating,
    error: updateError,
    reset: resetUpdate,
  } = useUpdateRole();
  const {
    deleteRole,
    isLoading: isDeleting,
    error: deleteError,
    reset: resetDelete,
  } = useDeleteRole();

  const isFormOpen = formRole !== undefined;
  const isEditing = Boolean(formRole);

  const handleSave = async (params) => {
    if (isEditing) {
      await updateRole(formRole.id, params);
    } else {
      await createRole(params);
    }
    setFormRole(undefined);
    refetch();
  };

  const handleDelete = async () => {
    try {
      await deleteRole(roleToDelete.id);
      setRoleToDelete(null);
      refetch();
    } catch {
      // El dialogo conserva el error del backend.
    }
  };

  const columns = [
    { key: "id", label: "ID" },
    {
      key: "name",
      label: "Nombre",
      render: (value) => <span className="font-medium">{value}</span>,
    },
    {
      key: "type",
      label: "Tipo",
      render: (_, role) =>
        isProtectedRole(role) ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">
            <LockKeyhole className="h-3 w-3" /> Sistema
          </span>
        ) : (
          <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold">
            Personalizado
          </span>
        ),
    },
    {
      key: "actions",
      label: "Acciones",
      render: (_, role) => {
        const isSystemRole = isProtectedRole(role);

        return (
          <div className="flex gap-2">
            <button
              type="button"
              disabled={isSystemRole}
              onClick={() => {
                resetUpdate();
                setFormRole(role);
              }}
              className="cursor-pointer rounded-lg p-2 text-blue-700 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-30"
              aria-label={`Editar ${role.name}`}
              title={isSystemRole ? "Rol protegido por el sistema" : "Editar rol"}
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              type="button"
              disabled={isSystemRole}
              onClick={() => {
                resetDelete();
                setRoleToDelete(role);
              }}
              className="cursor-pointer rounded-lg p-2 text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-30"
              aria-label={`Eliminar ${role.name}`}
              title={
                isSystemRole ? "Rol protegido por el sistema" : "Eliminar rol"
              }
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        );
      },
    },
  ];

  if (isLoading) {
    return <LoadingState message="Cargando roles..." />;
  }

  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-5 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <H2>Roles</H2>
          <p className="mt-1 text-sm text-stone-500">
            Los roles base estan protegidos porque controlan los permisos.
          </p>
        </div>
        <Button
          color="black"
          size="md"
          className="flex gap-2"
          onClick={() => {
            resetCreate();
            setFormRole(null);
          }}
        >
          <Plus className="h-4 w-4" />
          Nuevo rol
        </Button>
      </div>

      <ErrorMessage message={error} />
      {roles.length === 0 ? (
        <EmptyState
          title="No hay roles"
          description="Crea un rol para comenzar."
        />
      ) : (
        <TablePrivate columns={columns} data={roles} />
      )}

      {isFormOpen && (
        <Modal
          title={isEditing ? "Editar rol" : "Crear rol"}
          onClose={() => setFormRole(undefined)}
        >
          <RoleForm
            key={formRole?.id || "new"}
            role={formRole}
            onSubmit={handleSave}
            onCancel={() => setFormRole(undefined)}
            isLoading={isCreating || isUpdating}
            error={isEditing ? updateError : createError}
          />
        </Modal>
      )}

      {roleToDelete && (
        <ConfirmDialog
          title="Eliminar rol"
          message={`Se intentara eliminar el rol "${roleToDelete.name}". Si tiene usuarios asociados, el backend rechazara la operacion.`}
          onConfirm={handleDelete}
          onCancel={() => setRoleToDelete(null)}
          isLoading={isDeleting}
          error={deleteError}
        />
      )}
    </section>
  );
};

export default RolesPage;
