const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const Evaluation = require('../models/Evaluation');

async function resetAllEvaluations() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/iso-audit', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('⚠️  RÉINITIALISATION: Suppression de TOUTES les évaluations\n');
    
    const result = await Evaluation.deleteMany({});
    
    console.log(`✅ ${result.deletedCount} évaluations supprimées`);
    console.log('La BD est maintenant vierge. Tu peux recommencer à zéro.');
    
    await mongoose.disconnect();
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

resetAllEvaluations();
