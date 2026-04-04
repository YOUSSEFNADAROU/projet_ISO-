import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
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
  const [control, setControl] = useState(null);
  const [evidence, setEvidence] = useState([]);
  const [evaluation, setEvaluation] = useState(null);

  const loadEvaluations = () => {
    api.get('/evaluations').then((response) => {
      const evalForControl = response.data.find((item) => item.controlId._id === id);
      setEvaluation(evalForControl);
    });
  };

  useEffect(() => {
    api.get(`/controls/${id}`).then((response) => setControl(response.data));
    api.get(`/controls/${id}/evidence`).then((response) => setEvidence(response.data));
    loadEvaluations();
  }, [id]);

  if (!control) {
    return (
      <AppLayout pageTitle="Controle">
        <div className="card">Chargement...</div>
      </AppLayout>
    );
  }

  return (
    <AppLayout pageTitle={control.code} pageSubtitle={control.title}>
      <div className="control-detail-container">
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
              Categorie
            </h3>
            <p className="control-category">{control.category}</p>
          </Card>
        </div>

        <Card>
          <h2>Preuves et Elements de Conformite</h2>
          {evidence.length > 0 ? (
            <div className="evidence-list">
              {evidence.map((item, index) => (
                <motion.div
                  key={item._id}
                  className="evidence-item"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <div className="evidence-type">{item.type}</div>
                  <p className="evidence-content">{item.content}</p>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="empty-evidence">
              <p>Aucune preuve disponible pour ce controle.</p>
            </div>
          )}
        </Card>

        {evaluation && (
          <Card>
            <h2>Evaluation Actuelle</h2>
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
                  <RiskBadge
                    level={evaluation.riskLevel}
                    severity={evaluation.severity}
                    probability={evaluation.probability}
                  />
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

        <EvaluationForm
          controlId={id}
          initialStatus={evaluation?.status || ''}
          initialJustification={evaluation?.justification || ''}
          initialSeverity={evaluation?.severity || ''}
          initialProbability={evaluation?.probability || ''}
          initialRecommendation={evaluation?.recommendation || ''}
          onSaveSuccess={loadEvaluations}
        />
      </div>
    </AppLayout>
  );
};

export default ControlDetail;
