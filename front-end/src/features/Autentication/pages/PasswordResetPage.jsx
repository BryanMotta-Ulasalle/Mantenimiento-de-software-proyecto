import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getApiErrorMessage } from "../../../api/errors";
import Button from "../../../components/Button";
import ButtonLink from "../../../components/ButtonLink";
import ErrorMessage from "../../../components/ErrorMessage";
import LabelInput from "../../../components/LabelInput";
import { confirmPasswordReset, requestPasswordReset } from "../api/AuthApi";

const PasswordResetPage = ({ isConfirmation = false }) => {
  const { pathname, hash } = useLocation();
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const link = new URLSearchParams(hash.slice(1));
  const uid = link.get("uid");
  const token = link.get("token");
  const isLinkMissing = isConfirmation && (!uid || !token);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const fields = new FormData(event.currentTarget);
    const password = fields.get("new_password");
    if (isConfirmation && password !== fields.get("repeat_password")) {
      setError("Las contraseñas deben coincidir.");
      return;
    }

    setError("");
    setIsSaving(true);
    try {
      const result = isConfirmation
        ? await confirmPasswordReset({ uid, token, new_password: password })
        : await requestPasswordReset(fields.get("email"));
      setMessage(result.detail);
      if (isConfirmation) navigate(pathname, { replace: true });
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "No se pudo completar la recuperación."));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main className="flex  flex-col min-h-dvh items-center justify-center bg-bgLight px-5 py-10 ">
      <div className="w-full max-w-md">
        <ButtonLink to="/login" color="gray" className="">Volver a iniciar sesión</ButtonLink>

      <section className="w-full max-w-md space-y-5 rounded-2xl sm:p-8 mt-5">
        <h1 className="font-display text-3xl text-stone-900">
          {isConfirmation ? "Restablecer contraseña" : "Recuperar cuenta"}
        </h1>
        {message ? (
          <p role="status" className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
            {message}
          </p>
        ) : isLinkMissing ? (
          <ErrorMessage message="Abre el enlace del correo o solicita uno nuevo." />
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <fieldset disabled={isSaving} className="flex flex-col gap-4">
              {isConfirmation ? (
                <>
                  <LabelInput name="new_password" label="Nueva contraseña" type="password" autoComplete="new-password" minLength={8} maxLength={128} required />
                  <LabelInput name="repeat_password" label="Repite la contraseña" type="password" autoComplete="new-password" minLength={8} maxLength={128} required />
                </>
              ) : (
                <>
                  <p className="text-sm text-stone-600">Ingresa el correo que usas para iniciar sesión.</p>
                  <LabelInput name="email" label="Correo electrónico" type="email" autoComplete="email" maxLength={254} required />
                </>
              )}
            </fieldset>
            <ErrorMessage message={error} />
            <Button type="submit" color="black" size="md" disabled={isSaving} className="mt-5">
              {isSaving ? "Enviando..." : isConfirmation ? "Guardar contraseña" : "Solicitar enlace"}
            </Button>
          </form>
        )}
        {isConfirmation && !message && (
          <div className="flex w-full justify-end text-sm">
            <ButtonLink to="/recuperar-cuenta" color="black">
              Solicitar otro enlace
            </ButtonLink>
          </div>
        )}
      </section>
      </div>
    </main>
  );
};

export default PasswordResetPage;
