import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Building2, Check, CheckCircle2, Copy, Mail, ShieldCheck } from 'lucide-react';
import './CompanyRegistration.css';

const sectors = ['Technologie', 'Finance', 'Sante', 'E-commerce', 'Industrie', 'Autre'];
const sizes = ['Startup (<50)', 'PME (50-250)', 'ETI (250-1000)', 'GE (>1000)'];
const keySystemsOptions = [
  'ERP',
  'CRM',
  'Messagerie',
  'Cloud (AWS/Azure)',
  'Base de donnees',
  'Reseau',
  'Application web',
  'Mobile',
];

const initialFormState = {
  name: '',
  sector: 'Technologie',
  size: 'Startup (<50)',
  contactName: '',
  contactPhone: '',
  contactEmail: '',
  keySystems: [],
  securityContext: '',
  auditObjective: '',
};

const loadCompanies = () => {
  try {
    return JSON.parse(localStorage.getItem('companies') || '[]');
  } catch (error) {
    return [];
  }
};

const CompanyRegistration = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState(initialFormState);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmation, setConfirmation] = useState(null);

  const companies = useMemo(() => loadCompanies(), [confirmation]);

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError('');
  };

  const toggleSystem = (system) => {
    setFormData((prev) => {
      const hasSystem = prev.keySystems.includes(system);
      return {
        ...prev,
        keySystems: hasSystem
          ? prev.keySystems.filter((item) => item !== system)
          : [...prev.keySystems, system],
      };
    });
  };

  const goToNext = () => {
    if (currentStep === 1 && (!formData.name.trim() || !formData.contactEmail.trim())) {
      setError('Veuillez renseigner le nom de l entreprise et l email de contact.');
      return;
    }
    if (currentStep === 3 && !formData.auditObjective.trim()) {
      setError('Veuillez preciser l objectif de votre audit.');
      return;
    }
    setCurrentStep((prev) => Math.min(3, prev + 1));
  };

  const goToPrevious = () => {
    setError('');
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  const generateAccessCode = () => `AUD-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

  const handleSubmit = (event) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    const existingCompany = companies.find(
      (company) =>
        company.name?.trim().toLowerCase() === formData.name.trim().toLowerCase() ||
        company.contactEmail?.trim().toLowerCase() === formData.contactEmail.trim().toLowerCase()
    );

    if (existingCompany) {
      setError('Une entreprise avec ce nom ou cet email existe deja.');
      setIsSubmitting(false);
      return;
    }

    const accessCode = generateAccessCode();

    const newCompany = {
      id: `${Date.now()}`,
      name: formData.name.trim(),
      sector: formData.sector,
      size: formData.size,
      contactEmail: formData.contactEmail.trim().toLowerCase(),
      contactName: formData.contactName.trim(),
      contactPhone: formData.contactPhone.trim(),
      keySystems: formData.keySystems,
      securityContext: formData.securityContext.trim(),
      auditObjective: formData.auditObjective.trim(),
      accessCode,
      registeredAt: new Date().toISOString(),
      audits: [],
    };

    const updatedCompanies = [...companies, newCompany];
    localStorage.setItem('companies', JSON.stringify(updatedCompanies));

    console.log(`Email envoye a ${newCompany.contactEmail}`);
    console.log(`Code d acces: ${accessCode}`);
    console.log('Lien de connexion: http://localhost:5173/');

    setConfirmation({
      email: newCompany.contactEmail,
      accessCode,
      companyName: newCompany.name,
    });

    setIsSubmitting(false);
  };

  const copyAccessCode = async () => {
    if (!confirmation?.accessCode) return;
    try {
      await navigator.clipboard.writeText(confirmation.accessCode);
    } catch (clipboardError) {
      console.error('Impossible de copier le code.', clipboardError);
    }
  };

  if (confirmation) {
    return (
      <div className="company-registration-page">
        <motion.div
          className="registration-confirm-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="confirm-icon"><CheckCircle2 size={34} /></div>
          <h1>Inscription completee</h1>
          <p>
            Votre entreprise <strong>{confirmation.companyName}</strong> est enregistree.
            Votre code d acces a ete envoye a <strong>{confirmation.email}</strong>.
          </p>

          <div className="access-code-box">
            <span>Code d acces</span>
            <strong>{confirmation.accessCode}</strong>
            <button type="button" onClick={copyAccessCode}><Copy size={16} /> Copier</button>
          </div>

          <div className="confirm-actions">
            <button type="button" onClick={() => navigate('/')}>Retour a l accueil</button>
            <button type="button" className="primary" onClick={() => navigate('/')}>Se connecter</button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="company-registration-page">
      <motion.form
        className="company-registration-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        onSubmit={handleSubmit}
      >
        <button type="button" className="registration-back" onClick={() => navigate('/')}>
          <ArrowLeft size={18} /> Retour
        </button>

        <div className="registration-header">
          <span><Building2 size={18} /> Inscription Entreprise</span>
          <h1>Configurez votre audit ISO en 3 etapes</h1>
        </div>

        <div className="stepper">
          {[1, 2, 3].map((step) => (
            <div key={step} className={`step-item ${step <= currentStep ? 'active' : ''}`}>
              <div className="step-circle">{step < currentStep ? <Check size={16} /> : step}</div>
              {step < 3 && <div className="step-line" />}
            </div>
          ))}
        </div>

        {currentStep === 1 && (
          <div className="step-panel">
            <h2>Etape 1 - Identite</h2>
            <div className="grid-two">
              <label>
                Nom de l entreprise *
                <input
                  type="text"
                  value={formData.name}
                  onChange={(event) => updateField('name', event.target.value)}
                  required
                />
              </label>

              <label>
                Secteur
                <select value={formData.sector} onChange={(event) => updateField('sector', event.target.value)}>
                  {sectors.map((sector) => (
                    <option key={sector} value={sector}>{sector}</option>
                  ))}
                </select>
              </label>

              <label>
                Taille
                <select value={formData.size} onChange={(event) => updateField('size', event.target.value)}>
                  {sizes.map((size) => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select>
              </label>

              <label>
                Nom du contact
                <input
                  type="text"
                  value={formData.contactName}
                  onChange={(event) => updateField('contactName', event.target.value)}
                />
              </label>

              <label>
                Telephone
                <input
                  type="text"
                  value={formData.contactPhone}
                  onChange={(event) => updateField('contactPhone', event.target.value)}
                />
              </label>

              <label>
                Email de contact *
                <input
                  type="email"
                  value={formData.contactEmail}
                  onChange={(event) => updateField('contactEmail', event.target.value)}
                  required
                />
              </label>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="step-panel">
            <h2>Etape 2 - Contexte SI</h2>
            <p className="panel-help">Selectionnez les systemes cles concernes.</p>

            <div className="chips-grid">
              {keySystemsOptions.map((system) => (
                <button
                  type="button"
                  key={system}
                  className={`chip ${formData.keySystems.includes(system) ? 'active' : ''}`}
                  onClick={() => toggleSystem(system)}
                >
                  {system}
                </button>
              ))}
            </div>

            <label>
              Contexte de securite actuel
              <textarea
                rows={5}
                value={formData.securityContext}
                onChange={(event) => updateField('securityContext', event.target.value)}
                placeholder="Decrivez votre contexte de securite, contraintes, incidents recents..."
              />
            </label>
          </div>
        )}

        {currentStep === 3 && (
          <div className="step-panel">
            <h2>Etape 3 - Objectif audit</h2>
            <label>
              Objectif de l audit *
              <textarea
                rows={7}
                value={formData.auditObjective}
                onChange={(event) => updateField('auditObjective', event.target.value)}
                placeholder="Ex: Obtenir une vision claire des controles prioritaires a traiter pour une mise en conformite ISO 27001."
                required
              />
            </label>

            <div className="submit-info">
              <Mail size={16} /> Un code d acces sera genere puis envoye a l email de contact.
            </div>
          </div>
        )}

        {error && <p className="registration-error">{error}</p>}

        <div className="registration-actions">
          <button type="button" className="secondary" onClick={goToPrevious} disabled={currentStep === 1}>
            Precedent
          </button>

          {currentStep < 3 ? (
            <button type="button" className="primary" onClick={goToNext}>
              Suivant <ArrowRight size={16} />
            </button>
          ) : (
            <button type="submit" className="primary" disabled={isSubmitting}>
              <ShieldCheck size={16} /> {isSubmitting ? 'Enregistrement...' : 'Terminer'}
            </button>
          )}
        </div>

        <div className="registration-footnote">
          Deja inscrit ? <Link to="/">Retour a la connexion</Link>
        </div>
      </motion.form>
    </div>
  );
};

export default CompanyRegistration;
