import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Download, FileText, AlertCircle, CheckCircle2, XCircle, TrendingUp, Shield } from 'lucide-react';
import api from '../services/api';
import AppLayout from '../components/AppLayout';
import Card from '../components/Card';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import ChatPanel from '../components/ChatPanel';
import { calculateAuditScore, calculateRiskStats } from '../utils/auditCalculations';
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
    const companyId = localStorage.getItem('selectedCompanyId') || localStorage.getItem('companyId') || 'default';
    api.get('/report', { params: { companyId } })
      .then(response => setReport(response.data))
      .catch(err => console.error('Erreur chargement rapport:', err));
  }, []);

  const companyScenario = useMemo(() => {
    if (!report?.scenario) return null;
    try {
      const companies = JSON.parse(localStorage.getItem('companies') || '[]');
      const selectedId = localStorage.getItem('selectedCompanyId') || localStorage.getItem('companyId');
      const company = companies.find((item) => item.id === selectedId);
      if (!company) return report.scenario;

      return {
        ...report.scenario,
        name: company.name || report.scenario.name,
        sector: company.sector || report.scenario.sector,
        size: company.size || report.scenario.size,
        auditObjective: company.auditObjective || report.scenario.auditObjective,
        contactEmail: company.contactEmail || report.scenario.contactEmail,
        contactPhone: company.contactPhone || report.scenario.contactPhone,
      };
    } catch (storageError) {
      return report.scenario;
    }
  }, [report]);

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

    const scenario = companyScenario || report.scenario;

    setAiAnalysis(null);
    setPdfAnalysisError('');
    setAiLoading(true);

    try {
      const response = await api.post('/report/analyze', {
        scenario,
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

    const scenario = companyScenario || report.scenario;

    setActionPlan(null);
    setPdfAnalysisError('');
    setActionPlanLoading(true);

    try {
      const response = await api.post('/report/action-plan', {
        scenario,
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

  const generatePdfWithExtras = async () => {
    setGenerateError('');

    if (!report || !report.scenario || !report.evaluations) {
      setGenerateError('Données manquantes pour générer le PDF');
      return;
    }

    try {
      const scenario = companyScenario || report.scenario;
      const scenarioPayload = { scenario, evaluations: report.evaluations };

      const auditTeam = [
        'Youssef Nadarou',
        'Imane Id Moullay',
        'Hanane Essahely',
        'Khaoula Maraghir',
        'Hajar Laqlib'
      ];

      let nextAiAnalysis = aiAnalysis;
      let nextActionPlan = actionPlan;

      if (!nextAiAnalysis) {
        const aiResponse = await api.post('/report/analyze', scenarioPayload);
        nextAiAnalysis = aiResponse.data;
        setAiAnalysis(aiResponse.data);
      }

      if (!nextActionPlan) {
        const planResponse = await api.post('/report/action-plan', scenarioPayload);
        nextActionPlan = planResponse.data;
        setActionPlan(planResponse.data);
      }

      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      const writeParagraph = (text, startY) => {
        const lines = doc.splitTextToSize(text, pageWidth - 40);
        doc.text(lines, 20, startY);
        return startY + lines.length * 5 + 4;
      };

      const addSectionTitle = (title, startY) => {
        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(15, 23, 42);
        doc.text(title, 20, startY);
        return startY + 8;
      };

      const addFooter = (pageNumber) => {
        doc.setFontSize(10);
        doc.setTextColor(120, 120, 120);
        doc.text(`Page ${pageNumber}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
      };

      // Cover page
      doc.setFontSize(26);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text('Rapport d\'Audit ISO 2700x', pageWidth / 2, 60, { align: 'center' });

      doc.setFontSize(12);
      doc.setFont(undefined, 'normal');
      doc.setTextColor(80, 80, 80);
      doc.text(`Entreprise: ${scenario?.name || 'N/A'}`, pageWidth / 2, 80, { align: 'center' });
      const auditDate = new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });
      doc.text(`Date: ${auditDate}`, pageWidth / 2, 90, { align: 'center' });
      doc.text('Cabinet d\'audit: LearnAudit', pageWidth / 2, 100, { align: 'center' });

      doc.setFontSize(11);
      doc.setTextColor(90, 90, 90);
      doc.text('Equipe d\'audit:', pageWidth / 2, 115, { align: 'center' });
      auditTeam.forEach((auditor, index) => {
        doc.text(auditor, pageWidth / 2, 123 + index * 6, { align: 'center' });
      });

      addFooter(doc.internal.getNumberOfPages());
      doc.addPage();

      // Distribution et clause de non-responsabilite
      let yPosition = 20;
      yPosition = addSectionTitle('Distribution', yPosition);
      doc.setFontSize(11);
      doc.setFont(undefined, 'normal');
      doc.setTextColor(50, 50, 50);
      yPosition = writeParagraph(
        'Le contenu du present rapport ne doit pas etre divulgue a un tiers sans l\'accord du client de LearnAudit.',
        yPosition
      );
      yPosition += 6;
      yPosition = addSectionTitle('Clause de non-responsabilite', yPosition);
      yPosition = writeParagraph(
        'Le present rapport a ete prepare par LearnAudit pour donner suite a la demande d\'evaluation d\'un client. L\'objectif est de verifier la conformite aux exigences applicables et autres criteres specifies. Le contenu du present rapport ne s\'applique qu\'aux elements evidents au moment de l\'audit et faisant partie de son perimetre. LearnAudit ne garantit ni ne commente la pertinence du contenu du rapport ou du certificat a des fins ou utilisations particulieres. LearnAudit n\'accepte aucune responsabilite quant aux consequences ou mesures prises par des tiers a la suite des informations contenues dans ce rapport. Cet audit est base sur un processus d\'echantillonnage de l\'information disponible et ne permet pas de garantir que toutes les non-conformites eventuelles ont ete detectees.',
        yPosition
      );
      addFooter(doc.internal.getNumberOfPages());
      doc.addPage();

      // Plan (table des matieres)
      yPosition = 20;
      yPosition = addSectionTitle('Plan', yPosition);
      doc.setFontSize(11);
      doc.setFont(undefined, 'normal');
      doc.setTextColor(50, 50, 50);
      const planLines = [
        '1. Introduction',
        '2. Informations sur l\'audit',
        '3. Preparation et methodologie d\'audit',
        '4. Resultats et evaluations',
        '5. Plan d\'action',
        '6. Analyse IA',
        '7. Conclusion'
      ];
      planLines.forEach((line) => {
        doc.text(line, 20, yPosition);
        yPosition += 7;
      });
      addFooter(doc.internal.getNumberOfPages());
      doc.addPage();

      // Introduction
      yPosition = 20;
      yPosition = addSectionTitle('Introduction', yPosition);
      doc.setFontSize(11);
      doc.setFont(undefined, 'normal');
      doc.setTextColor(50, 50, 50);
      yPosition = writeParagraph(
        `J\'ai audite le systeme de management de la securite de l\'information (SMSI) de l\'organisation ${scenario?.name || 'l\'entreprise'} dans l\'objectif d\'evaluer sa conformite aux exigences de l\'ISO/IEC 27001:2013 et sa capacite a fonctionner de maniere efficace. L\'audit a ete realise par une equipe professionnelle selon une approche par les processus, avec un accent sur les risques et les objectifs critiques.`,
        yPosition
      );
      yPosition = writeParagraph(
        'Conformement aux normes ISO 19011 et ISO/IEC 17021, notre equipe a planifie et execute l\'audit afin d\'obtenir une assurance raisonnable que le SMSI est conforme et que les exigences applicables sont respectees. L\'audit repose sur un echantillonnage des informations disponibles et des non-conformites ou opportunites d\'amelioration peuvent subsister dans des domaines non examines.',
        yPosition
      );
      addFooter(doc.internal.getNumberOfPages());
      doc.addPage();

      // Informations sur l'audit
      yPosition = 20;
      yPosition = addSectionTitle('Informations sur l\'audit', yPosition);
      doc.setFontSize(11);
      doc.setFont(undefined, 'normal');
      doc.setTextColor(50, 50, 50);
      doc.text(`Organisation: ${scenario?.name || 'N/A'}`, 20, yPosition);
      yPosition += 6;
      doc.text(`Secteur: ${scenario?.sector || 'N/A'}`, 20, yPosition);
      yPosition += 6;
      doc.text(`Taille: ${scenario?.size || 'N/A'}`, 20, yPosition);
      yPosition += 6;
      doc.text(`Email du contact: ${scenario?.contactEmail || 'N/A'}`, 20, yPosition);
      yPosition += 6;
      doc.text(`Telephone du contact: ${scenario?.contactPhone || 'N/A'}`, 20, yPosition);
      yPosition += 8;
      yPosition = writeParagraph(`Objectif de l\'audit: ${scenario?.auditObjective || 'N/A'}`, yPosition);
      yPosition += 4;
      yPosition = writeParagraph('Norme d\'audit: ISO/IEC 27001:2013', yPosition);
      yPosition = writeParagraph(`Date de l\'audit: ${auditDate}`, yPosition);
      yPosition += 4;
      yPosition = writeParagraph(`Auditeur principal: ${auditTeam[0]}`, yPosition);
      yPosition = writeParagraph(`Autres membres de l\'equipe: ${auditTeam.slice(1).join(', ')}`, yPosition);
      addFooter(doc.internal.getNumberOfPages());
      doc.addPage();

      // Preparation et methodologie
      yPosition = 20;
      yPosition = addSectionTitle('Preparation et methodologie d\'audit', yPosition);
      doc.setFontSize(11);
      doc.setFont(undefined, 'normal');
      doc.setTextColor(50, 50, 50);
      yPosition = writeParagraph(
        'Les objectifs de l\'audit consistent a confirmer que l\'organisation a defini le perimetre du SMSI, qu\'il est conforme aux exigences de la norme, aux obligations legales et qu\'il est capable d\'atteindre les objectifs de securite de l\'information.',
        yPosition
      );
      yPosition = writeParagraph(
        'Les methodes utilisees comprennent des entrevues, l\'observation des activites, l\'examen de la documentation, des tests techniques limites et une analyse d\'echantillons. L\'echantillonnage permet de tirer des conclusions sur l\'ensemble en examinant une partie representative.',
        yPosition
      );
      yPosition = writeParagraph(
        'Le plan d\'audit a ete valide avec l\'organisation avant la reunion d\'ouverture. Les non-conformites identifiees, le cas echeant, doivent etre traitees via le processus d\'actions correctives de l\'organisation.',
        yPosition
      );
      addFooter(doc.internal.getNumberOfPages());
      doc.addPage();

      // Resultats et evaluations
      yPosition = 20;
      yPosition = addSectionTitle('Résultats et Évaluations', yPosition);
      const conforme = report.evaluations.filter(e => e.status === 'Conforme').length;
      const partiellement = report.evaluations.filter(e => e.status === 'Partiellement conforme').length;
      const nonConforme = report.evaluations.filter(e => e.status === 'Non conforme').length;
      const score = calculateAuditScore(report.evaluations);

      doc.setFontSize(11);
      doc.setFont(undefined, 'normal');
      doc.setTextColor(50, 50, 50);
      doc.text(`Score global: ${score}%`, 20, yPosition);
      yPosition += 6;
      doc.text(`Conformes: ${conforme}`, 20, yPosition);
      yPosition += 6;
      doc.text(`Partiellement conformes: ${partiellement}`, 20, yPosition);
      yPosition += 6;
      doc.text(`Non conformes: ${nonConforme}`, 20, yPosition);
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
          addFooter(data.pageNumber);
        },
        styles: { fontSize: 9, cellPadding: 4, textColor: [50, 50, 50] },
        headerStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [248, 249, 250] },
        columnStyles: { 0: { cellWidth: 22 }, 1: { cellWidth: 45 }, 2: { cellWidth: 30 }, 3: { cellWidth: 55 }, 4: { cellWidth: 20 } }
      });

      // Plan d'action
      doc.addPage();
      yPosition = 20;
      yPosition = addSectionTitle('Plan d\'Action', yPosition);
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.setTextColor(50, 50, 50);

      if (nextActionPlan?.actionPlan?.length) {
        nextActionPlan.actionPlan.forEach((item, index) => {
          yPosition = writeParagraph(
            `${index + 1}. ${item.controlCode || 'N/A'} - ${item.controlTitle || ''} (${item.priority || 'Moyenne'})`,
            yPosition
          );
          if (item.steps?.length) {
            yPosition = writeParagraph(`Étapes: ${item.steps.join(' | ')}`, yPosition);
          }
          if (item.resources?.length) {
            yPosition = writeParagraph(`Ressources: ${item.resources.join(' | ')}`, yPosition);
          }
          if (item.timeline || item.owner || item.expectedOutcome) {
            yPosition = writeParagraph(
              `Calendrier: ${item.timeline || 'N/A'} | Responsable: ${item.owner || 'N/A'} | Résultat attendu: ${item.expectedOutcome || 'N/A'}`,
              yPosition
            );
          }
          yPosition += 4;

          if (yPosition > pageHeight - 30) {
            doc.addPage();
            yPosition = 20;
          }
        });
      } else {
        yPosition = writeParagraph('Aucun plan d\'action disponible.', yPosition);
      }
      addFooter(doc.internal.getNumberOfPages());

      // Analyse IA
      doc.addPage();
      yPosition = 20;
      yPosition = addSectionTitle('Analyse IA', yPosition);
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.setTextColor(50, 50, 50);
      const aiText = nextAiAnalysis?.executiveSummary || nextAiAnalysis?.analysis || nextAiAnalysis?.answer || 'Analyse IA non disponible.';
      yPosition = writeParagraph(aiText, yPosition);
      if (nextAiAnalysis?.recommendations?.length) {
        yPosition = writeParagraph(`Recommandations: ${nextAiAnalysis.recommendations.join(' | ')}`, yPosition);
      }
      addFooter(doc.internal.getNumberOfPages());

      // Conclusion
      doc.addPage();
      yPosition = 20;
      yPosition = addSectionTitle('Conclusion', yPosition);
      doc.setFontSize(11);
      doc.setFont(undefined, 'normal');
      doc.setTextColor(50, 50, 50);
      yPosition = writeParagraph(
        `L'audit met en évidence les points forts et les axes d'amélioration prioritaires. Un suivi régulier est recommandé afin de maintenir un niveau de conformité élevé.`,
        yPosition
      );
      yPosition += 8;

      doc.setDrawColor(200, 200, 200);
      doc.line(20, yPosition, pageWidth - 20, yPosition);
      doc.setFontSize(11);
      doc.setTextColor(50, 50, 50);
      doc.text('Cabinet d\'audit: LearnAudit', 20, yPosition + 8);
      doc.text('Signature:', 20, yPosition + 16);

      addFooter(doc.internal.getNumberOfPages());

      const timestamp = new Date().toISOString().slice(0, 10);
      doc.save(`rapport-audit-iso27001-${timestamp}.pdf`);
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

  const scenario = companyScenario || report.scenario || {};
  const conforme = report.evaluations.filter(e => e.status === 'Conforme').length;
  const partiellement = report.evaluations.filter(e => e.status === 'Partiellement conforme').length;
  const nonConforme = report.evaluations.filter(e => e.status === 'Non conforme').length;
  const conformityRate = Math.round((conforme / report.evaluations.length) * 100);
  const score = calculateAuditScore(report.evaluations);

  return (
    <AppLayout pageTitle="Rapport Final d'Audit" pageSubtitle="Analyse de conformité ISO 2700x">
      <div className="report-container">
        <motion.div className="report-header" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <div className="button-group-1">
            <button onClick={generatePdfWithExtras} className="btn-download" disabled={!report}>
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

        <div className="report-stats-grid">
          <StatCard title="Taux de Conformité" value={`${conformityRate}%`} icon={TrendingUp} variant="blue" />
          <StatCard title="Conformes" value={conforme} icon={CheckCircle2} variant="green" />
          <StatCard title="Partiels" value={partiellement} icon={AlertCircle} variant="orange" />
          <StatCard title="Non conformes" value={nonConforme} icon={XCircle} variant="red" />
        </div>

        <Card>
          <h2>Informations de l'Entreprise</h2>
          <div className="company-info-grid">
            <div><p className="info-label">Nom</p><p className="info-value">{scenario.name || 'N/A'}</p></div>
            <div><p className="info-label">Secteur</p><p className="info-value">{scenario.sector || 'N/A'}</p></div>
            <div><p className="info-label">Taille</p><p className="info-value">{scenario.size || 'N/A'}</p></div>
            <div><p className="info-label">Objectif</p><p className="info-value">{scenario.auditObjective || 'N/A'}</p></div>
            <div><p className="info-label">Email</p><p className="info-value">{scenario.contactEmail || 'N/A'}</p></div>
            <div><p className="info-label">Téléphone</p><p className="info-value">{scenario.contactPhone || 'N/A'}</p></div>
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
