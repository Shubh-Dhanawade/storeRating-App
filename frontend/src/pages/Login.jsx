import { useState } from "react";
import API from "../Api";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const validatePassword = (password) => {
    const regex = /^(?=.*[A-Z])(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,16}$/;
    return regex.test(password);
  };

  const handleLogin = async () => {
   
    if (!email || !password) {
      alert("All fields are required");
      return;
    }

    if (!validateEmail(email)) {
      alert("Invalid email format");
      return;
    }

    if (!validatePassword(password)) {
      alert(
        "Password must be 8-16 characters, include 1 uppercase and 1 special character"
      );
      return;
    }

    try {
      const res = await API.post("/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);

      const role = res.data.role;
      if (role === "ADMIN") return navigate("/admin");
      if (role === "OWNER") return navigate("/owner");
      navigate("/stores");
    } catch (err) {
      alert("Invalid credentials");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-semibold text-center mb-6">Login</h2>

        <input
          type="email"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-4 px-4 py-2 border rounded-lg"
        />

        <input
          type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-5 px-4 py-2 border rounded-lg"
        />

        <button
          onClick={handleLogin}
          className="w-full bg-indigo-600 text-white py-2 rounded-lg"
        >
          Login
        </button>

        <p
          onClick={() => navigate("/user")}
          className="mt-4 text-center text-indigo-600 cursor-pointer"
        >
          New user? Register
        </p>
      </div>
    </div>
  );
}
