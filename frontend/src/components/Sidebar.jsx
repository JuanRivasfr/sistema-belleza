import { Link, useLocation } from "react-router-dom";

const links = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/citas", label: "Citas" },
  { to: "/clientes", label: "Clientes" },
  { to: "/servicios", label: "Servicios" },
  { to: "/pagos", label: "Pagos" },
  { to: "/reportes", label: "Reportes" },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <aside className="sidebar">
      {links.map((l) => (
        <Link
          key={l.to}
          to={l.to}
          className={location.pathname === l.to ? "active" : ""}
        >
          {l.label}
        </Link>
      ))}
    </aside>
  );
}
