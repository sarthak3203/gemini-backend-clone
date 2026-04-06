import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

export function PublicOnlyRoute({ children }) {
  const { isAuthed } = useAuth();
  if (isAuthed) return <Navigate to="/app" replace />;
  return children;
}

