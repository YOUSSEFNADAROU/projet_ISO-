const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const Evaluation = require('../models/Evaluation');

async function checkEvaluations() {
  try {
    console.log('🔍 Vérification de toutes les évaluations en DB...\n');
    
    const evals = await Evaluation.find().sort({ controlId: 1, updatedAt: -1 });
    console.log('===== TOUTES LES ÉVALUATIONS =====');
    console.log(`Total: ${evals.length}\n`);
    
    evals.forEach(e => {
      console.log(`Control: ${e.controlId} | Status: ${e.status} | Updated: ${new Date(e.updatedAt).toISOString()}`);
    });
    
    const duplicates = {};
    evals.forEach(e => {
      const cid = e.controlId.toString();
      if (!duplicates[cid]) duplicates[cid] = [];
      duplicates[cid].push({ status: e.status, id: e._id, date: e.updatedAt });
    });
    
    console.log(`\n===== ANALYSE DOUBLONS =====`);
    let hasDups = false;
    Object.entries(duplicates).forEach(([cid, items]) => {
      if (items.length > 1) {
        hasDups = true;
        console.log(`\nControl ${cid}: ${items.length} évaluations`);
        items.forEach((item, idx) => {
          console.log(`  [${idx}] Status: ${item.status} | ID: ${item.id}`);
        });
      }
    });
    
    if (!hasDups) {
      console.log('✅ Aucun doublon détecté.');
    }
    
    // Résumé par statut
    const statusCount = {};
    evals.forEach(e => {
      statusCount[e.status] = (statusCount[e.status] || 0) + 1;
    });
    
    console.log(`\n===== RÉSUMÉ STATUTS =====`);
    Object.entries(statusCount).forEach(([status, count]) => {
      console.log(`${status}: ${count}`);
    });

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/iso-audit', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => {
    console.log('🔗 Connecté à MongoDB\n');
    checkEvaluations();
  })
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Erreur de connexion:', error);
    process.exit(1);
  });
