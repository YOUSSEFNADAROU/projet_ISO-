import React, { useState } from 'react';
import api from '../services/api';

const RiskForm = ({ controlId, status, justification }) => {
  const [severity, setSeverity] = useState('');
  const [probability, setProbability] = useState('');
  const [recommendation, setRecommendation] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = { controlId, status, justification, severity, probability, recommendation };
    await api.post('/evaluations', data);
    alert('Évaluation avec risque sauvegardée');
  };

  return (
    <div className="card" style={{ marginTop: '20px' }}>
      <h3>Gestion des Risques</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Gravité :</label>
          <select value={severity} onChange={(e) => setSeverity(e.target.value)} required>
            <option value="">Sélectionner</option>
            <option value="faible">Faible</option>
            <option value="moyenne">Moyenne</option>
            <option value="élevée">Élevée</option>
          </select>
        </div>
        <div className="form-group">
          <label>Probabilité :</label>
          <select value={probability} onChange={(e) => setProbability(e.target.value)} required>
            <option value="">Sélectionner</option>
            <option value="faible">Faible</option>
            <option value="moyenne">Moyenne</option>
            <option value="élevée">Élevée</option>
          </select>
        </div>
        <div className="form-group">
          <label>Recommandation :</label>
          <textarea value={recommendation} onChange={(e) => setRecommendation(e.target.value)} required />
        </div>
        <button type="submit" className="btn btn-primary">Sauvegarder</button>
      </form>
    </div>
  );
};

export default RiskForm;