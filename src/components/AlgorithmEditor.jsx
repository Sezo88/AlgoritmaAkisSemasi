import React, { useState, useRef, useEffect } from 'react';
import { parseAlgorithm } from '../utils/parser';
import { layoutFlowchart } from '../utils/layoutEngine';

export default function AlgorithmEditor({ algorithmText, setAlgorithmText, setFlowchartData, setActiveTab }) {
  const [lineCount, setLineCount] = useState(1);
  const textareaRef = useRef(null);
  const lineNumbersRef = useRef(null);

  useEffect(() => {
    const count = algorithmText.split('\n').length;
    setLineCount(count);
  }, [algorithmText]);

  const handleScroll = () => {
    if (lineNumbersRef.current && textareaRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  const generateFlowchart = () => {
    try {
      const ast = parseAlgorithm(algorithmText);
      const data = layoutFlowchart(ast);
      setFlowchartData(data);
    } catch (err) {
      console.error('Parse error:', err);
    }
  };

  const clearText = () => {
    setAlgorithmText('');
    setFlowchartData({ nodes: [], connections: [] });
  };

  const insertTemplate = () => {
    setAlgorithmText(`BAŞLA\n\nBİTİR`);
  };

  return (
    <div className="algorithm-editor">
      <div className="editor-toolbar">
        <div className="toolbar-left">
          <h3>📝 Algoritma Editörü</h3>
        </div>
        <div className="toolbar-actions">
          <button className="btn btn-sm btn-ghost" onClick={insertTemplate} title="Şablon Ekle">
            <span>📄</span> Şablon
          </button>
          <button className="btn btn-sm btn-ghost" onClick={clearText} title="Temizle">
            <span>🗑️</span> Temizle
          </button>
        </div>
      </div>

      <div className="editor-help">
        <div className="help-tag">BAŞLA / BİTİR</div>
        <div className="help-tag">OKU değişken</div>
        <div className="help-tag">OKU "metin" değişken</div>
        <div className="help-tag">YAZ ifade</div>
        <div className="help-tag">EĞER ... İSE</div>
        <div className="help-tag">DEĞİLSE</div>
        <div className="help-tag">EĞER_BİTİR</div>
        <div className="help-tag">DÖNGÜ i = 1, n, 1</div>
        <div className="help-tag">DÖNGÜ_BİTİR</div>
      </div>

      <div className="editor-container">
        <div className="line-numbers" ref={lineNumbersRef}>
          {Array.from({ length: lineCount }, (_, i) => (
            <div key={i} className="line-number">{i + 1}</div>
          ))}
        </div>
        <textarea
          ref={textareaRef}
          className="editor-textarea"
          value={algorithmText}
          onChange={(e) => setAlgorithmText(e.target.value)}
          onScroll={handleScroll}
          placeholder="Algoritmanızı buraya yazın...&#10;&#10;Örnek:&#10;BAŞLA&#10;OKU &quot;Sayıyı girin&quot; sayi&#10;YAZ sayi * 2&#10;BİTİR"
          spellCheck={false}
        />
      </div>

      <div className="editor-footer">
        <span className="editor-stats">{lineCount} satır</span>
        <button className="btn btn-primary btn-generate" onClick={generateFlowchart}>
          <span>⚡</span> Akış Şeması Oluştur
        </button>
      </div>
    </div>
  );
}
