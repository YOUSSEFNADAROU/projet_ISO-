import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText, BookOpen, CheckSquare } from 'lucide-react';
import api from '../services/api';
import AppLayout from '../components/AppLayout';
import Card from '../components/Card';
import StatusBadge from '../components/StatusBadge';
import RiskBadge from '../components/RiskBadge';
import EvaluationForm from '../components/EvaluationForm';
import './ControlDetail.css';

const ControlDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [control, setControl] = useState(null);
  const [evaluation, setEvaluation] = useState(null);

  const loadEvaluations = () => {
    const companyId = localStorage.getItem('selectedCompanyId') || localStorage.getItem('companyId') || 'default';
    api.get('/evaluations', { params: { companyId } }).then(response => {
      const evalForControl = response.data.find(e => e.controlId._id === id);
      setEvaluation(evalForControl);
    });
  };

  useEffect(() => {
    api.get(`/controls/${id}`).then(response => setControl(response.data));
    loadEvaluations();
  }, [id]);

  const handleSaveSuccess = () => {
    loadEvaluations();
  };

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
          <div className="control-detail-actions">
            <button type="button" className="control-back" onClick={() => navigate('/controls')}>
              Retour aux contrôles
            </button>
            {evaluation && <StatusBadge status={evaluation.status} />}
          </div>
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
          initialRemediationScore={evaluation?.remediationScore ?? 0}
          initialRemediationComments={evaluation?.remediationComments || ''}
          initialRemediationDeadline={evaluation?.remediationDeadline || ''}
          onSaveSuccess={handleSaveSuccess}
        />
      </div>
    </AppLayout>
  );
};

export default ControlDetail;