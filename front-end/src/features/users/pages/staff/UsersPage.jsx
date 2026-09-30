import { Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import ConfirmDialog from "../../../../components/ConfirmDialog";
import EmptyState from "../../../../components/EmptyState";
import ErrorMessage from "../../../../components/ErrorMessage";
import H2 from "../../../../components/H2";
import LoadingState from "../../../../components/LoadingState";
import Modal from "../../../../components/Modal";
import StatusBadge from "../../../../components/StatusBadge";
import useAuth from "../../../../hooks/useAuth";
import TablePrivate from "../../../products/components/staff/TablePrivate";
import UserForm from "../../components/UserForm";
import useDeleteUser from "../../hooks/useDeleteUser";
import useUpdateUser from "../../hooks/useUpdateUser";
import useUsersAdmin from "../../hooks/useUsersAdmin";

const formatDate = (value) =>
  value
    ? new Intl.DateTimeFormat("es-PE", { dateStyle: "medium" }).format(
        new Date(value),
      )
    : "Sin fecha";

const UsersPage = () => {
  const { user: currentUser, updateUser: updateCurrentUser } = useAuth();
  const { users, isLoading, error, refetch } = useUsersAdmin();
  const [userToEdit, setUserToEdit] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);
  const {
    updateUser,
    isLoading: isUpdating,
    error: updateError,
    reset: resetUpdate,
  } = useUpdateUser();
  const {
    deleteUser,
    isLoading: isDeleting,
    error: deleteError,
    reset: resetDelete,
  } = useDeleteUser();

  const handleUpdate = async (params) => {
    const updatedUser = await updateUser(userToEdit.id, params);
    if (updatedUser.id === currentUser.id) {
      updateCurrentUser(updatedUser);
    }
    setUserToEdit(null);
    refetch();
  };

  const handleDelete = async () => {
    try {
      await deleteUser(userToDelete.id);
      setUserToDelete(null);
      refetch();
    } catch {
      // El dialogo conserva el error del backend.
    }
  };

  const columns = [
    {
      key: "name",
      label: "Nombre",
      render: (value) => <span className="font-medium">{value}</span>,
    },
    { key: "email", label: "Correo" },
    {
      key: "role.name",
      label: "Rol",
      render: (value) => (
        <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold">
          {value}
        </span>
      ),
    },
    {
      key: "is_active",
      label: "Estado",
      render: (value) => <StatusBadge active={value} />,
    },
    {
      key: "created_at",
      label: "Registro",
      render: (value) => (
        <span className="whitespace-nowrap text-sm text-stone-500">
          {formatDate(value)}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Acciones",
      render: (_, user) => {
        const isCurrentUser = user.id === currentUser.id;

        return (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                resetUpdate();
                setUserToEdit(user);
              }}
              className="cursor-pointer rounded-lg p-2 text-blue-700 hover:bg-blue-50"
              aria-label={`Editar ${user.name}`}
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              type="button"
              disabled={isCurrentUser}
              onClick={() => {
                resetDelete();
                setUserToDelete(user);
              }}
              className="cursor-pointer rounded-lg p-2 text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-30"
              aria-label={`Eliminar ${user.name}`}
              title={
                isCurrentUser
                  ? "No puedes eliminar tu propia cuenta"
                  : "Eliminar usuario"
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
    return <LoadingState message="Cargando usuarios..." />;
  }

  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-5 py-10">
      <div>
        <H2>Usuarios</H2>
        <p className="mt-1 text-sm text-stone-500">
          Administra perfiles, roles y acceso al sistema.
        </p>
      </div>
      <ErrorMessage message={error} />
      {users.length === 0 ? (
        <EmptyState
          title="No hay usuarios registrados"
          description="Los usuarios apareceran aqui cuando se registren."
        />
      ) : (
        <TablePrivate columns={columns} data={users} />
      )}

      {userToEdit && (
        <Modal title="Editar usuario" onClose={() => setUserToEdit(null)}>
          <UserForm
            key={userToEdit.id}
            user={userToEdit}
            isCurrentUser={userToEdit.id === currentUser.id}
            onSubmit={handleUpdate}
            onCancel={() => setUserToEdit(null)}
            isLoading={isUpdating}
            error={updateError}
          />
        </Modal>
      )}

      {userToDelete && (
        <ConfirmDialog
          title="Eliminar usuario"
          message={`Se eliminara la cuenta de "${userToDelete.name}" y sus datos relacionados.`}
          onConfirm={handleDelete}
          onCancel={() => setUserToDelete(null)}
          isLoading={isDeleting}
          error={deleteError}
        />
      )}
    </section>
  );
};

export default UsersPage;
