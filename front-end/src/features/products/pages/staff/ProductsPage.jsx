import { Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import Button from "../../../../components/Button";
import ConfirmDialog from "../../../../components/ConfirmDialog";
import ErrorMessage from "../../../../components/ErrorMessage";
import H2 from "../../../../components/H2";
import LoadingState from "../../../../components/LoadingState";
import Modal from "../../../../components/Modal";
import StatusBadge from "../../../../components/StatusBadge";
import { formatProductPrice } from "../../utils/productFormatters";
import ProductForm from "../../components/staff/ProductForm";
import ProductTable from "../../components/staff/ProductTable";
import ProductFilters from "../../components/shared/ProductFilters";
import useCategory from "../../../Home/hooks/useCategory";
import useCreateProduct from "../../hooks/useCreateProduct";
import useDeleteProduct from "../../hooks/useDeleteProduct";
import useProducts from "../../hooks/useProducts";
import useUpdateProduct from "../../hooks/useUpdateProduct";

const ADMIN_ORDERING_OPTIONS = [
  { value: "", label: "Orden predeterminado" },
  { value: "name", label: "Nombre A-Z" },
  { value: "-name", label: "Nombre Z-A" },
  { value: "price", label: "Precio: menor a mayor" },
  { value: "-price", label: "Precio: mayor a menor" },
  { value: "stock", label: "Stock: menor a mayor" },
  { value: "-stock", label: "Stock: mayor a menor" },
  { value: "created_at", label: "Más antiguos" },
  { value: "-created_at", label: "Más recientes" },
];

const formatDate = (value) => {
  if (!value) return "Sin fecha";
  return new Intl.DateTimeFormat("es-PE", { dateStyle: "medium" }).format(
    new Date(value),
  );
};

const ProductsPage = () => {
  const [filters, setFilters] = useState({
    search: "",
    category: "",
    is_active: "",
    stock: "",
    ordering: "",
  });
  const {
    products,
    isInitialLoading,
    isRefreshing,
    error,
    refetch,
  } = useProducts(filters);
  const {
    categories,
    isLoading: categoriesLoading,
    error: categoriesError,
  } = useCategory();
  const [formProduct, setFormProduct] = useState(undefined);
  const [productToDelete, setProductToDelete] = useState(null);
  const {
    createProduct,
    isLoading: isCreating,
    error: createError,
    reset: resetCreate,
  } = useCreateProduct();
  const {
    updateProduct,
    isLoading: isUpdating,
    error: updateError,
    reset: resetUpdate,
  } = useUpdateProduct();
  const {
    deleteProduct,
    isLoading: isDeleting,
    error: deleteError,
    reset: resetDelete,
  } = useDeleteProduct();

  const isFormOpen = formProduct !== undefined;
  const isEditing = Boolean(formProduct);

  const handleSave = async (params) => {
    if (isEditing) {
      await updateProduct(formProduct.id, params);
    } else {
      await createProduct(params);
    }

    setFormProduct(undefined);
    refetch();
  };

  const handleDelete = async () => {
    try {
      await deleteProduct(productToDelete.id);
      setProductToDelete(null);
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
      key: "category.name",
      label: "Categoria",
      render: (value) => (
        <span className="text-gray-600">{value || "Sin categoria"}</span>
      ),
    },
    {
      key: "price",
      label: "Precio",
      render: (value) => (
        <span className="font-bold">{formatProductPrice(value)}</span>
      ),
    },
    {
      key: "stock",
      label: "Stock",
      render: (value) => (
        <span className="rounded-md bg-gray-100 px-2 py-1 text-sm">
          {value}
        </span>
      ),
    },
    {
      key: "status",
      label: "Estado",
      render: (value) => <StatusBadge active={value} />,
    },
    {
      key: "created_at",
      label: "Creado",
      render: (value) => (
        <span className="whitespace-nowrap text-sm text-gray-500">
          {formatDate(value)}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Acciones",
      render: (_, product) => (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              resetUpdate();
              setFormProduct(product);
            }}
            className="cursor-pointer rounded-lg p-2 text-blue-700 hover:bg-blue-50"
            aria-label={`Editar ${product.name}`}
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => {
              resetDelete();
              setProductToDelete(product);
            }}
            className="cursor-pointer rounded-lg p-2 text-red-700 hover:bg-red-50"
            aria-label={`Eliminar ${product.name}`}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  if (isInitialLoading || categoriesLoading) {
    return <LoadingState message="Cargando tabla de productos..." />;
  }

  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-5 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <H2>Productos</H2>
          <p className="mt-1 text-sm text-stone-500">
            Administra el catalogo publicado en la tienda.
          </p>
        </div>
        <Button
          color="black"
          size="md"
          className="flex gap-2"
          onClick={() => {
            resetCreate();
            setFormProduct(null);
          }}
        >
          <Plus className="h-4 w-4" />
          Nuevo producto
        </Button>
      </div>

      <ErrorMessage message={error || categoriesError} />
      <ProductFilters
        filters={filters}
        categories={categories}
        onChange={setFilters}
        onClear={() =>
          setFilters({
            search: "",
            category: "",
            is_active: "",
            stock: "",
            ordering: "",
          })
        }
        showStatus
        showStock
        orderingOptions={ADMIN_ORDERING_OPTIONS}
      />
      <div className="relative" aria-busy={isRefreshing}>
        {isRefreshing && (
          <span className="absolute right-3 top-3 z-10 rounded-full bg-stone-900 px-3 py-1 text-xs font-medium text-white shadow-sm">
            Actualizando...
          </span>
        )}
        <div className={isRefreshing ? "opacity-60 transition-opacity" : ""}>
          <ProductTable
            columns={columns}
            products={products}
            emptyTitle="No se encontraron productos"
            emptyDescription="No se encontraron productos con los filtros seleccionados."
          />
        </div>
      </div>

      {isFormOpen && (
        <Modal
          title={isEditing ? "Editar producto" : "Crear producto"}
          onClose={() => setFormProduct(undefined)}
        >
          <ProductForm
            key={formProduct?.id || "new"}
            initialData={formProduct}
            onSubmit={handleSave}
            onCancel={() => setFormProduct(undefined)}
            isLoading={isCreating || isUpdating}
            error={isEditing ? updateError : createError}
          />
        </Modal>
      )}

      {productToDelete && (
        <ConfirmDialog
          title="Eliminar producto"
          message={`Se eliminara "${productToDelete.name}" de forma permanente.`}
          onConfirm={handleDelete}
          onCancel={() => setProductToDelete(null)}
          isLoading={isDeleting}
          error={deleteError}
        />
      )}
    </section>
  );
};

export default ProductsPage;
