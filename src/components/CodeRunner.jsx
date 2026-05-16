import React, { useState, useRef } from 'react';
import { algorithmToJS, executeAlgorithm } from '../utils/executor';

export default function CodeRunner({ algorithmText }) {
  const [output, setOutput] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [showCode, setShowCode] = useState(true);
  const [inputPrompt, setInputPrompt] = useState(null);
  const inputResolveRef = useRef(null);
  const [inputValue, setInputValue] = useState('');
  const outputRef = useRef(null);

  const generatedCode = algorithmText ? algorithmToJS(algorithmText) : '';

  const handleRun = async () => {
    setOutput([]);
    setIsRunning(true);

    const onOutput = (msg) => {
      setOutput(prev => [...prev, { type: 'output', text: msg }]);
      setTimeout(() => {
        if (outputRef.current) outputRef.current.scrollTop = outputRef.current.scrollHeight;
      }, 50);
    };

    const onInput = (prompt) => {
      return new Promise((resolve) => {
        setInputPrompt(prompt);
        setInputValue('');
        inputResolveRef.current = resolve;
      });
    };

    try {
      const result = await executeAlgorithm(algorithmText, onOutput, onInput);
      if (!result.success) {
        setOutput(prev => [...prev, { type: 'error', text: `Hata: ${result.error}` }]);
      }
      setOutput(prev => [...prev, { type: 'info', text: '--- Program sona erdi ---' }]);
    } catch (err) {
      setOutput(prev => [...prev, { type: 'error', text: `Hata: ${err.message}` }]);
    }
    setIsRunning(false);
  };

  const submitInput = () => {
    if (inputResolveRef.current) {
      setOutput(prev => [...prev, { type: 'input', text: `> ${inputPrompt} ${inputValue}` }]);
      inputResolveRef.current(inputValue);
      inputResolveRef.current = null;
      setInputPrompt(null);
    }
  };

  const handleInputKeyDown = (e) => {
    if (e.key === 'Enter') submitInput();
  };

  return (
    <div className="code-runner">
      <div className="runner-left">
        <div className="runner-header">
          <h4>💻 JavaScript Kodu</h4>
          <button className="btn btn-sm btn-ghost" onClick={() => setShowCode(!showCode)}>
            {showCode ? '🔽 Gizle' : '🔼 Göster'}
          </button>
        </div>
        {showCode && (
          <pre className="code-block">
            <code>{generatedCode || '// Algoritma yazıldığında kod burada görünecek...'}</code>
          </pre>
        )}
        <button className="btn btn-primary btn-run" onClick={handleRun} disabled={isRunning || !algorithmText}>
          {isRunning ? '⏳ Çalışıyor...' : '▶ Çalıştır'}
        </button>
      </div>

      <div className="runner-right">
        <div className="runner-header">
          <h4>📺 Çıktı Konsolu</h4>
          <button className="btn btn-sm btn-ghost" onClick={() => setOutput([])}>🗑️ Temizle</button>
        </div>
        <div className="output-console" ref={outputRef}>
          {output.length === 0 && (
            <div className="console-placeholder">Programı çalıştırınca çıktı burada görünecek...</div>
          )}
          {output.map((item, idx) => (
            <div key={idx} className={`console-line console-${item.type}`}>
              {item.type === 'output' && <span className="console-prefix">→</span>}
              {item.type === 'error' && <span className="console-prefix">✗</span>}
              {item.type === 'input' && <span className="console-prefix">⌨</span>}
              {item.type === 'info' && <span className="console-prefix">ℹ</span>}
              {item.text}
            </div>
          ))}
        </div>

        {inputPrompt && (
          <div className="input-prompt">
            <span className="input-label">{inputPrompt}</span>
            <div className="input-row">
              <input
                type="text"
                className="input-field"
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                onKeyDown={handleInputKeyDown}
                autoFocus
                placeholder="Değer girin..."
              />
              <button className="btn btn-sm btn-primary" onClick={submitInput}>Gönder</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
