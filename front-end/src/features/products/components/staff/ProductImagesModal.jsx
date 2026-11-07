import { useId, useState } from "react";
import { getApiErrorMessage } from "../../../../api/errors";
import Button from "../../../../components/Button";
import ConfirmDialog from "../../../../components/ConfirmDialog";
import ErrorMessage from "../../../../components/ErrorMessage";
import Modal from "../../../../components/Modal";
import {
  deleteProductImage,
  setPrimaryProductImage,
  uploadProductImage,
} from "../../api/productsApi";
import { getProductImages } from "../../utils/productImages";
import ProductImage from "../shared/ProductImage";

const ProductImagesModal = ({ product, onClose, onSaved }) => {
  const fileInputId = useId();
  const [images, setImages] = useState(() => getProductImages(product));
  const [imageToDelete, setImageToDelete] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  const saveImages = async (save, errorMessage) => {
    setIsSaving(true);
    setError(null);
    try {
      setImages(await save());
      onSaved();
      return true;
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, errorMessage));
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpload = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const saved = await saveImages(
      () => uploadProductImage(product.id, formData),
      "No se pudo subir la imagen.",
    );
    if (saved) form.reset();
  };

  const handleDelete = async () => {
    const deleted = await saveImages(
      () => deleteProductImage(product.id, imageToDelete.id),
      "No se pudo eliminar la imagen.",
    );
    if (deleted) setImageToDelete(null);
  };

  const imagesPanel = (
    <Modal title={`Imágenes de ${product.name}`} onClose={onClose} closeDisabled={isSaving}>
      <form onSubmit={handleUpload} className="space-y-3 rounded-xl border border-stone-200 p-4">
        <label htmlFor={fileInputId} className="block font-medium">
          Selecciona una imagen
        </label>
        <input
          id={fileInputId}
          name="image_file"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          aria-describedby={`${fileInputId}-help`}
          className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm"
          disabled={isSaving}
          required
        />
        <p id={`${fileInputId}-help`} className="text-sm text-stone-600">
          JPG, PNG o WebP. Máximo 5 MB por imagen.
        </p>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="is_main" value="true" disabled={isSaving} />
          Usar como imagen principal
        </label>
        <Button type="submit" color="black" size="sm" disabled={isSaving}>
          Subir imagen
        </Button>
      </form>

      {isSaving && (
        <p role="status" className="mt-3 text-sm text-stone-600">Guardando imágenes...</p>
      )}
      <ErrorMessage message={error} className="mt-3" />

      {images.length === 0 ? (
        <p className="mt-5 text-sm text-stone-600">Este producto aún no tiene imágenes.</p>
      ) : (
        <ul aria-label="Imágenes del producto" className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {images.map((image, index) => (
            <li key={image.id} className="overflow-hidden rounded-xl border border-stone-200">
              <ProductImage
                src={image.image_url}
                alt={`${product.name}, imagen ${index + 1}`}
                className="aspect-square w-full"
              />
              <div className="flex flex-wrap items-center gap-2 p-2">
                {image.is_main ? (
                  <span className="inline-block rounded-full bg-stone-100 px-2 py-1 text-sm font-medium">
                    Principal
                  </span>
                ) : (
                  <Button
                    size="sm"
                    className="border border-stone-300"
                    aria-label={`Hacer principal la imagen ${index + 1}`}
                    disabled={isSaving}
                    onClick={() => saveImages(
                      () => setPrimaryProductImage(product.id, image.id),
                      "No se pudo cambiar la imagen principal.",
                    )}
                  >
                    Hacer principal
                  </Button>
                )}
                {image.is_uploaded && (
                  <Button
                    size="sm"
                    className="border border-red-200 text-red-700 hover:bg-red-50"
                    aria-label={`Eliminar la imagen ${index + 1}`}
                    disabled={isSaving}
                    onClick={() => {
                      setError(null);
                      setImageToDelete({ id: image.id, position: index + 1 });
                    }}
                  >
                    Eliminar
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </Modal>
  );

  return (
    <>
      <div inert={Boolean(imageToDelete)}>{imagesPanel}</div>
      {imageToDelete && (
        <ConfirmDialog
          title="Eliminar imagen"
          message={`Se eliminará la imagen ${imageToDelete.position} de ${product.name}.`}
          onConfirm={handleDelete}
          onCancel={() => {
            setImageToDelete(null);
            setError(null);
          }}
          isLoading={isSaving}
          error={error}
        />
      )}
    </>
  );
};

export default ProductImagesModal;
