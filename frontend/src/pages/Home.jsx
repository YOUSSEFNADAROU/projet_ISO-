import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckSquare, BarChart3, FileCheck, ArrowRight } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import AppLayout from '../components/AppLayout';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import StatCard from '../components/StatCard';
import './Home.css';

const Home = () => {
  const [dashboard, setDashboard] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const companyId = localStorage.getItem('selectedCompanyId') || localStorage.getItem('companyId') || 'default';
    api.get('/dashboard', { params: { companyId } }).then(response => setDashboard(response.data));
  }, []);

  const quickLinks = [
    { path: '/controls', label: 'Contrôles', icon: CheckSquare, color: 'cyan' },
    { path: '/dashboard', label: 'Tableau de Bord', icon: BarChart3, color: 'orange' },
    { path: '/report', label: 'Rapport', icon: FileCheck, color: 'green' },
  ].filter((link) => user?.role !== 'company' || link.path !== '/controls');

  return (
    <AppLayout pageTitle="Accueil" pageSubtitle="Bienvenue dans ISO Audit Simulator">
      <div className="home-container">
        {/* Progress Section */}
        {dashboard && (
          <Card className="home-progress">
            <div className="progress-header">
              <div>
                <h2>Progression d'audit</h2>
                <p>Suivi en temps reel de l'avancement des controles.</p>
              </div>
              <div className="progress-kpi">
                <strong>{dashboard.progress}%</strong>
                <span>{dashboard.evaluated}/{dashboard.totalControls} controles</span>
              </div>
            </div>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${dashboard.progress}%` }}
              />
            </div>
          </Card>
        )}

        {/* Welcome Section */}
        <Card className="home-welcome">
          <div className="welcome-content">
            <h2>Simulateur d'Audit ISO 27001/27002</h2>
            <p>
              Une plateforme d'apprentissage interactive pour maîtriser les normes de sécurité de l'information.
              Évaluez les contrôles de sécurité, analysez les risques et générez des rapports d'audit professionnels.
            </p>
          </div>
        </Card>

        {/* Quick Stats */}
        {dashboard && (
          <div className="home-stats">
            <StatCard title="Contrôles" value={dashboard.totalControls} color="blue" />
            <StatCard title="Évalués" value={dashboard.evaluated} color="cyan" />
            <StatCard title="Conformes" value={dashboard.conforme} color="green" />
            <StatCard title="Score" value={`${Math.round((dashboard.conforme / Math.max(dashboard.evaluated, 1)) * 100)}%`} color="orange" />
          </div>
        )}

        {/* Quick Links */}
        <div className="home-section">
          <h3>Accès rapide</h3>
          <div className="quick-links">
            {quickLinks.map((link, i) => {
              const Icon = link.icon;
              return (
                <motion.div
                  key={link.path}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.1 }}
                >
                  <Link to={link.path} className={`quick-link quick-link-${link.color}`}>
                    <Icon size={28} />
                    <span>{link.label}</span>
                    <ArrowRight size={18} />
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Info Section */}
        <div className="home-section">
          <h3>À propos</h3>
          <div className="info-grid">
            <Card>
              <h4>ISO 27001</h4>
              <p>Norme de gestion de la sécurité de l'information établissant les exigences pour un système de gestion de la sécurité de l'information.</p>
            </Card>
            <Card>
              <h4>ISO 27002</h4>
              <p>Code de bonne pratique offrant les directives de mise en œuvre des contrôles de sécurité décrit dans l'ISO 27001.</p>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Home;