const express = require('express');

module.exports = function(mctavish) {
  const router = express.Router();
  
  router.get('/', (req, res) => {
    try {
      const premonitionMatcher = mctavish.getPremonitionMatcher();
      const activePremonitions = premonitionMatcher.getActivePremonitions();
      res.json(activePremonitions);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  router.get('/bound', (req, res) => {
    try {
      const premonitionMatcher = mctavish.getPremonitionMatcher();
      const boundPremonitions = premonitionMatcher.getBoundPremonitions();
      res.json(boundPremonitions);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  router.post('/bind', (req, res) => {
    try {
      const { premonitionId, fractureId } = req.body;
      
      if (!premonitionId || !fractureId) {
        return res.status(400).json({ 
          error: 'Both premonitionId and fractureId are required' 
        });
      }
      
      const collapseEngine = mctavish.getCollapseEngine();
      const success = collapseEngine.bindPremonitionToFracture(premonitionId, fractureId);
      
      if (!success) {
        return res.status(404).json({ 
          error: 'Premonition or fracture not found, or binding failed' 
        });
      }
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  return router;
};
