import React, { useState, useRef } from 'react';

// Shape renderers for SVG flowchart
export function FlowchartSVG({ nodes, connections, selectedNode, onNodeClick, onNodeDragStart, interactive = false, onDeleteConnection }) {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [hoveredConn, setHoveredConn] = useState(null);
  const isPanning = useRef(false);
  const startPan = useRef({ x: 0, y: 0 });
  const svgRef = useRef(null);

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
  const origVbX = minX - padding;
  const origVbY = minY - padding;
  const origVbW = (maxX - minX) + padding * 2;
  const origVbH = (maxY - minY) + padding * 2;

  const vbW = origVbW / zoom;
  const vbH = origVbH / zoom;
  const vbX = origVbX + (origVbW - vbW) / 2 - pan.x;
  const vbY = origVbY + (origVbH - vbH) / 2 - pan.y;

  const handlePointerDown = (e) => {
    if (e.button !== 0) return;
    if (e.target.closest('.flowchart-node')) return;
    isPanning.current = true;
    startPan.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerMove = (e) => {
    if (isPanning.current && svgRef.current) {
      const dx = e.clientX - startPan.current.x;
      const dy = e.clientY - startPan.current.y;
      const svg = svgRef.current;
      const scaleX = vbW / svg.clientWidth;
      const scaleY = vbH / svg.clientHeight;
      const scale = Math.max(scaleX, scaleY);
      setPan(p => ({ x: p.x + dx * scale, y: p.y + dy * scale }));
      startPan.current = { x: e.clientX, y: e.clientY };
    }
  };

  const handlePointerUp = () => {
    isPanning.current = false;
  };

  const handleWheel = (e) => {
    const zoomDelta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(z => Math.max(0.1, Math.min(5, z * zoomDelta)));
  };

  return (
    <div className="flowchart-wrapper" style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
      <div className="zoom-controls">
        <button onClick={() => setZoom(z => Math.min(5, z * 1.25))} title="Yakınlaştır">➕</button>
        <button onClick={() => { setZoom(1); setPan({x: 0, y: 0}); }} title="Sıfırla">🏠</button>
        <button onClick={() => setZoom(z => Math.max(0.1, z / 1.25))} title="Uzaklaştır">➖</button>
      </div>
      <svg
        ref={svgRef}
        className="flowchart-svg"
        viewBox={`${vbX} ${vbY} ${vbW} ${vbH}`}
        preserveAspectRatio="xMidYMid meet"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onWheel={handleWheel}
        style={{ cursor: isPanning.current ? 'grabbing' : 'grab' }}
      >
        <defs>
          <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="#64748b" />
          </marker>
          <marker id="arrowhead-back" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="#a78bfa" />
          </marker>
          <marker id="arrowhead-goto" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="#f472b6" />
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
          <linearGradient id="grad-goto" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f472b6"/>
            <stop offset="100%" stopColor="#ec4899"/>
          </linearGradient>
        </defs>

        {/* Render connections first (below nodes) */}
        {connections.map((conn, idx) => (
          <ConnectionLine
            key={idx}
            idx={idx}
            conn={conn}
            nodes={nodes}
            isHovered={hoveredConn === idx}
            onHover={setHoveredConn}
            onDelete={onDeleteConnection}
            interactive={interactive}
          />
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
    </div>
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
    case 'goto': {
      // Pentagon / arrow-right shape for goto
      const gh = hh;
      const tip = hw * 0.25;
      const points = `${x - hw},${y - gh} ${x + hw - tip},${y - gh} ${x + hw},${y} ${x + hw - tip},${y + gh} ${x - hw},${y + gh}`;
      shape = (
        <polygon points={points}
          fill="url(#grad-goto)" stroke={isSelected ? '#be185d' : '#ec4899'} strokeWidth={isSelected ? 3 : 1.5} filter="url(#shadow)" />
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
  const maxCharsPerLine = (type === 'decision' || type === 'goto') ? 16 : 20;
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

function ConnectionLine({ conn, nodes, idx, isHovered, onHover, onDelete, interactive }) {
  const fromNode = nodes.find(n => n.id === conn.from);
  const toNode = nodes.find(n => n.id === conn.to);
  if (!fromNode || !toNode) return null;

  const isBack = conn.isBack;
  const isGoto = fromNode.type === 'goto' || toNode.type === 'goto';

  // --- Akıllı port seçimi ---
  // Bağlantının gidişatına göre hangi taraftan çıkacağına karar ver
  let x1, y1, x2, y2;

  if (conn.side === 'right') {
    x1 = fromNode.x + fromNode.width / 2;
    y1 = fromNode.y;
    x2 = toNode.x - toNode.width / 2;
    y2 = toNode.y;
  } else if (conn.side === 'right-down') {
    x1 = fromNode.x + fromNode.width / 2;
    y1 = fromNode.y;
    x2 = toNode.x + toNode.width / 2;
    y2 = toNode.y;
  } else {
    // Default: aşağıdan çık, yukarıdan gir
    x1 = fromNode.x;
    y1 = fromNode.y + fromNode.height / 2;
    x2 = toNode.x;
    y2 = toNode.y - toNode.height / 2;
  }

  // --- Path hesabı ---
  let path;
  const SIDE_OFFSET = 60; // yan kaçış mesafesi

  if (isBack && conn.isGoto) {
    // GİT komutu: sağdan çık, yukarı dön (pembe)
    const rightX = Math.max(fromNode.x + fromNode.width / 2, toNode.x + toNode.width / 2) + SIDE_OFFSET + 30;
    // fromNode alt ortasından çık, sağa git, yukarı çık, hedef sağ ortasına gir
    x1 = fromNode.x + fromNode.width / 2;
    y1 = fromNode.y;
    x2 = toNode.x + toNode.width / 2;
    y2 = toNode.y;
    path = `M ${x1} ${y1} L ${rightX} ${y1} L ${rightX} ${y2} L ${x2} ${y2}`;
  } else if (isBack) {
    // Döngü geri oku: soldan çık
    const leftX = Math.min(fromNode.x - fromNode.width / 2, toNode.x - toNode.width / 2) - SIDE_OFFSET;
    path = `M ${x1} ${y1} L ${leftX} ${y1} L ${leftX} ${y2} L ${x2} ${y2}`;
  } else if (conn.side === 'right') {
    // Hayır kolu: sağa çık, eğri
    const midX = x1 + (x2 - x1) / 2;
    path = `M ${x1} ${y1} C ${x1 + SIDE_OFFSET} ${y1}, ${midX} ${y2 - 40}, ${x2} ${y2}`;
  } else if (conn.side === 'right-down') {
    // Hayır kolu (döngü exit): sağ taraftan çık, aşağı in, hedefe gir
    const rightX = fromNode.x + fromNode.width / 2 + SIDE_OFFSET;
    path = `M ${x1} ${y1} L ${rightX} ${y1} L ${rightX} ${y2} L ${x2} ${y2}`;
  } else if (Math.abs(x1 - x2) < 8) {
    // Düz dikey
    path = `M ${x1} ${y1} L ${x2} ${y2}`;
  } else {
    // L-shape: aşağı in, yatay git
    const midY = y1 + (y2 - y1) * 0.5;
    path = `M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`;
  }

  // Etiket konumu - path ortasına yerleştir
  const labelX = (x1 + x2) / 2;
  const labelY = (y1 + y2) / 2;

  // Silme butonu: path'in ortasına küçük daire
  const delX = conn.side === 'right' ? x1 + (x2 - x1) * 0.5 : (x1 + x2) / 2;
  const delY = conn.side === 'right' ? y1 + (y2 - y1) * 0.5 : (y1 + y2) / 2;

  const strokeColor = isBack ? '#a78bfa' : isGoto ? '#f472b6' : '#94a3b8';
  const markerUrl = isBack ? 'url(#arrowhead-back)' : isGoto ? 'url(#arrowhead-goto)' : 'url(#arrowhead)';

  return (
    <g
      onMouseEnter={() => onHover(idx)}
      onMouseLeave={() => onHover(null)}
    >
      {/* Tıklanabilir kalın saydam şerit (hover alanı) */}
      <path d={path} fill="none" stroke="transparent" strokeWidth={12} style={{ cursor: interactive ? 'pointer' : 'default' }}
        onClick={() => interactive && onDelete && onDelete(idx)}
      />
      {/* Gerçek ok çizgisi */}
      <path d={path} fill="none"
        stroke={isHovered ? '#ef4444' : strokeColor}
        strokeWidth={isHovered ? 2.5 : 2}
        strokeDasharray={isBack ? '6,4' : 'none'}
        markerEnd={isHovered ? 'url(#arrowhead)' : markerUrl}
        style={{ transition: 'stroke 0.15s, stroke-width 0.15s', pointerEvents: 'none' }}
      />
      {/* Etiket */}
      {conn.label && (
        <g>
          <rect
            x={labelX - 18} y={labelY - 11} width={36} height={18} rx={4}
            fill={conn.label === 'Evet' ? '#d1fae5' : '#fee2e2'}
            stroke={conn.label === 'Evet' ? '#6ee7b7' : '#fca5a5'}
            strokeWidth={1}
          />
          <text
            x={labelX} y={labelY}
            fontSize="11" fontFamily="Inter, sans-serif" fontWeight="700"
            textAnchor="middle" dominantBaseline="central"
            fill={conn.label === 'Evet' ? '#059669' : '#dc2626'}
          >
            {conn.label}
          </text>
        </g>
      )}
      {/* Silme butonu - hover'da göster (sadece interactive modda) */}
      {interactive && isHovered && onDelete && (
        <g onClick={() => onDelete(idx)} style={{ cursor: 'pointer' }}>
          <circle cx={delX} cy={delY} r={10} fill="#ef4444" stroke="white" strokeWidth={1.5} />
          <text x={delX} y={delY} textAnchor="middle" dominantBaseline="central"
            fontSize="12" fill="white" fontWeight="bold" style={{ pointerEvents: 'none' }}>
            ×
          </text>
        </g>
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
