import React from 'react';
import { EXAMPLES } from '../utils/examples';

export default function ExamplesModal({ isOpen, onClose, onSelect }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>📚 Hazır Örnekler</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <p className="modal-subtitle">Bir örnek seçerek algoritma editörüne yükleyin</p>
        <div className="examples-grid">
          {EXAMPLES.map(ex => (
            <button key={ex.id} className="example-card" onClick={() => { onSelect(ex); onClose(); }}>
              <span className="example-icon">{ex.icon}</span>
              <div className="example-info">
                <span className="example-name">{ex.name}</span>
                <span className="example-desc">{ex.description}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
