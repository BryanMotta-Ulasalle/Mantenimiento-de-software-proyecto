import { useState } from "react";
import Button from "../../../components/Button";
import ErrorMessage from "../../../components/ErrorMessage";
import LabelInput from "../../../components/LabelInput";
import { formatProductPrice } from "../../products/utils/productFormatters";

const CheckoutForm = ({ total, onSubmit, isLoading, error }) => {
  const [shippingAddress, setShippingAddress] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit(shippingAddress.trim());
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
        <LabelInput
          id="shipping-address"
          name="shipping_address"
          label="Direccion de envio"
          value={shippingAddress}
          onChange={(event) => setShippingAddress(event.target.value)}
          placeholder="Av. Principal 123, Lima"
          minLength={5}
          required
        />
        <ErrorMessage message={error} />
        <Button
          type="submit"
          color="black"
          size="md"
          className="w-full"
          disabled={isLoading || !shippingAddress.trim()}
        >
          {isLoading ? "Creando orden..." : "Finalizar compra"}
        </Button>
      </form>

      
    </aside>
  );
};

export default CheckoutForm;
