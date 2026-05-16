import React from 'react';

// Shape renderers for SVG flowchart
export function FlowchartSVG({ nodes, connections, selectedNode, onNodeClick, onNodeDragStart, interactive = false }) {
  if (!nodes || nodes.length === 0) {
    return (
      <div className="flowchart-empty">
        <div className="flowchart-empty-icon">📐</div>
        <p>Henüz akış şeması oluşturulmadı</p>
        <p className="flowchart-empty-hint">Algoritma yazıp "Akış Şeması Oluştur" butonuna tıklayın</p>
      </div>
    );
  }

  // Calculate viewBox with minimum dimensions
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const n of nodes) {
    const hw = (n.width || 180) / 2 + 60;
    const hh = (n.height || 56) / 2 + 40;
    minX = Math.min(minX, n.x - hw);
    maxX = Math.max(maxX, n.x + hw);
    minY = Math.min(minY, n.y - hh);
    maxY = Math.max(maxY, n.y + hh);
  }
  const padding = 80;
  const vbX = minX - padding;
  const vbY = minY - padding;
  const vbW = (maxX - minX) + padding * 2;
  const vbH = (maxY - minY) + padding * 2;

  return (
    <svg
      className="flowchart-svg"
      viewBox={`${vbX} ${vbY} ${vbW} ${vbH}`}
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
          <polygon points="0 0, 10 3.5, 0 7" fill="#64748b" />
        </marker>
        <marker id="arrowhead-back" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
          <polygon points="0 0, 10 3.5, 0 7" fill="#a78bfa" />
        </marker>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.1" floodColor="#64748b"/>
        </filter>
        <linearGradient id="grad-start" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#34d399"/>
          <stop offset="100%" stopColor="#10b981"/>
        </linearGradient>
        <linearGradient id="grad-end" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f87171"/>
          <stop offset="100%" stopColor="#ef4444"/>
        </linearGradient>
        <linearGradient id="grad-process" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#818cf8"/>
          <stop offset="100%" stopColor="#6366f1"/>
        </linearGradient>
        <linearGradient id="grad-input" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fbbf24"/>
          <stop offset="100%" stopColor="#f59e0b"/>
        </linearGradient>
        <linearGradient id="grad-output" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#22d3ee"/>
          <stop offset="100%" stopColor="#06b6d4"/>
        </linearGradient>
        <linearGradient id="grad-decision" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fb923c"/>
          <stop offset="100%" stopColor="#f97316"/>
        </linearGradient>
      </defs>

      {/* Render connections first (below nodes) */}
      {connections.map((conn, idx) => (
        <ConnectionLine key={idx} conn={conn} nodes={nodes} />
      ))}

      {/* Render nodes */}
      {nodes.map(node => (
        <NodeShape
          key={node.id}
          node={node}
          isSelected={selectedNode === node.id}
          onClick={() => onNodeClick?.(node.id)}
          interactive={interactive}
          onDragStart={onNodeDragStart}
        />
      ))}
    </svg>
  );
}

function NodeShape({ node, isSelected, onClick, interactive, onDragStart }) {
  if (node.type === 'connector') return null;

  const { x, y, width: w, height: h, type, text } = node;
  const hw = w / 2;
  const hh = h / 2;

  const handleMouseDown = (e) => {
    if (interactive && onDragStart) {
      onDragStart(e, node.id);
    }
  };

  let shape = null;
  let textColor = '#ffffff';
  let fontSize = 13;

  switch (type) {
    case 'start':
      shape = (
        <rect x={x - hw} y={y - hh} width={w} height={h} rx={hh} ry={hh}
          fill="url(#grad-start)" stroke={isSelected ? '#059669' : '#10b981'} strokeWidth={isSelected ? 3 : 1.5} filter="url(#shadow)" />
      );
      break;
    case 'end':
      shape = (
        <rect x={x - hw} y={y - hh} width={w} height={h} rx={hh} ry={hh}
          fill="url(#grad-end)" stroke={isSelected ? '#dc2626' : '#ef4444'} strokeWidth={isSelected ? 3 : 1.5} filter="url(#shadow)" />
      );
      break;
    case 'process':
      shape = (
        <rect x={x - hw} y={y - hh} width={w} height={h} rx={8} ry={8}
          fill="url(#grad-process)" stroke={isSelected ? '#4f46e5' : '#6366f1'} strokeWidth={isSelected ? 3 : 1.5} filter="url(#shadow)" />
      );
      break;
    case 'input': {
      const skew = 15;
      const points = `${x - hw + skew},${y - hh} ${x + hw + skew},${y - hh} ${x + hw - skew},${y + hh} ${x - hw - skew},${y + hh}`;
      shape = (
        <polygon points={points}
          fill="url(#grad-input)" stroke={isSelected ? '#d97706' : '#f59e0b'} strokeWidth={isSelected ? 3 : 1.5} filter="url(#shadow)" />
      );
      textColor = '#1e293b';
      break;
    }
    case 'output': {
      const skew = 15;
      const points = `${x - hw + skew},${y - hh} ${x + hw + skew},${y - hh} ${x + hw - skew},${y + hh} ${x - hw - skew},${y + hh}`;
      shape = (
        <polygon points={points}
          fill="url(#grad-output)" stroke={isSelected ? '#0891b2' : '#06b6d4'} strokeWidth={isSelected ? 3 : 1.5} filter="url(#shadow)" />
      );
      break;
    }
    case 'decision': {
      const dw = hw + 10;
      const dh = hh + 10;
      const points = `${x},${y - dh} ${x + dw},${y} ${x},${y + dh} ${x - dw},${y}`;
      shape = (
        <polygon points={points}
          fill="url(#grad-decision)" stroke={isSelected ? '#ea580c' : '#f97316'} strokeWidth={isSelected ? 3 : 1.5} filter="url(#shadow)" />
      );
      fontSize = 11;
      break;
    }
    default:
      shape = (
        <rect x={x - hw} y={y - hh} width={w} height={h} rx={4} ry={4}
          fill="#e2e8f0" stroke="#94a3b8" strokeWidth={1.5} filter="url(#shadow)" />
      );
      textColor = '#1e293b';
  }

  // Word wrap text
  const maxCharsPerLine = type === 'decision' ? 16 : 20;
  const textLines = wrapText(text, maxCharsPerLine);

  return (
    <g className={`flowchart-node ${interactive ? 'interactive' : ''}`}
       onClick={onClick} onMouseDown={handleMouseDown} style={{ cursor: interactive ? 'grab' : 'pointer' }}>
      {shape}
      {textLines.map((line, i) => (
        <text key={i} x={x} y={y + (i - (textLines.length - 1) / 2) * 16}
          textAnchor="middle" dominantBaseline="central"
          fill={textColor} fontSize={fontSize} fontFamily="Inter, sans-serif" fontWeight="500"
          style={{ pointerEvents: 'none' }}>
          {line}
        </text>
      ))}
    </g>
  );
}

function ConnectionLine({ conn, nodes }) {
  const fromNode = nodes.find(n => n.id === conn.from);
  const toNode = nodes.find(n => n.id === conn.to);
  if (!fromNode || !toNode) return null;

  let x1, y1, x2, y2;
  const isBack = conn.isBack;

  if (conn.side === 'right') {
    x1 = fromNode.x + (fromNode.width / 2 + 10);
    y1 = fromNode.y;
    x2 = toNode.x;
    y2 = toNode.y - toNode.height / 2;
  } else if (conn.side === 'right-down') {
    x1 = fromNode.x + (fromNode.width / 2 + 10);
    y1 = fromNode.y;
    x2 = toNode.x;
    y2 = toNode.y;
  } else {
    x1 = fromNode.x;
    y1 = fromNode.y + fromNode.height / 2;
    x2 = toNode.x;
    y2 = toNode.y - toNode.height / 2;
  }

  let path;
  if (isBack) {
    // Back arrow for loops - goes left and up
    const offsetX = -80;
    path = `M ${x1} ${y1} L ${x1 + offsetX} ${y1} L ${x1 + offsetX} ${y2} L ${x2 - fromNode.width/2 - 10} ${y2}`;
  } else if (conn.side === 'right') {
    const midX = (x1 + x2) / 2;
    path = `M ${x1} ${y1} L ${midX} ${y1} L ${midX} ${y2} L ${x2} ${y2}`;
  } else if (conn.side === 'right-down') {
    const rightX = fromNode.x + (fromNode.width / 2 + 10) + 60;
    path = `M ${x1} ${y1} L ${rightX} ${y1} L ${rightX} ${y2} L ${x2 + toNode.width/2} ${y2}`;
  } else if (Math.abs(x1 - x2) < 5) {
    // Straight vertical
    path = `M ${x1} ${y1} L ${x2} ${y2}`;
  } else {
    // L-shaped path
    const midY = (y1 + y2) / 2;
    path = `M ${x1} ${y1} L ${x1} ${midY} L ${x2} ${midY} L ${x2} ${y2}`;
  }

  return (
    <g>
      <path d={path} fill="none"
        stroke={isBack ? '#a78bfa' : '#94a3b8'}
        strokeWidth={2}
        strokeDasharray={isBack ? '6,4' : 'none'}
        markerEnd={isBack ? 'url(#arrowhead-back)' : 'url(#arrowhead)'}
      />
      {conn.label && (
        <text
          x={conn.side === 'right' || conn.side === 'right-down' ? x1 + 8 : x1 + 8}
          y={conn.side === 'right' || conn.side === 'right-down' ? y1 - 8 : y1 + 18}
          fontSize="11" fontFamily="Inter, sans-serif" fontWeight="600"
          fill={conn.label === 'Evet' ? '#10b981' : '#ef4444'}
        >
          {conn.label}
        </text>
      )}
    </g>
  );
}

function wrapText(text, maxChars) {
  if (!text) return [''];
  if (text.length <= maxChars) return [text];
  const words = text.split(/\s+/);
  const lines = [];
  let current = '';
  for (const word of words) {
    if (current && (current + ' ' + word).length > maxChars) {
      lines.push(current);
      current = word;
    } else {
      current = current ? current + ' ' + word : word;
    }
  }
  if (current) lines.push(current);
  return lines.length > 0 ? lines : [''];
}

export default FlowchartSVG;
