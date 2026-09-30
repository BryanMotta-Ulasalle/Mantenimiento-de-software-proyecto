import { useState } from "react";
import LoadingState from "../../../../components/LoadingState";
import useAuth from "../../../../hooks/useAuth";
import InformationProfile from "../../components/InformationProfile";
import NameProfile from "../../components/NameProfile";
import useUpdateProfile from "../../hooks/useUpdateProfile";

const ProfilePage = () => {
  const { user, isLoading: isSessionLoading } = useAuth();
  const [formData, setFormData] = useState(null);
  const {
    update,
    isLoading: isUpdating,
    error,
  } = useUpdateProfile();

  const currentFormData = formData || {
    name: user?.name ?? "",
    email: user?.email ?? "",
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      await update(currentFormData);
    } catch {
      // El hook mantiene el mensaje que se presenta en el formulario.
    }
  };

  if (isSessionLoading) {
    return <LoadingState message="Cargando datos del perfil..." />;
  }

  return (
    <div className="flex flex-col items-center justify-center px-5 py-20">
      <div className="z-10 flex w-full max-w-lg flex-col gap-5">
        <NameProfile
          name={user?.name}
          email={user?.email}
          role={user?.role?.name}
        />
        <InformationProfile
          nameValue={currentFormData.name}
          nameOnChange={(event) =>
            setFormData({ ...currentFormData, name: event.target.value })
          }
          emailValue={currentFormData.email}
          emailOnChange={(event) =>
            setFormData({ ...currentFormData, email: event.target.value })
          }
          onSubmit={handleSubmit}
          isLoading={isUpdating}
          error={error}
        />
      </div>
    </div>
  );
};

export default ProfilePage;
