import React, { useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../redux/store';
import { addFracture, addFold } from '../../redux/canonSlice';
import styled from 'styled-components';
import { v4 as uuidv4 } from 'uuid';
import { FractureEvent, RecursionFold } from '../../../types';

const CollapsePaneContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: white;
  border-left: 1px solid #d9d9d9;
  width: 350px;
`;

const MessageList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px;
`;

const MessageItem = styled.div<{ isUser: boolean }>`
  margin-bottom: 16px;
  display: flex;
  flex-direction: ${({ isUser }) => isUser ? 'row-reverse' : 'row'};
`;

const MessageBubble = styled.div<{ isUser: boolean }>`
  max-width: 80%;
  padding: 12px;
  border-radius: 8px;
  background-color: ${({ isUser }) => isUser ? '#1890ff' : '#f0f2f5'};
  color: ${({ isUser }) => isUser ? 'white' : 'inherit'};
`;

const MessageContent = styled.div`
  margin-bottom: 4px;
`;

const MessageMeta = styled.div<{ isUser: boolean }>`
  font-size: 10px;
  color: ${({ isUser }) => isUser ? 'rgba(255, 255, 255, 0.7)' : '#8c8c8c'};
  text-align: ${({ isUser }) => isUser ? 'right' : 'left'};
`;

const InputContainer = styled.div`
  padding: 16px;
  border-top: 1px solid #d9d9d9;
  display: flex;
`;

const MessageInput = styled.input`
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  margin-right: 8px;
`;

const SendButton = styled.button`
  padding: 8px 16px;
  background-color: #1890ff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  
  &:hover {
    background-color: #40a9ff;
  }
  
  &:disabled {
    background-color: #d9d9d9;
    cursor: not-allowed;
  }
`;

const ToggleButton = styled.button`
  padding: 8px 16px;
  background-color: #f0f2f5;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  margin-bottom: 16px;
  cursor: pointer;
  
  &:hover {
    background-color: #e6f7ff;
  }
`;

export const CollapsePane: React.FC = () => {
  const dispatch = useDispatch();
  const [inputValue, setInputValue] = useState('');
  const [showLayers, setShowLayers] = useState(false);
  
  const fractures = useSelector((state: RootState) => state.canon.fractures);
  const folds = useSelector((state: RootState) => state.canon.folds);
  const possessedCharacterId = useSelector((state: RootState) => state.character.possessedCharacterId);
  const emotionalStates = useSelector((state: RootState) => state.character.emotionalStates);
  
  const messages = [...fractures, ...folds].sort((a, b) => a.timestamp - b.timestamp);
  
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  }, []);
  
  const handleSendMessage = useCallback(() => {
    if (!inputValue.trim()) return;
    
    if (possessedCharacterId) {
      const fold: RecursionFold = {
        id: uuidv4(),
        content: inputValue,
        timestamp: Date.now(),
        characterId: possessedCharacterId,
        emotionalState: emotionalStates[possessedCharacterId] || {
          dominant: 'neutral',
          intensity: 0.5,
          stability: 0.5
        }
      };
      dispatch(addFold(fold));
    } else {
      const fracture: FractureEvent = {
        id: uuidv4(),
        content: inputValue,
        timestamp: Date.now(),
        source: 'user'
      };
      dispatch(addFracture(fracture));
    }
    
    setInputValue('');
  }, [inputValue, possessedCharacterId, emotionalStates, dispatch]);
  
  const handleKeyPress = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  }, [handleSendMessage]);
  
  const toggleLayers = useCallback(() => {
    setShowLayers(!showLayers);
  }, [showLayers]);
  
  return (
    <CollapsePaneContainer>
      <MessageList>
        <ToggleButton onClick={toggleLayers}>
          {showLayers ? 'Hide Collapse Layers' : 'Show Collapse Layers'}
        </ToggleButton>
        
        {messages.map((message) => {
          const isUser = 'source' in message && message.source === 'user';
          const characterName = !isUser && 'characterId' in message
            ? `Character ${message.characterId.substring(0, 8)}`
            : 'User';
          
          return (
            <MessageItem key={message.id} isUser={isUser}>
              <MessageBubble isUser={isUser}>
                <MessageContent>{message.content}</MessageContent>
                <MessageMeta isUser={isUser}>
                  {characterName} • {new Date(message.timestamp).toLocaleTimeString()}
                </MessageMeta>
              </MessageBubble>
            </MessageItem>
          );
        })}
      </MessageList>
      
      <InputContainer>
        <MessageInput
          value={inputValue}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          placeholder={possessedCharacterId ? "Speak as character..." : "Type a message..."}
        />
        <SendButton onClick={handleSendMessage} disabled={!inputValue.trim()}>
          Send
        </SendButton>
      </InputContainer>
    </CollapsePaneContainer>
  );
};
