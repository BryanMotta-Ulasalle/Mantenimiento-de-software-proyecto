import { useState } from "react";
import Modal from "../../../../components/Modal";
import Button from "../../../../components/Button";
import ErrorMessage from "../../../../components/ErrorMessage";
import apiClient from "../../../../api/client";
import { getApiErrorMessage } from "../../../../api/errors";
const template = "\uFEFFnombre;descripcion;categoria;precio;stock;activo\nPolo nuevo;Polo de algodón;Ropa;49.90;10;sí\n";
const ProductImportModal = ({
  onClose,
  onSaved
}) => {
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(null);
  const review = async event => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setBusy(true);
    setError("");
    setPreview(null);
    setDone(null);
    try {
      const {
        data
      } = await apiClient.postForm("/product-imports/preview/", formData, {
        withAuth: true
      });
      setPreview(data);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setBusy(false);
    }
  };
  const confirm = async () => {
    setBusy(true);
    setError("");
    try {
      const {
        data
      } = await apiClient.post("/product-imports/confirm/", {
        batch_id: preview.batch_id
      }, {
        withAuth: true
      });
      setDone(data.count);
      setPreview(null);
      onSaved();
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setBusy(false);
    }
  };
  const download = () => {
    const url = URL.createObjectURL(new Blob([template], {
      type: "text/csv;charset=utf-8"
    }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "plantilla-productos.csv";
    link.click();
    URL.revokeObjectURL(url);
  };
  return <Modal title="Importar productos por CSV" onClose={onClose} closeDisabled={busy}>
    <div className="space-y-4">
      <p className="text-sm text-stone-600">Crea hasta 1000 productos por archivo UTF-8, de máximo 2 MB. La categoría debe existir. Se admiten separadores de coma o punto y coma.</p>
      <Button size="sm" onClick={download} className="border border-stone-300">Descargar plantilla CSV</Button>
      <form onSubmit={review} className="space-y-3"><label className="flex flex-col gap-2 font-medium">Archivo CSV<input
        type="file"
        name="file"
        accept=".csv,text/csv"
        disabled={busy}
        required
        onChange={() => {
            setPreview(null);
            setDone(null);
            setError("");
          }}
        className="w-full rounded-xl border border-stone-200 p-3 text-sm"
      /></label><Button type="submit" color="black" size="sm" disabled={busy}>{busy ? "Procesando..." : "Revisar archivo"}</Button></form>
      <ErrorMessage message={error} />
      {done !== null && <p role="status" className="rounded-xl bg-emerald-50 p-3 text-emerald-900">Se importaron {done} productos.</p>}
      {preview && <>
        <p role="status" className="font-medium">{preview.valid_count} de {preview.total} filas válidas</p>
        <div className="max-h-72 overflow-auto rounded-xl border border-stone-200">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-stone-50">
                <th className="p-2">Fila</th>
                <th className="p-2">Producto normalizado</th>
                <th className="p-2">Resultado</th>
              </tr>
            </thead>
            <tbody>
              {preview.rows.map(row => (
                <tr key={row.line} className="border-t border-stone-100">
                  <td className="p-2 align-top">{row.line}</td>
                  <td className="break-words p-2 align-top">
                    {row.product && <>
                      {row.product.name} · {row.product.price} · Stock {row.product.stock}
                    </>}
                  </td>
                  <td className={`p-2 ${row.errors.length ? "text-red-700" : "text-emerald-800"}`}>
                    {row.errors.length === 0 ? "Lista para importar" : (
                      <ul className="space-y-1">
                        {row.errors.map((error, index) => (
                          <li key={index}>
                            {typeof error === "string" ? error : Object.entries(error).map(([field, messages]) => (
                              <p key={field}>{field}: {messages.join(" ")}</p>
                            ))}
                          </li>
                        ))}
                      </ul>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {preview.batch_id ? <Button color="black" size="md" disabled={busy} onClick={confirm}>Confirmar importación</Button> : <p className="text-sm text-red-700">Corrige las filas indicadas y vuelve a revisar el archivo.</p>}
      </>}
    </div>
  </Modal>;
};
export default ProductImportModal;
