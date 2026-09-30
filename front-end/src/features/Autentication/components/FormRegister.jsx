import { ArrowLeft } from "lucide-react";
import Button from "../../../components/Button";
import ButtonLink from "../../../components/ButtonLink";
import ErrorMessage from "../../../components/ErrorMessage";
import H2 from "../../../components/H2";
import LabelInput from "../../../components/LabelInput";
import P from "../../../components/P";

const FormRegister = ({
  name,
  nameOnChange,
  email,
  emailOnChange,
  password,
  passOnChange,
  isLoading,
  error,
  onSubmit,
}) => {
  return (
    <div className="flex w-full max-w-lg flex-col gap-6">
      <ButtonLink to="/login" className="flex gap-2" color="gray">
        <ArrowLeft className="h-4 w-4" /> Atrás
      </ButtonLink>
      <div>
        <H2>Crear Cuenta</H2>
        <P>Únete a Ecommerce ahora</P>
      </div>
      <form onSubmit={onSubmit} className="flex flex-col gap-3">
        <LabelInput
          id="register-name"
          name="name"
          label="Nombre Completo"
          value={name}
          onChange={nameOnChange}
          placeholder="Bryan Motta Bedregal"
          required
        />
        <LabelInput
          id="register-email"
          name="email"
          label="Correo electrónico"
          type="email"
          value={email}
          onChange={emailOnChange}
          placeholder="tu@ejemplo.com"
          required
        />
        <LabelInput
          id="register-password"
          name="password"
          label="Contraseña"
          type="password"
          value={password}
          onChange={passOnChange}
          placeholder="********"
          minLength={8}
          required
        />
        <Button
          disabled={isLoading}
          type="submit"
          color="black"
          size="md"
          className="w-full"
        >
          {isLoading ? "Creando cuenta..." : "Crear Cuenta"}
        </Button>
        <ErrorMessage message={error} />
      </form>
    </div>
  );
};

export default FormRegister;
