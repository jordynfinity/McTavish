import React, { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../redux/store';
import { possessCharacter, clearPossession } from '../../redux/characterSlice';
import styled from 'styled-components';

const CharacterListContainer = styled.div`
  width: 250px;
  height: 100%;
  background-color: #f0f2f5;
  border-right: 1px solid #d9d9d9;
  overflow-y: auto;
  padding: 16px;
`;

const CharacterCard = styled.div<{ isActive: boolean }>`
  padding: 12px;
  margin-bottom: 12px;
  border-radius: 4px;
  background-color: ${({ isActive }) => isActive ? '#e6f7ff' : 'white'};
  border: 1px solid ${({ isActive }) => isActive ? '#91d5ff' : '#d9d9d9'};
  cursor: pointer;
  transition: all 0.3s;
  
  &:hover {
    border-color: #40a9ff;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.09);
  }
`;

const CharacterName = styled.div`
  font-weight: bold;
  margin-bottom: 8px;
`;

const CharacterTone = styled.div`
  font-size: 12px;
  color: #8c8c8c;
  margin-bottom: 8px;
`;

const MoodRing = styled.div<{ emotion: string }>`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  margin-right: 8px;
  background-color: ${({ emotion }) => {
    switch (emotion) {
      case 'joy': return '#52c41a';
      case 'sadness': return '#1890ff';
      case 'anger': return '#f5222d';
      case 'fear': return '#722ed1';
      case 'surprise': return '#faad14';
      case 'disgust': return '#eb2f96';
      case 'curiosity': return '#13c2c2';
      case 'helpfulness': return '#52c41a';
      case 'exhaustion': return '#8c8c8c';
      case 'melancholy': return '#096dd9';
      case 'bitterness': return '#cf1322';
      default: return '#8c8c8c';
    }
  }};
`;

const CharacterInfo = styled.div`
  display: flex;
  align-items: center;
`;

const CollapseIndicator = styled.div<{ threshold: number }>`
  width: 100%;
  height: 4px;
  margin-top: 8px;
  background-color: #f5f5f5;
  border-radius: 2px;
  overflow: hidden;
  
  &::after {
    content: '';
    display: block;
    height: 100%;
    width: ${({ threshold }) => `${threshold * 100}%`};
    background-color: #1890ff;
  }
`;

export const CharacterList: React.FC = () => {
  const dispatch = useDispatch();
  const characters = useSelector((state: RootState) => state.character.characters);
  const emotionalStates = useSelector((state: RootState) => state.character.emotionalStates);
  const possessedCharacterId = useSelector((state: RootState) => state.character.possessedCharacterId);
  
  const handleCharacterClick = useCallback((characterId: string) => {
    if (possessedCharacterId === characterId) {
      dispatch(clearPossession());
    } else {
      dispatch(possessCharacter(characterId));
    }
  }, [dispatch, possessedCharacterId]);
  
  return (
    <CharacterListContainer>
      <h3>Characters</h3>
      {characters.map((character) => {
        const emotionalState = emotionalStates[character.id];
        const dominantEmotion = emotionalState?.dominant || character.toneProfile.baseline;
        
        return (
          <CharacterCard 
            key={character.id}
            isActive={possessedCharacterId === character.id}
            onClick={() => handleCharacterClick(character.id)}
          >
            <CharacterName>{character.name}</CharacterName>
            <CharacterTone>
              Tone: {dominantEmotion}
              {emotionalState?.secondary && ` / ${emotionalState.secondary}`}
            </CharacterTone>
            <CharacterInfo>
              <MoodRing emotion={dominantEmotion} />
              <div>
                Intensity: {emotionalState?.intensity.toFixed(2) || '0.00'}
              </div>
            </CharacterInfo>
            <CollapseIndicator threshold={character.collapseThreshold} />
          </CharacterCard>
        );
      })}
    </CharacterListContainer>
  );
};
