import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem('adminToken');
  if (!token || token === 'undefined' || token === 'null' || !token.trim()) {
    return <Navigate to="/admin" replace />;
  }
  return children;
}
