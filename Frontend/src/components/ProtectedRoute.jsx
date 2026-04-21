import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

  if (!isLoggedIn) {
    // Redirect to landing page if not logged in
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
