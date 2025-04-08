import { Navigate } from 'react-router-dom';

export default function PrivateRoute({ children, tipo }) {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));

  if (!token || !user || user.tipo !== tipo) {
    return <Navigate to="/" />;
  }

  return children;
}
