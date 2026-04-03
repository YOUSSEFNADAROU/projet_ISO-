import React, { useEffect, useState } from 'react';
import { Briefcase, Users, Shield, Target } from 'lucide-react';
import api from '../services/api';
import AppLayout from '../components/AppLayout';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import './Scenario.css';

const Scenario = () => {
  const [scenario, setScenario] = useState(null);

  useEffect(() => {
    api.get('/scenario').then(response => setScenario(response.data)).catch(err => console.error(err));
  }, []);

  if (!scenario) return <AppLayout pageTitle="Scénario"><div className="card">Chargement...</div></AppLayout>;

  return (
    <AppLayout pageTitle="Scénario" pageSubtitle="Informations de l'entreprise fictive">
      <div className="scenario-container">
        {/* General Info */}
        <div className="scenario-grid">
          <Card>
            <div className="scenario-card-header">
              <Briefcase size={24} color="#2563eb" />
              <h3>Nom de l'Entreprise</h3>
            </div>
            <p className="scenario-value">{scenario.name}</p>
          </Card>

          <Card>
            <div className="scenario-card-header">
              <Users size={24} color="#f59e0b" />
              <h3>Taille</h3>
            </div>
            <p className="scenario-value">{scenario.size}</p>
          </Card>

          <Card>
            <div className="scenario-card-header">
              <Shield size={24} color="#16a34a" />
              <h3>Secteur d'Activité</h3>
            </div>
            <p className="scenario-value">{scenario.sector}</p>
          </Card>

          <Card>
            <div className="scenario-card-header">
              <Target size={24} color="#ef4444" />
              <h3>Statut Audit</h3>
            </div>
            <p className="scenario-value">En cours</p>
          </Card>
        </div>

        {/* Key Systems */}
        <Card className="scenario-section">
          <h2>Systèmes Clés</h2>
          <div className="scenario-list">
            {scenario.keySystems && scenario.keySystems.map((system, index) => (
              <div key={index} className="scenario-list-item">
                <span className="scenario-list-bullet">•</span>
                <span>{system}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Security Context */}
        <Card className="scenario-section">
          <h2>Contexte de Sécurité</h2>
          <p className="scenario-text">{scenario.securityContext}</p>
        </Card>

        {/* Audit Objective */}
        <Card className="scenario-section">
          <h2>Objectif de l'Audit</h2>
          <p className="scenario-text">{scenario.auditObjective}</p>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Scenario;