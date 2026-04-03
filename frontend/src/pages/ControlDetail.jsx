import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText, BookOpen, CheckSquare, Award, Calendar } from 'lucide-react';
import api from '../services/api';
import AppLayout from '../components/AppLayout';
import Card from '../components/Card';
import StatusBadge from '../components/StatusBadge';
import RiskBadge from '../components/RiskBadge';
import EvaluationForm from '../components/EvaluationForm';
import './ControlDetail.css';

const ControlDetail = () => {
  const { id } = useParams();
  const [control, setControl] = useState(null);
  const [evidence, setEvidence] = useState([]);
  const [evaluation, setEvaluation] = useState(null);
  const [remediationScore, setRemediationScore] = useState(0);
  const [remediationComments, setRemediationComments] = useState('');
  const [remediationDeadline, setRemediationDeadline] = useState('');
  const [savingRemediation, setSavingRemediation] = useState(false);

  const loadEvaluations = () => {
    api.get('/evaluations').then(response => {
      const evalForControl = response.data.find(e => e.controlId._id === id);
      setEvaluation(evalForControl);
      if (evalForControl) {
        setRemediationScore(evalForControl.remediationScore || 0);
        setRemediationComments(evalForControl.remediationComments || '');
        setRemediationDeadline(evalForControl.remediationDeadline || '');
      }
    });
  };

  const saveRemediation = async () => {
    setSavingRemediation(true);
    try {
      await api.put(`/evaluations/${evaluation._id}`, {
        remediationScore,
        remediationComments,
        remediationDeadline
      });
      loadEvaluations();
      alert('Scoring de remédiation sauvegardé!');
    } catch (error) {
      alert('Erreur lors de la sauvegarde: ' + error.message);
    } finally {
      setSavingRemediation(false);
    }
  };

  useEffect(() => {
    api.get(`/controls/${id}`).then(response => setControl(response.data));
    api.get(`/controls/${id}/evidence`).then(response => setEvidence(response.data));
    loadEvaluations();
  }, [id]);

  if (!control) return <AppLayout pageTitle="Contrôle"><div className="card">Chargement...</div></AppLayout>;

  return (
    <AppLayout pageTitle={control.code} pageSubtitle={control.title}>
      <div className="control-detail-container">
        {/* Header */}
        <motion.div
          className="control-detail-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div>
            <h1>{control.title}</h1>
            <p className="control-detail-code">Code : {control.code}</p>
          </div>
          {evaluation && <StatusBadge status={evaluation.status} />}
        </motion.div>

        {/* Main Info */}
        <div className="control-detail-grid">
          <Card>
            <h3>
              <FileText size={20} style={{ display: 'inline-block', marginRight: '8px', verticalAlign: 'middle' }} />
              Description
            </h3>
            <p>{control.description}</p>
          </Card>

          <Card>
            <h3>
              <BookOpen size={20} style={{ display: 'inline-block', marginRight: '8px', verticalAlign: 'middle' }} />
              Objectif
            </h3>
            <p>{control.objective}</p>
          </Card>

          <Card>
            <h3>
              <CheckSquare size={20} style={{ display: 'inline-block', marginRight: '8px', verticalAlign: 'middle' }} />
              Catégorie
            </h3>
            <p className="control-category">{control.category}</p>
          </Card>
        </div>

        {/* Evidence Section */}
        <Card>
          <h2>Preuves et Éléments de Conformité</h2>
          {evidence.length > 0 ? (
            <div className="evidence-list">
              {evidence.map((ev, index) => (
                <motion.div
                  key={ev._id}
                  className="evidence-item"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <div className="evidence-type">{ev.type}</div>
                  <p className="evidence-content">{ev.content}</p>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="empty-evidence">
              <p>Aucune preuve disponible pour ce contrôle.</p>
            </div>
          )}
        </Card>

        {/* Current Evaluation */}
        {evaluation && (
          <Card>
            <h2>Évaluation Actuelle</h2>
            <div className="current-eval-grid">
              <div>
                <p className="eval-label">Statut</p>
                <StatusBadge status={evaluation.status} />
              </div>
              <div>
                <p className="eval-label">Justification</p>
                <p className="eval-content">{evaluation.justification}</p>
              </div>
              {evaluation.riskLevel && (
                <div>
                  <p className="eval-label">Risque</p>
                  <RiskBadge level={evaluation.riskLevel} severity={evaluation.severity} probability={evaluation.probability} />
                </div>
              )}
              {evaluation.recommendation && (
                <div>
                  <p className="eval-label">Recommandation</p>
                  <p className="eval-content">{evaluation.recommendation}</p>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Evaluation Form */}
        <EvaluationForm
          controlId={id}
          initialStatus={evaluation?.status || ''}
          initialJustification={evaluation?.justification || ''}
          initialSeverity={evaluation?.severity || ''}
          initialProbability={evaluation?.probability || ''}
          initialRecommendation={evaluation?.recommendation || ''}
          onSaveSuccess={loadEvaluations}
        />

        {/* Remediation Scoring Section */}
        {evaluation && evaluation.status !== 'Conforme' && (
          <Card>
            <h2>
              <Award size={24} style={{ display: 'inline-block', marginRight: '10px', verticalAlign: 'middle', color: '#f59e0b' }} />
              Scoring de Remédiation
            </h2>
            <div className="remediation-form">
              <div className="remediation-field">
                <label>Score de Remédiation (%)</label>
                <div className="remediation-slider-container">
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={remediationScore}
                    onChange={(e) => setRemediationScore(Number(e.target.value))}
                    className="remediation-slider"
                  />
                  <div className="remediation-score-display">
                    <span className="score-value">{remediationScore}%</span>
                    <span className={`score-label ${remediationScore < 30 ? 'low' : remediationScore < 70 ? 'medium' : 'high'}`}>
                      {remediationScore < 30 ? 'Faible' : remediationScore < 70 ? 'En cours' : 'Avancé'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="remediation-field">
                <label>Commentaires de Remédiation</label>
                <textarea
                  value={remediationComments}
                  onChange={(e) => setRemediationComments(e.target.value)}
                  placeholder="Décrivez les actions de remédiation entreprises..."
                  rows="4"
                  className="remediation-textarea"
                />
              </div>

              <div className="remediation-field">
                <label>
                  <Calendar size={18} style={{ display: 'inline-block', marginRight: '8px', verticalAlign: 'middle' }} />
                  Date Limite de Remédiation
                </label>
                <input
                  type="date"
                  value={remediationDeadline}
                  onChange={(e) => setRemediationDeadline(e.target.value)}
                  className="remediation-date"
                />
              </div>

              <button 
                onClick={saveRemediation}
                disabled={savingRemediation}
                className="btn-save-remediation"
              >
                {savingRemediation ? 'Sauvegarde...' : '💾 Sauvegarder la Remédiation'}
              </button>
            </div>
          </Card>
        )}
      </div>
    </AppLayout>
  );
};

export default ControlDetail;