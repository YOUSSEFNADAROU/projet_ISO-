import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Download, AlertCircle, CheckCircle2, XCircle, TrendingUp, Shield } from 'lucide-react';
import api from '../services/api';
import AppLayout from '../components/AppLayout';
import Card from '../components/Card';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import ChatPanel from '../components/ChatPanel_v2';
import { calculateAuditScore, generateExecutiveSummary, calculateRiskStats } from '../utils/auditCalculations';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import './Report.css';

const Report = () => {
  const [report, setReport] = useState(null);
  const [generateError, setGenerateError] = useState('');

  useEffect(() => {
    api
      .get('/report')
      .then((response) => setReport(response.data))
      .catch((err) => console.error('Erreur chargement rapport:', err));
  }, []);

  const generatePDF = () => {
    try {
      setGenerateError('');

      if (!report || !report.scenario || !report.evaluations) {
        setGenerateError('Données manquantes pour générer le PDF');
        return;
      }

      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      let yPosition = 15;

      doc.setFontSize(24);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text("Rapport d'Audit ISO 2700x", 20, yPosition);
      yPosition += 12;

      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.setTextColor(100, 100, 100);
      const auditDate = new Date().toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      doc.text(`Genere le ${auditDate}`, 20, yPosition);
      yPosition += 8;

      doc.setDrawColor(200, 200, 200);
      doc.line(20, yPosition, pageWidth - 20, yPosition);
      yPosition += 10;

      const conforme = report.evaluations.filter((evaluation) => evaluation.status === 'Conforme').length;
      const partiellement = report.evaluations.filter((evaluation) => evaluation.status === 'Partiellement conforme').length;
      const nonConforme = report.evaluations.filter((evaluation) => evaluation.status === 'Non conforme').length;
      const score = calculateAuditScore(report.evaluations);

      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text('Resume Executif', 20, yPosition);
      yPosition += 10;

      doc.setFontSize(11);
      doc.setFont(undefined, 'normal');
      doc.setTextColor(50, 50, 50);
      const summaryText = `L'audit de securite de l'information a porte sur un total de ${report.evaluations.length} controles. Le taux de conformite global s'eleve a ${score}%.`;
      const summaryWrapped = doc.splitTextToSize(summaryText, pageWidth - 40);
      doc.text(summaryWrapped, 20, yPosition);
      yPosition += summaryWrapped.length * 5 + 8;

      doc.setFontSize(11);
      doc.setFont(undefined, 'bold');
      doc.text(`Score Global: ${score}%`, 20, yPosition);
      yPosition += 7;
      doc.setFont(undefined, 'normal');
      doc.text(`Conformes: ${conforme} (${Math.round((conforme / report.evaluations.length) * 100)}%)`, 20, yPosition);
      yPosition += 6;
      doc.text(`Partiellement conformes: ${partiellement} (${Math.round((partiellement / report.evaluations.length) * 100)}%)`, 20, yPosition);
      yPosition += 6;
      doc.text(`Non conformes: ${nonConforme} (${Math.round((nonConforme / report.evaluations.length) * 100)}%)`, 20, yPosition);
      yPosition += 10;

      const scenario = report.scenario;
      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text("Informations de l'Entreprise", 20, yPosition);
      yPosition += 10;

      doc.setFontSize(11);
      doc.setFont(undefined, 'normal');
      doc.setTextColor(50, 50, 50);
      doc.text(`Nom: ${scenario.name || 'N/A'}`, 20, yPosition);
      yPosition += 6;
      doc.text(`Secteur: ${scenario.sector || 'N/A'}`, 20, yPosition);
      yPosition += 6;
      doc.text(`Taille: ${scenario.size || 'N/A'}`, 20, yPosition);
      yPosition += 6;
      const objectiveWrapped = doc.splitTextToSize(`Objectif: ${scenario.auditObjective || 'N/A'}`, 170);
      doc.text(objectiveWrapped, 20, yPosition);
      yPosition += objectiveWrapped.length * 6 + 10;

      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text('Detail des Controles', 20, yPosition);
      yPosition += 8;

      const tableData = report.evaluations.map((evaluation) => [
        evaluation.control?.code || evaluation.controlId?.code || 'N/A',
        evaluation.control?.title || evaluation.controlId?.title || 'N/A',
        evaluation.status || 'N/A',
        (evaluation.justification || 'N/A').substring(0, 40),
        evaluation.riskLevel || '',
      ]);

      autoTable(doc, {
        head: [['Code', 'Titre', 'Statut', 'Justification', 'Risque']],
        body: tableData,
        startY: yPosition,
        margin: 10,
        didDrawPage: (data) => {
          doc.setFontSize(10);
          doc.text(`Page ${data.pageNumber}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
        },
        styles: { fontSize: 9, cellPadding: 4, textColor: [50, 50, 50] },
        headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [248, 249, 250] },
        columnStyles: {
          0: { cellWidth: 22 },
          1: { cellWidth: 45 },
          2: { cellWidth: 30 },
          3: { cellWidth: 55 },
          4: { cellWidth: 20 },
        },
      });

      const timestamp = new Date().toISOString().slice(0, 10);
      doc.save(`rapport-audit-iso27001-${timestamp}.pdf`);
    } catch (error) {
      console.error('Erreur génération PDF:', error);
      setGenerateError(`Erreur lors de la génération du PDF: ${error.message}`);
    }
  };

  if (!report) {
    return (
      <AppLayout pageTitle="Rapport" pageSubtitle="Chargement...">
        <div className="report-container">
          <Card>Chargement du rapport...</Card>
        </div>
      </AppLayout>
    );
  }

  const conforme = report.evaluations.filter((evaluation) => evaluation.status === 'Conforme').length;
  const partiellement = report.evaluations.filter((evaluation) => evaluation.status === 'Partiellement conforme').length;
  const nonConforme = report.evaluations.filter((evaluation) => evaluation.status === 'Non conforme').length;
  const conformityRate = Math.round((conforme / report.evaluations.length) * 100);
  const summary = generateExecutiveSummary(report.evaluations, report.scenario);
  const riskStats = calculateRiskStats(report.evaluations);
  const analysisContext = {
    scenario: report.scenario,
    evaluations: report.evaluations,
    summary: {
      score: summary.score,
      conforme: summary.conforme,
      partiel: summary.partiel,
      non: summary.non,
      riskStats,
    },
  };

  return (
    <AppLayout pageTitle="Rapport Final d'Audit" pageSubtitle="Analyse de conformité ISO 2700x">
      <div className="report-container">
        <motion.div
          className="report-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="report-header-main">
            <button onClick={generatePDF} className="btn-download" disabled={!report}>
              <Download size={18} />
              Télécharger le Rapport
            </button>
            <div className="report-chatbot-note">
              <h3>Expert AI ISO 2700x</h3>
              <p>Le chatbot devient le point d’entrée principal pour poser vos questions d’audit, de remédiation, de preuves et de priorisation.</p>
            </div>
          </div>

          {generateError && (
            <div className="error-alert">
              <AlertCircle size={18} />
              <span>{generateError}</span>
            </div>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, delay: 0.1 }}>
          <Card className="executive-summary-card">
            <div className="executive-header">
              <Shield size={24} />
              <h2>Résumé Exécutif</h2>
            </div>
            <div className="executive-content">
              <p>L'audit couvre {report.evaluations.length} contrôles.</p>
              <div className="exec-metrics">
                <div className="metric">
                  <span className="metric-label">Score Global</span>
                  <span className="metric-value primary">{summary.score}%</span>
                </div>
                <div className="metric">
                  <span className="metric-label">Conformes</span>
                  <span className="metric-value green">{summary.conforme}</span>
                </div>
                <div className="metric">
                  <span className="metric-label">Partiels</span>
                  <span className="metric-value orange">{summary.partiel}</span>
                </div>
                <div className="metric">
                  <span className="metric-label">Non conformes</span>
                  <span className="metric-value red">{summary.non}</span>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        <div className="report-stats-grid">
          <StatCard title="Taux de Conformité" value={`${conformityRate}%`} icon={TrendingUp} variant="blue" />
          <StatCard title="Conformes" value={conforme} icon={CheckCircle2} variant="green" />
          <StatCard title="Partiels" value={partiellement} icon={AlertCircle} variant="orange" />
          <StatCard title="Non conformes" value={nonConforme} icon={XCircle} variant="red" />
        </div>

        <Card>
          <h2>Informations de l'Entreprise</h2>
          <div className="company-info-grid">
            <div>
              <p className="info-label">Nom</p>
              <p className="info-value">{report.scenario.name}</p>
            </div>
            <div>
              <p className="info-label">Secteur</p>
              <p className="info-value">{report.scenario.sector}</p>
            </div>
            <div>
              <p className="info-label">Taille</p>
              <p className="info-value">{report.scenario.size}</p>
            </div>
            <div>
              <p className="info-label">Objectif</p>
              <p className="info-value">{report.scenario.auditObjective}</p>
            </div>
          </div>
        </Card>

        <Card>
          <h2>Détail des Évaluations</h2>
          <div className="evaluations-list">
            {report.evaluations.map((evaluation, index) => (
              <motion.div
                key={evaluation._id}
                className="evaluation-item"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <div className="eval-header">
                  <div>
                    <h4>{evaluation.controlId.title}</h4>
                    <p className="eval-code">{evaluation.controlId.code}</p>
                  </div>
                  <StatusBadge status={evaluation.status} />
                </div>
                <p className="eval-justification">
                  <strong>Justification :</strong> {evaluation.justification}
                </p>
                {evaluation.riskLevel && <p><strong>Niveau de Risque :</strong> {evaluation.riskLevel}</p>}
                {evaluation.recommendation && <p><strong>Recommandation :</strong> {evaluation.recommendation}</p>}
              </motion.div>
            ))}
          </div>
        </Card>
      </div>
      <ChatPanel analysisContext={analysisContext} />
    </AppLayout>
  );
};

export default Report;
