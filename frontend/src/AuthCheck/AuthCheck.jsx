import { Navigate, useLocation } from 'react-router-dom'
import useAuthStore from '../services/authStore'

const AuthCheck = ({children}) => {
  const isAuthenticated = useAuthStore((state) => Boolean(state.accessToken))
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} />;
  }

  return children;

}

export default AuthCheck