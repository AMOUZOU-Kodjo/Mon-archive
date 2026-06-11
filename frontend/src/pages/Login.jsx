import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HiOutlineLockClosed, HiOutlineMail, HiOutlineEye, HiOutlineEyeOff } from 'react-icons/hi';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Veuillez remplir tous les champs.');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Identifiants incorrects.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-base-200 to-base-300 p-4">
      <div className="w-full max-w-md fade-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg">
              <span className="text-primary-content font-bold text-lg">M</span>
            </div>
          </Link>
          <h1 className="text-2xl font-bold">Connexion</h1>
          <p className="text-base-content/60 text-sm mt-1">Accès à l'espace personnel</p>
        </div>

        {/* Formulaire */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body p-6 sm:p-8">
            {error && (
              <div className="alert alert-error shadow-sm text-sm mb-4">
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div className="form-control">
                <label className="label" htmlFor="email">
                  <span className="label-text">Email</span>
                </label>
                <div className="join w-full">
                  <div className="join-item flex items-center pl-3 bg-base-200 border border-base-300 rounded-l-lg">
                    <HiOutlineMail className="text-base-content/40" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    placeholder="phipsipy@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="join-item input input-bordered w-full border-l-0 rounded-r-lg focus:outline-none"
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              {/* Mot de passe */}
              <div className="form-control">
                <label className="label" htmlFor="password">
                  <span className="label-text">Mot de passe</span>
                </label>
                <div className="join w-full">
                  <div className="join-item flex items-center pl-3 bg-base-200 border border-base-300 rounded-l-lg">
                    <HiOutlineLockClosed className="text-base-content/40" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="join-item input input-bordered w-full border-l-0 rounded-r-lg focus:outline-none"
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="join-item btn btn-ghost border border-l-0 border-base-300 rounded-r-lg"
                  >
                    {showPassword ? <HiOutlineEyeOff className="text-base-content/40" /> : <HiOutlineEye className="text-base-content/40" />}
                  </button>
                </div>
              </div>

              {/* Bouton de connexion */}
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full shadow-md"
              >
                {loading ? (
                  <>
                    <span className="loading loading-spinner loading-sm" />
                    Connexion en cours...
                  </>
                ) : (
                  'Se connecter'
                )}
              </button>
            </form>

            <div className="text-center mt-4">
              <Link to="/" className="text-sm text-base-content/50 hover:text-primary transition-colors">
                Retour à l'accueil
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
