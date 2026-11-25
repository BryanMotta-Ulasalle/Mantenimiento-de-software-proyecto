import { MapPin, Star } from "lucide-react";
import { useState } from "react";
import Button from "../../../components/Button";
import LabelInput from "../../../components/LabelInput";
import ErrorMessage from "../../../components/ErrorMessage";
import LoadingState from "../../../components/LoadingState";
import ConfirmDialog from "../../../components/ConfirmDialog";
import { getApiErrorMessage } from "../../../api/errors";
import { saveDestination, deleteDestination } from "../api/destinationsApi";
import useDestinations from "../hooks/useDestinations";
const EMPTY = {
  label: "",
  address: "",
  phone: "",
  is_default: false
};
const ShippingDestinations = () => {
  const {
    destinations,
    isLoading,
    error,
    refetch
  } = useDestinations();
  const [editing, setEditing] = useState(null);
  const [values, setValues] = useState(EMPTY);
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState("");
  const [toDelete, setToDelete] = useState(null);
  const change = event => setValues(current => ({
    ...current,
    [event.target.name]: event.target.type === "checkbox" ? event.target.checked : event.target.value
  }));
  const perform = async operation => {
    setBusy(true);
    setFailure("");
    try {
      await operation();
      setEditing(null);
      setValues(EMPTY);
      setToDelete(null);
      refetch();
    } catch (requestError) {
      setFailure(getApiErrorMessage(requestError));
    } finally {
      setBusy(false);
    }
  };
  return <section className="space-y-4 rounded-2xl border border-stone-200 bg-white p-5">
      <h2 className="flex items-center gap-2 text-xl font-semibold"><MapPin className="size-5 text-golden" />Direcciones de envío</h2>
      <ErrorMessage message={error || failure} />
      {isLoading ? <LoadingState /> : <ul className="space-y-3">{destinations.map(destination => <li key={destination.id} className="space-y-2 rounded-xl bg-stone-50 p-4">
          <p className="flex flex-wrap items-center gap-2 font-semibold">{destination.label}{destination.is_default && <span className="inline-flex items-center gap-1 text-xs text-amber-800"><Star className="size-3" />Preferente</span>}</p>
          <p className="break-words text-sm">{destination.address}</p><p className="text-sm text-stone-600">{destination.phone}</p>
          <div className="flex flex-wrap gap-3 text-sm">
            <button
              type="button"
              disabled={busy}
              onClick={() => {
            setEditing(destination.id);
            setValues(destination);
            setFailure("");
          }}
              className="font-medium underline"
            >Editar {destination.label}</button>
            {!destination.is_default && <button
              type="button"
              disabled={busy}
              onClick={() => perform(() => saveDestination(destination.id, {
            is_default: true
          }))}
              className="text-amber-900 underline"
            >Hacer preferente</button>}
            {destinations.length > 1 && <button type="button" disabled={busy} onClick={() => setToDelete(destination)} className="text-red-700 underline">Eliminar {destination.label}</button>}
          </div>
        </li>)}</ul>}
      {!isLoading && destinations.length === 0 && <p className="text-sm text-stone-600">Registra tu primera dirección y teléfono para completar tus datos de envío.</p>}
      <form onSubmit={event => {
      event.preventDefault();
      perform(() => saveDestination(editing, values));
    }}>
        <fieldset disabled={busy} className="space-y-3">
          <h3 className="font-medium">{editing ? "Editar destino" : "Nuevo destino"}</h3>
          <LabelInput
            name="label"
            label="Nombre del destino"
            placeholder="Casa o trabajo"
            maxLength={50}
            value={values.label}
            onChange={change}
            required
          />
          <LabelInput
            name="address"
            label="Dirección"
            autoComplete="street-address"
            minLength={5}
            maxLength={255}
            value={values.address}
            onChange={change}
            required
          />
          <LabelInput
            name="phone"
            label="Teléfono de contacto"
            type="tel"
            autoComplete="tel"
            maxLength={40}
            value={values.phone}
            onChange={change}
            required
          />
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="is_default" checked={values.is_default} onChange={change} />Usar como preferente</label>
          <div className="flex flex-wrap gap-3"><Button type="submit" color="black" size="sm">{busy ? "Guardando..." : "Guardar destino"}</Button>{editing && <Button onClick={() => {
            setEditing(null);
            setValues(EMPTY);
          }}>Cancelar edición</Button>}</div>
        </fieldset>
      </form>
      {toDelete && <ConfirmDialog
        title="Eliminar destino"
        message={`Se eliminará ${toDelete.label}.`}
        onConfirm={() => perform(() => deleteDestination(toDelete.id))}
        onCancel={() => setToDelete(null)}
        isLoading={busy}
        error={failure}
      />}
    </section>;
};
export default ShippingDestinations;
