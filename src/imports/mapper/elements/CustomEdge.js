import React, { useEffect, useState } from 'react';
import { EdgeText, getBezierPath, getMarkerEnd, getEdgeCenter  } from 'react-flow-renderer';
import { usePayload } from '../usePayload';

export default function CustomEdge({
  id,
  source,
  target,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  data,
  arrowHeadType= "arrowclosed",
  markerEndId,
}) {
  const [label, setLabel] = useState()
  const edgePath = getBezierPath({ sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition });
  const markerEnd = getMarkerEnd(arrowHeadType, markerEndId);
  const content = usePayload()
  const [centerX, centerY] = getEdgeCenter({ sourceX, sourceY, targetX, targetY })

  useEffect(()=>{
    if(content?.payload){
      setLabel(content.payload[source])
    }
  },[content, source, target])
  
  return (
    <>
      <path id={id} style={style} className="react-flow__edge-path" d={edgePath} markerEnd={markerEnd} />
      {label && (<EdgeText
        x={centerX}
        y={centerY}
        label={label}
        labelStyle={{ fill: 'white' }}
        labelShowBg
        labelBgStyle={{ fill: 'red' }}
        labelBgPadding={[4, 4]}
        labelBgBorderRadius={4}
        />)}
    </>
  );
}
