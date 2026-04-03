import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Download, FileText, AlertCircle, CheckCircle2, XCircle, TrendingUp, Shield } from 'lucide-react';
import api from '../services/api';
import AppLayout from '../components/AppLayout';
import Card from '../components/Card';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import ChatPanel from '../components/ChatPanel';
import { calculateAuditScore, generateExecutiveSummary, calculateRiskStats } from '../utils/auditCalculations';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist/legacy/build/pdf';
import pdfjsWorker from 'pdfjs-dist/legacy/build/pdf.worker.min.mjs?url';
import './Report.css';

GlobalWorkerOptions.workerSrc = pdfjsWorker;

const Report = () => {
  const [report, setReport] = useState(null);
  const [generateError, setGenerateError] = useState('');
  const [pdfAnalysisError, setPdfAnalysisError] = useState('');
  const [analysisResult, setAnalysisResult] = useState(null);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [actionPlan, setActionPlan] = useState(null);
  const [actionPlanLoading, setActionPlanLoading] = useState(false);

  useEffect(() => {
    api.get('/report')
      .then(response => setReport(response.data))
      .catch(err => console.error('Erreur chargement rapport:', err));
  }, []);

  const analyzeCurrentReport = () => {
    setPdfAnalysisError('');
    setAnalysisResult(null);

    if (!report || !report.evaluations) {
      setPdfAnalysisError('Aucun rapport disponible à analyser.');
      return;
    }

    const statusCounts = { 'Conforme': 0, 'Partiellement conforme': 0, 'Non conforme': 0 };
    report.evaluations.forEach(e => {
      if (statusCounts[e.status] !== undefined) statusCounts[e.status] += 1;
    });

    const totalFound = Object.values(statusCounts).reduce((acc, val) => acc + val, 0);
    const complianceRate = totalFound > 0 ? Math.round((statusCounts['Conforme'] / totalFound) * 100) : null;

    setAnalysisResult({
      totalFound,
      statusCounts,
      complianceRate,
      controleCodes: [],
      extractedTextPreview: 'Analyse réalisée depuis le rapport chargé (API).'
    });
  };

  const analyzeWithAi = async () => {
    if (!report) return;

    setAiAnalysis(null);
    setPdfAnalysisError('');
    setAiLoading(true);

    try {
      const response = await api.post('/report/analyze', {
        scenario: report.scenario,
        evaluations: report.evaluations,
      });

      setAiAnalysis(response.data);
    } catch (error) {
      console.error('Erreur AI analyse:', error);
      setPdfAnalysisError('L\'analyse AI a échoué.');
    } finally {
      setAiLoading(false);
    }
  };

  const generateActionPlan = async () => {
    if (!report || !report.evaluations?.length) {
      setPdfAnalysisError('Pas d\'évaluations pour générer un plan.');
      return;
    }

    setActionPlan(null);
    setPdfAnalysisError('');
    setActionPlanLoading(true);

    try {
      const response = await api.post('/report/action-plan', {
        scenario: report.scenario,
        evaluations: report.evaluations,
      });

      // Vérifier si c'est une erreur
      if (response.data.error) {
        setPdfAnalysisError(`❌ Erreur: ${response.data.message} (${response.data.error})`);
        return;
      }

      setActionPlan(response.data);
    } catch (error) {
      console.error('Erreur génération plan d\'action:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Impossible de générer le plan d\'action.';
      setPdfAnalysisError(`❌ ${errorMsg}`);
    } finally {
      setActionPlanLoading(false);
    }
  };

  const handlePdfUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      setPdfAnalysisError('Veuillez sélectionner un fichier PDF valide.');
      return;
    }

    setPdfAnalysisError('');
    setAnalysisResult(null);

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const arrayBuffer = reader.result;
        const pdfDoc = await getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
        let textFromPdf = '';
        const pageCount = Math.min(pdfDoc.numPages, 20);

        for (let pageNumber = 1; pageNumber <= pageCount; pageNumber += 1) {
          const page = await pdfDoc.getPage(pageNumber);
          const textContent = await page.getTextContent();
          textFromPdf += textContent.items.map(item => item.str).join(' ') + '\n';
        }

        const statusCounts = { 'Conforme': 0, 'Partiellement conforme': 0, 'Non conforme': 0 };
        const regex = /\b(Conforme|Partiellement conforme|Non conforme)\b/g;
        let match;
        while ((match = regex.exec(textFromPdf)) !== null) {
          statusCounts[match[1]] += 1;
        }

        const totalFound = Object.values(statusCounts).reduce((acc, val) => acc + val, 0);
        const complianceRate = totalFound > 0 ? Math.round((statusCounts['Conforme'] / totalFound) * 100) : null;

        const controleCodes = [...new Set((textFromPdf.match(/\bA\.\d+\.\d+\b/g) || []))];

        setAnalysisResult({
          totalFound,
          statusCounts,
          complianceRate,
          controleCodes,
          extractedTextPreview: textFromPdf.slice(0, 1500)
        });
      } catch (error) {
        console.error('Erreur analyse PDF', error);
        setPdfAnalysisError('Impossible d\'analyser le fichier PDF.');
      }
    };
    reader.onerror = () => {
      setPdfAnalysisError('Erreur de lecture du fichier PDF.');
    };

    reader.readAsArrayBuffer(file);
  };

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
      doc.text('Rapport d\'Audit ISO 2700x', 20, yPosition);
      yPosition += 12;

      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.setTextColor(100, 100, 100);
      const auditDate = new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });
      doc.text(`Généré le ${auditDate}`, 20, yPosition);
      yPosition += 8;

      doc.setDrawColor(200, 200, 200);
      doc.line(20, yPosition, pageWidth - 20, yPosition);
      yPosition += 10;

      const conforme = report.evaluations.filter(e => e.status === 'Conforme').length;
      const partiellement = report.evaluations.filter(e => e.status === 'Partiellement conforme').length;
      const nonConforme = report.evaluations.filter(e => e.status === 'Non conforme').length;
      const score = calculateAuditScore(report.evaluations);

      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text('Résumé Exécutif', 20, yPosition);
      yPosition += 10;

      doc.setFontSize(11);
      doc.setFont(undefined, 'normal');
      doc.setTextColor(50, 50, 50);
      const summaryText = `L'audit de sécurité de l'information a porté sur un total de ${report.evaluations.length} contrôles. Le taux de conformité global s'élève à ${score}%.`;
      const summaryWrapped = doc.splitTextToSize(summaryText, pageWidth - 40);
      doc.text(summaryWrapped, 20, yPosition);
      yPosition += summaryWrapped.length * 5 + 8;

      doc.setFontSize(11);
      doc.setFont(undefined, 'bold');
      doc.text('Score Global: ' + score + '%', 20, yPosition);
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
      doc.text('Informations de l\'Entreprise', 20, yPosition);
      yPosition += 10;

      doc.setFontSize(11);
      doc.setFont(undefined, 'normal');
      doc.setTextColor(50, 50, 50);
      doc.text('Nom: ', 20, yPosition);
      yPosition += 6;
      doc.text('Secteur: ', 20, yPosition);
      yPosition += 6;
      doc.text('Taille: ', 20, yPosition);
      yPosition += 6;
      const objective = scenario.auditObjective || 'N/A';
      const objectiveWrapped = doc.splitTextToSize('Objectif: ', 170);
      doc.text(objectiveWrapped, 20, yPosition);
      yPosition += objectiveWrapped.length * 6 + 10;

      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text('Détail des Contrôles', 20, yPosition);
      yPosition += 8;

      const tableData = report.evaluations.map(e => [
        e.control?.code || 'N/A',
        e.control?.title || 'N/A',
        e.status || 'N/A',
        (e.justification || 'N/A').substring(0, 40),
        e.riskLevel || ''
      ]);

      autoTable(doc, {
        head: [['Code', 'Titre', 'Statut', 'Justification', 'Risque']],
        body: tableData,
        startY: yPosition,
        margin: 10,
        didDrawPage: (data) => {
          const footer = 'Page ' + data.pageNumber;
          doc.setFontSize(10);
          doc.text(footer, pageWidth / 2, pageHeight - 10, { align: 'center' });
        },
        styles: { fontSize: 9, cellPadding: 4, textColor: [50, 50, 50] },
        headerStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [248, 249, 250] },
        columnStyles: { 0: { cellWidth: 22 }, 1: { cellWidth: 45 }, 2: { cellWidth: 30 }, 3: { cellWidth: 55 }, 4: { cellWidth: 20 } }
      });

      const timestamp = new Date().toISOString().slice(0, 10);
      doc.save(`apport-audit-iso27001-${timestamp}.pdf`);
    } catch (error) {
      console.error('Erreur génération PDF:', error);
      setGenerateError('Erreur lors de la génération du PDF: ' + error.message);
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

  const conforme = report.evaluations.filter(e => e.status === 'Conforme').length;
  const partiellement = report.evaluations.filter(e => e.status === 'Partiellement conforme').length;
  const nonConforme = report.evaluations.filter(e => e.status === 'Non conforme').length;
  const conformityRate = Math.round((conforme / report.evaluations.length) * 100);
  const score = calculateAuditScore(report.evaluations);
  const summary = generateExecutiveSummary(report.evaluations, report.scenario);

  return (
    <AppLayout pageTitle="Rapport Final d'Audit" pageSubtitle="Analyse de conformité ISO 2700x">
      <div className="report-container">
        <motion.div className="report-header" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <div className="button-group-1">
            <button onClick={generatePDF} className="btn-download" disabled={!report}>
              <Download size={18} />
              Télécharger le Rapport
            </button>
            <label className="btn-upload" style={{ marginLeft: "0.8rem" }}>
              <FileText size={18} />
              Choisir un PDF
              <input type="file" accept="application/pdf" onChange={handlePdfUpload} style={{ display: "none" }} />
            </label>
          </div>

          <div className="button-group-2">
            <button onClick={analyzeCurrentReport} className="btn-upload" disabled={!report || !report.evaluations?.length}>
              <FileText size={18} />
              Analyser Rapport
            </button>
            <button onClick={analyzeWithAi} className="btn-upload" disabled={!report || !report.evaluations?.length || aiLoading}>
              {aiLoading ? '⏳ IA...' : '🤖 Agent IA'}
            </button>
            <button onClick={generateActionPlan} className="btn-upload" disabled={!report || !report.evaluations?.length || actionPlanLoading}>
              {actionPlanLoading ? '⏳ Plan...' : '📋 Plan d\'Action'}
            </button>
          </div>

          {generateError && (
            <div className="error-alert">
              <AlertCircle size={18} />
              <span>{generateError}</span>
            </div>
          )}
          {pdfAnalysisError && (
            <div className="error-alert">
              <AlertCircle size={18} />
              <span>{pdfAnalysisError}</span>
            </div>
          )}
        </motion.div>

        {analysisResult && (
          <Card className="pdf-analysis-card" style={{ marginTop: "1rem" }}>
            <h3>Résultat de l'analyse PDF</h3>
            <p><strong>Nombre d'occurrences statuts trouvées :</strong> {analysisResult.totalFound}</p>
            <p><strong>Conforme</strong> : {analysisResult.statusCounts.Conforme}</p>
            <p><strong>Partiellement conforme</strong> : {analysisResult.statusCounts["Partiellement conforme"]}</p>
            <p><strong>Non conforme</strong> : {analysisResult.statusCounts["Non conforme"]}</p>
            {analysisResult.complianceRate !== null && <p><strong>Taux de conformité estimé :</strong> {analysisResult.complianceRate}%</p>}
            {analysisResult.controleCodes && analysisResult.controleCodes.length > 0 && (
              <p><strong>Contrôles détectés :</strong> {analysisResult.controleCodes.slice(0, 10).join(", ")}{analysisResult.controleCodes.length > 10 ? " ..." : ""}</p>
            )}
            <details>
              <summary>Aperçu du texte extrait</summary>
              <pre style={{ whiteSpace: "pre-wrap", maxHeight: "220px", overflowY: "auto" }}>{analysisResult.extractedTextPreview}</pre>
            </details>
          </Card>
        )}

        {aiAnalysis && (
          <Card className="ai-analysis-card" style={{ marginTop: "1rem" }}>
            <h3>Analyse Expert IA</h3>
            {aiAnalysis.executiveSummary && <div><h4>Résumé Exécutif</h4><p>{aiAnalysis.executiveSummary}</p></div>}
            {aiAnalysis.metrics && (
              <div><h4>📊 Métriques</h4><p>Conformité : {aiAnalysis.metrics.complianceRatio}%</p></div>
            )}
            {aiAnalysis.recommendations && (
              <div><h4>Recommandations</h4><ol>{aiAnalysis.recommendations.map((r, i) => <li key={i}>{r}</li>)}</ol></div>
            )}
          </Card>
        )}

        {actionPlan && actionPlan.actionPlan && actionPlan.actionPlan.length > 0 && (
          <Card className="action-plan-card" style={{ marginTop: "1rem" }}>
            <h3>📋 Plan d'Action pour Non-Conformités</h3>
            {actionPlan.actionPlan.map((item, index) => (
              <motion.div key={index} className="plan-item" style={{ marginTop: "1.5rem", paddingTop: "1rem", borderTop: "1px solid #e5e7eb" }} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: index * 0.1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "1rem" }}>
                  <div>
                    <p style={{ fontWeight: "bold", fontSize: "1rem" }}>{item.controlCode} - {item.controlTitle}</p>
                    <p style={{ fontSize: "0.9rem", color: "#666" }}>Statut: {item.status}</p>
                  </div>
                  <span style={{
                    padding: "0.5rem 1rem",
                    borderRadius: "4px",
                    fontSize: "0.85rem",
                    fontWeight: "bold",
                    backgroundColor:
                      item.priority === "Critique" ? "#ef4444" : 
                      item.priority === "Haute" ? "#f97316" : 
                      item.priority === "Moyenne" ? "#eab308" : "#10b981",
                    color: "#fff"
                  }}>
                    {item.priority}
                  </span>
                </div>

                <div style={{ marginBottom: "1rem" }}>
                  <h5 style={{ fontWeight: "bold", marginBottom: "0.5rem" }}>Étapes de remédiation:</h5>
                  <ol style={{ marginLeft: "1.5rem", lineHeight: "1.6" }}>
                    {item.steps && item.steps.map((step, i) => <li key={i}>{step}</li>)}
                  </ol>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                  <div>
                    <p><strong>Ressources:</strong></p>
                    <ul style={{ marginLeft: "1.5rem" }}>
                      {item.resources && item.resources.map((r, i) => <li key={i}>{r}</li>)}
                    </ul>
                  </div>
                  <div>
                    <p><strong>Calendrier:</strong> {item.timeline}</p>
                    <p><strong>Responsable:</strong> {item.owner}</p>
                    <p><strong>Résultat attendu:</strong> {item.expectedOutcome}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </Card>
        )}

        {actionPlan && actionPlan.actionPlan && actionPlan.actionPlan.length === 0 && (
          <Card style={{ marginTop: "1rem", backgroundColor: "#d1fae5", padding: "1.5rem", borderRadius: "8px" }}>
            <h3 style={{ color: "#065f46", marginBottom: "0.5rem" }}>✅ Excellentes nouvelles!</h3>
            <p style={{ color: "#047857" }}>Aucune non-conformité détectée. Tous vos contrôles ISO 2700x sont en conformité.</p>
          </Card>
        )}

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, delay: 0.1 }}>
          <Card className="executive-summary-card">
            <div className="executive-header">
              <Shield size={24} />
              <h2>Résumé Exécutif</h2>
            </div>
            <div className="executive-content">
              <p>L'audit couvre {report.evaluations.length} contrôles.</p>
              <div className="exec-metrics">
                <div className="metric"><span className="metric-label">Score Global</span><span className="metric-value primary">{summary.score}%</span></div>
                <div className="metric"><span className="metric-label">Conformes</span><span className="metric-value green">{summary.conforme}</span></div>
                <div className="metric"><span className="metric-label">Partiels</span><span className="metric-value orange">{summary.partiel}</span></div>
                <div className="metric"><span className="metric-label">Non conformes</span><span className="metric-value red">{summary.non}</span></div>
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
            <div><p className="info-label">Nom</p><p className="info-value">{report.scenario.name}</p></div>
            <div><p className="info-label">Secteur</p><p className="info-value">{report.scenario.sector}</p></div>
            <div><p className="info-label">Taille</p><p className="info-value">{report.scenario.size}</p></div>
            <div><p className="info-label">Objectif</p><p className="info-value">{report.scenario.auditObjective}</p></div>
          </div>
        </Card>

        <Card>
          <h2>Détail des Évaluations</h2>
          <div className="evaluations-list">
            {report.evaluations.map((evaluation, index) => (
              <motion.div key={evaluation._id} className="evaluation-item" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: index * 0.05 }}>
                <div className="eval-header">
                  <div><h4>{evaluation.controlId.title}</h4><p className="eval-code">{evaluation.controlId.code}</p></div>
                  <StatusBadge status={evaluation.status} />
                </div>
                <p className="eval-justification"><strong>Justification :</strong> {evaluation.justification}</p>
                {evaluation.riskLevel && <p><strong>Niveau de Risque :</strong> {evaluation.riskLevel}</p>}
                {evaluation.recommendation && <p><strong>Recommandation :</strong> {evaluation.recommendation}</p>}
              </motion.div>
            ))}
          </div>
        </Card>
      </div>
      <ChatPanel analysisContext={aiAnalysis} />
    </AppLayout>
  );
};

export default Report;
