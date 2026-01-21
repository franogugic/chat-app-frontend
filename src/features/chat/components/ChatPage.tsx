import { logoutRequest } from "../../auth/api/auth.api";
import { useAuth } from "../../auth/context/useAuth";

export function ChatPage() {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logoutRequest(); 
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      logout(); 
    }
  };

  return (
    <div
      style={{
        padding: "20px",
        background: "#121212",
        color: "white",
        minHeight: "100vh",
        fontFamily: "sans-serif",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <header
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginBottom: "40px",
        }}
      >
        <span style={{ marginRight: "15px" }}>{user?.name}</span>
        <button
          onClick={handleLogout}
          style={{
            padding: "5px 10px",
            cursor: "pointer",
            background: "#ff4444",
            border: "none",
            borderRadius: "4px",
            color: "white",
          }}
        >
          Logout
        </button>
      </header>

      {/* Main content */}
      <main
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "24px",
        }}
      >
        Ovo je Chat Page
      </main>
    </div>
  );
}

