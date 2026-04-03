import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Building2, FileText, ShieldCheck } from 'lucide-react';
import './CompanyDashboard.css';

const CompanyDashboard = () => {
  const navigate = useNavigate();

  const companyName = localStorage.getItem('companyName') || 'Entreprise';
  const companyId = localStorage.getItem('companyId');

  const startOrResume = () => {
    if (companyId) {
      localStorage.setItem('selectedCompanyId', companyId);
      localStorage.setItem('selectedCompanyName', companyName);
    }
    navigate('/dashboard');
  };

  return (
    <div className="company-dashboard-shell">
      <div className="company-dashboard-card">
        <span className="company-dashboard-badge"><Building2 size={18} /> Espace Entreprise</span>
        <h1>Bienvenue, {companyName}</h1>
        <p>Suivez la progression de votre audit ISO 27001, consultez les controles et visualisez vos rapports.</p>

        <div className="company-dashboard-actions">
          <button type="button" onClick={startOrResume}>
            <ShieldCheck size={18} /> Ouvrir le tableau de bord <ArrowRight size={18} />
          </button>
          <button type="button" className="secondary" onClick={() => navigate('/controls')}>
            <FileText size={18} /> Voir les controles
          </button>
        </div>
      </div>
    </div>
  );
};

export default CompanyDashboard;
