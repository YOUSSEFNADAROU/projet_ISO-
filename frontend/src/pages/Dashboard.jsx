import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, XCircle, TrendingUp, Award } from 'lucide-react';
import api from '../services/api';
import AppLayout from '../components/AppLayout';
import Card from '../components/Card';
import StatCard from '../components/StatCard';
import ScoreChart from '../components/ScoreChart';
import ResultsDistribution from '../components/ResultsDistribution';
import { calculateAuditScore, calculateWeightedScore, calculateRiskStats } from '../utils/auditCalculations';
import './Dashboard.css';

const Dashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [evaluations, setEvaluations] = useState([]);
  const [companyInfo, setCompanyInfo] = useState(null);
  const [sessionInfo, setSessionInfo] = useState(null);

  const selectedCompanyId = useMemo(() => (
    localStorage.getItem('selectedCompanyId') || localStorage.getItem('companyId')
  ), []);

  useEffect(() => {
    const loadData = () => {
      const companyId = localStorage.getItem('selectedCompanyId') || localStorage.getItem('companyId') || 'default';
      api.get('/dashboard', { params: { companyId } }).then(response => setDashboard(response.data)).catch(err => console.error(err));
      api.get('/evaluations', { params: { companyId } }).then(response => setEvaluations(response.data)).catch(err => console.error(err));
    };

    loadData();
    const intervalId = window.setInterval(loadData, 5000);

    try {
      const companies = JSON.parse(localStorage.getItem('companies') || '[]');
      const activeCompany = companies.find((company) => company.id === selectedCompanyId) || null;
      setCompanyInfo(activeCompany);

      const sessions = JSON.parse(localStorage.getItem('auditSessions') || '[]');
      const currentAuditId = localStorage.getItem('currentAuditId');
      const activeSession = currentAuditId
        ? sessions.find((session) => session.id === currentAuditId)
        : sessions.find((session) => session.companyId === selectedCompanyId);
      setSessionInfo(activeSession || null);
    } catch (storageError) {
      setCompanyInfo(null);
      setSessionInfo(null);
    }

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        loadData();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  useEffect(() => {
    if (!dashboard || !selectedCompanyId) return;

    try {
      const sessions = JSON.parse(localStorage.getItem('auditSessions') || '[]');
      const currentAuditId = localStorage.getItem('currentAuditId');
      let updated = false;

      const updatedSessions = sessions.map((session) => {
        const isMatch = currentAuditId ? session.id === currentAuditId : session.companyId === selectedCompanyId;
        if (!isMatch) return session;
        updated = true;
        return {
          ...session,
          progress: dashboard.progress,
          evaluated: dashboard.evaluated,
          totalControls: dashboard.totalControls,
          status: dashboard.progress >= 100 ? 'completed' : session.status || 'in_progress',
          updatedAt: new Date().toISOString(),
        };
      });

      if (!updated) {
        const newSession = {
          id: currentAuditId || Date.now().toString(),
          companyId: selectedCompanyId,
          companyName: companyInfo?.name || localStorage.getItem('selectedCompanyName') || 'Entreprise',
          startDate: new Date().toISOString(),
          status: dashboard.progress >= 100 ? 'completed' : 'in_progress',
          progress: dashboard.progress,
          evaluated: dashboard.evaluated,
          totalControls: dashboard.totalControls,
          evaluations: [],
        };
        updatedSessions.push(newSession);
        if (!currentAuditId) localStorage.setItem('currentAuditId', newSession.id);
      }

      localStorage.setItem('auditSessions', JSON.stringify(updatedSessions));
      const refreshed = updatedSessions.find((session) => session.companyId === selectedCompanyId) || null;
      setSessionInfo(refreshed);
    } catch (storageError) {
      // Ignore persistence errors in demo mode.
    }
  }, [dashboard, selectedCompanyId, companyInfo]);

  if (!dashboard) return <AppLayout pageTitle="Tableau de Bord"><div className="card">Chargement...</div></AppLayout>;

  const score = dashboard.evaluated > 0 ? Math.round((dashboard.conforme / dashboard.evaluated) * 100) : 0;
  const weightedScore = calculateWeightedScore(evaluations);
  const riskStats = calculateRiskStats(evaluations);

  return (
    <AppLayout pageTitle="Tableau de Bord" pageSubtitle="Vue d'ensemble de votre audit ISO 2700x">
      <div className="dashboard-container">
        {companyInfo && (
          <Card className="company-context-card">
            <div className="company-context">
              <div>
                <p className="company-label">Entreprise</p>
                <h2>{companyInfo.name}</h2>
                <p className="company-meta">{companyInfo.sector || 'Secteur'} · {companyInfo.size || 'Taille'}</p>
              </div>
              <div className="company-progress">
                <span>Progression</span>
                <strong>{dashboard.progress}%</strong>
                <small>{dashboard.evaluated} / {dashboard.totalControls} controles</small>
              </div>
            </div>
          </Card>
        )}
        {/* Scores Section */}
        <motion.div 
          className="dashboard-scores-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="score-charts-grid">
            <Card className="score-card">
              <ScoreChart score={score} title="Score Simple" size="medium" />
              <p className="score-description">Basé sur le nombre de contrôles conformes</p>
            </Card>
            <Card className="score-card">
              <motion.div 
                className="weighted-score-display"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <div className="weighted-score-value">{weightedScore}</div>
                <div className="weighted-score-label">Score Pondéré</div>
              </motion.div>
              <p className="score-description">Prenant en compte les partiels et risques</p>
            </Card>
          </div>
        </motion.div>

        {/* Main KPI Cards */}
        <motion.div 
          className="dashboard-main-kpi"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <StatCard title="Score Global" value={`${score}%`} icon={Award} variant="blue" trend={`${weightedScore >= 70 ? '↑' : '↓'} ${weightedScore}pts`} />
          <StatCard title="Conformes" value={dashboard.conforme} icon={CheckCircle2} variant="green" />
          <StatCard title="Partiellement" value={dashboard.partiellementConforme} icon={AlertCircle} variant="orange" />
          <StatCard title="Non-Conformes" value={dashboard.nonConforme} icon={XCircle} variant="red" />
        </motion.div>

        {/* Extended Stats */}
        <motion.div 
          className="dashboard-extended-stats"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <StatCard title="Total Contrôles" value={dashboard.totalControls} icon={TrendingUp} variant="cyan" />
          <StatCard title="Évalués" value={dashboard.evaluated} icon={CheckCircle2} variant="blue" />
          {riskStats.critical > 0 && (
            <StatCard title="Risques Critiques" value={riskStats.critical} icon={AlertCircle} variant="red" />
          )}
        </motion.div>

        {/* Results Distribution */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          <Card>
            <h3>Répartition des Résultats</h3>
            <ResultsDistribution 
              conforme={dashboard.conforme}
              partiel={dashboard.partiellementConforme}
              nonConforme={dashboard.nonConforme}
            />
          </Card>
        </motion.div>

        {/* Risk Summary */}
        {riskStats.total > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.5 }}
          >
            <Card className="risk-summary-card">
              <h3>Résumé des Risques</h3>
              <div className="risk-summary-grid">
                {riskStats.critical > 0 && (
                  <div className="risk-item critical">
                    <span className="risk-label">Critiques</span>
                    <span className="risk-value">{riskStats.critical}</span>
                  </div>
                )}
                {riskStats.high > 0 && (
                  <div className="risk-item high">
                    <span className="risk-label">Élevés</span>
                    <span className="risk-value">{riskStats.high}</span>
                  </div>
                )}
                {riskStats.medium > 0 && (
                  <div className="risk-item medium">
                    <span className="risk-label">Moyens</span>
                    <span className="risk-value">{riskStats.medium}</span>
                  </div>
                )}
                {riskStats.low > 0 && (
                  <div className="risk-item low">
                    <span className="risk-label">Faibles</span>
                    <span className="risk-value">{riskStats.low}</span>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        )}

      </div>
    </AppLayout>
  );
};

export default Dashboard;