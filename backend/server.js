const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const scenarioRoutes = require('./routes/scenario');
const controlsRoutes = require('./routes/controls');
const evaluationsRoutes = require('./routes/evaluations');
const dashboardRoutes = require('./routes/dashboard');
const reportRoutes = require('./routes/report');

app.use('/api/scenario', scenarioRoutes);
app.use('/api/controls', controlsRoutes);
app.use('/api/evaluations', evaluationsRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/report', reportRoutes);

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/iso-audit', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('Connected to MongoDB');
  const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`Port ${PORT} déjà utilisé. Essayez de démarrer sur un autre port.`);
      const fallbackPort = Number(PORT) + 1;
      console.log(`Tentative de repli sur le port ${fallbackPort}...`);

      app.listen(fallbackPort, () => {
        console.log(`Server running on fallback port ${fallbackPort}`);
      }).on('error', (fallbackErr) => {
        if (fallbackErr.code === 'EADDRINUSE') {
          console.error(`Le port ${fallbackPort} est aussi occupé. Arrêt du serveur.`);
        } else {
          console.error('Erreur de fallback serveur:', fallbackErr);
        }
        process.exit(1);
      });
    } else {
      console.error('Erreur du serveur:', err);
      process.exit(1);
    }
  });
})
.catch((error) => {
  console.error('Database connection error:', error);
});