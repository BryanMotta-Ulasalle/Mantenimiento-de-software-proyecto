import Button from "../../../components/Button";
import ErrorMessage from "../../../components/ErrorMessage";
import H5 from "../../../components/H5";
import LabelInput from "../../../components/LabelInput";

const InformationProfile = ({
  nameValue,
  nameOnChange,
  emailValue,
  emailOnChange,
  onSubmit,
  isLoading,
  error,
}) => {
  return (
    <div className="flex flex-col gap-5 rounded-xl border border-gray-200 bg-white px-5 py-10">
      <H5>Informacion de la cuenta</H5>
      <form onSubmit={onSubmit} className="flex flex-col gap-5">
        <LabelInput
          id="profile-name"
          name="name"
          isProfile
          label="Nombre Completo"
          value={nameValue}
          onChange={nameOnChange}
          required
        />
        <LabelInput
          id="profile-email"
          name="email"
          isProfile
          label="Correo Electronico"
          type="email"
          value={emailValue}
          onChange={emailOnChange}
          required
        />
        <Button
          color="black"
          size="md"
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? "Guardando..." : "Guardar Cambios"}
        </Button>
        <ErrorMessage message={error} />
      </form>
    </div>
  );
};

export default InformationProfile;
