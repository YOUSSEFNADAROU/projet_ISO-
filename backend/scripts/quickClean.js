const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const Evaluation = require('../models/Evaluation');

async function run() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/iso-audit';
    console.log('Connexion à:', mongoUri);
    
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000
    });
    
    console.log('✅ Connecté\n');
    
    // Étape 1: Compter avant
    const countBefore = await Evaluation.countDocuments();
    console.log(`Avant: ${countBefore} évaluations`);
    
    // Étape 2: Supprimer les doublons (garder le plus récent par controlId)
    const result = await Evaluation.collection.aggregate([
      {
        $sort: { controlId: 1, updatedAt: -1 }
      },
      {
        $group: {
          _id: '$controlId',
          ids: { $push: '$_id' },
          keepId: { $first: '$_id' }
        }
      },
      {
        $project: {
          _id: 0,
          controlId: '$_id',
          toDelete: {
            $slice: ['$ids', 1, { $size: '$ids' }]
          }
        }
      }
    ]).toArray();
    
    console.log(`Contrôles avec doublons: ${result.length}`);
    
    let totalDeleted = 0;
    for (const doc of result) {
      if (doc.toDelete && doc.toDelete.length > 0) {
        const r = await Evaluation.deleteMany({ _id: { $in: doc.toDelete } });
        totalDeleted += r.deletedCount;
        console.log(`  Control ${doc.controlId}: ${r.deletedCount} supprimés`);
      }
    }
    
    // Étape 3: Compter après
    const countAfter = await Evaluation.countDocuments();
    console.log(`\nAprès: ${countAfter} évaluations (supprimé ${totalDeleted})`);
    
    // Étape 4: Résumé par statut
    const conforme = await Evaluation.countDocuments({ status: 'Conforme' });
    const partiel = await Evaluation.countDocuments({ status: 'Partiellement conforme' });
    const nonConforme = await Evaluation.countDocuments({ status: 'Non conforme' });
    
    console.log(`\n✅ État final:`);
    console.log(`  Conformes: ${conforme}`);
    console.log(`  Partiellement: ${partiel}`);
    console.log(`  Non-conformes: ${nonConforme}`);
    
    await mongoose.disconnect();
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

run();
