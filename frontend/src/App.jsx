
import { useEffect, useState } from "react";
import { apiRequest } from "./services/api";
import {
  Wallet, Gem, Coins, Trophy, LogOut, User,
  ShieldCheck, TrendingUp, LoaderCircle, Award,
  History, Calendar, Users, UserCheck, UserX,
  ClipboardList, PlusCircle, RefreshCw
} from "lucide-react";
import "./App.css";

function App() {
  const [page, setPage] = useState("login");
  const [activeTab, setActiveTab] = useState("overview");
  const [user, setUser] = useState(null);

  const [achievements, setAchievements] = useState([]);
  const [rewardHistory, setRewardHistory] = useState([]);

  const [adminStats, setAdminStats] = useState(null);
  const [adminUsers, setAdminUsers] = useState([]);
  const [adminRewards, setAdminRewards] = useState([]);

  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);
  const [adminLoading, setAdminLoading] = useState(false);

  const [error, setError] = useState("");
  const [adminError, setAdminError] = useState("");
  const [adminMessage, setAdminMessage] = useState("");

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: ""
  });

  const [achievementForm, setAchievementForm] = useState({
    userId: "",
    title: "",
    description: "",
    icon: "🏆",
    target: 1,
    xpReward: 50
  });

  // Load user profile
  async function loadProfile() {
    try {
      const data = await apiRequest("/users/profile");
      setUser(data.user);
      setPage("dashboard");
    } catch {
      localStorage.removeItem("velo_token");
      setUser(null);
      setPage("login");
    }
  }

  // Load user achievements
  async function loadAchievements() {
    setPageLoading(true);
    setError("");

    try {
      const data = await apiRequest("/rewards/achievements");
      setAchievements(data.achievements || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setPageLoading(false);
    }
  }

  // Load user reward history
  async function loadRewardHistory() {
    setPageLoading(true);
    setError("");

    try {
      const data = await apiRequest("/rewards/history");
      setRewardHistory(data.rewards || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setPageLoading(false);
    }
  }

  // Load admin dashboard data
  async function loadAdminData() {
    setAdminLoading(true);
    setAdminError("");

    try {
      const [statsData, usersData, rewardsData] = await Promise.all([
        apiRequest("/admin/stats"),
        apiRequest("/admin/users"),
        apiRequest("/admin/rewards")
      ]);

      setAdminStats(statsData.stats);
      setAdminUsers(usersData.users || []);
      setAdminRewards(rewardsData.rewards || []);
    } catch (err) {
      setAdminError(err.message);
    } finally {
      setAdminLoading(false);
    }
  }

  // Activate or deactivate a user
  async function updateUserStatus(userId, isActive) {
    setAdminError("");
    setAdminMessage("");

    try {
      await apiRequest(`/admin/users/${userId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ isActive })
      });

      setAdminMessage("User status updated successfully.");
      await loadAdminData();
    } catch (err) {
      setAdminError(err.message);
    }
  }

  // Create an achievement
  async function handleCreateAchievement(event) {
    event.preventDefault();
    setAdminError("");
    setAdminMessage("");

    try {
      await apiRequest("/admin/achievements", {
        method: "POST",
        body: JSON.stringify({
          ...achievementForm,
          target: Number(achievementForm.target),
          xpReward: Number(achievementForm.xpReward)
        })
      });

      setAdminMessage("Achievement created successfully.");

      setAchievementForm({
        userId: "",
        title: "",
        description: "",
        icon: "🏆",
        target: 1,
        xpReward: 50
      });

      await loadAdminData();
    } catch (err) {
      setAdminError(err.message);
    }
  }

  // Initial login check
  useEffect(() => {
    if (localStorage.getItem("velo_token")) {
      loadProfile();
    }
  }, []);

  // Load data when tabs change
  useEffect(() => {
    if (user && activeTab === "achievements") {
      loadAchievements();
    }

    if (user && activeTab === "rewards") {
      loadRewardHistory();
    }

    if (user?.role === "admin" && activeTab === "admin") {
      loadAdminData();
    }
  }, [user, activeTab]);

  function handleChange(event) {
    setForm({
      ...form,
      [event.target.name]: event.target.value
    });
  }

  function handleAchievementChange(event) {
    setAchievementForm({
      ...achievementForm,
      [event.target.name]: event.target.value
    });
  }

  // Login and registration
  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const endpoint =
        page === "register" ? "/auth/register" : "/auth/login";

      const data = await apiRequest(endpoint, {
        method: "POST",
        body: JSON.stringify(form)
      });

      localStorage.setItem("velo_token", data.token);
      setActiveTab("overview");
      await loadProfile();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // Logout
  function logout() {
    localStorage.removeItem("velo_token");

    setUser(null);
    setAchievements([]);
    setRewardHistory([]);
    setAdminStats(null);
    setAdminUsers([]);
    setAdminRewards([]);

    setForm({
      fullName: "",
      email: "",
      password: ""
    });

    setActiveTab("overview");
    setError("");
    setAdminError("");
    setAdminMessage("");
    setPage("login");
  }

  if (page === "dashboard" && !user) {
    return (
      <div className="loading">
        <LoaderCircle className="spin" />
        Loading dashboard...
      </div>
    );
  }

  // Authentication screen
  if (!user) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="brand-mark">V</div>

          <h1>VELOop Rewards</h1>

          <p className="muted">
            Your rewards. Your journey. Your future.
          </p>

          <h2>
            {page === "register"
              ? "Create your account"
              : "Welcome back"}
          </h2>

          <p className="muted">
            {page === "register"
              ? "Join the VELOop community"
              : "Sign in to your account"}
          </p>

          <form onSubmit={handleSubmit}>
            {page === "register" && (
              <input
                name="fullName"
                placeholder="Full name"
                value={form.fullName}
                onChange={handleChange}
                required
              />
            )}

            <input
              name="email"
              type="email"
              placeholder="Email address"
              value={form.email}
              onChange={handleChange}
              required
            />

            <input
              name="password"
              type="password"
              placeholder="Password (minimum 8 characters)"
              value={form.password}
              onChange={handleChange}
              minLength={8}
              required
            />

            {error && (
              <div className="error-message">{error}</div>
            )}

            <button className="primary-btn" disabled={loading}>
              {loading
                ? "Please wait..."
                : page === "register"
                ? "Create Account"
                : "Sign In"}
            </button>
          </form>

          <p className="switch-text">
            {page === "register"
              ? "Already have an account?"
              : "New to VELOop?"}

            <button
              className="text-btn"
              onClick={() => {
                setError("");
                setPage(
                  page === "register" ? "login" : "register"
                );
              }}
            >
              {page === "register" ? "Sign in" : "Create account"}
            </button>
          </p>
        </div>
      </div>
    );
  }

  const rewards = [
    {
      label: "VE Balance",
      value: user.veBalance,
      icon: Wallet,
      color: "blue"
    },
    {
      label: "SVE Balance",
      value: user.sveBalance,
      icon: TrendingUp,
      color: "purple"
    },
    {
      label: "Gems",
      value: user.gems,
      icon: Gem,
      color: "pink"
    },
    {
      label: "Tokens",
      value: user.tokens,
      icon: Coins,
      color: "orange"
    }
  ];

  const nextLevelXP = 1000;

  const progress = Math.min(
    (Number(user.xp || 0) / nextLevelXP) * 100,
    100
  );

  // User overview
  function renderOverview() {
    return (
      <>
        <section className="welcome-banner">
          <div>
            <span className="eyebrow">
              YOUR REWARDS JOURNEY
            </span>

            <h1>Hello, {user.fullName} 👋</h1>

            <p>
              Keep earning rewards and reach your next level.
            </p>
          </div>

          <Trophy size={75} />
        </section>

        <div className="section-heading">
          <h2>My Rewards</h2>
          <span>Live account balances</span>
        </div>

        <section className="reward-grid">
          {rewards.map((item) => {
            const Icon = item.icon;

            return (
              <div className="reward-card" key={item.label}>
                <div className={`reward-icon ${item.color}`}>
                  <Icon size={23} />
                </div>

                <p>{item.label}</p>

                <h2>
                  {Number(item.value || 0).toLocaleString("en-IN")}
                </h2>
              </div>
            );
          })}
        </section>

        <div className="section-heading">
          <h2>Level Progress</h2>
          <span>Keep moving forward</span>
        </div>

        <section className="level-card">
          <div className="level-top">
            <div className="level-icon">
              <Trophy size={25} />
            </div>

            <div>
              <strong>Level {user.level}</strong>
              <p className="muted">VELOop Member</p>
            </div>

            <div className="xp-value">
              {user.xp} XP
            </div>
          </div>

          <div className="progress-track">
            <div
              className="progress-fill"
              style={{ width: `${progress}%` }}
            />
          </div>

          <p className="progress-caption">
            {user.xp} / {nextLevelXP} XP
          </p>
        </section>

        <div className="section-heading">
          <h2>Account Information</h2>
        </div>

        <section className="account-card">
          <div className="account-row">
            <User size={18} />
            <span>Full Name</span>
            <strong>{user.fullName}</strong>
          </div>

          <div className="account-row">
            <ShieldCheck size={18} />
            <span>Email</span>
            <strong>{user.email}</strong>
          </div>

          <div className="account-row">
            <ShieldCheck size={18} />
            <span>Account Status</span>
            <strong className="status-active">
              {user.isActive ? "Active" : "Inactive"}
            </strong>
          </div>

          <div className="account-row">
            <ShieldCheck size={18} />
            <span>Account Role</span>
            <strong>{user.role}</strong>
          </div>
        </section>
      </>
    );
  }

  // User achievements
  function renderAchievements() {
    return (
      <>
        <div className="section-heading">
          <h2>My Achievements 🏆</h2>
          <span>Track your milestones</span>
        </div>

        {error && (
          <div className="error-message">{error}</div>
        )}

        {pageLoading ? (
          <div className="loading">
            <LoaderCircle className="spin" />
            Loading achievements...
          </div>
        ) : achievements.length === 0 ? (
          <section className="account-card empty-state">
            <Award size={48} />
            <h2>No achievements yet</h2>
            <p>
              Your achievements will appear here as you complete
              milestones.
            </p>
          </section>
        ) : (
          <section className="achievement-grid">
            {achievements.map((item) => (
              <div
                className="reward-card achievement-card"
                key={item._id}
              >
                <div className="reward-icon purple">
                  <Award size={25} />
                </div>

                <h3>
                  {item.icon} {item.title}
                </h3>

                <p>{item.description}</p>

                <div className="progress-track">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${Math.min(
                        (item.progress / item.target) * 100,
                        100
                      )}%`
                    }}
                  />
                </div>

                <p>
                  {item.progress} / {item.target} completed
                </p>

                <strong>{item.xpReward} XP reward</strong>

                <span className="status-active">
                  {item.isCompleted
                    ? "Completed"
                    : "In Progress"}
                </span>
              </div>
            ))}
          </section>
        )}
      </>
    );
  }

  // User reward history
  function renderRewards() {
    return (
      <>
        <div className="section-heading">
          <h2>Reward History</h2>
          <span>Your reward transactions</span>
        </div>

        {error && (
          <div className="error-message">{error}</div>
        )}

        {pageLoading ? (
          <div className="loading">
            <LoaderCircle className="spin" />
            Loading transactions...
          </div>
        ) : rewardHistory.length === 0 ? (
          <section className="account-card empty-state">
            <History size={48} />
            <h2>No transactions yet</h2>
            <p>
              Your earned and redeemed rewards will appear here.
            </p>
          </section>
        ) : (
          <section className="account-card">
            {rewardHistory.map((item) => (
              <div className="account-row" key={item._id}>
                <History size={19} />

                <div className="transaction-info">
                  <strong>{item.description}</strong>

                  <small>
                    {item.type} · {item.transactionType}
                  </small>

                  <small>
                    <Calendar size={13} />
                    {new Date(item.createdAt).toLocaleDateString("en-IN")}
                  </small>
                </div>

                <strong>
                  {item.amount} {item.type}
                </strong>
              </div>
            ))}
          </section>
        )}
      </>
    );
  }

  // Admin dashboard
  function renderAdminDashboard() {
    return (
      <div className="admin-dashboard">
        <div className="section-heading">
          <div>
            <h2>Admin Dashboard</h2>
            <span>Manage your VELOop platform</span>
          </div>

          <button
            className="primary-btn"
            onClick={loadAdminData}
            disabled={adminLoading}
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>

        {adminError && (
          <div className="error-message">{adminError}</div>
        )}

        {adminMessage && (
          <div className="admin-message">
            {adminMessage}
          </div>
        )}

        {adminLoading ? (
          <div className="loading">
            <LoaderCircle className="spin" />
            Loading admin data...
          </div>
        ) : (
          <>
            {/* Statistics */}
            <section className="reward-grid">
              <div className="reward-card">
                <div className="reward-icon blue">
                  <Users size={24} />
                </div>
                <p>Total Users</p>
                <h2>{adminStats?.totalUsers ?? 0}</h2>
              </div>

              <div className="reward-card">
                <div className="reward-icon purple">
                  <UserCheck size={24} />
                </div>
                <p>Active Users</p>
                <h2>{adminStats?.activeUsers ?? 0}</h2>
              </div>

              <div className="reward-card">
                <div className="reward-icon orange">
                  <UserX size={24} />
                </div>
                <p>Inactive Users</p>
                <h2>{adminStats?.inactiveUsers ?? 0}</h2>
              </div>

              <div className="reward-card">
                <div className="reward-icon pink">
                  <Trophy size={24} />
                </div>
                <p>Achievements</p>
                <h2>{adminStats?.totalAchievements ?? 0}</h2>
              </div>

              <div className="reward-card">
                <div className="reward-icon blue">
                  <ClipboardList size={24} />
                </div>
                <p>Transactions</p>
                <h2>{adminStats?.totalTransactions ?? 0}</h2>
              </div>
            </section>

            {/* User management */}
            <div className="section-heading">
              <h2>User Management</h2>
              <span>{adminUsers.length} registered users</span>
            </div>

            <section className="account-card admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {adminUsers.map((item) => (
                    <tr key={item._id}>
                      <td>{item.fullName}</td>
                      <td>{item.email}</td>
                      <td>{item.role}</td>
                      <td>
                        <span
                          className={
                            item.isActive
                              ? "status-active"
                              : "status-inactive"
                          }
                        >
                          {item.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td>
                        {item.role === "admin" ? (
                          <span>Protected Admin</span>
                        ) : (
                          <button
                            className={
                              item.isActive
                                ? "admin-danger-btn"
                                : "admin-success-btn"
                            }
                            onClick={() =>
                              updateUserStatus(
                                item._id,
                                !item.isActive
                              )
                            }
                          >
                            {item.isActive
                              ? "Deactivate"
                              : "Activate"}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}

                  {adminUsers.length === 0 && (
                    <tr>
                      <td colSpan="5">No users found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </section>

            {/* Create achievement */}
            <div className="section-heading">
              <h2>Create Achievement</h2>
              <span>Assign an achievement to a user</span>
            </div>

            <section className="account-card admin-form-card">
              <form onSubmit={handleCreateAchievement}>
                <label>Select User</label>

                <select
                  name="userId"
                  value={achievementForm.userId}
                  onChange={handleAchievementChange}
                  required
                >
                  <option value="">Choose a user</option>

                  {adminUsers
                    .filter((item) => item.role === "user")
                    .map((item) => (
                      <option key={item._id} value={item._id}>
                        {item.fullName} ({item.email})
                      </option>
                    ))}
                </select>

                <label>Achievement Title</label>

                <input
                  name="title"
                  placeholder="Example: First Purchase"
                  value={achievementForm.title}
                  onChange={handleAchievementChange}
                  required
                />

                <label>Description</label>

                <input
                  name="description"
                  placeholder="Describe the achievement"
                  value={achievementForm.description}
                  onChange={handleAchievementChange}
                  required
                />

                <label>Icon</label>

                <input
                  name="icon"
                  value={achievementForm.icon}
                  onChange={handleAchievementChange}
                  required
                />

                <label>Target</label>

                <input
                  type="number"
                  name="target"
                  min="1"
                  value={achievementForm.target}
                  onChange={handleAchievementChange}
                  required
                />

                <label>XP Reward</label>

                <input
                  type="number"
                  name="xpReward"
                  min="0"
                  value={achievementForm.xpReward}
                  onChange={handleAchievementChange}
                  required
                />

                <button className="primary-btn" type="submit">
                  <PlusCircle size={17} />
                  Create Achievement
                </button>
              </form>
            </section>

            {/* Reward transactions */}
            <div className="section-heading">
              <h2>Reward Transactions</h2>
              <span>All platform transactions</span>
            </div>

            <section className="account-card admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Type</th>
                    <th>Transaction</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>

                <tbody>
                  {adminRewards.map((item) => (
                    <tr key={item._id}>
                      <td>
                        {item.user?.fullName || "Unknown"}
                      </td>
                      <td>{item.type}</td>
                      <td>{item.transactionType}</td>
                      <td>{item.amount}</td>
                      <td>{item.status}</td>
                      <td>
                        {new Date(item.createdAt).toLocaleDateString("en-IN")}
                      </td>
                    </tr>
                  ))}

                  {adminRewards.length === 0 && (
                    <tr>
                      <td colSpan="6">No transactions found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </section>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="dashboard">
      <style>{`
        .admin-message {
          padding: 12px 16px;
          margin: 12px 0;
          background: #e7f8ee;
          color: #176b3a;
          border-radius: 8px;
        }

        .admin-table-wrap {
          overflow-x: auto;
          margin-bottom: 25px;
        }

        .admin-table {
          width: 100%;
          border-collapse: collapse;
          min-width: 650px;
        }

        .admin-table th,
        .admin-table td {
          padding: 14px 12px;
          text-align: left;
          border-bottom: 1px solid #e8ebf1;
          font-size: 14px;
        }

        .admin-table th {
          font-weight: 700;
          color: #687386;
          background: #f8f9fc;
        }

        .admin-table td {
          color: #273449;
        }

        .admin-table tr:last-child td {
          border-bottom: none;
        }

        .admin-form-card form {
          display: flex;
          flex-direction: column;
          gap: 12px;
          max-width: 600px;
        }

        .admin-form-card label {
          font-weight: 600;
          margin-top: 5px;
        }

        .admin-form-card input,
        .admin-form-card select {
          width: 100%;
          padding: 12px;
          border: 1px solid #dce1ea;
          border-radius: 8px;
          font: inherit;
        }

        .admin-danger-btn,
        .admin-success-btn {
          padding: 8px 12px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 600;
        }

        .admin-danger-btn {
          background: #fee2e2;
          color: #b91c1c;
        }

        .admin-success-btn {
          background: #dcfce7;
          color: #166534;
        }

        .status-inactive {
          color: #b91c1c;
          font-weight: 600;
        }

        .admin-dashboard .section-heading {
          margin-top: 25px;
        }

        .admin-dashboard .section-heading button {
          display: flex;
          align-items: center;
          gap: 7px;
        }

        @media (max-width: 600px) {
          .admin-table {
            min-width: 650px;
          }
        }
      `}</style>

      <aside className="sidebar">
        <div className="side-brand">
          <div className="brand-mark small">V</div>
          <span>VELOop</span>
        </div>

        <button
          className={`nav-item ${activeTab === "overview" ? "active" : ""}`}
          onClick={() => {
            setError("");
            setActiveTab("overview");
          }}
        >
          <TrendingUp size={19} />
          Overview
        </button>

        <button
          className={`nav-item ${activeTab === "profile" ? "active" : ""}`}
          onClick={() => {
            setError("");
            setActiveTab("profile");
          }}
        >
          <User size={19} />
          My Profile
        </button>

        <button
          className={`nav-item ${activeTab === "achievements" ? "active" : ""}`}
          onClick={() => {
            setError("");
            setActiveTab("achievements");
          }}
        >
          <Trophy size={19} />
          Achievements
        </button>

        <button
          className={`nav-item ${activeTab === "rewards" ? "active" : ""}`}
          onClick={() => {
            setError("");
            setActiveTab("rewards");
          }}
        >
          <Wallet size={19} />
          Rewards
        </button>

        {user.role === "admin" && (
          <button
            className={`nav-item ${activeTab === "admin" ? "active" : ""}`}
            onClick={() => {
              setAdminError("");
              setAdminMessage("");
              setActiveTab("admin");
            }}
          >
            <ShieldCheck size={19} />
            Admin Panel
          </button>
        )}

        <button className="logout-btn" onClick={logout}>
          <LogOut size={18} />
          Logout
        </button>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <h2>
              {activeTab === "overview"
                ? "Dashboard"
                : activeTab === "profile"
                ? "My Profile"
                : activeTab === "achievements"
                ? "Achievements"
                : activeTab === "rewards"
                ? "Rewards"
                : "Admin Panel"}
            </h2>

            <p className="muted">
              Welcome back, {user.fullName}!
            </p>
          </div>

          <div className="profile-chip">
            <div className="avatar">
              {user.fullName?.charAt(0).toUpperCase()}
            </div>

            <div>
              <strong>{user.fullName}</strong>
              <small>{user.role}</small>
            </div>
          </div>
        </header>

        {activeTab === "overview" && renderOverview()}

        {activeTab === "achievements" && renderAchievements()}

        {activeTab === "rewards" && renderRewards()}

        {activeTab === "admin" && user.role === "admin" &&
          renderAdminDashboard()}

        {activeTab === "profile" && (
          <>
            <div className="section-heading">
              <h2>My Profile</h2>
              <span>Your account details</span>
            </div>

            <section className="account-card">
              <div className="account-row">
                <User size={18} />
                <span>Full Name</span>
                <strong>{user.fullName}</strong>
              </div>

              <div className="account-row">
                <ShieldCheck size={18} />
                <span>Email</span>
                <strong>{user.email}</strong>
              </div>

              <div className="account-row">
                <ShieldCheck size={18} />
                <span>Role</span>
                <strong>{user.role}</strong>
              </div>

              <div className="account-row">
                <ShieldCheck size={18} />
                <span>Status</span>
                <strong>
                  {user.isActive ? "Active" : "Inactive"}
                </strong>
              </div>
            </section>
          </>
        )}

        <footer>
          © 2026 VELOop Rewards. All rights reserved.
        </footer>
      </main>
    </div>
  );
}

export default App;
