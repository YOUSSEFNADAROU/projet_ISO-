import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CheckCircle2,
  Copy,
  Eye,
  EyeOff,
  KeyRound,
  Mail,
  Shield,
  Sparkles,
  UserCog,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import logo from '../../assets/logo.png';
import './LoginChoice.css';

const DEMO_COMPANY = {
  id: 'company-demo-1',
  name: 'TechSecure',
  contactEmail: 'contact@techsecure.com',
  password: 'company123',
};

const DEMO_AUDITOR = {
  id: 'auditor1',
  email: 'auditor@example.com',
  password: 'auditor123',
  name: 'Auditeur Demo',
};

const featurePills = [
  'Conformite ISO 27001',
  'Suivi en temps reel',
  'Recommandations IA',
  'Securite des donnees',
  'Rapports detailles',
  'Certifie ISO 27001',
];

const normalize = (value) => (value || '').trim().toLowerCase();

const getRegisteredCompanies = () => {
  try {
    return JSON.parse(localStorage.getItem('companies') || '[]');
  } catch (error) {
    return [];
  }
};

const LoginChoice = ({ initialRole = null }) => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [selectedRole, setSelectedRole] = useState(initialRole);
  const [companyMode, setCompanyMode] = useState('email');
  const [showPassword, setShowPassword] = useState(false);
  const [companyEmail, setCompanyEmail] = useState(DEMO_COMPANY.contactEmail);
  const [companyPassword, setCompanyPassword] = useState(DEMO_COMPANY.password);
  const [companyCode, setCompanyCode] = useState('');
  const [auditorEmail, setAuditorEmail] = useState(DEMO_AUDITOR.email);
  const [auditorPassword, setAuditorPassword] = useState(DEMO_AUDITOR.password);
  const [error, setError] = useState('');
  const [copyNote, setCopyNote] = useState('');

  const companies = useMemo(() => getRegisteredCompanies(), []);

  const resetError = () => setError('');

  const loginCompany = async (company) => {
    await login({
      email: company.contactEmail,
      password: company.password || 'company123',
      name: company.name,
      role: 'company',
    });
    localStorage.setItem('companyId', company.id);
    localStorage.setItem('companyName', company.name);
    localStorage.setItem('selectedCompanyId', company.id);
    localStorage.setItem('selectedCompanyName', company.name);
    localStorage.setItem('userRole', 'company');
    localStorage.removeItem('auditorId');
    navigate('/home');
  };

  const loginAuditor = async () => {
    await login({
      email: DEMO_AUDITOR.email,
      password: DEMO_AUDITOR.password,
      name: DEMO_AUDITOR.name,
      role: 'auditor',
    });
    localStorage.setItem('auditorId', DEMO_AUDITOR.id);
    localStorage.setItem('userRole', 'auditor');
    localStorage.removeItem('companyId');
    localStorage.removeItem('companyName');
    localStorage.removeItem('selectedCompanyId');
    localStorage.removeItem('selectedCompanyName');
    navigate('/auditor/companies');
  };

  const copyAccessCode = async () => {
    const text = (companyCode || '').trim();
    if (!text) {
      setCopyNote('Veuillez saisir le code d acces d abord.');
      return;
    }

    let copied = false;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        copied = true;
      }
    } catch (clipboardError) {
      copied = false;
    }

    if (!copied) {
      try {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.setAttribute('readonly', '');
        textarea.style.position = 'absolute';
        textarea.style.left = '-9999px';
        document.body.appendChild(textarea);
        textarea.select();
        copied = document.execCommand('copy');
        document.body.removeChild(textarea);
      } catch (fallbackError) {
        copied = false;
      }
    }

    setCopyNote(copied ? 'Code copie.' : 'Copie impossible sur ce navigateur.');
    window.setTimeout(() => setCopyNote(''), 2000);
  };

  const handleCompanySubmit = async (event) => {
    event.preventDefault();
    resetError();

    if (companyMode === 'email') {
      const email = normalize(companyEmail);
      const password = (companyPassword || '').trim();

      const foundCompany = companies.find(
        (company) => normalize(company.contactEmail) === email && password === 'company123'
      );

      if (email === DEMO_COMPANY.contactEmail && password === DEMO_COMPANY.password) {
        await loginCompany(DEMO_COMPANY);
        return;
      }

      if (foundCompany) {
        await loginCompany(foundCompany);
        return;
      }

      setError('Identifiants entreprise invalides.');
      return;
    }

    const code = (companyCode || '').trim().toUpperCase();
    const companyByCode = companies.find((company) => (company.accessCode || '').toUpperCase() === code);

    if (!companyByCode) {
      setError('Code d acces invalide ou inconnu.');
      return;
    }

    await loginCompany(companyByCode);
  };

  const handleAuditorSubmit = async (event) => {
    event.preventDefault();
    resetError();

    if (normalize(auditorEmail) !== DEMO_AUDITOR.email || (auditorPassword || '').trim() !== DEMO_AUDITOR.password) {
      setError('Identifiants auditeur invalides.');
      return;
    }

    await loginAuditor();
  };

  return (
    <div className="login-choice-page">
      <div className="login-choice-bg-shape login-choice-bg-shape-one" />
      <div className="login-choice-bg-shape login-choice-bg-shape-two" />

      <motion.div
        className="login-choice-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
      >
        <div className="login-choice-logo-wrap">
          <motion.div
            className="login-choice-logo"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ repeat: Infinity, duration: 2.4 }}
          >
            <img src={logo} alt="LearnAudit Logo" className="login-choice-logo-image" />
          </motion.div>
          <div>
            <h1>LearnAudit</h1>
            <p>Audit ISO 2700x intelligent</p>
          </div>
        </div>

        <div className="login-choice-pills">
          {featurePills.map((feature) => (
            <span key={feature} className="login-choice-pill">
              <CheckCircle2 size={16} /> {feature}
            </span>
          ))}
        </div>

        {!selectedRole && (
          <div className="login-role-selection">
            <h2>Connectez-vous en tant que</h2>
            <button type="button" className="role-card role-company" onClick={() => setSelectedRole('company')}>
              <div className="role-icon"><Building2 size={28} /></div>
              <div className="role-content">
                <h3>Entreprise</h3>
                <p>Suivez vos audits et recommandations IA</p>
                <small>Tableau de bord | Rapports | Analyse IA</small>
              </div>
              <ArrowRight size={24} className="role-arrow" />
            </button>

            <button type="button" className="role-card role-auditor" onClick={() => setSelectedRole('auditor')}>
              <div className="role-icon"><UserCog size={28} /></div>
              <div className="role-content">
                <h3>Auditeur</h3>
                <p>Realisez des audits et generez des rapports</p>
                <small>Controles ISO | Evaluations | Rapports</small>
              </div>
              <ArrowRight size={24} className="role-arrow" />
            </button>
          </div>
        )}

        {selectedRole === 'company' && (
          <form className="login-form" onSubmit={handleCompanySubmit}>
            <button type="button" className="back-link" onClick={() => setSelectedRole(initialRole)}>
              <ArrowLeft size={18} /> Retour
            </button>

            <div className="role-badge role-badge-company">
              <Building2 size={20} /> Espace Entreprise
            </div>

            <h2>Accedez a votre tableau de bord</h2>

            <div className="mode-toggle">
              <button
                type="button"
                className={companyMode === 'email' ? 'active' : ''}
                onClick={() => {
                  setCompanyMode('email');
                  resetError();
                  setCopyNote('');
                }}
              >
                <Mail size={18} /> Email / Mot de passe
              </button>
              <button
                type="button"
                className={companyMode === 'code' ? 'active' : ''}
                onClick={() => {
                  setCompanyMode('code');
                  resetError();
                  setCopyNote('');
                }}
              >
                <KeyRound size={18} /> Code d acces
              </button>
            </div>

            {companyMode === 'email' ? (
              <>
                <label>Adresse email</label>
                <input
                  type="email"
                  placeholder="contact@entreprise.com"
                  value={companyEmail}
                  onChange={(event) => setCompanyEmail(event.target.value)}
                  required
                />

                <label>Mot de passe</label>
                <div className="password-field">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="company123"
                    value={companyPassword}
                    onChange={(event) => setCompanyPassword(event.target.value)}
                    required
                  />
                  <button type="button" onClick={() => setShowPassword((prev) => !prev)}>
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </>
            ) : (
              <>
                <label>Code d acces recu par email</label>
                <input
                  type="text"
                  placeholder="AUD-XXXXXXXX"
                  value={companyCode}
                  onChange={(event) => setCompanyCode(event.target.value.toUpperCase())}
                  required
                />
                <div className="code-copy-row">
                  <p className="field-help">Entrez le code genere lors de votre inscription.</p>
                  <button type="button" className="copy-btn" onClick={copyAccessCode}>
                    <Copy size={16} /> Copier le code
                  </button>
                </div>
                {copyNote && <p className="copy-note">{copyNote}</p>}
              </>
            )}

            {error && <p className="form-error">{error}</p>}

            <button type="submit" className="submit-btn">
              Se connecter <ArrowRight size={20} />
            </button>

            {companyMode === 'email' && (
              <p className="inline-note">
                Pas encore de compte ? <Link to="/company/register">Creer un compte</Link>
              </p>
            )}
          </form>
        )}

        {selectedRole === 'auditor' && (
          <form className="login-form" onSubmit={handleAuditorSubmit}>
            <button type="button" className="back-link" onClick={() => setSelectedRole(initialRole)}>
              <ArrowLeft size={18} /> Retour
            </button>

            <div className="role-badge role-badge-auditor">
              <UserCog size={20} /> Espace Auditeur
            </div>

            <h2>Accedez a votre espace d audit</h2>

            <label>Adresse email</label>
            <input
              type="email"
              placeholder="auditor@example.com"
              value={auditorEmail}
              onChange={(event) => setAuditorEmail(event.target.value)}
              required
            />

            <label>Mot de passe</label>
            <div className="password-field">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="auditor123"
                value={auditorPassword}
                onChange={(event) => setAuditorPassword(event.target.value)}
                required
              />
              <button type="button" onClick={() => setShowPassword((prev) => !prev)}>
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {error && <p className="form-error">{error}</p>}

            <button type="submit" className="submit-btn">
              Se connecter <ArrowRight size={20} />
            </button>

            <div className="demo-card">
              <h4><Sparkles size={16} /> Comptes de demonstration</h4>
              <p>Entreprise: contact@techsecure.com / company123</p>
              <p>Auditeur: auditor@example.com / auditor123</p>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
};

export default LoginChoice;
