import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

export default function AdminLayout() {
  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        overflow: "auto",
      }}
    >
      <Sidebar />

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
        }}
      >
        <Navbar />

        <div
          style={{
            flex: 1,
            minHeight: 0,
            padding: "20px",
            width: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            overflowY: "auto",

            // 🔥 ESTA ES LA CLAVE PARA QUE LOS INPUTS FUNCIONEN
            position: "relative",
            zIndex: 1,
          }}
        >
          <Outlet />
        </div>
      </div>
    </div>
  );
}
