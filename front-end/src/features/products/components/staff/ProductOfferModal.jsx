import { useState } from "react";
import Modal from "../../../../components/Modal";
import Button from "../../../../components/Button";
import LabelInput from "../../../../components/LabelInput";
import ErrorMessage from "../../../../components/ErrorMessage";
import ConfirmDialog from "../../../../components/ConfirmDialog";
import { getApiErrorMessage } from "../../../../api/errors";
import { updateProduct } from "../../api/productsApi";
import { formatProductPrice } from "../../utils/productFormatters";
const localDate = value => {
  if (!value) return "";
  const date = new Date(value);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};
const ProductOfferModal = ({
  product,
  onClose,
  onSaved
}) => {
  const [values, setValues] = useState({
    offer_price: product.offer_price ?? "",
    offer_starts_at: localDate(product.offer_starts_at),
    offer_ends_at: localDate(product.offer_ends_at),
    offer_enabled: product.offer_enabled ?? false
  });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const save = async payload => {
    setBusy(true);
    setError("");
    try {
      await updateProduct(product.id, payload);
      onSaved();
      onClose();
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setBusy(false);
    }
  };
  const change = event => setValues(current => ({
    ...current,
    [event.target.name]: event.target.type === "checkbox" ? event.target.checked : event.target.value
  }));
  return <>
    <div inert={deleting}><Modal title={`Oferta de ${product.name}`} onClose={onClose} closeDisabled={busy}>
      <form
        onSubmit={event => {
          event.preventDefault();
          save({
            ...values,
            offer_starts_at: new Date(values.offer_starts_at).toISOString(),
            offer_ends_at: new Date(values.offer_ends_at).toISOString()
          });
        }}
      ><fieldset disabled={busy} className="space-y-4">
        <p className="text-sm text-stone-600">Precio normal {formatProductPrice(product.price)} · Horario local</p>
        <LabelInput
          name="offer_price"
          label="Precio de oferta"
          type="number"
          min="0.01"
          max={Number(product.price) - 0.01}
          step="0.01"
          value={values.offer_price}
          onChange={change}
          required
        />
        <LabelInput
          name="offer_starts_at"
          label="Inicio de la oferta"
          type="datetime-local"
          value={values.offer_starts_at}
          onChange={change}
          required
        />
        <LabelInput
          name="offer_ends_at"
          label="Fin de la oferta"
          type="datetime-local"
          value={values.offer_ends_at}
          onChange={change}
          required
        />
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="offer_enabled" checked={values.offer_enabled} onChange={change} />Habilitar oferta en las fechas indicadas</label>
        <ErrorMessage message={error} />
        <div className="flex flex-wrap gap-3"><Button type="submit" color="black" size="md">{busy ? "Guardando..." : "Guardar oferta"}</Button>{product.offer_price != null && <Button onClick={() => setDeleting(true)} className="text-red-700">Eliminar oferta</Button>}</div>
      </fieldset></form>
    </Modal></div>
    {deleting && <ConfirmDialog
      title="Eliminar oferta"
      message={`Se eliminará la oferta de ${product.name}.`}
      isLoading={busy}
      error={error}
      onCancel={() => setDeleting(false)}
      onConfirm={() => save({
      offer_price: null,
      offer_starts_at: null,
      offer_ends_at: null,
      offer_enabled: false
    })}
    />}
  </>;
};
export default ProductOfferModal;
