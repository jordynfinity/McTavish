import { createSlice, PayloadAction, Slice } from '@reduxjs/toolkit';
import { Premonition } from '../../types';
import { mockPremonitions } from '../mockData/premonitions';

interface PremonitionState {
  premonitions: Premonition[];
  activePremonitionId: string | null;
}

const initialState: PremonitionState = {
  premonitions: mockPremonitions,
  activePremonitionId: null,
};

export const premonitionSlice = createSlice({
  name: 'premonition',
  initialState,
  reducers: {
    emitPremonition: (state, action: PayloadAction<Premonition>) => {
      state.premonitions.push(action.payload);
    },
    setActivePremonition: (state, action: PayloadAction<string>) => {
      state.activePremonitionId = action.payload;
    },
    clearActivePremonition: (state, action: PayloadAction<void>) => {
      state.activePremonitionId = null;
    },
    bindPremonition: (state, action: PayloadAction<{ premonitionId: string, inputId: string }>) => {
    }
  },
}) as Slice<PremonitionState>;

export const { 
  emitPremonition, 
  setActivePremonition, 
  clearActivePremonition, 
  bindPremonition 
} = premonitionSlice.actions;

export default premonitionSlice.reducer;
