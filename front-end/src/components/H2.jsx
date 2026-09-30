const H2 = ({ children, color }) => {
  const colors = {
    white: "text-white",
  };

  return (
    <h2 className={`text-3xl font-display lg:text-4xl ${colors[color] || ""}`}>
      {children}
    </h2>
  );
};

export default H2;
