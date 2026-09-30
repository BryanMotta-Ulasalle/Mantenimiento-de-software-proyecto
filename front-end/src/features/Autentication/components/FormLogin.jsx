import { ArrowLeft } from "lucide-react";
import Button from "../../../components/Button";
import ButtonLink from "../../../components/ButtonLink";
import ErrorMessage from "../../../components/ErrorMessage";
import H2 from "../../../components/H2";
import LabelInput from "../../../components/LabelInput";
import P from "../../../components/P";

const FormLogin = ({
  email,
  password,
  emailOnChange,
  passOnChange,
  onSubmit,
  isLoading,
  error,
}) => {
  return (
    <div className="flex w-full max-w-md flex-col gap-10">
      <ButtonLink to="/" className="flex gap-2" color="gray">
        <ArrowLeft className="h-4 w-4" /> Inicio
      </ButtonLink>
      <div className="flex flex-col gap-2">
        <H2>Bienvenido de nuevo</H2>
        <P>Inicia sesión con tu cuenta registrada</P>
      </div>
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <LabelInput
          id="login-email"
          name="email"
          label="Correo electrónico"
          type="email"
          value={email}
          onChange={emailOnChange}
          placeholder="Ej: usuario@usuario.com"
          required
        />
        <LabelInput
          id="login-password"
          name="password"
          label="Contraseña"
          type="password"
          value={password}
          onChange={passOnChange}
          placeholder="********"
          required
        />
        <Button
          disabled={isLoading}
          type="submit"
          color="black"
          size="md"
          className="w-full"
        >
          {isLoading ? "Iniciando sesión..." : "Iniciar sesión"}
        </Button>
        <ErrorMessage message={error} />
        <div className="flex items-center gap-1">
          <P>¿No tienes una cuenta?</P>
          <ButtonLink to="/register" color="black">
            Crea una
          </ButtonLink>
        </div>
      </form>
    </div>
  );
};

export default FormLogin;
