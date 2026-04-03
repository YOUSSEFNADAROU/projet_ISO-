const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const Evaluation = require('../models/Evaluation');
const Control = require('../models/Control');

async function run() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/iso-audit', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('===== DÉTAIL DE CHAQUE ÉVALUATION RESTANTE =====\n');
    
    const evals = await Evaluation.find().populate('controlId').sort({ controlId: 1 });
    
    evals.forEach((e, idx) => {
      const control = e.controlId;
      console.log(`[${idx + 1}] ${control?.code || 'N/A'}`);
      console.log(`    Status: ${e.status}`);
      console.log(`    Updated: ${new Date(e.updatedAt).toLocaleString()}`);
      console.log(`    ID: ${e._id}`);
      console.log('');
    });
    
    await mongoose.disconnect();
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

run();
