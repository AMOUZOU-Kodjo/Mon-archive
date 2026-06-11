import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Route protégée : redirige vers /login si l'utilisateur n'est pas authentifié.
 * Affiche un squelette de chargement pendant la vérification.
 */
export default function ProtectedRoute({ children }) {
  const { authenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-200">
        <div className="flex flex-col items-center gap-4">
          <span className="loading loading-spinner loading-lg text-primary" />
          <p className="text-base-content/60 text-sm">Vérification de l'authentification...</p>
        </div>
      </div>
    );
  }

  if (!authenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
