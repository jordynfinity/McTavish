import React, { useCallback, useMemo } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  NodeTypes,
  EdgeTypes,
  OnConnect,
  Connection,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../redux/store';
import { selectNode } from '../../redux/canonSlice';
import { CharacterNode, EventNode, GhostNode, DivergenceNode } from './nodes';
import { BindingLink } from './edges';
import { mockFlowNodes, mockFlowEdges } from '../../mockData/canon';
import { mockGhostNodes } from '../../mockData/premonitions';
import styled from 'styled-components';

const GraphContainer = styled.div`
  width: 100%;
  height: 100%;
  background-color: #fafafa;
`;

const nodeTypes: NodeTypes = {
  characterNode: CharacterNode,
  eventNode: EventNode,
  ghostNode: GhostNode,
  divergenceNode: DivergenceNode,
};

const edgeTypes: EdgeTypes = {
  bindingLink: BindingLink,
};

const layoutNodes = (nodes: Node[]): Node[] => {
  const centerX = 500;
  const centerY = 300;
  const radius = 250;
  
  return nodes.map((node, i) => {
    const angle = (i * 2 * Math.PI) / nodes.length;
    return {
      ...node,
      position: {
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
      },
    };
  });
};

export const CanonGraph: React.FC = () => {
  const dispatch = useDispatch();
  
  const showPremonitions = useSelector((state: RootState) => state.ui.showPremonitions);
  const selectedNodeId = useSelector((state: RootState) => state.canon.selectedNodeId);
  
  const initialNodes = useMemo(() => {
    const baseNodes = layoutNodes(mockFlowNodes);
    return showPremonitions 
      ? [...baseNodes, ...layoutNodes(mockGhostNodes)]
      : baseNodes;
  }, [showPremonitions]);
  
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(mockFlowEdges);
  
  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    dispatch(selectNode(node.id));
  }, [dispatch]);
  
  const onConnect: OnConnect = useCallback((connection: Connection) => {
    setEdges((eds) => [...eds, {
      ...connection,
      id: `${connection.source}-${connection.target}`,
      type: 'bindingLink',
      data: { type: 'causality', weight: 1.0 },
      label: 'causality'
    } as Edge]);
  }, [setEdges]);
  
  return (
    <GraphContainer>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
      >
        <Background />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </GraphContainer>
  );
};
