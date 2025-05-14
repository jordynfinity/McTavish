const express = require('express');

module.exports = function(mctavish) {
  const router = express.Router();
  
  router.get('/:fractureId', (req, res) => {
    try {
      const { fractureId } = req.params;
      const interactionBinding = mctavish.getInteractionBinding();
      const memoryGraph = mctavish.getMemoryGraph();
      
      const fracture = memoryGraph.getNode(fractureId);
      if (!fracture || fracture.type !== 'fracture') {
        return res.status(404).json({ error: 'Fracture not found' });
      }
      
      const responseIds = interactionBinding.getResponsesForFracture(fractureId);
      const responses = responseIds.map(id => memoryGraph.getNode(id)).filter(Boolean);
      
      res.json(responses);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  router.post('/:id/select', (req, res) => {
    try {
      const { id } = req.params;
      const memoryGraph = mctavish.getMemoryGraph();
      
      const fold = memoryGraph.getNode(id);
      if (!fold || fold.type !== 'fold') {
        return res.status(404).json({ error: 'Response not found' });
      }
      
      mctavish.selectResponse(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  return router;
};
