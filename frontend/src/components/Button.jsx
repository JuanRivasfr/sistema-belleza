export default function Button({ children, type = "button", onClick, full }) {
  return (
    <button
      type={type}
      onClick={onClick}
      className="btn"
      style={{ width: full ? "100%" : "auto" }}
    >
      {children}
    </button>
  );
}
