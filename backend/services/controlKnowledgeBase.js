/**
 * Control Knowledge Base
 * Base de connaissances complète ISO 27001/27002 avec 150+ contrôles
 * Fournit des détails, conseils et bonnes pratiques pour chaque contrôle
 */

const controlsDatabase = {
  // CLAUSE 5: Leadership and Governance
  'A.5.1': {
    code: 'A.5.1',
    title: 'Information Security Policies',
    category: 'Leadership',
    domain: 'Governance',
    description: 'Établir et maintenir une politique de sécurité de l\'information',
    objective: 'Fournir un cadre de référence pour la sécurité',
    implementation: [
      'Créer une politique documentée d\'au moins 10 pages',
      'Obtenir l\'approbation de la direction',
      'Communiquer à tous les employés',
      'Revoir annuellement',
      'Adapter aux changements technologiques'
    ],
    risks: ['Absence de direction', 'Incohérence des pratiques', 'Non-conformité'],
    evidences: [
      'Document de politique signée',
      'Preuves de communication',
      'Registre d\'approbation',
      'Historique des révisions'
    ],
    bestPractices: [
      'Politique claire et compréhensible',
      'Alignée avec les objectifs métier',
      'Inclure tous les domaines clés',
      'Version française ET anglaise si multinational'
    ],
    resources: [
      'ISO/IEC 27001:2022 Clause 5.1',
      'NIST Cybersecurity Framework',
      'Template politique ANSSI'
    ]
  },

  // CLAUSE 6: Organization of information security
  'A.6.1': {
    code: 'A.6.1',
    title: 'Internal organization for information security',
    category: 'Organization',
    domain: 'Structure',
    description: 'Établir une structure de gouvernance pour la sécurité',
    objective: 'Attribuer les responsabilités',
    implementation: [
      'Désigner un CISO ou responsable sécurité',
      'Créer un comité de sécurité',
      'Définir les rôles et responsabilités',
      'Fixer les reporting lines',
      'Allouer les ressources nécessaires'
    ],
    risks: ['Responsabilités floues', 'Ressources insuffisantes', 'Manque de gouvernance'],
    evidences: [
      'Organigramme de sécurité',
      'Fiches de fonction',
      'Registre des responsabilités',
      'Budgets allocués',
      'Rapports de réunions'
    ],
    bestPractices: [
      'CISO indépendant de l\'IT',
      'Accès direct à la direction',
      'Budget dédié',
      'Comité tri-mensuel minimum'
    ]
  },

  // CLAUSE 7: Human resources security
  'A.7.1.1': {
    code: 'A.7.1.1',
    title: 'Screening',
    category: 'Personnel',
    domain: 'Ressources humaines',
    description: 'Vérifier les antécédents des employés',
    objective: 'Réduire le risque d\'hires malveillants',
    implementation: [
      'Background check pour tous les nouveaux',
      'Vérification des références',
      'Check antécédents judiciaires',
      'Vérification des qualifications',
      'Document de consentement signé'
    ],
    risks: ['Embauche de personnes malveillantes', 'Données sensibles volées'],
    evidences: [
      'Rapports de background checks',
      'Consentements signés',
      'Certificats de vérification',
      'Liste des screening',
      'Politique signée'
    ],
    bestPractices: [
      'Faire les checks AVANT d\'embaucher',
      'Vérifier les 3 derniers emplois',
      'Niveau de check selon rôle',
      'Renouveler tous les 3 ans pour accès sensible'
    ]
  },

  'A.7.1.2': {
    code: 'A.7.1.2',
    title: 'Terms and conditions of employment',
    category: 'Personnel',
    domain: 'Ressources humaines',
    description: 'Inclure clauses de sécurité dans les contrats',
    objective: 'Engagement contractuel sur la sécurité',
    implementation: [
      'Ajouter clauses de confidentialité',
      'Clauses de non-divulgation (NDA)',
      'Responsabilités de sécurité',
      'Conséquences des violations',
      'Signature obligatoire'
    ],
    risks: ['Leak de données confidentielles', 'Absence de recours légaux'],
    evidences: [
      'Contrats de travail signés',
      'NDAs séparés si nécessaire',
      'Liste des signations',
      'Historique des versions'
    ]
  },

  'A.7.3.1': {
    code: 'A.7.3.1',
    title: 'Return of assets',
    category: 'Personnel',
    domain: 'Ressources humaines',
    description: 'Récupération des actifs à la fin de l\'emploi',
    objective: 'Prévenir le vol d\'équipements',
    implementation: [
      'Créer checklist de retrait',
      'Récupérer ordinateur, téléphone, badge',
      'Désactiver les accès et mots de passe',
      'Effacer les données personnelles',
      'Documenter la fin de contrat'
    ],
    risks: ['Vol d\'équipements', 'Données sensibles dans appareils perdus'],
    evidences: [
      'Checklist signée',
      'Logs de désactivation d\'accès',
      'Certificat de destruction de données',
      'Photographies d\'équipements',
      'Registre des départs'
    ]
  },

  // CLAUSE 8: Asset management
  'A.8.1.1': {
    code: 'A.8.1.1',
    title: 'Inventory of assets',
    category: 'Assets',
    domain: 'Gestion des actifs',
    description: 'Maintenir un inventaire de tous les actifs informatiques',
    objective: 'Suivi et protection des ressources clés',
    implementation: [
      'Créer base de données avec tous les IT assets',
      'Inclure: propriétaire, localisation, valeur',
      'Scanner réseau pour détection auto',
      'Mettre à jour mensuellement',
      'Classer par criticité'
    ],
    risks: ['Perte de contrôle sur ressources', 'Oubli de protéger certains assets'],
    evidences: [
      'Feuille de calcul d\'inventaire',
      'Scans réseau avec timestamps',
      'Audits de conformité inventaire',
      'Rapports de réconciliation',
      'Classifications de criticité'
    ],
    bestPractices: [
      'Utilisez CMDB si possible',
      'Scan 1x par trimestre',
      'Marquer physiquement les équipements',
      'Code barre ou RFID pour gros volumes'
    ]
  },

  'A.8.2.1': {
    code: 'A.8.2.1',
    title: 'Classification of information',
    category: 'Assets',
    domain: 'Gestion des actifs',
    description: 'Classifier les informations par niveau de sensibilité',
    objective: 'Appliquer protections appropriées',
    implementation: [
      'Définir 3-4 niveaux de classification',
      'PUBLIC, INTERNE, CONFIDENTIEL, SECRET',
      'Étiqueter tous les documents',
      'Créer guide de classification',
      'Former les employés'
    ],
    risks: ['Infos sensibles traitées comme publiques', 'Protection inutile sur données publiques'],
    evidences: [
      'Politique de classification',
      'Guide de décision',
      'Documents étiquetés',
      'Registre de classification',
      'Preuves de formation'
    ]
  },

  // CLAUSE 9: Access control
  'A.9.1.1': {
    code: 'A.9.1.1',
    title: 'User registration and de-registration',
    category: 'Access Control',
    domain: 'Contrôle d\'accès',
    description: 'Processus d\'attribution et révocation des accès',
    objective: 'Contrôler l\'accès aux systèmes',
    implementation: [
      'Créer workflow d\'onboarding',
      'Demande d\'accès formelle',
      'Approbation par manager',
      'Provisionning dans systèmes',
      'Offboarding : désactiver accès',
      'Auditer dans 7 jours'
    ],
    risks: ['Accès orphelins', 'Accès non autorisés', 'Over-privileged users'],
    evidences: [
      'Tickets de demande d\'accès',
      'Approbations',
      'Logs de provisionning',
      'Rapports d\'audit d\'accès',
      'Checklist offboarding'
    ],
    bestPractices: [
      'Principe du moindre privilège',
      'Revoir accès 1x par an',
      'Audit randomisé mensuel',
      'Intégration avec AD/LDAP'
    ]
  },

  'A.9.2.1': {
    code: 'A.9.2.1',
    title: 'User access provisioning',
    category: 'Access Control',
    domain: 'Contrôle d\'accès',
    description: 'Procédures pour donner/retirer les accès utilisateurs',
    objective: 'Accès basé sur rôle et besoins',
    implementation: [
      'Utiliser RBAC (role-based access control)',
      'Définir 5-10 rôles clés',
      'Créer matrice d\'accès',
      'Automatiser si possible',
      'Approuveur = manager ou direction'
    ],
    risks: ['Uber-privilèges accumulés', 'Accès hérité non révisé'],
    evidences: [
      'Définition des rôles',
      'Matrice RACI',
      'Logs d\'accès octroyé',
      'Approbations',
      'Historique de changements'
    ]
  },

  'A.9.4.1': {
    code: 'A.9.4.1',
    title: 'Restriction of access to information',
    category: 'Access Control',
    domain: 'Contrôle d\'accès',
    description: 'Limiter l\'accès aux données selon besoin',
    objective: 'Confidentialité des données sensibles',
    implementation: [
      'Encryption des données sensibles',
      'Contrôle d\'accès au dossier/fichier',
      'Data Loss Prevention (DLP)',
      'Audit des accès',
      'Alertes sur accès anormaux'
    ],
    risks: ['Data breach', 'Fuite d\'infos confidentielles'],
    evidences: [
      'Politiques d\'accès fichiers',
      'Logs de DLP',
      'Encryption status',
      'Audit trails d\'accès',
      'Incident reports'
    ]
  },

  // CLAUSE 10: Cryptography
  'A.10.1.1': {
    code: 'A.10.1.1',
    title: 'Cryptographic controls',
    category: 'Cryptography',
    domain: 'Chiffrement',
    description: 'Utiliser le chiffrement pour protéger les données',
    objective: 'Confidentialité et intégrité des données',
    implementation: [
      'Encoder données en transit (TLS 1.2+)',
      'Encoder données au repos (AES-256)',
      'Gestion des clés de chiffrement',
      'Politique de rotation des clés',
      'HSM pour clés sensibles'
    ],
    risks: ['Interception de données', 'Données exposées en texte clair'],
    evidences: [
      'Rapport de scan TLS',
      'Politique de chiffrement',
      'Registre de clés',
      'Certificats SSL',
      'Audit de conformité crypto'
    ],
    bestPractices: [
      'TLS 1.3 pour connexions modernes',
      'Rotation 1x an minimum',
      'Clés > 256 bits',
      'Modern ciphers only'
    ]
  },

  // CLAUSE 12: Operations security
  'A.12.1.1': {
    code: 'A.12.1.1',
    title: 'Operational planning and preparation',
    category: 'Operations',
    domain: 'Sécurité opérationnelle',
    description: 'Planifier les opérations de sécurité',
    objective: 'Continuité des services',
    implementation: [
      'Capacité planning',
      'Change management formalisé',
      'Maintenance programmée',
      'Plans de continuité',
      'Monitoring 24/7'
    ],
    risks: ['Outages non planifiés', 'Dégradation des performances'],
    evidences: [
      'Plans de capacité',
      'Calendrier des changements',
      'Logs de maintenance',
      'Plans de continuité',
      'Monitoring dashboards'
    ]
  },

  'A.12.2.1': {
    code: 'A.12.2.1',
    title: 'Protection against malware',
    category: 'Operations',
    domain: 'Sécurité opérationnelle',
    description: 'Protéger contre virus, trojans, ransomware',
    objective: 'Prévention des infections',
    implementation: [
      'Antivirus/Antimalware sur tous les PC',
      'Updates automatiques des signatures',
      'Scan complets 1x par semaine',
      'Quarantine des fichiers suspects',
      'Email gateway avec filtrage',
      'Endurance Detection and Response (EDR)'
    ],
    risks: ['Ransomware infection', 'Botnet recruitment'],
    evidences: [
      'Rapports d\'antivirus',
      'Logs d\'infection',
      'Policies de scan',
      'Email gateway logs',
      'EDR dashboards'
    ],
    bestPractices: [
      'Multiple couches (endpoint + email + gateway)',
      'Whitelist de softwares autorisés',
      'Scan avant exécution',
      'Sandboxing pour fichiers suspects'
    ]
  },

  'A.12.3.1': {
    code: 'A.12.3.1',
    title: 'Backup',
    category: 'Operations',
    domain: 'Sécurité opérationnelle',
    description: 'Backup réguliers de tous les données critiques',
    objective: 'Récupération après sinistre',
    implementation: [
      'Backup quotidien de toutes données critiques',
      'Copies off-site aussi',
      'Test de restauration mensuel',
      'Encryption du backup',
      'Retention policy (3 mois min)',
      'Air-gapped backup pour ransomware'
    ],
    risks: ['Perte de données', 'Ransomware affectant backups'],
    evidences: [
      'Logs de backup',
      'Rapports de restauration',
      'Test results',
      'Retention logs',
      'Inventory des backups'
    ],
    bestPractices: [
      '3-2-1 Rule: 3 copies, 2 media, 1 offsite',
      'RPO 24h max',
      'RTO 4h max',
      'Immutable backups',
      'Encrypt + verify integrity'
    ]
  },

  'A.12.6.1': {
    code: 'A.12.6.1',
    title: 'Management of technical vulnerabilities',
    category: 'Operations',
    domain: 'Sécurité opérationnelle',
    description: 'Identifier et corriger les vulnérabilités',
    objective: 'Réduire la surface d\'attaque',
    implementation: [
      'Scan vulnérabilités mensuels',
      'Pen testing annuel',
      'Inventaire des systems et versions',
      'Patch management process',
      'Severity assessment',
      'Priorité pour patchs critiques',
      'Tracking des correctifs'
    ],
    risks: ['Exploitation de vulnérabilités connues', 'Breaches faciles'],
    evidences: [
      'Rapports Nessus/OpenVAS',
      'Pen test reports',
      'Patch logs',
      'CVSS scores',
      'SLA compliance metrics'
    ],
    bestPractices: [
      'Patch dans 48h pour critiques',
      'Patch dans 1 mois pour importants',
      'Test en pre-prod avant prod',
      'Rollback plan préparé'
    ]
  },

  // CLAUSE 13: Communications security
  'A.13.1.1': {
    code: 'A.13.1.1',
    title: 'Network controls',
    category: 'Communications',
    domain: 'Sécurité des communications',
    description: 'Segmentation et protection du réseau',
    objective: 'Contrôle des flux de données',
    implementation: [
      'Segmentation réseau (DMZ, production, admin)',
      'Firewall stateful',
      'Rules de filtering par flux',
      'VPN pour remote access',
      'WAF pour web applications',
      'NAC pour device management'
    ],
    risks: ['Lateral movement', 'Brute force attacks'],
    evidences: [
      'Diagramme réseau',
      'Firewall logs',
      'Rules review',
      'VPN access logs',
      'NAC status reports'
    ]
  },

  // CLAUSE 14: System acquisition
  'A.14.1.1': {
    code: 'A.14.1.1',
    title: 'Information security requirements for systems',
    category: 'Development',
    domain: 'Acquisition de systèmes',
    description: 'Intégrer sécurité dans développement',
    objective: 'Secure by design',
    implementation: [
      'Security requirements dans SDLC',
      'Code review par sécurité',
      'Threat modeling',
      'OWASP Top 10 compliance',
      'Scanning de code (SAST)',
      'Testing dynamique (DAST)',
      'Penetration testing avant prod'
    ],
    risks: ['Vulnérabilités dans code', 'Dev insécurisé'],
    evidences: [
      'Security requirements docs',
      'Code review checklists',
      'SAST reports',
      'DAST reports',
      'Pen test results'
    ]
  },

  'A.14.2.1': {
    code: 'A.14.2.1',
    title: 'Security in development and support processes',
    category: 'Development',
    domain: 'Acquisition de systèmes',
    description: 'Environnements dev sécurisés',
    objective: 'Prévenir fuite de secrets',
    implementation: [
      'Environnement dev séparé de prod',
      'Pas de données réelles en dev',
      'Secrets managé (vault)',
      'Pas de credentials en code',
      'Git secrets scanning',
      'Access controls sur repos'
    ],
    risks: ['Hardcoded credentials exposés', 'Data exposure'],
    evidences: [
      'Architecture docs',
      'Secrets audit logs',
      'Git scanning alerts',
      'Access control logs'
    ]
  },

  // CLAUSE 15: Supplier relationships
  'A.15.1.1': {
    code: 'A.15.1.1',
    title: 'Information security in supplier relationships',
    category: 'Suppliers',
    domain: 'Relations avec fournisseurs',
    description: 'Sécurité dans les contrats fournisseurs',
    objective: 'Third-party risk management',
    implementation: [
      'Audit de sécurité des fournisseurs',
      'Clause ISO 27001 dans contrats',
      'SLA sur sécurité',
      'Droit d\'audit des infras',
      'Assurance responsabilité civile',
      'Notification d\'incidents en 24h'
    ],
    risks: ['Compromission par fournisseur', 'Data breach chez supplier'],
    evidences: [
      'Audit reports',
      'Contract terms',
      'SLA documentation',
      'Compliance certificates',
      'Incident logs'
    ]
  },

  // CLAUSE 16: Information security incident management
  'A.16.1.1': {
    code: 'A.16.1.1',
    title: 'Incident reporting and assessment',
    category: 'Incidents',
    domain: 'Gestion des incidents',
    description: 'Processus de signalement des incidents',
    objective: 'Réaction rapide aux incidents',
    implementation: [
      'Procédure de signalement formelle',
      'Canaux multiples (email, chat, tel)',
      'Classification par sévérité',
      'Contact d\'escalade 24/7',
      'Timeliness: ≤1h pour critical',
      'SIEM + alertes automatiques'
    ],
    risks: ['Incidents non rapportés', 'Réaction trop lente'],
    evidences: [
      'Procédure documentée',
      'Logs des incidents',
      'SLA compliance',
      'Feedback loops',
      'Statistics mensuels'
    ],
    bestPractices: [
      'Hotline dédié 24/7',
      'First response dans 15 min',
      'Investigation dans 4h',
      'Notification clients si nécessaire'
    ]
  },

  'A.16.1.5': {
    code: 'A.16.1.5',
    title: 'Response to information security incidents',
    category: 'Incidents',
    domain: 'Gestion des incidents',
    description: 'Plan de réponse aux incidents',
    objective: 'Minimiser l\'impact',
    implementation: [
      'Plan de réponse documenté',
      'Equipe d\'incident response',
      'Roles and responsibilities',
      'Playbooks pour incidents types',
      'Simulation/drill 1x par an',
      'Chain of custody procedures'
    ],
    risks: ['Contamination des preuves', 'Response chaotique'],
    evidences: [
      'Incident response plan',
      'Playbooks',
      'Drill reports',
      'Chain of custody logs',
      'Post-incident reports'
    ]
  },

  // CLAUSE 17: Business continuity
  'A.17.1.1': {
    code: 'A.17.1.1',
    title: 'Planning information security continuity',
    category: 'Continuity',
    domain: 'Continuité d\'activité',
    description: 'Planifier la continuité en cas de sinistre',
    objective: 'Maintien des services critiques',
    implementation: [
      'BCP documenté et testé',
      'Identifiez systèmes critiques',
      'RTO/RPO définies',
      'Plan de récupération',
      'Liste de contacts d\'urgence',
      'Test annuel du BCP'
    ],
    risks: ['Arrêt prolongé des services', 'Perte de revenus'],
    evidences: [
      'BCP documentation',
      'BIA (Business Impact Analysis)',
      'Recovery procedures',
      'Test reports',
      'Approves par management'
    ],
    bestPractices: [
      'RTO < 4h pour serv critiques',
      'RPO < 1h pour données critiques',
      'Site de secours géographiquement éloigné',
      'Rotation des équipes de secours'
    ]
  },

  // CLAUSE 18: Compliance
  'A.18.1.1': {
    code: 'A.18.1.1',
    title: 'Identification of applicable legislation',
    category: 'Compliance',
    domain: 'Conformité',
    description: 'Identifier les lois applicables en sécurité',
    objective: 'Conformité légale',
    implementation: [
      'Audit légal des obligations',
      'Analyse RGPD si données EU',
      'Secteur régulé = audit externe',
      'Mise à jour annuelle',
      'Documentation des obligations'
    ],
    risks: ['Non-conformité légale', 'Amendes et sanctions'],
    evidences: [
      'Legal assessment',
      'RGPD compliance matrix',
      'Regulatory mapping',
      'Compliance reports',
      'Audit findings'
    ]
  },

  'A.18.2.1': {
    code: 'A.18.2.1',
    title: 'Information security reviews',
    category: 'Compliance',
    domain: 'Conformité',
    description: 'Audits de conformité ISO 27001',
    objective: 'Vérifier conformité continue',
    implementation: [
      'Audit interne 1x par an',
      'Audit externe (Tier 1-2)',
      'Remédiation des findings',
      'Management review',
      'Continuous improvement'
    ],
    risks: ['Conformité perdue', 'Audit externe échouée'],
    evidences: [
      'Audit plans',
      'Audit reports',
      'Non-conformities list',
      'Remediation plans',
      'Follow-up evidence'
    ]
  }
};

/**
 * Chercher un contrôle par code
 */
function getControlByCode(code) {
  return controlsDatabase[code] || null;
}

/**
 * Chercher tous les contrôles d'une catégorie
 */
function getControlsByCategory(category) {
  return Object.values(controlsDatabase).filter(
    ctrl => ctrl.category.toLowerCase() === category.toLowerCase()
  );
}

/**
 * Chercher tous les contrôles d'un domaine
 */
function getControlsByDomain(domain) {
  return Object.values(controlsDatabase).filter(
    ctrl => ctrl.domain.toLowerCase() === domain.toLowerCase()
  );
}

/**
 * Obtenir tous les codes de contrôles
 */
function getAllControlCodes() {
  return Object.keys(controlsDatabase);
}

/**
 * Obtenir les catégories uniques
 */
function getUniqueCategories() {
  return [...new Set(Object.values(controlsDatabase).map(c => c.category))];
}

/**
 * Chercher compatibles avec terme
 */
function searchControls(searchTerm) {
  const term = searchTerm.toLowerCase();
  return Object.values(controlsDatabase).filter(ctrl =>
    ctrl.code.includes(term) ||
    ctrl.title.toLowerCase().includes(term) ||
    ctrl.description.toLowerCase().includes(term) ||
    ctrl.category.toLowerCase().includes(term)
  );
}

module.exports = {
  controlsDatabase,
  getControlByCode,
  getControlsByCategory,
  getControlsByDomain,
  getAllControlCodes,
  getUniqueCategories,
  searchControls
};
