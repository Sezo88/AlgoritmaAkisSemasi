import React, { useState } from 'react';
import AlgorithmEditor from './components/AlgorithmEditor';
import FlowchartSVG from './components/FlowchartSVG';
import FlowchartBuilder from './components/FlowchartBuilder';
import CodeRunner from './components/CodeRunner';
import ExamplesModal from './components/ExamplesModal';
import { parseAlgorithm } from './utils/parser';
import { layoutFlowchart } from './utils/layoutEngine';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('algorithm');
  const [algorithmText, setAlgorithmText] = useState('');
  const [flowchartData, setFlowchartData] = useState({ nodes: [], connections: [] });
  const [showExamples, setShowExamples] = useState(false);

  const handleExampleSelect = (example) => {
    setAlgorithmText(example.algorithm);
    try {
      const ast = parseAlgorithm(example.algorithm);
      const data = layoutFlowchart(ast);
      setFlowchartData(data);
    } catch (err) {
      console.error(err);
    }
    setActiveTab('algorithm');
  };

  // Builder'dan algoritmaya çevirme
  const handleConvertToAlgorithm = (algoText) => {
    setAlgorithmText(algoText);
    setActiveTab('algorithm');
  };

  const tabs = [
    { id: 'algorithm', label: 'Algoritma Editörü', icon: '📝' },
    { id: 'builder', label: 'Akış Şeması Çizici', icon: '📐' },
    { id: 'runner', label: 'Kodu Çalıştır', icon: '▶️' },
  ];

  return (
    <div className="app">
      {/* Header */}
      <header className="app-header">
        <div className="header-brand">
          <div className="brand-icon">⬡</div>
          <div className="brand-text">
            <h1>Algoritma & Akış Şeması</h1>
            <span className="brand-subtitle">İnteraktif Öğrenme Platformu</span>
          </div>
        </div>

        <nav className="header-tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="tab-icon">{tab.icon}</span>
              <span className="tab-label">{tab.label}</span>
            </button>
          ))}
        </nav>

        <div className="header-actions">
          <button className="btn btn-examples" onClick={() => setShowExamples(true)}>
            <span>📚</span> Örnekler
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="app-main">
        {activeTab === 'algorithm' && (
          <div className="split-view">
            <div className="split-left">
              <AlgorithmEditor
                algorithmText={algorithmText}
                setAlgorithmText={setAlgorithmText}
                setFlowchartData={setFlowchartData}
                setActiveTab={setActiveTab}
              />
            </div>
            <div className="split-right">
              <div className="preview-panel">
                <div className="preview-header">
                  <h3>📊 Akış Şeması Önizleme</h3>
                </div>
                <div className="preview-canvas">
                  <FlowchartSVG
                    nodes={flowchartData.nodes}
                    connections={flowchartData.connections}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'builder' && (
          <FlowchartBuilder
            flowchartData={flowchartData}
            setFlowchartData={setFlowchartData}
            onConvertToAlgorithm={handleConvertToAlgorithm}
          />
        )}

        {activeTab === 'runner' && (
          <CodeRunner algorithmText={algorithmText} />
        )}
      </main>

      {/* Legend and Footer */}
      <div className="shape-legend-container">
        <div className="shape-legend">
          <div className="legend-item"><span className="legend-dot" style={{ background: '#10b981' }} /> Başla/Bitir</div>
          <div className="legend-item"><span className="legend-dot" style={{ background: '#6366f1' }} /> İşlem</div>
          <div className="legend-item"><span className="legend-dot" style={{ background: '#f59e0b' }} /> Girdi</div>
          <div className="legend-item"><span className="legend-dot" style={{ background: '#06b6d4' }} /> Çıktı</div>
          <div className="legend-item"><span className="legend-dot" style={{ background: '#f97316' }} /> Karar</div>
        </div>
        <div className="app-footer">
          Sezai KAYA tarafından Algoritma ve Akış Şeması konusu anlatılmak için hazırlanmıştır.
        </div>
      </div>

      {/* Examples Modal */}
      <ExamplesModal
        isOpen={showExamples}
        onClose={() => setShowExamples(false)}
        onSelect={handleExampleSelect}
      />
    </div>
  );
}

export default App;
