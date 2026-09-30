import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import image from "../../../assets/login-photo.webp";
import FormLogin from "../components/FormLogin";
import useLogin from "../hooks/useLogin";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { loginUser, isLoading, error } = useLogin();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      await loginUser({ email, password });
      navigate(location.state?.from || "/", { replace: true });
    } catch {
      // El hook expone el mensaje de error para el formulario.
    }
  };

  return (
    <section className="flex min-h-dvh w-full">
      <div className="relative hidden flex-1 bg-gray-400 lg:block">
        <div className="absolute h-full w-full bg-black/50" />
        <img
          className="h-full w-full object-cover"
          src={image}
          alt="Productos del Ecommerce"
        />
      </div>
      <div className="flex flex-1 items-center justify-center bg-bgLight px-5 py-10">
        <FormLogin
          email={email}
          password={password}
          emailOnChange={(event) => setEmail(event.target.value)}
          passOnChange={(event) => setPassword(event.target.value)}
          onSubmit={handleSubmit}
          isLoading={isLoading}
          error={error}
        />
      </div>
    </section>
  );
};

export default Login;
