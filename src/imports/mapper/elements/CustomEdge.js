import React, { useEffect } from 'react';
import { EdgeText, getBezierPath, getMarkerEnd, getEdgeCenter  } from 'react-flow-renderer';

export default function CustomEdge({
  id,
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
  const edgePath = getBezierPath({ sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition });
  const markerEnd = getMarkerEnd(arrowHeadType, markerEndId);

  useEffect(()=>{
    console.log("arrowHeadType", arrowHeadType)
  },[arrowHeadType])
  // const [centerX, centerY, offsetX, offsetY] = getEdgeCenter({ sourceX, sourceY, targetX, targetY })

  return (
    <>
      <path id={id} style={style} className="react-flow__edge-path" d={edgePath} markerEnd={markerEnd} />
      {/* <EdgeText
        x={centerX}
        y={centerY}
        label="a label"
        labelStyle={{ fill: 'white' }}
        labelShowBg
        labelBgStyle={{ fill: 'red' }}
        labelBgPadding={[4, 4]}
        labelBgBorderRadius={4}
        />; */}
    </>
  );
}

{/* <text>
        <textPath href={`#${id}`} style={{ fontSize: '12px' }} startOffset="50%" textAnchor="middle">
          {data.text}
        </textPath>
      </text> */}