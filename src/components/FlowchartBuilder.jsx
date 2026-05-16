import React, { useState, useRef, useCallback } from 'react';
import FlowchartSVG from './FlowchartSVG';
import { flowchartToAlgorithm } from '../utils/converter';

const SHAPE_TYPES = [
  { type: 'start', label: 'Başla', icon: '🟢', defaultText: 'BAŞLA' },
  { type: 'end', label: 'Bitir', icon: '🔴', defaultText: 'BİTİR' },
  { type: 'process', label: 'İşlem', icon: '🟦', defaultText: 'İşlem' },
  { type: 'input', label: 'Girdi', icon: '🟨', defaultText: 'OKU değişken' },
  { type: 'output', label: 'Çıktı', icon: '🟩', defaultText: 'YAZ sonuç' },
  { type: 'decision', label: 'Karar', icon: '🔶', defaultText: 'Koşul?' },
];

export default function FlowchartBuilder({ flowchartData, setFlowchartData, onConvertToAlgorithm }) {
  const [selectedNode, setSelectedNode] = useState(null);
  const [editText, setEditText] = useState('');
  const [connectMode, setConnectMode] = useState(false);
  const [connectFrom, setConnectFrom] = useState(null);
  const [selectedConnection, setSelectedConnection] = useState(null);
  const svgContainerRef = useRef(null);
  const dragRef = useRef({ active: false, nodeId: null, startX: 0, startY: 0 });

  const nodes = flowchartData?.nodes || [];
  const connections = flowchartData?.connections || [];

  const addNode = (shapeType) => {
    const newNode = {
      id: `builder_${Date.now()}`,
      type: shapeType.type,
      text: shapeType.defaultText,
      x: 600,
      y: 80 + nodes.filter(n => n.type !== 'connector').length * 100,
      width: shapeType.type === 'decision' ? 200 : 180,
      height: shapeType.type === 'decision' ? 80 : 56,
    };
    setFlowchartData({
      nodes: [...nodes, newNode],
      connections: [...connections]
    });
  };

  const handleNodeClick = (nodeId) => {
    if (connectMode) {
      if (!connectFrom) {
        setConnectFrom(nodeId);
      } else if (connectFrom !== nodeId) {
        const label = prompt('Bağlantı etiketi (boş bırakabilirsiniz, karar için Evet/Hayır):') || '';
        setFlowchartData({
          nodes: [...nodes],
          connections: [...connections, { from: connectFrom, to: nodeId, label, side: '' }]
        });
        setConnectFrom(null);
        setConnectMode(false);
      }
    } else {
      setSelectedNode(nodeId);
      setSelectedConnection(null);
      const node = nodes.find(n => n.id === nodeId);
      if (node) setEditText(node.text);
    }
  };

  const updateNodeText = () => {
    if (!selectedNode) return;
    setFlowchartData({
      nodes: nodes.map(n => n.id === selectedNode ? { ...n, text: editText } : n),
      connections: [...connections]
    });
  };

  const deleteNode = () => {
    if (!selectedNode) return;
    setFlowchartData({
      nodes: nodes.filter(n => n.id !== selectedNode),
      connections: connections.filter(c => c.from !== selectedNode && c.to !== selectedNode)
    });
    setSelectedNode(null);
    setEditText('');
  };

  const deleteConnection = (idx) => {
    setFlowchartData({
      nodes: [...nodes],
      connections: connections.filter((_, i) => i !== idx)
    });
    setSelectedConnection(null);
  };

  const clearAll = () => {
    if (!confirm('Tüm şekilleri silmek istediğinize emin misiniz?')) return;
    setFlowchartData({ nodes: [], connections: [] });
    setSelectedNode(null);
    setEditText('');
  };

  const handleConvert = () => {
    const algoText = flowchartToAlgorithm(nodes, connections);
    if (onConvertToAlgorithm) {
      onConvertToAlgorithm(algoText);
    }
  };

  const handleDragStart = useCallback((e, nodeId) => {
    const svg = svgContainerRef.current?.querySelector('svg');
    if (!svg) return;
    
    // Scale oranını hesapla (viewBox genişliği / gerçek pixel genişliği)
    const vb = svg.getAttribute('viewBox').split(' ').map(Number);
    const scaleX = vb[2] / svg.clientWidth;
    const scaleY = vb[3] / svg.clientHeight;
    const scale = Math.max(scaleX, scaleY); // preserveAspectRatio="meet" için

    dragRef.current = { 
      active: true, 
      nodeId, 
      startClientX: e.clientX, 
      startClientY: e.clientY,
      scale
    };

    const handleMove = (me) => {
      if (!dragRef.current.active) return;
      
      const dxCSS = me.clientX - dragRef.current.startClientX;
      const dyCSS = me.clientY - dragRef.current.startClientY;
      
      const dxSVG = dxCSS * dragRef.current.scale;
      const dySVG = dyCSS * dragRef.current.scale;
      
      dragRef.current.startClientX = me.clientX;
      dragRef.current.startClientY = me.clientY;
      
      setFlowchartData(prev => ({
        nodes: prev.nodes.map(n => n.id === dragRef.current.nodeId ? { ...n, x: n.x + dxSVG, y: n.y + dySVG } : n),
        connections: [...prev.connections]
      }));
    };

    const handleUp = () => {
      dragRef.current.active = false;
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
  }, [setFlowchartData]);

  const selectedNodeObj = nodes.find(n => n.id === selectedNode);

  // Bağlantı listesi için node isimlerini bul
  const getNodeLabel = (id) => {
    const n = nodes.find(nd => nd.id === id);
    if (!n) return '?';
    const typeName = { start: '⏵', end: '⏹', process: '▭', input: '▱', output: '▱', decision: '◇' };
    return `${typeName[n.type] || '?'} ${n.text?.substring(0, 12) || ''}`;
  };

  return (
    <div className="flowchart-builder">
      {/* Shape Palette */}
      <div className="builder-palette">
        <h4>📐 Şekiller</h4>
        <div className="palette-shapes">
          {SHAPE_TYPES.map(shape => (
            <button key={shape.type} className="palette-shape-btn" onClick={() => addNode(shape)} title={shape.label}>
              <span className="shape-icon">{shape.icon}</span>
              <span className="shape-label">{shape.label}</span>
            </button>
          ))}
        </div>
        <div className="palette-divider" />
        <h4>🔧 Araçlar</h4>
        <button className={`btn btn-sm btn-tool ${connectMode ? 'active' : ''}`}
          onClick={() => { setConnectMode(!connectMode); setConnectFrom(null); }}>
          {connectMode ? '🔗 Bağlantı Modu (Aktif)' : '🔗 Bağlantı Ekle'}
        </button>
        {connectMode && (
          <div className="connect-hint">
            {connectFrom ? '🎯 Hedef düğümü seçin...' : '📌 Kaynak düğümü seçin...'}
          </div>
        )}
        <button className="btn btn-sm btn-tool btn-convert" onClick={handleConvert} disabled={nodes.length === 0}>
          📝 Algoritmaya Çevir
        </button>
        <button className="btn btn-sm btn-tool btn-danger" onClick={clearAll}>
          🗑️ Tümünü Sil
        </button>

        {/* Bağlantı Listesi */}
        {connections.length > 0 && (
          <>
            <div className="palette-divider" />
            <h4>🔗 Bağlantılar</h4>
            <div className="connection-list">
              {connections.map((conn, idx) => (
                <div key={idx} className="connection-item">
                  <span className="conn-info">
                    {getNodeLabel(conn.from)} → {getNodeLabel(conn.to)}
                    {conn.label && <em> ({conn.label})</em>}
                  </span>
                  <button className="conn-delete-btn" onClick={() => deleteConnection(idx)} title="Bağlantıyı sil">
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Canvas */}
      <div className="builder-canvas" ref={svgContainerRef}>
        {nodes.length === 0 ? (
          <div className="builder-empty">
            <div className="builder-empty-icon">📐</div>
            <p>Soldaki panelden şekil ekleyerek başlayın</p>
            <p className="builder-empty-hint">Şekilleri sürükleyerek konumlandırabilirsiniz</p>
          </div>
        ) : (
          <FlowchartSVG
            nodes={nodes}
            connections={connections}
            selectedNode={selectedNode}
            onNodeClick={handleNodeClick}
            onNodeDragStart={handleDragStart}
            interactive={true}
          />
        )}
      </div>

      {/* Properties Panel */}
      <div className="builder-properties">
        <h4>⚙️ Özellikler</h4>
        {selectedNodeObj ? (
          <div className="prop-form">
            <label>Tür:</label>
            <div className="prop-type">{getTypeName(selectedNodeObj.type)}</div>
            <label>Metin:</label>
            <textarea
              className="prop-textarea"
              value={editText}
              onChange={e => setEditText(e.target.value)}
              onBlur={updateNodeText}
              rows={3}
            />
            <button className="btn btn-sm btn-primary" onClick={updateNodeText}>✓ Güncelle</button>
            <button className="btn btn-sm btn-danger" onClick={deleteNode}>🗑️ Düğümü Sil</button>
          </div>
        ) : (
          <div className="prop-hint-box">
            <p className="prop-hint">Düzenlemek için bir düğüme tıklayın</p>
            <div className="prop-tips">
              <p>💡 <strong>İpuçları:</strong></p>
              <ul>
                <li>Şekilleri sürükleyerek taşıyın</li>
                <li>Bağlantı eklemek için aracı aktifleştirin</li>
                <li>Çift tıklayarak metin düzenleyin</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function getTypeName(type) {
  const names = { start: '🟢 Başla', end: '🔴 Bitir', process: '🟦 İşlem', input: '🟨 Girdi', output: '🟩 Çıktı', decision: '🔶 Karar' };
  return names[type] || type;
}
