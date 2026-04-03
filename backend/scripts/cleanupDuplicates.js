/**
 * Script pour nettoyer les évaluations dupliquées en base de données
 * Garde la plus récente (basée sur updatedAt) pour chaque controlId
 * 
 * Usage: node backend/scripts/cleanupDuplicates.js
 */

const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const Evaluation = require('../models/Evaluation'); 

async function cleanupDuplicates() {
  try {
    console.log('🔍 Recherche des contrôles avec doublons...');
    
    // Grouper par controlId et trouver les doublons
    const duplicates = await Evaluation.aggregate([
      {
        $group: {
          _id: '$controlId',
          count: { $sum: 1 },
          ids: { $push: '$_id' },
          updatedAts: { $push: '$updatedAt' }
        }
      },
      {
        $match: { count: { $gt: 1 } }
      }
    ]);

    console.log(`📊 Nombre de contrôles avec doublons: ${duplicates.length}`);

    if (duplicates.length === 0) {
      console.log('✅ Aucun doublon trouvé. Votre base de données est propre !');
      process.exit(0);
    }

    // Calculer combien de doublons seront supprimés
    let totalToDelete = 0;
    duplicates.forEach(dup => {
      totalToDelete += dup.count - 1;
      console.log(`  - controlId: ${dup._id}, évaluations: ${dup.count}, à supprimer: ${dup.count - 1}`);
    });

    console.log(`\n⚠️  Total d'évaluations à supprimer: ${totalToDelete}`);
    console.log('📝 Suppression en cours...\n');

    let deletedCount = 0;

    // Pour chaque contrôle avec doublons
    for (const duplicate of duplicates) {
      const { _id: controlId, ids, updatedAts } = duplicate;

      // Créer un tableau de tuples [id, updatedAt]
      const evaluationPairs = ids.map((id, index) => ({
        id,
        updatedAt: updatedAts[index]
      }));

      // Trier par updatedAt (les plus récents en dernier)
      evaluationPairs.sort((a, b) => new Date(a.updatedAt) - new Date(b.updatedAt));

      // Garder le dernier (le plus récent), supprimer les autres
      const toDelete = evaluationPairs.slice(0, -1).map(pair => pair.id);

      const result = await Evaluation.deleteMany({ _id: { $in: toDelete } });
      deletedCount += result.deletedCount;

      console.log(`✓ controlId ${controlId}: ${result.deletedCount} doublon(s) supprimé(s)`);
    }

    console.log(`\n✅ Nettoyage terminé! ${deletedCount} doublons supprimés.`);
    console.log('💡 Conseil: Vérifiez votre dashboard pour confirmer les chiffres');

  } catch (error) {
    console.error('❌ Erreur lors du nettoyage:', error.message);
    process.exit(1);
  }
}

// Connexion à la base et lancement
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/iso-audit', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => {
    console.log('🔗 Connecté à MongoDB\n');
    cleanupDuplicates();
  })
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Erreur de connexion:', error);
    process.exit(1);
  });
