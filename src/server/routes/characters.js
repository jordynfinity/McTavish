const express = require('express');

module.exports = function(mctavish) {
  const router = express.Router();
  
  router.get('/', (req, res) => {
    try {
      const characterKernel = mctavish.getCharacterKernel();
      const characters = characterKernel.getCharacters();
      res.json(characters);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  router.get('/:id', (req, res) => {
    try {
      const { id } = req.params;
      const characterKernel = mctavish.getCharacterKernel();
      const character = characterKernel.getCharacter(id);
      
      if (!character) {
        return res.status(404).json({ error: 'Character not found' });
      }
      
      res.json(character);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  router.post('/', (req, res) => {
    try {
      const { name, traits = {}, emotionalState = {} } = req.body;
      
      if (!name) {
        return res.status(400).json({ error: 'Character name is required' });
      }
      
      const characterKernel = mctavish.getCharacterKernel();
      const characterId = characterKernel.createCharacter(name, traits, emotionalState);
      const character = characterKernel.getCharacter(characterId);
      
      res.status(201).json(character);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  router.put('/:id', (req, res) => {
    try {
      const { id } = req.params;
      const { traits, emotionalState } = req.body;
      
      const characterKernel = mctavish.getCharacterKernel();
      const character = characterKernel.getCharacter(id);
      
      if (!character) {
        return res.status(404).json({ error: 'Character not found' });
      }
      
      if (traits) {
        characterKernel.updateCharacterTraits(id, traits);
      }
      
      if (emotionalState) {
        characterKernel.updateCharacterEmotionalState(id, emotionalState);
      }
      
      const updatedCharacter = characterKernel.getCharacter(id);
      res.json(updatedCharacter);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  return router;
};
