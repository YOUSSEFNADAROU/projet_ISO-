const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const Evaluation = require('../models/Evaluation');

async function forceCleanup() {
  try {
    console.log('🔗 Nettoyage forcé - suppression de TOUS les doublons...\n');
    
    // Obtenir la liste unique des controlId
    const uniqueControls = await Evaluation.distinct('controlId');
    console.log(`Found ${uniqueControls.length} unique controls\n`);
    
    let totalDeleted = 0;
    
    for (const controlId of uniqueControls) {
      // Pour chaque contrôle, garder SEULEMENT le plus récent
      const evals = await Evaluation.find({ controlId }).sort({ updatedAt: -1 });
      
      if (evals.length > 1) {
        // Garder le premier (le plus récent), supprimer les autres
        const toKeep = evals[0]._id;
        const result = await Evaluation.deleteMany({ 
          controlId, 
          _id: { $ne: toKeep } 
        });
        
        if (result.deletedCount > 0) {
          console.log(`✓ Control ${controlId}: ${result.deletedCount} doublon(s) supprimé(s)`);
          totalDeleted += result.deletedCount;
        }
      }
    }
    
    console.log(`\n✅ Nettoyage terminé! ${totalDeleted} doublons supprimés.`);
    
    // Afficher le résumé final
    const finalCount = await Evaluation.countDocuments();
    const conformeCount = await Evaluation.countDocuments({ status: 'Conforme' });
    const partielCount = await Evaluation.countDocuments({ status: 'Partiellement conforme' });
    const nonCount = await Evaluation.countDocuments({ status: 'Non conforme' });
    
    console.log(`\n===== STATE FINAL =====`);
    console.log(`Total évaluations: ${finalCount}`);
    console.log(`Conformes: ${conformeCount}`);
    console.log(`Partiellement conformes: ${partielCount}`);
    console.log(`Non conformes: ${nonCount}`);
    
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
    forceCleanup();
  })
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Erreur de connexion:', error);
    process.exit(1);
  });
