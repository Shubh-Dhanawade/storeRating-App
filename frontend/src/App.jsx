import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";

import Stores from "./pages/Store";
import Store from "./pages/Store";
import User from "./pages/User";
import AdminDashboard from "./pages/AdminDashboard";
import OwnerDashboard from "./pages/OwnerDashboard";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/user" element={<User />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/owner" element={<OwnerDashboard />} />
        <Route path="/stores" element={<Stores />} />
      </Routes>
    </BrowserRouter>
  );
}
