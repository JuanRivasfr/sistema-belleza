import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

export default function AdminLayout() {
  return (
    <div className="layout">
      <Sidebar />

      <div className="layout-content">
        <Navbar />
        <Outlet />
      </div>
    </div>
  );
}
