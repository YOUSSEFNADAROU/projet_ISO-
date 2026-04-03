const mongoose = require('mongoose');
const Scenario = require('../models/Scenario');
const Control = require('../models/Control');
const Evaluation = require('../models/Evaluation');

require('dotenv').config();

const connectDB = async () => {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/iso-audit');
};

const seedEvaluations = async () => {
  try {
    await connectDB();
    console.log('✅ Connecté à la base de données');

    // Récupérer les contrôles existants
    const controls = await Control.find().limit(10);
    const scenario = await Scenario.findOne();

    if (!controls.length) {
      console.error('❌ Aucun contrôle trouvé. Exécutez d\'abord: npm run seed');
      process.exit(1);
    }

    if (!scenario) {
      console.error('❌ Aucun scénario trouvé. Exécutez d\'abord: npm run seed');
      process.exit(1);
    }

    // Supprimer les évaluations existantes
    await Evaluation.deleteMany();
    console.log('🗑️ Évaluations précédentes supprimées');

    // Créer des évaluations avec des données réalistes
    const evaluations = controls.map((control, index) => {
      const statuses = ['Conforme', 'Partiellement conforme', 'Non conforme'];
      const severities = ['faible', 'moyenne', 'élevée'];
      const probabilities = ['faible', 'moyenne', 'élevée'];
      
      // Varier les statuts: 40% conforme, 40% partiellement, 20% non conforme
      let status;
      if (index % 5 === 0) status = 'Non conforme';
      else if (index % 5 < 2) status = 'Partiellement conforme';
      else status = 'Conforme';

      return {
        controlId: control._id,
        status: status,
        justification: `Évaluation du contrôle ${control.code}: ${control.title}. Justification: Ce contrôle a été évalué selon les critères ISO 2700x.`,
        severity: severities[Math.floor(Math.random() * severities.length)],
        probability: probabilities[Math.floor(Math.random() * probabilities.length)],
        riskLevel: status === 'Non conforme' ? 'Élevé' : (status === 'Partiellement conforme' ? 'Moyen' : 'Faible'),
        recommendation: `Pour améliorer ${control.code}, il est recommandé de: 1) Analyser les lacunes actuelles, 2) Mettre en place des correctifs, 3) Documenter les actions.`,
        remediationScore: status === 'Conforme' ? 100 : (status === 'Partiellement conforme' ? 60 : 20),
        remediationComments: 'Actions de remédiation en cours',
        remediationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 jours
      };
    });

    // Insérer les évaluations
    await Evaluation.insertMany(evaluations);
    console.log(`✅ ${evaluations.length} évaluations créées avec succès`);

    // Afficher un résumé
    const conformes = evaluations.filter(e => e.status === 'Conforme').length;
    const partielles = evaluations.filter(e => e.status === 'Partiellement conforme').length;
    const nonConformes = evaluations.filter(e => e.status === 'Non conforme').length;

    console.log('\n📊 Résumé:');
    console.log(`  ✅ Conformes: ${conformes}`);
    console.log(`  ⚠️  Partiellement: ${partielles}`);
    console.log(`  ❌ Non conformes: ${nonConformes}`);
    console.log('\n🎯 Vous pouvez maintenant cliquer sur "Plan d\'Action" pour générer redemé plan!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
};

seedEvaluations();
