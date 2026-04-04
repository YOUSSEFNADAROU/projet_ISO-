import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, X, CheckCircle2, AlertCircle, XCircle } from 'lucide-react';
import api from '../services/api';
import AppLayout from '../components/AppLayout';
import PageHeader from '../components/PageHeader';
import ControlCard from '../components/ControlCard';
import './Controls.css';

const Controls = () => {
  const [controls, setControls] = useState([]);
  const [evaluations, setEvaluations] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const companyId = localStorage.getItem('selectedCompanyId') || localStorage.getItem('companyId') || 'default';
    api.get('/controls').then(response => setControls(response.data));
    api.get('/evaluations', { params: { companyId } }).then(response => {
      const evalMap = {};
      response.data.forEach(evaluation => {
        const controlKey = evaluation.controlId?._id || evaluation.controlId;
        if (controlKey) {
          evalMap[controlKey] = evaluation;
        }
      });
      setEvaluations(evalMap);
    });
  }, []);

  const categories = [...new Set(controls.map(c => c.category))];

  const filteredControls = controls.filter(control => {
    const matchesSearch = control.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         control.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         control.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || control.category === selectedCategory;
    const matchesStatus = !statusFilter || evaluations[control._id]?.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const conformeCount = controls.filter(c => evaluations[c._id]?.status === 'Conforme').length;
  const partielCount = controls.filter(c => evaluations[c._id]?.status === 'Partiellement conforme').length;
  const nonConformeCount = controls.filter(c => evaluations[c._id]?.status === 'Non conforme').length;
  const evaluatedCount = conformeCount + partielCount + nonConformeCount;

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setStatusFilter('');
  };

  const hasActiveFilters = searchTerm || selectedCategory || statusFilter;

  return (
    <AppLayout 
      pageTitle="Contrôles ISO 2700x" 
      pageSubtitle={`${filteredControls.length} contrôles trouvés`}
    >
      <div className="controls-container">
        {/* Quick Stats */}
        <motion.div 
          className="controls-stats"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="stat-item">
            <span className="stat-label">Total</span>
            <span className="stat-value">{controls.length}</span>
          </div>
          <div className="stat-item conforme">
            <CheckCircle2 size={16} />
            <span className="stat-label">Conformes</span>
            <span className="stat-value">{conformeCount}</span>
          </div>
          <div className="stat-item partiel">
            <AlertCircle size={16} />
            <span className="stat-label">Partiels</span>
            <span className="stat-value">{partielCount}</span>
          </div>
          <div className="stat-item non-conforme">
            <XCircle size={16} />
            <span className="stat-label">Non Conformes</span>
            <span className="stat-value">{nonConformeCount}</span>
          </div>
          <div className="stat-item evaluated">
            <span className="stat-label">Évalués</span>
            <span className="stat-value">{evaluatedCount}</span>
          </div>
        </motion.div>

        {/* Search and Filter Toolbar */}
        <motion.div 
          className="controls-toolbar"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <div className="search-box">
            <Search size={20} />
            <input
              type="text"
              placeholder="Rechercher par code, titre ou description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            {searchTerm && (
              <button 
                className="search-clear"
                onClick={() => setSearchTerm('')}
              >
                <X size={16} />
              </button>
            )}
          </div>

          <button 
            className={`filter-toggle ${showFilters ? 'active' : ''}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter size={18} />
            Filtres
            {hasActiveFilters && <span className="filter-badge">{(searchTerm ? 1 : 0) + (selectedCategory ? 1 : 0) + (statusFilter ? 1 : 0)}</span>}
          </button>
        </motion.div>

        {/* Advanced Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div 
              className="controls-filters-panel"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="filter-section">
                <h4>Par Catégorie</h4>
                <div className="filter-options">
                  <button
                    className={`filter-option ${!selectedCategory ? 'active' : ''}`}
                    onClick={() => setSelectedCategory('')}
                  >
                    Toutes ({controls.length})
                  </button>
                  {categories.map(cat => (
                    <button
                      key={cat}
                      className={`filter-option ${selectedCategory === cat ? 'active' : ''}`}
                      onClick={() => setSelectedCategory(cat)}
                    >
                      {cat} ({controls.filter(c => c.category === cat).length})
                    </button>
                  ))}
                </div>
              </div>

              <div className="filter-section">
                <h4>Par Statut d'Évaluation</h4>
                <div className="filter-options">
                  <button
                    className={`filter-option ${!statusFilter ? 'active' : ''}`}
                    onClick={() => setStatusFilter('')}
                  >
                    Tous ({controls.length})
                  </button>
                  <button
                    className={`filter-option conforme ${statusFilter === 'Conforme' ? 'active' : ''}`}
                    onClick={() => setStatusFilter('Conforme')}
                  >
                    <CheckCircle2 size={14} />
                    Conformes ({conformeCount})
                  </button>
                  <button
                    className={`filter-option partiel ${statusFilter === 'Partiellement conforme' ? 'active' : ''}`}
                    onClick={() => setStatusFilter('Partiellement conforme')}
                  >
                    <AlertCircle size={14} />
                    Partiellement ({partielCount})
                  </button>
                  <button
                    className={`filter-option non-conforme ${statusFilter === 'Non conforme' ? 'active' : ''}`}
                    onClick={() => setStatusFilter('Non conforme')}
                  >
                    <XCircle size={14} />
                    Non Conformes ({nonConformeCount})
                  </button>
                </div>
              </div>

              {hasActiveFilters && (
                <button className="reset-filters-btn" onClick={resetFilters}>
                  <X size={16} />
                  Réinitialiser les filtres
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Controls Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          {filteredControls.length > 0 ? (
            <div className="controls-grid">
              <AnimatePresence mode="popLayout">
                {filteredControls.map(control => (
                  <motion.div
                    key={control._id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ControlCard
                      control={control}
                      evaluation={evaluations[control._id]}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <motion.div 
              className="empty-state"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Search size={48} />
              <h3>Aucun contrôle trouvé</h3>
              <p>Aucun contrôle ne correspond à vos critères de recherche.</p>
              {hasActiveFilters && (
                <button className="reset-filters-btn-secondary" onClick={resetFilters}>
                  Réinitialiser les filtres
                </button>
              )}
            </motion.div>
          )}
        </motion.div>
      </div>
    </AppLayout>
  );
};

export default Controls;