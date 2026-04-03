import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Lock, Mail, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('admin@iso-audit.local');
  const [password, setPassword] = useState('admin123');
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, from, navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await login({ email, password, remember });
      navigate(from, { replace: true });
    } catch (loginError) {
      setError(loginError.message || 'Impossible de vous connecter.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-background" />
      <div className="login-grid">
        <motion.section
          className="login-panel login-panel-hero"
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="login-brand-badge">
            <ShieldCheck size={20} />
            ISO Audit Simulator
          </div>
          <h1>Connexion sécurisée</h1>
          <p>
            Accédez au simulateur d'audit, gérez vos évaluations et préparez l'intégration avec la branche authentification.
          </p>

          <div className="login-feature-list">
            <div className="login-feature-item">
              <Lock size={18} />
              Authentification centralisée
            </div>
            <div className="login-feature-item">
              <ShieldCheck size={18} />
              Déconnexion immédiate
            </div>
            <div className="login-feature-item">
              <ArrowRight size={18} />
              Base prête pour fusion GitHub
            </div>
          </div>
        </motion.section>

        <motion.section
          className="login-panel login-panel-form"
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <div className="login-form-header">
            <span className="login-eyebrow">Espace sécurisé</span>
            <h2>Se connecter</h2>
            <p>Utilisez vos identifiants pour accéder à l'application.</p>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            <label className="login-field">
              <span>Email</span>
              <div className="login-input-wrap">
                <Mail size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="admin@iso-audit.local"
                  autoComplete="email"
                  required
                />
              </div>
            </label>

            <label className="login-field">
              <span>Mot de passe</span>
              <div className="login-input-wrap">
                <Lock size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="login-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </label>

            <div className="login-options">
              <label className="login-remember">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(event) => setRemember(event.target.checked)}
                />
                <span>Se souvenir de moi</span>
              </label>
              <span className="login-back-link">Accès réservé aux comptes autorisés</span>
            </div>

            {error && <div className="login-error">{error}</div>}

            <button type="submit" className="login-submit" disabled={isSubmitting}>
              {isSubmitting ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>
        </motion.section>
      </div>
    </div>
  );
};

export default Login;