import React from 'react';
import { ReactFlowProvider } from 'reactflow';
import { Provider } from 'react-redux';
import { store } from './redux/store';
import styled from 'styled-components';
import { CanonGraph } from './components/CanonGraph/CanonGraph';
import { CanonTimeline } from './components/CanonTimeline/CanonTimeline';
import { CharacterList } from './components/CharacterList/CharacterList';
import { CollapsePane } from './components/CollapsePane/CollapsePane';
import { PremonitionOverlay } from './components/PremonitionOverlay/PremonitionOverlay';

const AppContainer = styled.div`
  display: flex;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
`;

const MainContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
`;

const GraphContainer = styled.div`
  flex: 1;
  position: relative;
`;

export const App: React.FC = () => {
  return (
    <Provider store={store}>
      <ReactFlowProvider>
        <AppContainer>
          <CharacterList />
          
          <MainContent>
            <GraphContainer>
              <CanonGraph />
              <PremonitionOverlay />
            </GraphContainer>
            <CanonTimeline />
          </MainContent>
          
          <CollapsePane />
        </AppContainer>
      </ReactFlowProvider>
    </Provider>
  );
};

export default App;
