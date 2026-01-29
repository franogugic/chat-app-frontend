import { Routes, Route, Navigate } from "react-router-dom";
import { LoginPage } from "./features/auth/components/LoginPage";
import { useAuth } from "./features/auth/context/useAuth";
import { RequireAuth } from "./features/auth/components/RequireAuth";
import ChatPage from "./features/chat/ChatPage";



export default function App() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'white', background: '#121212' }}>
        <h1>Učitavanje sesije...</h1>
      </div>
    );
  }

  return (
    <Routes>
      <Route 
        path="/login" 
        element={!user ? <LoginPage /> : <Navigate to="/chat" replace />} 
      />

      <Route 
        path="/chat" 
        element={
          <RequireAuth>
            <ChatPage />
          </RequireAuth>
        } 
      />

      <Route path="*" element={<Navigate to={user ? "/chat" : "/login"} replace />} />
    </Routes>
  );
}