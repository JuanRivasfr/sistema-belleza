export default function Input({ label, type = "text", name, value, onChange, required, ...rest }) {
  const id = `input-${name || (label || "").replace(/\s+/g, "-").toLowerCase()}`;
  return (
    <div className="input-group">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        {...rest}
      />
    </div>
  );
}
