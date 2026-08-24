import { createUser, getAllUsers, manageUser, deleteUser } from "../../api/manageUser";
import { useState, useEffect, useMemo, useRef } from "react";
import Loader from "../global/loader";

interface UserData {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  position?: string;
  isFirstLogin: boolean;
}

// Reusable beautiful custom select dropdown
const FancySelect = ({
  label,
  value,
  options,
  onChange,
  required = false,
  placeholder = "Select...",
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (val: string) => void;
  required?: boolean;
  placeholder?: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.value === value);
  const displayText = selectedOption ? selectedOption.label : placeholder;

  return (
    <div ref={containerRef} className="relative">
      <label className="block text-sm font-semibold text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-4 py-2.5 border rounded-xl bg-white text-left transition-all duration-200 cursor-pointer
          ${isOpen 
            ? "border-[#ff9900] ring-2 ring-[#ff9900]/20 shadow-md" 
            : "border-gray-300 hover:border-gray-400 focus:outline-none focus:border-[#ff9900] focus:ring-2 focus:ring-[#ff9900]/20"
          }
          ${!selectedOption ? "text-gray-400" : "text-gray-700"}
        `}
      >
        <span className="block truncate">{displayText}</span>
        <svg 
          className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} 
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-20 mt-1 w-full bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <ul className="max-h-60 overflow-auto py-1">
            {options.map((opt) => (
              <li
                key={opt.value}
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`flex items-center justify-between px-4 py-2.5 text-sm cursor-pointer transition-colors duration-150
                  ${opt.value === value 
                    ? "bg-orange-50 text-[#ff9900] font-semibold" 
                    : "text-gray-700 hover:bg-orange-50/50 hover:text-gray-900"
                  }
                `}
              >
                <span>{opt.label}</span>
                {opt.value === value && (
                  <svg className="w-5 h-5 text-[#ff9900]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

function ManageUsers() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search state
  const [searchTerm, setSearchTerm] = useState("");

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "staff",
    position: "",
    password: "",
  });
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const roles = ["customer", "staff", "manager", "admin", "head-chef"];
  const staffPositions = [
    "line-cook",
    "prep-cook",
    "kitchen-assistant",
    "dishwasher",
    "cashier",
    "waiter",
    "cleaner",
    "host",
  ];

  // Lock background scroll when any modal is open
  useEffect(() => {
    if (showCreateModal || showEditModal || showDeleteModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showCreateModal, showEditModal, showDeleteModal]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await getAllUsers();
      if (Array.isArray(data)) {
        setUsers(data);
      } else if (data?.users && Array.isArray(data.users)) {
        setUsers(data.users);
      } else {
        setUsers([]);
      }
      setError(null);
    } catch (err) {
      setError("Failed to load users. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    Promise.resolve().then(fetchUsers);
  }, []);

  const resetForm = () => {
    setFormData({ name: "", email: "", phone: "", role: "staff", position: "", password: "" });
    setSubmitError(null);
  };

  const handleRoleChange = (newRole: string) => {
    setFormData(prev => ({
      ...prev,
      role: newRole,
      position: newRole === "staff" ? prev.position : "",
    }));
  };

  const handleCreate = async () => {
    if (!formData.name || !formData.email || !formData.password) {
      setSubmitError("Name, email and password are required.");
      return;
    }
    if (formData.role === "staff" && !formData.position) {
      setSubmitError("Position is required for staff members.");
      return;
    }
    try {
      setSubmitLoading(true);
      const position = formData.role === "staff" ? formData.position : "";
      await createUser(
        formData.name,
        formData.email,
        formData.phone,
        formData.password,
        formData.password,
        formData.role,
        position,
      );
      await fetchUsers();
      setShowCreateModal(false);
      resetForm();
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { message?: string } } };
      setSubmitError(apiError?.response?.data?.message || "Failed to create user.");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleEdit = async () => {
    if (!selectedUser) return;
    if (!formData.name || !formData.email) {
      setSubmitError("Name and email are required.");
      return;
    }
    if (formData.role === "staff" && !formData.position) {
      setSubmitError("Position is required for staff members.");
      return;
    }
    try {
      setSubmitLoading(true);
      const position = formData.role === "staff" ? formData.position : "";
      await manageUser(formData.role, position, selectedUser._id);
      await fetchUsers();
      setShowEditModal(false);
      setSelectedUser(null);
      resetForm();
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { message?: string } } };
      setSubmitError(apiError?.response?.data?.message || "Failed to update user.");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedUser) return;
    try {
      setSubmitLoading(true);
      await deleteUser(selectedUser._id);
      await fetchUsers();
      setShowDeleteModal(false);
      setSelectedUser(null);
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { message?: string } } };
      setSubmitError(apiError?.response?.data?.message || "Failed to delete user.");
    } finally {
      setSubmitLoading(false);
    }
  };

  const openEditModal = (user: UserData) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      phone: user.phone || "",
      role: user.role,
      position: user.position || "",
      password: "",
    });
    setSubmitError(null);
    setShowEditModal(true);
  };

  const openDeleteModal = (user: UserData) => {
    setSelectedUser(user);
    setSubmitError(null);
    setShowDeleteModal(true);
  };

  // Filter users based on search term
  const filteredUsers = useMemo(() => {
    if (!searchTerm.trim()) return users;
    const term = searchTerm.toLowerCase().trim();
    return users.filter(user => {
      return (
        user.name.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term) ||
        (user.phone && user.phone.includes(term)) ||
        user.role.toLowerCase().includes(term) ||
        (user.position && user.position.toLowerCase().includes(term))
      );
    });
  }, [users, searchTerm]);

  return (
    <div className="min-h-screen bg-linear-to-br from-[#fffaf3] to-[#ffe8c8] relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-[#ff9900]/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#ff9900]/5 rounded-full blur-3xl translate-x-1/3 translate-y-1/3 pointer-events-none"></div>

      <div className="relative z-10 px-6 md:px-12 lg:px-20 py-10">
        {/* Header with Search & Add Button */}
        <div className="mb-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 mb-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm font-semibold text-[#ff9900] tracking-wide uppercase">User Management</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
              Manage <span className="text-[#ff9900]">Users</span>
            </h1>
            <p className="text-lg text-gray-600 mt-2 max-w-2xl">
              Add, edit or remove staff accounts and manage their roles.
            </p>
            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm border border-gray-100">
              <span className="text-[#ff9900]">Total users:</span>
              <span>{users.length}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            {/* Search bar */}
            <div className="relative w-full sm:w-64 lg:w-72">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#ff9900] focus:border-transparent outline-none transition bg-white text-sm"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                >
                  <svg className="w-5 h-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {/* Add New User button */}
            <button
              onClick={() => {
                resetForm();
                setShowCreateModal(true);
              }}
              className="flex items-center gap-2 px-6 py-3 bg-[#ff9900] hover:bg-[#ff8800] text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl cursor-pointer whitespace-nowrap"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              Add New User
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && <Loader message="Loading users..." />}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
            <svg className="w-10 h-10 text-red-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-red-700 font-semibold">{error}</p>
            <button
              onClick={fetchUsers}
              className="mt-4 px-6 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition cursor-pointer"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Users Grid */}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUsers.length === 0 ? (
              <div className="col-span-full text-center py-16 bg-white rounded-2xl border-2 border-dashed border-gray-300">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <p className="text-gray-500 font-medium">
                  {searchTerm ? "No users match your search." : "No users found. Add your first user."}
                </p>
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="mt-2 text-sm text-[#ff9900] font-semibold hover:underline cursor-pointer"
                  >
                    Clear search
                  </button>
                )}
              </div>
            ) : (
              filteredUsers.map((user) => (
                <div
                  key={user._id}
                  className="bg-white rounded-2xl shadow-md border border-gray-100 hover:shadow-xl transition-shadow duration-300 overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-[#ff9900]/10 rounded-full flex items-center justify-center">
                          <span className="text-lg font-bold text-[#ff9900]">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 text-lg">{user.name}</h3>
                          <span className="text-xs font-semibold text-gray-500 uppercase">{user.role}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEditModal(user)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                          title="Edit user"
                        >
                          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => openDeleteModal(user)}
                          className="p-2 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete user"
                        >
                          <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <span className="font-medium">{user.email}</span>
                      </div>
                      {user.phone && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          <span className="font-medium">{user.phone}</span>
                        </div>
                      )}
                      {user.position && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          <span className="font-medium">{user.position.replace("-", " ")}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* CREATE USER MODAL – no scroll, background locked */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-gray-200 max-w-md w-full p-8 relative animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition cursor-pointer"
            >
              <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="inline-flex items-center gap-2 mb-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm font-semibold text-[#ff9900] uppercase">Add New User</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Create Account</h2>

            {submitError && (
              <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">{submitError}</p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#ff9900] focus:border-transparent outline-none transition"
                  placeholder="Full name"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#ff9900] focus:border-transparent outline-none transition"
                  placeholder="email@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Phone</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#ff9900] focus:border-transparent outline-none transition"
                  placeholder="Phone number"
                />
              </div>
              <FancySelect
                label="Role"
                value={formData.role}
                options={roles.map(r => ({ value: r, label: r.charAt(0).toUpperCase() + r.slice(1).replace("-", " ") }))}
                onChange={handleRoleChange}
                required
                placeholder="Select role"
              />
              {formData.role === "staff" && (
                <FancySelect
                  label="Position"
                  value={formData.position}
                  options={[
                    { value: "", label: "Select position" },
                    ...staffPositions.map(p => ({ value: p, label: p.charAt(0).toUpperCase() + p.slice(1).replace("-", " ") }))
                  ]}
                  onChange={(val) => setFormData({ ...formData, position: val })}
                  required
                  placeholder="Select position"
                />
              )}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Password *</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#ff9900] focus:border-transparent outline-none transition"
                  placeholder="Password"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-3 bg-white border-2 border-gray-200 font-semibold rounded-xl hover:border-gray-300 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={submitLoading}
                className="flex-1 px-4 py-3 bg-linear-to-r from-gray-900 to-black text-white font-semibold rounded-xl transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-orange-500/20 hover:shadow-lg"
              >
                {submitLoading ? "Creating..." : "Create User"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT USER MODAL – no scroll, background locked */}
            {/* EDIT USER MODAL – positioned higher */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 backdrop-blur-sm p-4 pt-16">
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-gray-200 max-w-md w-full p-8 relative animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setShowEditModal(false)}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition cursor-pointer"
            >
              <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="inline-flex items-center gap-2 mb-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm font-semibold text-[#ff9900] uppercase">Edit User</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">{selectedUser.name}</h2>

            {submitError && (
              <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">{submitError}</p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#ff9900] focus:border-transparent outline-none transition"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#ff9900] focus:border-transparent outline-none transition"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Phone</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#ff9900] focus:border-transparent outline-none transition"
                />
              </div>
              <FancySelect
                label="Role"
                value={formData.role}
                options={roles.map(r => ({ value: r, label: r.charAt(0).toUpperCase() + r.slice(1).replace("-", " ") }))}
                onChange={handleRoleChange}
                required
                placeholder="Select role"
              />
              {formData.role === "staff" && (
                <div className="-mt-2">
                  <FancySelect
                    label="Position"
                    value={formData.position}
                    options={[
                      { value: "", label: "Select position" },
                      ...staffPositions.map(p => ({ value: p, label: p.charAt(0).toUpperCase() + p.slice(1).replace("-", " ") }))
                    ]}
                    onChange={(val) => setFormData({ ...formData, position: val })}
                    required
                    placeholder="Select position"
                  />
                </div>
              )}
              <p className="text-sm text-gray-500">Password cannot be changed here.</p>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 px-4 py-3 bg-white border-2 border-gray-200 font-semibold rounded-xl hover:border-gray-300 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleEdit}
                disabled={submitLoading}
                className="flex-1 px-4 py-3 bg-linear-to-r from-gray-900 to-black text-white font-semibold rounded-xl transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-orange-500/20 hover:shadow-lg"
              >
                {submitLoading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {showDeleteModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-gray-200 max-w-md w-full p-8 relative animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowDeleteModal(false)}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition cursor-pointer"
            >
              <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Delete User</h2>
              <p className="text-gray-600 mb-1">
                Are you sure you want to delete <span className="font-semibold text-gray-900">{selectedUser.name}</span>?
              </p>
              <p className="text-sm text-gray-500">This action cannot be undone.</p>

              {submitError && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700">{submitError}</p>
                </div>
              )}

              <div className="flex gap-3 mt-8">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-4 py-3 bg-white border-2 border-gray-200 font-semibold rounded-xl hover:border-gray-300 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={submitLoading}
                  className="flex-1 px-4 py-3 bg-red-600 text-white font-semibold rounded-xl transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:bg-red-700"
                >
                  {submitLoading ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageUsers;