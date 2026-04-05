import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  CircleOff,
  LogOut,
  Mail,
  Phone,
  Search,
  UserRound,
  X,
} from 'lucide-react';
import logo from '../../assets/logo.png';
import './CompanySelector.css';

const getCompanies = () => {
  try {
    return JSON.parse(localStorage.getItem('companies') || '[]');
  } catch (error) {
    return [];
  }
};

const CompanySelector = () => {
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [selectedCompany, setSelectedCompany] = useState(null);

  const companies = useMemo(() => getCompanies(), []);

  const filteredCompanies = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return companies;

    return companies.filter((company) => {
      const values = [company.name, company.sector, company.contactEmail]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return values.includes(term);
    });
  }, [companies, search]);

  const sectorsCount = new Set(companies.map((company) => company.sector).filter(Boolean)).size;

  const logout = () => {
    localStorage.removeItem('auditorId');
    localStorage.removeItem('userRole');
    localStorage.removeItem('selectedCompanyId');
    localStorage.removeItem('selectedCompanyName');
    localStorage.removeItem('selectedCompanyEmail');
    localStorage.removeItem('currentAuditId');
    navigate('/');
  };

  const startAudit = (company) => {
    localStorage.setItem('selectedCompanyId', company.id);
    localStorage.setItem('selectedCompanyName', company.name);
    localStorage.setItem('selectedCompanyEmail', company.contactEmail || '');

    const auditSession = {
      id: Date.now().toString(),
      companyId: company.id,
      companyName: company.name,
      startDate: new Date().toISOString(),
      status: 'in_progress',
      progress: 0,
      evaluations: [],
    };

    const audits = JSON.parse(localStorage.getItem('auditSessions') || '[]');
    audits.push(auditSession);
    localStorage.setItem('auditSessions', JSON.stringify(audits));
    localStorage.setItem('currentAuditId', auditSession.id);

    navigate('/controls');
  };

  return (
    <div className="company-selector-page">
      <header className="company-selector-header">
        <div className="brand-wrap">
          <div className="brand-logo">
            <img src={logo} alt="LearnAudit Logo" className="brand-logo-image" />
          </div>
          <h1>LearnAudit</h1>
          <span>Auditeur</span>
        </div>

        <button type="button" className="logout-btn" onClick={logout}>
          <LogOut size={18} /> Deconnexion
        </button>
      </header>

      <section className="stats-grid">
        <article className="stat-card">
          <Building2 size={22} />
          <div>
            <strong>{companies.length}</strong>
            <p>Entreprises</p>
          </div>
        </article>
        <article className="stat-card">
          <BadgeCheck size={22} />
          <div>
            <strong>{sectorsCount}</strong>
            <p>Secteurs</p>
          </div>
        </article>
        <article className="stat-card">
          <BadgeCheck size={22} />
          <div>
            <strong>Pret</strong>
            <p>Statut</p>
          </div>
        </article>
      </section>

      <section className="search-wrap">
        <Search size={22} />
        <input
          type="text"
          placeholder="Rechercher par nom, secteur ou email..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </section>

      {filteredCompanies.length === 0 ? (
        <div className="empty-state">
          <CircleOff size={34} />
          <h3>Aucune entreprise trouvee</h3>
          <p>Ajoutez des inscriptions entreprise puis revenez ici.</p>
        </div>
      ) : (
        <section className="companies-grid">
          {filteredCompanies.map((company) => (
            <motion.article
              key={company.id}
              className="company-card"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
            >
              <div className="company-card-top">
                <h3>{company.name}</h3>
                <span>{company.sector || 'Secteur'}</span>
              </div>

              <div className="company-lines">
                <p><Mail size={17} /> {company.contactEmail || 'N/A'}</p>
                <p><Phone size={17} /> {company.contactPhone || 'N/A'}</p>
                <p><UserRound size={17} /> {company.size || 'N/A'}</p>
              </div>

              <p className="company-summary">{(company.securityContext || 'Aucun contexte securite fourni.').slice(0, 100)}...</p>

              <div className="company-actions">
                <button type="button" className="secondary" onClick={() => setSelectedCompany(company)}>Voir infos</button>
                <button type="button" className="primary" onClick={() => startAudit(company)}>
                  Commencer l audit <ArrowRight size={17} />
                </button>
              </div>
            </motion.article>
          ))}
        </section>
      )}

      {selectedCompany && (
        <div className="company-modal-overlay" role="dialog" aria-modal="true">
          <div className="company-modal">
            <button type="button" className="modal-close" onClick={() => setSelectedCompany(null)}>
              <X size={18} />
            </button>
            <h2>{selectedCompany.name}</h2>
            <p><strong>Secteur:</strong> {selectedCompany.sector || 'N/A'}</p>
            <p><strong>Taille:</strong> {selectedCompany.size || 'N/A'}</p>
            <p><strong>Email:</strong> {selectedCompany.contactEmail || 'N/A'}</p>
            <p><strong>Telephone:</strong> {selectedCompany.contactPhone || 'N/A'}</p>
            <p><strong>Systemes cles:</strong> {(selectedCompany.keySystems || []).join(', ') || 'N/A'}</p>
            <p><strong>Contexte securite:</strong> {selectedCompany.securityContext || 'N/A'}</p>
            <p><strong>Objectif audit:</strong> {selectedCompany.auditObjective || 'N/A'}</p>

            <div className="modal-actions">
              <button type="button" className="secondary" onClick={() => setSelectedCompany(null)}>Fermer</button>
              <button
                type="button"
                className="primary"
                onClick={() => {
                  startAudit(selectedCompany);
                  setSelectedCompany(null);
                }}
              >
                Commencer l audit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanySelector;
