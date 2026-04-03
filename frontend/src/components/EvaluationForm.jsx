import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle2, Save, ZapOff } from 'lucide-react';
import api from '../services/api';
import Toast from './Toast';
import './EvaluationForm.css';

const EvaluationForm = ({ 
  controlId, 
  initialStatus = '', 
  initialJustification = '', 
  initialSeverity = '', 
  initialProbability = '', 
  initialRecommendation = '', 
  onSaveSuccess 
}) => {
  const [status, setStatus] = useState(initialStatus);
  const [justification, setJustification] = useState(initialJustification);
  const [severity, setSeverity] = useState(initialSeverity);
  const [probability, setProbability] = useState(initialProbability);
  const [recommendation, setRecommendation] = useState(initialRecommendation);
  const [showRisk, setShowRisk] = useState(status !== 'Conforme' && status !== '');
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    setStatus(initialStatus);
    setJustification(initialJustification);
    setSeverity(initialSeverity);
    setProbability(initialProbability);
    setRecommendation(initialRecommendation);
    setShowRisk(initialStatus !== 'Conforme' && initialStatus !== '');
  }, [initialStatus, initialJustification, initialSeverity, initialProbability, initialRecommendation]);

  const handleStatusChange = (e) => {
    const newStatus = e.target.value;
    setStatus(newStatus);
    setShowRisk(newStatus !== 'Conforme' && newStatus !== '');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const data = { controlId, status, justification };
    if (status !== 'Conforme') {
      data.severity = severity;
      data.probability = probability;
      data.recommendation = recommendation;
    }
    try {
      await api.post('/evaluations', data);
      setToast({ message: 'Évaluation sauvegardée avec succès ✓', type: 'success' });
      if (onSaveSuccess) onSaveSuccess();
    } catch (error) {
      setToast({ message: 'Erreur : ' + error.message, type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (value) => {
    if (value === 'Conforme') return 'conforme';
    if (value === 'Partiellement conforme') return 'partiel';
    return 'non-conforme';
  };

  const getStatusIcon = (value) => {
    if (value === 'Conforme') return <CheckCircle2 size={16} />;
    if (value === 'Partiellement conforme') return <AlertCircle size={16} />;
    if (value === 'Non conforme') return <ZapOff size={16} />;
    return null;
  };

  return (
    <motion.div
      className="evaluation-form-wrapper"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
    >
      <div className="evaluation-card">
        <div className="evaluation-header">
          <h2>Évaluation du Contrôle</h2>
          <p>Complétez l'évaluation de conformité pour ce contrôle</p>
        </div>

        <form onSubmit={handleSubmit} className="evaluation-form">
          {/* Statut Field */}
          <div className="form-section">
            <div className="form-group full-width">
              <div className="form-header">
                <label className="form-label">Statut de Conformité</label>
                <span className="form-required">*</span>
              </div>
              <div className="select-wrapper">
                <select 
                  value={status} 
                  onChange={handleStatusChange}
                  className={`form-select ${status ? `select-${getStatusColor(status)}` : ''}`}
                  required
                >
                  <option value="">Choisir un statut</option>
                  <option value="Conforme">Conforme</option>
                  <option value="Partiellement conforme">Partiellement conforme</option>
                  <option value="Non conforme">Non conforme</option>
                </select>
              </div>
              <AnimatePresence>
                {status && (
                  <motion.div 
                    className={`status-badge badge-${getStatusColor(status)}`}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                  >
                    {getStatusIcon(status)}
                    <span>{status}</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Justification Field */}
          <div className="form-section">
            <div className="form-group full-width">
              <div className="form-header">
                <label className="form-label">Justification</label>
                <span className="form-required">*</span>
              </div>
              <textarea 
                value={justification} 
                onChange={(e) => setJustification(e.target.value)}
                placeholder="Décrivez les raisons et éléments justifiant cette évaluation..."
                className="form-textarea"
                rows={4}
                required 
              />
            </div>
          </div>

          {/* Risk Assessment Section */}
          <AnimatePresence>
            {showRisk && (
              <motion.div 
                className="form-section risk-section"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="risk-section-title">
                  <AlertCircle size={18} />
                  <span>Évaluation des Risques</span>
                </div>

                {/* Severity & Probability Grid */}
                <div className="form-grid-2">
                  <div className="form-group">
                    <div className="form-header">
                      <label className="form-label">Gravité</label>
                      <span className="form-required">*</span>
                    </div>
                    <div className="select-wrapper">
                      <select 
                        value={severity} 
                        onChange={(e) => setSeverity(e.target.value)}
                        className="form-select"
                        required={showRisk}
                      >
                        <option value="">Sélectionner</option>
                        <option value="faible">Faible</option>
                        <option value="moyenne">Moyenne</option>
                        <option value="élevée">Élevée</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <div className="form-header">
                      <label className="form-label">Probabilité</label>
                      <span className="form-required">*</span>
                    </div>
                    <div className="select-wrapper">
                      <select 
                        value={probability} 
                        onChange={(e) => setProbability(e.target.value)}
                        className="form-select"
                        required={showRisk}
                      >
                        <option value="">Sélectionner</option>
                        <option value="faible">Faible</option>
                        <option value="moyenne">Moyenne</option>
                        <option value="élevée">Élevée</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Recommendation Field */}
                <div className="form-group full-width">
                  <div className="form-header">
                    <label className="form-label">Recommandation</label>
                    <span className="form-required">*</span>
                  </div>
                  <textarea 
                    value={recommendation} 
                    onChange={(e) => setRecommendation(e.target.value)}
                    placeholder="Proposez des actions correctives ou d'amélioration..."
                    className="form-textarea"
                    rows={4}
                    required={showRisk}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit Button */}
          <div className="form-actions">
            <motion.button 
              type="submit" 
              className={`btn-submit ${isLoading ? 'btn-loading' : ''}`}
              disabled={isLoading}
              whileHover={!isLoading ? { scale: 1.02 } : {}}
              whileTap={!isLoading ? { scale: 0.98 } : {}}
            >
              {isLoading ? (
                <>
                  <span className="spinner"></span>
                  <span>Sauvegarde en cours...</span>
                </>
              ) : (
                <>
                  <Save size={18} />
                  <span>Sauvegarder l'Évaluation</span>
                </>
              )}
            </motion.button>
          </div>
        </form>
      </div>

      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}
    </motion.div>
  );
};

export default EvaluationForm;