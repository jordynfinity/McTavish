import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CharacterField, EmotionalState } from '../../types';
import { mockCharacters, mockEmotionalStates } from '../mockData/characters';

interface CharacterState {
  characters: CharacterField[];
  emotionalStates: Record<string, EmotionalState>;
  possessedCharacterId: string | null;
}

const initialState: CharacterState = {
  characters: mockCharacters,
  emotionalStates: mockEmotionalStates,
  possessedCharacterId: null,
};

export const characterSlice = createSlice({
  name: 'character',
  initialState,
  reducers: {
    possessCharacter: (state, action: PayloadAction<string>) => {
      state.possessedCharacterId = action.payload;
    },
    clearPossession: (state) => {
      state.possessedCharacterId = null;
    },
    updateEmotionalState: (state, action: PayloadAction<{ characterId: string, emotionalState: EmotionalState }>) => {
      state.emotionalStates[action.payload.characterId] = action.payload.emotionalState;
    }
  },
});

export const { possessCharacter, clearPossession, updateEmotionalState } = characterSlice.actions;

export default characterSlice.reducer;
