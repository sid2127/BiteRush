import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

function AuthLayout({ children, authentication }) {
  const { status, loading } = useSelector(state => state.user);

  // ⏳ WAIT while checking auth
  if (loading) return <div>Loading...</div>;

  // 🔐 Private page
  if (authentication && !status) {
    return <Navigate to="/login" replace />;
  }

  // 🌐 Public page
  if (!authentication && status) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default AuthLayout;
