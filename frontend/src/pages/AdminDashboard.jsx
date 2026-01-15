import { useEffect, useState } from "react";
import API from "../Api";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [stores, setStores] = useState([]);
  const [owners, setOwners] = useState([]);
  const [userFilters, setUserFilters] = useState({
    name: "",
    email: "",
    address: "",
    role: "",
  });
  const [storeFilters, setStoreFilters] = useState({ name: "", address: "" });
  const [selectedUser, setSelectedUser] = useState(null);
  const [newStore, setNewStore] = useState({
    name: "",
    email: "",
    address: "",
    owner_id: "",
  });
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    address: "",
    role: "USER",
  });
  const [newPassword, setNewPassword] = useState("");
  const navigate = useNavigate();

  const fetchDashboard = async () => {
    const res = await API.get("/admin/dashboard");
    setStats(res.data);
  };

  const fetchUsers = async (filters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => v && params.append(k, v));
    const res = await API.get(`/admin/users?${params.toString()}`);
    setUsers(res.data);
  };

  const fetchStores = async () => {
    try {
      const res = await API.get("/admin/stores");
      setStores(res.data);
    } catch (err) {
      setStores([]);
    }
  };

  const fetchOwners = async () => {
    try {
      // Request only OWNER users
      const res = await API.get("/admin/users?role=OWNER");
      setOwners(res.data);
    } catch (err) {
      setOwners([]);
    }
  };

  useEffect(() => {
    fetchDashboard();
    fetchUsers();
    fetchStores();
    fetchOwners();
  }, []);

  const handleAddStore = async () => {
    const { name, email, address, owner_id } = newStore;
    if (!name.trim() || !email.trim() || !address.trim() || !owner_id)
      return alert("Please fill all store fields before adding");

    try {
      const { owner_id } = newStore;
      await API.post("/admin/stores", {
        ...newStore,
        owner_id: Number(owner_id),
      });
      alert("Store added");
      setNewStore({ name: "", email: "", address: "", owner_id: "" });
      fetchStores();
      fetchDashboard();
    } catch (err) {
      const msg = err?.response?.data || err.message || "Failed to add store";
      alert(msg);
    }
  };

  const handleAddUser = async () => {
    const { name, email, password, address } = newUser;
    if (!name.trim() || !email.trim() || !password || !address.trim())
      return alert("Please fill all user fields before adding");


    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return alert("Enter a valid email address");

    try {
      await API.post("/admin/users", newUser);
      alert("User added");
      setNewUser({
        name: "",
        email: "",
        password: "",
        address: "",
        role: "USER",
      });
      fetchUsers();
      fetchDashboard();
    } catch (err) {
      const msg = err?.response?.data || err.message || "Failed to add user";
      alert(msg);
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

  const applyUserFilters = () => {
    fetchUsers(userFilters);
  };

  const viewUser = async (id) => {
    try {
      const res = await API.get(`/admin/users/${id}`);
      setSelectedUser(res.data);
    } catch (err) {
      alert("Unable to fetch user");
    }
  };

  const filteredStores = stores.filter(
    (s) =>
      s.name.toLowerCase().includes(storeFilters.name.toLowerCase()) &&
      s.address.toLowerCase().includes(storeFilters.address.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
       
        <h2 className="text-3xl font-semibold text-gray-800 mb-6">
          Admin Dashboard
        </h2>

        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-500">Total Users</p>
            <p className="text-2xl font-bold text-gray-800">{stats.users}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-500">Total Stores</p>
            <p className="text-2xl font-bold text-gray-800">{stats.stores}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-500">Total Ratings</p>
            <p className="text-2xl font-bold text-gray-800">{stats.ratings}</p>
          </div>
        </div>

      
        <div className="flex justify-end mb-6">
          <button
            onClick={handleLogout}
            className="bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition"
          >
            Logout
          </button>
        </div>

        
        <div className="bg-white rounded-lg shadow p-4 mb-8">
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

       
        <h3 className="text-xl font-semibold mb-3">Users</h3>

        
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-4">
          {["name", "email", "address", "role"].map((field) => (
            <input
              key={field}
              placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
              value={userFilters[field]}
              onChange={(e) =>
                setUserFilters({ ...userFilters, [field]: e.target.value })
              }
              className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
            />
          ))}
          <button
            onClick={applyUserFilters}
            className="bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            Filter
          </button>
        </div>

        
        <div className="bg-white rounded-lg shadow divide-y mb-6">
          {users.map((u) => (
            <div
              key={u.id}
              className="flex justify-between items-center px-4 py-2 text-sm"
            >
              <span>
                {u.name} | {u.email} | {u.address} | {u.role}
              </span>
              <button
                onClick={() => viewUser(u.id)}
                className="text-indigo-600 hover:underline"
              >
                View
              </button>
            </div>
          ))}
        </div>

      
        {selectedUser && (
          <div className="bg-white rounded-lg shadow p-4 mb-8">
            <h4 className="font-semibold mb-2">User Details</h4>
            <p>Name: {selectedUser.name}</p>
            <p>Email: {selectedUser.email}</p>
            <p>Address: {selectedUser.address}</p>
            <p>Role: {selectedUser.role}</p>
            {selectedUser.role === "OWNER" && (
              <p>Rating: {selectedUser.rating ?? "No ratings yet"}</p>
            )}
          </div>
        )}

        
        <h3 className="text-xl font-semibold mb-3">Add User</h3>
        <div className="grid grid-cols-1 md:grid-cols-6 gap-3 mb-8">
          <input
            className="input"
            placeholder="Name"
            value={newUser.name}
            onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
          />
          <input
            className="input"
            placeholder="Email"
            value={newUser.email}
            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
          />
          <input
            className="input"
            placeholder="Address"
            value={newUser.address}
            onChange={(e) =>
              setNewUser({ ...newUser, address: e.target.value })
            }
          />
          <input
            className="input"
            type="password"
            placeholder="Password"
            value={newUser.password}
            onChange={(e) =>
              setNewUser({ ...newUser, password: e.target.value })
            }
          />
          <select
            className="input"
            value={newUser.role}
            onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
          >
            <option value="USER">USER</option>
            <option value="OWNER">OWNER</option>
            <option value="ADMIN">ADMIN</option>
          </select>
          <button onClick={handleAddUser} className="btn bg-green-600">
            Add User
          </button>
        </div>

        
        <h3 className="text-xl font-semibold mb-3">Stores</h3>

        <div className="flex gap-3 mb-4">
          <input
            className="border rounded-lg px-3 py-2"
            placeholder="Store name"
          />
          <input
            className="border rounded-lg px-3 py-2"
            placeholder="Store address"
          />
          <button
            onClick={fetchStores}
            className="bg-indigo-600 text-white px-4 rounded-lg hover:bg-indigo-700 transition"
          >
            Refresh
          </button>
        </div>

        <div className="space-y-3 mb-8">
          {filteredStores.map((s) => (
            <div key={s.id} className="bg-white rounded-lg shadow p-3 text-sm">
              {s.name} | {s.email} | {s.address} | Avg:{" "}
              {s.avgRating || "No ratings"} | Owner: {s.ownerName || "-"}
            </div>
          ))}
        </div>

        
        <h3 className="text-xl font-semibold mb-3">Add Store</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <input
            className="input"
            placeholder="Name"
            value={newStore.name}
            onChange={(e) => setNewStore({ ...newStore, name: e.target.value })}
          />
          <input
            className="input"
            placeholder="Email"
            value={newStore.email}
            onChange={(e) =>
              setNewStore({ ...newStore, email: e.target.value })
            }
          />
          <input
            className="input"
            placeholder="Address"
            value={newStore.address}
            onChange={(e) =>
              setNewStore({ ...newStore, address: e.target.value })
            }
          />
          <select
            className="input"
            value={newStore.owner_id}
            onChange={(e) =>
              setNewStore({ ...newStore, owner_id: e.target.value })
            }
          >
            <option value="">Select Owner</option>
            {owners.length === 0 ? (
              <option value="" disabled>
                No owners found
              </option>
            ) : (
              owners.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name} (id: {o.id})
                </option>
              ))
            )}
          </select>
          <button onClick={handleAddStore} className="btn bg-green-600">
            Add Store
          </button>
        </div>
      </div>
    </div>
  );
}
