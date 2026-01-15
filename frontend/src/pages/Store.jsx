import { useEffect, useState } from "react";
import API from "../Api";
import { useNavigate } from "react-router-dom";

export default function Stores() {
  const [stores, setStores] = useState([]);
  const [rating, setRating] = useState({});
  const [nameFilter, setNameFilter] = useState("");
  const [addressFilter, setAddressFilter] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const navigate = useNavigate();

  const fetchStores = async () => {
    try {
      const res = await API.get("/stores");
      setStores(res.data);
    } catch (err) {
      setStores([]);
    }
  };

  useEffect(() => {
    fetchStores();
  }, []);

  const submitRating = async (storeId) => {
    const value = parseInt(rating[storeId], 10);
    if (!value || value < 1 || value > 5)
      return alert("Rating must be between 1 and 5");
    try {
      await API.post("/ratings", { store_id: storeId, rating: value });
      alert("Rating submitted");
      fetchStores();
    } catch (err) {
      alert("Please login to submit a rating");
    }
  };

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

  const filteredStores = stores.filter(
    (s) =>
      s.name.toLowerCase().includes(nameFilter.toLowerCase()) &&
      s.address.toLowerCase().includes(addressFilter.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <h2 className="text-3xl font-semibold text-gray-800 mb-6">Stores</h2>

        {/* Filters + Actions */}
        <div className="flex flex-wrap gap-3 mb-6">
          <input
            type="text"
            placeholder="Search name"
            value={nameFilter}
            onChange={(e) => setNameFilter(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
          />

          <input
            type="text"
            placeholder="Search address"
            value={addressFilter}
            onChange={(e) => setAddressFilter(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
          />

          <button
            onClick={fetchStores}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
          >
            Refresh
          </button>

          <button
            onClick={handleLogout}
            className="bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition"
          >
            Logout
          </button>
        </div>

        {/* Change Password */}
        <div className="bg-white rounded-lg shadow p-4 mb-8">
          <h4 className="font-medium mb-3 text-gray-800">Change Password</h4>
          <div className="flex gap-3">
            <input
              type="password"
              placeholder="New password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="flex-1 border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
            />
            <button
              onClick={handleChangePassword}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
            >
              Update
            </button>
          </div>
        </div>

        {/* Store List */}
        <div className="space-y-4">
          {filteredStores.map((store) => (
            <div key={store.id} className="bg-white rounded-lg shadow p-4">
              <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                {/* Store Info */}
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">
                    {store.name}
                  </h3>
                  <p className="text-sm text-gray-600">{store.address}</p>
                  <p className="text-sm">
                    Average Rating:{" "}
                    <span className="font-medium">
                      {store.avgRating || "No ratings yet"}
                    </span>
                  </p>
                  <p className="text-sm">
                    Your Rating:{" "}
                    <span className="font-medium">
                      {store.userRating ?? "Not rated"}
                    </span>
                  </p>
                </div>

                {/* Rating Action */}
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min="1"
                    max="5"
                    placeholder="1-5"
                    value={rating[store.id] ?? store.userRating ?? ""}
                    onChange={(e) =>
                      setRating({ ...rating, [store.id]: e.target.value })
                    }
                    className="w-24 border rounded-lg px-2 py-1 text-sm focus:ring-2 focus:ring-indigo-500"
                  />

                  <button
                    onClick={() => submitRating(store.id)}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
                  >
                    Submit
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
