import { Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import Button from "../../../../components/Button";
import ConfirmDialog from "../../../../components/ConfirmDialog";
import ErrorMessage from "../../../../components/ErrorMessage";
import EmptyState from "../../../../components/EmptyState";
import H2 from "../../../../components/H2";
import LoadingState from "../../../../components/LoadingState";
import Modal from "../../../../components/Modal";
import CategoryForm from "../../components/staff/CategoryForm";
import TablePrivate from "../../components/staff/TablePrivate";
import useCategoriesAdmin from "../../hooks/useCategoriesAdmin";
import useCreateCategory from "../../hooks/useCreateCategory";
import useDeleteCategory from "../../hooks/useDeleteCategory";
import useUpdateCategory from "../../hooks/useUpdateCategory";

const CategoriesPage = () => {
  const { categories, isLoading, error, refetch } = useCategoriesAdmin();
  const [formCategory, setFormCategory] = useState(undefined);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const {
    createCategory,
    isLoading: isCreating,
    error: createError,
    reset: resetCreate,
  } = useCreateCategory();
  const {
    updateCategory,
    isLoading: isUpdating,
    error: updateError,
    reset: resetUpdate,
  } = useUpdateCategory();
  const {
    deleteCategory,
    isLoading: isDeleting,
    error: deleteError,
    reset: resetDelete,
  } = useDeleteCategory();

  const isFormOpen = formCategory !== undefined;
  const isEditing = Boolean(formCategory);

  const handleSave = async (params) => {
    if (isEditing) {
      await updateCategory(formCategory.id, params);
    } else {
      await createCategory(params);
    }

    setFormCategory(undefined);
    refetch();
  };

  const handleDelete = async () => {
    try {
      await deleteCategory(categoryToDelete.id);
      setCategoryToDelete(null);
      refetch();
    } catch {
      // El dialogo conserva y muestra el error.
    }
  };

  const columns = [
    {
      key: "name",
      label: "Nombre",
      render: (value) => <span className="font-medium">{value}</span>,
    },
    {
      key: "description",
      label: "Descripcion",
      render: (value) => (
        <span className="block max-w-xl text-sm text-stone-600">
          {value || "Sin descripcion"}
        </span>
      ),
    },
    {
      key: "total_products",
      label: "Productos",
      render: (value) => (
        <span className="rounded-md bg-stone-100 px-2 py-1 text-sm">
          {value || 0}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Acciones",
      render: (_, category) => (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              resetUpdate();
              setFormCategory(category);
            }}
            className="cursor-pointer rounded-lg p-2 text-blue-700 hover:bg-blue-50"
            aria-label={`Editar ${category.name}`}
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => {
              resetDelete();
              setCategoryToDelete(category);
            }}
            className="cursor-pointer rounded-lg p-2 text-red-700 hover:bg-red-50"
            aria-label={`Eliminar ${category.name}`}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  if (isLoading) {
    return <LoadingState message="Cargando categorias..." />;
  }

  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-5 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <H2>Categorias</H2>
          <p className="mt-1 text-sm text-stone-500">
            Organiza los productos visibles en el catalogo.
          </p>
        </div>
        <Button
          color="black"
          size="md"
          className="flex gap-2"
          onClick={() => {
            resetCreate();
            setFormCategory(null);
          }}
        >
          <Plus className="h-4 w-4" />
          Nueva categoria
        </Button>
      </div>

      <ErrorMessage message={error} />
      {categories.length === 0 ? (
        <EmptyState
          title="No hay categorias registradas"
          description="Crea una categoria para organizar el catalogo."
        />
      ) : (
        <TablePrivate columns={columns} data={categories} />
      )}

      {isFormOpen && (
        <Modal
          title={isEditing ? "Editar categoria" : "Crear categoria"}
          onClose={() => setFormCategory(undefined)}
        >
          <CategoryForm
            key={formCategory?.id || "new"}
            initialData={formCategory}
            onSubmit={handleSave}
            onCancel={() => setFormCategory(undefined)}
            isLoading={isCreating || isUpdating}
            error={isEditing ? updateError : createError}
          />
        </Modal>
      )}

      {categoryToDelete && (
        <ConfirmDialog
          title="Eliminar categoria"
          message={
            categoryToDelete.total_products > 0
              ? `"${categoryToDelete.name}" tiene ${categoryToDelete.total_products} productos. El backend eliminara tambien esos productos.`
              : `Se eliminara "${categoryToDelete.name}" de forma permanente.`
          }
          onConfirm={handleDelete}
          onCancel={() => setCategoryToDelete(null)}
          isLoading={isDeleting}
          error={deleteError}
        />
      )}
    </section>
  );
};

export default CategoriesPage;
