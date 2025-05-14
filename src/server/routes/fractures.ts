/**
 * Fractures API Routes
 * 
 * Handles HTTP endpoints for fracture events:
 * - GET / - Retrieve all fractures
 * - GET /:id - Retrieve a specific fracture
 * - POST / - Create a new fracture
 */

import express from 'express';
import { McTavish } from '../../index';
import { FractureEvent } from '../../types';

export default function(mctavish: McTavish) {
  const router = express.Router();
  
  // Get all fractures
  router.get('/', (req, res) => {
    try {
      const memoryGraph = mctavish.getMemoryGraph();
      const fractures = memoryGraph.getNodesByType('fracture');
      res.json(fractures);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Get a specific fracture
  router.get('/:id', (req, res) => {
    try {
      const { id } = req.params;
      const memoryGraph = mctavish.getMemoryGraph();
      const fracture = memoryGraph.getNode(id);
      
      if (!fracture || fracture.type !== 'fracture') {
        return res.status(404).json({ error: 'Fracture not found' });
      }
      
      res.json(fracture);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Create a new fracture
  router.post('/', (req, res) => {
    try {
      const { content, source = 'user' } = req.body;
      
      if (!content) {
        return res.status(400).json({ error: 'Content is required' });
      }
      
      if (source !== 'user' && source !== 'system') {
        return res.status(400).json({ error: 'Source must be "user" or "system"' });
      }
      
      mctavish.introduceFracture(content, source);
      
      const memoryGraph = mctavish.getMemoryGraph();
      const fractures = memoryGraph.getNodesByType('fracture');
      const latestFracture = fractures.reduce((latest: any, current: any) => {
        return current.timestamp > latest.timestamp ? current : latest;
      }, { timestamp: 0 });
      
      res.status(201).json(latestFracture);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Get responses for a specific fracture
  router.get('/:id/responses', (req, res) => {
    try {
      const { id } = req.params;
      const interactionBinding = mctavish.getInteractionBinding();
      const responses = interactionBinding.getResponsesForFracture(id);
      
      if (!responses || responses.length === 0) {
        return res.json([]);
      }
      
      const memoryGraph = mctavish.getMemoryGraph();
      const responseNodes = responses.map(responseId => memoryGraph.getNode(responseId))
                                    .filter(node => node !== null);
      
      res.json(responseNodes);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  return router;
}
