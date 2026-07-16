import { useEffect, useState } from "react";
import "./App.css";

// Key used to save/load data from the browser's localStorage
const STORAGE_KEY = "team-availability-members";

// Starting data, used only the very first time the app runs
// (i.e. when localStorage is empty)
const initialMembers = [
  { id: 1, name: "Jordan Lee", role: "Design", availability: true, lastUpdated: null },
  { id: 2, name: "Priya Nair", role: "Engineering", availability: false, lastUpdated: null },
  { id: 3, name: "Sam Osei", role: "Product", availability: true, lastUpdated: null },
  { id: 4, name: "Marco Diaz", role: "Engineering", availability: false, lastUpdated: null },
];

function loadMembers() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : initialMembers;
  } catch (e) {
    // If localStorage is unavailable or the saved data is corrupted,
    // fall back to the starting data instead of crashing.
    return initialMembers;
  }
}

function App() {
  const [teamMembers, setTeamMembers] = useState(loadMembers);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const [sortAZ, setSortAZ] = useState(false);

  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState("");
  const [newAvailability, setNewAvailability] = useState(true);

  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editRole, setEditRole] = useState("");

  const [darkMode, setDarkMode] = useState(false);

  const totalMembers = teamMembers.length;
  const availableMembers = teamMembers.filter((m) => m.availability).length;
  const unavailableMembers = totalMembers - availableMembers;

  // Whenever teamMembers changes, save it to localStorage so it survives a page refresh.
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(teamMembers));
  }, [teamMembers]);

  const toggleAvailability = (id) => {
    setTeamMembers((prev) =>
      prev.map((member) =>
        member.id === id
          ? { ...member, availability: !member.availability, lastUpdated: new Date().toISOString() }
          : member
      )
    );
  };

  const addTeamMember = () => {
    if (newName.trim() === "" || newRole.trim() === "") {
      alert("Please enter both name and role.");
      return;
    }

    const newMember = {
      id: Date.now(), // simple unique id, good enough for local data
      name: newName.trim(),
      role: newRole.trim(),
      availability: newAvailability,
      lastUpdated: new Date().toISOString(),
    };

    setTeamMembers((prev) => [...prev, newMember]);
    setNewName("");
    setNewRole("");
    setNewAvailability(true);
  };

  const deleteMember = (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this member?");
    if (!confirmDelete) return;
    setTeamMembers((prev) => prev.filter((member) => member.id !== id));
  };

  const startEdit = (member) => {
    setEditingId(member.id);
    setEditName(member.name);
    setEditRole(member.role);
  };

  const saveEdit = (id) => {
    if (editName.trim() === "" || editRole.trim() === "") {
      alert("Name and role can't be empty.");
      return;
    }

    setTeamMembers((prev) =>
      prev.map((member) =>
        member.id === id
          ? {
              ...member,
              name: editName.trim(),
              role: editRole.trim(),
              lastUpdated: new Date().toISOString(),
            }
          : member
      )
    );

    setEditingId(null);
    setEditName("");
    setEditRole("");
  };

  // Wrap each CSV field in quotes and escape any quotes inside it,
  // so names/roles containing commas don't break the file.
  const escapeCsvField = (value) => `"${String(value).replace(/"/g, '""')}"`;

  const exportCSV = () => {
    const rows = [
      ["Name", "Role", "Availability"],
      ...teamMembers.map((m) => [m.name, m.role, m.availability ? "Available" : "Unavailable"]),
    ];

    const csvContent = rows.map((row) => row.map(escapeCsvField).join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "team-members.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Search, filter, and sort are all computed here (not stored),
  // so they always reflect the current teamMembers data.
  const visibleMembers = teamMembers
    .filter((member) => member.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .filter((member) => {
      if (filter === "available") return member.availability;
      if (filter === "unavailable") return !member.availability;
      return true;
    })
    .sort((a, b) => (sortAZ ? a.name.localeCompare(b.name) : 0));

  return (
    <div className={darkMode ? "app dark" : "app"}>
      <div className="top-bar">
        <button className="mode-toggle" onClick={() => setDarkMode(!darkMode)}>
          {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
        </button>
      </div>

      <h1 className="title">👥 Team Availability Tracker</h1>

      {/* Summary cards */}
      <div className="stats">
        <div className="stat-card">
          <h2>{totalMembers}</h2>
          <p>Total Members</p>
        </div>
        <div className="stat-card">
          <h2 className="text-available">{availableMembers}</h2>
          <p>Available</p>
        </div>
        <div className="stat-card">
          <h2 className="text-unavailable">{unavailableMembers}</h2>
          <p>Unavailable</p>
        </div>
      </div>

      {/* Search */}
      <input
        className="search-input"
        type="text"
        placeholder="🔍 Search Team Member..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {/* Filters + actions */}
      <div className="button-row">
        <button
          className={filter === "all" ? "btn btn-active" : "btn"}
          onClick={() => setFilter("all")}
        >
          All
        </button>
        <button
          className={filter === "available" ? "btn btn-active" : "btn"}
          onClick={() => setFilter("available")}
        >
          Available
        </button>
        <button
          className={filter === "unavailable" ? "btn btn-active" : "btn"}
          onClick={() => setFilter("unavailable")}
        >
          Unavailable
        </button>
        <button className={sortAZ ? "btn btn-active" : "btn"} onClick={() => setSortAZ(!sortAZ)}>
          🔤 Sort A-Z
        </button>
        <button className="btn" onClick={exportCSV}>
          📄 Export CSV
        </button>
      </div>

      {/* Add member form */}
      <div className="card form-card">
        <h2>Add Team Member</h2>

        <input
          className="text-input"
          type="text"
          placeholder="Name"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
        />
        <input
          className="text-input"
          type="text"
          placeholder="Role"
          value={newRole}
          onChange={(e) => setNewRole(e.target.value)}
        />

        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={newAvailability}
            onChange={(e) => setNewAvailability(e.target.checked)}
          />
          Available
        </label>

        <button className="btn btn-primary" onClick={addTeamMember}>
          Add Member
        </button>
      </div>

      {/* Member list */}
      {visibleMembers.map((member) => (
        <div className="card member-card" key={member.id}>
          <div className="member-row">
            <div className="member-info">
              <div className="avatar">{member.name.charAt(0).toUpperCase()}</div>

              {editingId === member.id ? (
                <div className="edit-fields">
                  <input
                    className="text-input"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                  />
                  <input
                    className="text-input"
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value)}
                  />
                </div>
              ) : (
                <div>
                  <h2 className="member-name">{member.name}</h2>
                  <p className="member-role">{member.role}</p>
                </div>
              )}

              <p className={member.availability ? "status text-available" : "status text-unavailable"}>
                {member.availability ? "🟢 Available" : "🔴 Unavailable"}
              </p>

              {member.lastUpdated && (
                <p className="updated-at">
                  Updated: {new Date(member.lastUpdated).toLocaleString()}
                </p>
              )}
            </div>

            <div className="member-actions">
              <button className="btn btn-toggle" onClick={() => toggleAvailability(member.id)}>
                Toggle
              </button>

              {editingId === member.id ? (
                <button className="btn btn-save" onClick={() => saveEdit(member.id)}>
                  💾 Save
                </button>
              ) : (
                <button className="btn btn-edit" onClick={() => startEdit(member)}>
                  ✏️ Edit
                </button>
              )}

              <button className="btn btn-delete" onClick={() => deleteMember(member.id)}>
                🗑 Delete
              </button>
            </div>
          </div>
        </div>
      ))}

      {visibleMembers.length === 0 && <h3 className="empty-message">No team members found.</h3>}
    </div>
  );
}

export default App;
