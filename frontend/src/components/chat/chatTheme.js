import {
  AlertCircle,
  CheckCircle2,
  FileText,
  Lightbulb,
  Shield,
  TrendingUp,
  Database,
  Sparkles,
  Cpu,
} from 'lucide-react';

export const SOURCE_LABELS = {
  local: 'Expert local',
  local_fallback: 'Mode local',
  gemini: 'IA',
  application: 'Donnees reelles',
  db: 'Donnees reelles',
  iso_kb: 'Base ISO',
  local_kb: 'Base ISO',
  openai: 'OpenAI',
};

export const QUICK_SUGGESTIONS = [
  'Quels sont mes problemes critiques ?',
  'Quelles preuves dois-je preparer ?',
  "Quel plan d'action recommandes-tu ?",
  'Quels controles sont non conformes ?',
  'Comment ameliorer mon score ?',
  'Quel est le risque principal ?',
];

export const QUICK_ACTIONS = [
  { label: 'Approfondir', prompt: 'Approfondis cette analyse comme un auditeur senior ISO 27001/27002.' },
  { label: 'Voir les preuves', prompt: 'Liste les preuves attendues de facon detaillee.' },
  { label: "Plan d'action", prompt: "Genere un plan d'action priorise a partir de cette reponse." },
  { label: 'Prioriser', prompt: 'Priorise les actions a lancer en premier.' },
  { label: 'Controles lies', prompt: 'Quels controles ISO sont lies a ce sujet ?' },
  { label: 'Resume direction', prompt: 'Resume ce sujet pour un comite de direction en 5 points.' },
];

export const SECTION_CONFIG = {
  summary: { title: 'Resume', icon: CheckCircle2 },
  isoContext: { title: 'Contexte ISO', icon: Shield },
  impact: { title: 'Impact', icon: TrendingUp },
  findings: { title: 'Constats', icon: AlertCircle },
  recommendations: { title: 'Recommandations', icon: Lightbulb },
  evidence: { title: 'Preuves attendues', icon: FileText },
  nextSteps: { title: 'Prochaines etapes', icon: TrendingUp },
};

export const SOURCE_ICON_MAP = {
  gemini: Sparkles,
  openai: Sparkles,
  local: Cpu,
  local_fallback: Cpu,
  application: Database,
  db: Database,
  iso_kb: Shield,
  local_kb: Shield,
};

export function getRiskTone(level = '') {
  const value = String(level).toLowerCase();
  if (value.includes('crit')) return 'critical';
  if (value.includes('elev')) return 'high';
  if (value.includes('moy')) return 'medium';
  return 'low';
}
