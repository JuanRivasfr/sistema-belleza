// src/layouts/UserLayout.jsx
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function UserLayout() {
  return (
    <div className="user-layout">
      <Navbar />
      <div className="user-layout-content">
        <Outlet />
      </div>
    </div>
  );
}
