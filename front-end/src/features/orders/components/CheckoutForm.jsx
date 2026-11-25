import { useState } from "react";
import Button from "../../../components/Button";
import ErrorMessage from "../../../components/ErrorMessage";
import LabelInput from "../../../components/LabelInput";
import { formatProductPrice } from "../../products/utils/productFormatters";
import useDestinations from "../../users/hooks/useDestinations";
import { Link } from "react-router-dom";

const CheckoutForm = ({ total, onSubmit, isLoading, error }) => {
  const { destinations, isLoading: destinationsLoading, error: destinationsError } = useDestinations();
  const [selection, setSelection] = useState(null);
  const [edits, setEdits] = useState({});
  const destination = destinations.find((item) => item.id === Number(selection)) || (selection === "custom" ? null : destinations.find((item) => item.is_default));
  const shippingAddress = edits.address ?? destination?.address ?? "";
  const shippingPhone = edits.phone ?? destination?.phone ?? "";

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit({ shipping_address: shippingAddress.trim(), shipping_phone: shippingPhone.trim(), expected_total: total });
  };

  return (
    <aside className="h-fit rounded-2xl border border-stone-200 bg-white p-6 lg:sticky lg:top-24">
      <h2 className="text-xl font-semibold text-stone-900">
        Resumen de compra
      </h2>
      <div className="my-5 flex items-center justify-between border-y border-stone-200 py-4">
        <span className="text-stone-600">Total</span>
        <strong className="text-2xl">{formatProductPrice(total)}</strong>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm font-medium">Destino guardado
          <select aria-label="Destino guardado" disabled={isLoading || destinationsLoading} value={selection ?? destination?.id ?? "custom"} onChange={(event) => { setSelection(event.target.value); setEdits({}); }} className="rounded-xl border border-stone-200 bg-white p-3">
            {destinations.map((item) => <option key={item.id} value={item.id}>{item.label}{item.is_default ? " · Preferente" : ""}</option>)}
            <option value="custom">Otra dirección para este pedido</option>
          </select>
        </label>
        <Link to="/cuenta" className="text-sm font-medium text-amber-900 underline">Gestionar mis direcciones</Link>
        <ErrorMessage message={destinationsError} />
        <LabelInput
          id="shipping-address"
          name="shipping_address"
          label="Direccion de envio"
          value={shippingAddress}
          onChange={(event) => setEdits((current) => ({ ...current, address: event.target.value }))}
          placeholder="Av. Principal 123, Lima"
          minLength={5}
          maxLength={255}
          disabled={isLoading}
          required
        />
        <LabelInput name="shipping_phone" label="Teléfono de contacto" type="tel" value={shippingPhone} onChange={(event) => setEdits((current) => ({ ...current, phone: event.target.value }))} maxLength={40} disabled={isLoading} required />
        <ErrorMessage message={error} />
        <Button
          type="submit"
          color="black"
          size="md"
          className="w-full"
          disabled={isLoading || destinationsLoading || !shippingAddress.trim() || !shippingPhone.trim()}
        >
          {isLoading ? "Creando orden..." : "Finalizar compra"}
        </Button>
      </form>

      
    </aside>
  );
};

export default CheckoutForm;
