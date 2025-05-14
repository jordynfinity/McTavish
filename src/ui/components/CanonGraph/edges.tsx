import React, { memo } from 'react';
import { EdgeProps, getBezierPath } from 'reactflow';
import styled from 'styled-components';

const EdgePath = styled.path<{ edgeType: string }>`
  stroke: ${({ edgeType }) => 
    edgeType === 'causality' ? '#1890ff' :
    edgeType === 'emotional' ? '#eb2f96' :
    edgeType === 'divergence' ? '#fa8c16' :
    edgeType === 'contradiction' ? '#f5222d' : '#8c8c8c'
  };
  stroke-width: 2;
`;

const EdgeLabel = styled.div`
  font-size: 10px;
  background-color: white;
  padding: 2px 4px;
  border-radius: 4px;
`;

export const BindingLink = memo(({
  id,
  source,
  target,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  style = {},
  markerEnd,
}: EdgeProps) => {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const edgeType = data?.type || 'default';

  return (
    <>
      <EdgePath
        id={id}
        edgeType={edgeType}
        d={edgePath}
        markerEnd={markerEnd}
      />
      <EdgeLabel
        style={{
          position: 'absolute',
          transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
          pointerEvents: 'all',
        }}
      >
        {edgeType}
      </EdgeLabel>
    </>
  );
});
