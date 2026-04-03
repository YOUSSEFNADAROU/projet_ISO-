const mongoose = require('mongoose');
const Scenario = require('../models/Scenario');
const Control = require('../models/Control');
const Evidence = require('../models/Evidence');

require('dotenv').config();

const connectDB = async () => {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/iso-audit');
};

const seedData = async () => {
  await connectDB();

  // Clear existing data
  await Scenario.deleteMany();
  await Control.deleteMany();
  await Evidence.deleteMany();

  // Seed Scenario
  const scenario = new Scenario({
    name: 'E-Commerce Plus',
    sector: 'E-commerce',
    size: 'PME (50 employés)',
    keySystems: ['Site web de vente en ligne', 'Système de paiement', 'Base de données clients', 'Serveur de stockage'],
    securityContext: 'Entreprise gérant des données sensibles de clients et des transactions financières.',
    auditObjective: 'Évaluer la conformité aux normes ISO 27001 pour renforcer la sécurité des informations.',
  });
  await scenario.save();

  // Seed Controls
  const controlsData = [
    {
      internalId: '1',
      code: 'A.9.1.1',
      title: 'Contrôle d\'accès aux systèmes d\'information',
      description: 'Assurer que l\'accès aux systèmes est contrôlé.',
      objective: 'Prévenir les accès non autorisés.',
      category: 'Contrôle d\'accès',
    },
    {
      internalId: '2',
      code: 'A.9.2.1',
      title: 'Gestion des mots de passe utilisateur',
      description: 'Définir des règles pour la gestion des mots de passe.',
      objective: 'Renforcer la sécurité des comptes.',
      category: 'Contrôle d\'accès',
    },
    {
      internalId: '3',
      code: 'A.12.1.1',
      title: 'Sécurité des opérations',
      description: 'Maintenir la sécurité des opérations informatiques.',
      objective: 'Assurer la continuité des services.',
      category: 'Opérations',
    },
    {
      internalId: '4',
      code: 'A.12.2.1',
      title: 'Protection contre les logiciels malveillants',
      description: 'Implémenter des mesures contre les virus et malware.',
      objective: 'Protéger les systèmes contre les attaques.',
      category: 'Opérations',
    },
    {
      internalId: '5',
      code: 'A.13.1.1',
      title: 'Sécurité des communications réseau',
      description: 'Sécuriser les communications réseau.',
      objective: 'Prévenir les interceptions.',
      category: 'Communications',
    },
    {
      internalId: '6',
      code: 'A.14.1.1',
      title: 'Acquisition, développement et maintenance',
      description: 'Sécuriser le développement des systèmes.',
      objective: 'Intégrer la sécurité dès la conception.',
      category: 'Acquisition',
    },
    {
      internalId: '7',
      code: 'A.15.1.1',
      title: 'Relations avec les fournisseurs',
      description: 'Gérer la sécurité avec les fournisseurs.',
      objective: 'Assurer la sécurité des chaînes d\'approvisionnement.',
      category: 'Fournisseurs',
    },
    {
      internalId: '8',
      code: 'A.16.1.1',
      title: 'Gestion des incidents de sécurité',
      description: 'Définir des procédures pour les incidents.',
      objective: 'Réagir rapidement aux menaces.',
      category: 'Incidents',
    },
    {
      internalId: '9',
      code: 'A.17.1.1',
      title: 'Continuité d\'activité',
      description: 'Planifier la continuité des opérations.',
      objective: 'Minimiser les interruptions.',
      category: 'Continuité',
    },
    {
      internalId: '10',
      code: 'A.18.1.1',
      title: 'Conformité',
      description: 'Assurer la conformité légale et réglementaire.',
      objective: 'Respecter les exigences légales.',
      category: 'Conformité',
    },
  ];

  const controls = [];
  for (const data of controlsData) {
    const control = new Control(data);
    await control.save();
    controls.push(control);
  }

  // Seed Evidence
  const evidenceData = [
    { controlId: controls[0]._id, type: 'procedure', content: 'Procédure d\'accès : Authentification à deux facteurs requise.' },
    { controlId: controls[0]._id, type: 'logs', content: 'Logs d\'accès : Dernière connexion le 2023-10-01.' },
    { controlId: controls[1]._id, type: 'configuration', content: 'Politique mot de passe : Minimum 8 caractères, expiration tous les 90 jours.' },
    { controlId: controls[2]._id, type: 'constat', content: 'Sauvegardes quotidiennes effectuées.' },
    { controlId: controls[3]._id, type: 'note', content: 'Antivirus installé sur tous les serveurs.' },
    { controlId: controls[4]._id, type: 'configuration', content: 'VPN configuré pour les accès distants.' },
    { controlId: controls[5]._id, type: 'procedure', content: 'Révision de code incluant vérifications de sécurité.' },
    { controlId: controls[6]._id, type: 'note', content: 'Contrats fournisseurs incluant clauses de sécurité.' },
    { controlId: controls[7]._id, type: 'procedure', content: 'Plan de réponse aux incidents documenté.' },
    { controlId: controls[8]._id, type: 'constat', content: 'Plan de continuité testé annuellement.' },
    { controlId: controls[9]._id, type: 'note', content: 'Audit de conformité RGPD réalisé.' },
  ];

  for (const data of evidenceData) {
    const evidence = new Evidence(data);
    await evidence.save();
  }

  console.log('Seed completed');
  process.exit();
};

seedData();