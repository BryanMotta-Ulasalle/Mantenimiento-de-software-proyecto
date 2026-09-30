import { useState } from "react";
import { useNavigate } from "react-router-dom";
import FormRegister from "../components/FormRegister";
import useRegister from "../hooks/useRegister";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { registerUser, isLoading, error } = useRegister();

  const handleSubmit = async (event) => {
    event.preventDefault();

    const result = await registerUser({ name, email, password });

    if (result) {
      navigate("/login");
    }
  };

  return (
    <section className="flex min-h-dvh w-full items-center justify-center bg-bgLight px-5 py-10">
      <FormRegister
        name={name}
        nameOnChange={(event) => setName(event.target.value)}
        email={email}
        emailOnChange={(event) => setEmail(event.target.value)}
        password={password}
        passOnChange={(event) => setPassword(event.target.value)}
        isLoading={isLoading}
        error={error}
        onSubmit={handleSubmit}
      />
    </section>
  );
};

export default Register;
