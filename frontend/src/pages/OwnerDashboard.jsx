import { useEffect, useState } from "react";
import API from "../Api";
import { useNavigate } from "react-router-dom";

export default function OwnerDashboard() {
  const [ratings, setRatings] = useState([]);
  const [avg, setAvg] = useState(0);
  const [newPassword, setNewPassword] = useState("");
  const navigate = useNavigate();

  const fetch = async () => {
    const r = await API.get("/owner/dashboard");
    setRatings(r.data);
    const a = await API.get("/owner/average-rating");
    setAvg(a.data.avgRating);
  };

  useEffect(() => {
    fetch();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const handleChangePassword = async () => {
    if (!newPassword) return alert("Enter a new password");
    try {
      await API.put("/auth/password", { password: newPassword });
      alert("Password updated");
      setNewPassword("");
    } catch (err) {
      alert("Unable to change password");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-3xl mx-auto">

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">
            Store Owner Dashboard
          </h2>
          <button
            onClick={handleLogout}
            className="bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition"
          >
            Logout
          </button>
        </div>

       
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <p className="text-sm text-gray-500">Average Rating</p>
          <p className="text-2xl font-bold text-gray-800">{avg}</p>
        </div>

        
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <h3 className="text-lg font-medium mb-3">Change Password</h3>
          <div className="flex gap-3">
            <input
              type="password"
              placeholder="New password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              onClick={handleChangePassword}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
            >
              Update
            </button>
          </div>
        </div>

      
        <h3 className="text-lg font-medium mb-3">Users Who Rated</h3>

        <div className="grid gap-3">
          {ratings.map((r, i) => (
            <div
              key={i}
              className="bg-white rounded-lg shadow p-3 text-sm text-gray-700"
            >
              <span className="font-medium">{r.name}</span> →{" "}
              <span className="font-semibold text-indigo-600">{r.rating}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
