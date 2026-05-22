import React, { useState, useRef, useEffect } from 'react';
import { parseAlgorithm } from '../utils/parser';
import { layoutFlowchart } from '../utils/layoutEngine';

// ============================================================
// Komut açıklamaları ve örnekler
// ============================================================
const HELP_ITEMS = [
  {
    tag: 'BAŞLA / BİTİR',
    title: '🟢 BAŞLA / 🔴 BİTİR',
    desc: 'Her algoritmada mutlaka bulunmalıdır. BAŞLA ile program başlar, BİTİR ile biter.',
    example: `BAŞLA\n  ...\nBİTİR`,
  },
  {
    tag: 'OKU değişken',
    title: '🟨 OKU değişken',
    desc: 'Kullanıcıdan bir değer okur ve belirtilen değişkene atar.',
    example: `OKU sayi\nOKU x`,
  },
  {
    tag: 'OKU "metin" değişken',
    title: '🟨 OKU "metin" değişken',
    desc: 'Kullanıcıya bir mesaj göstererek değer okur.',
    example: `OKU "Yaşınızı girin" yas\nOKU "Not girin" not1`,
  },
  {
    tag: 'YAZ ifade',
    title: '🟩 YAZ ifade',
    desc: 'Ekrana bir değer, değişken veya ifade yazdırır. Birden fazla şeyi virgülle ayırabilirsiniz.',
    example: `YAZ "Merhaba"\nYAZ "Sonuç: ", sonuc\nYAZ a + b`,
  },
  {
    tag: 'EĞER ... İSE',
    title: '🔶 EĞER koşul İSE',
    desc: 'Koşul doğruysa içindeki işlemleri çalıştırır. DEĞİLSE bloğu isteğe bağlıdır. EĞER_BİTİR ile kapatılır.',
    example: `EĞER sayi > 0 İSE\n  YAZ "Pozitif"\nDEĞİLSE\n  YAZ "Sıfır veya negatif"\nEĞER_BİTİR`,
  },
  {
    tag: 'DEĞİLSE',
    title: '🔶 DEĞİLSE',
    desc: 'EĞER bloğundaki koşul yanlışsa çalışır. Opsiyoneldir, kullanmak zorunda değilsiniz.',
    example: `EĞER x == 5 İSE\n  YAZ "Beş"\nDEĞİLSE\n  YAZ "Beş değil"\nEĞER_BİTİR`,
  },
  {
    tag: 'EĞER_BİTİR',
    title: '🔶 EĞER_BİTİR',
    desc: 'EĞER bloğunu kapatır. Her açılan EĞER için bir EĞER_BİTİR yazılmalıdır.',
    example: `EĞER yas >= 18 İSE\n  YAZ "Yetişkin"\nEĞER_BİTİR`,
  },
  {
    tag: 'DÖNGÜ i = 1, n, 1',
    title: '🔁 DÖNGÜ değişken = başlangıç, bitiş, artış',
    desc: 'For döngüsü. Değişken başlangıç değerinden bitiş değerine kadar artış adımıyla ilerler. DÖNGÜ_BİTİR ile kapatılır.',
    example: `DÖNGÜ i = 1, 10, 1\n  YAZ i\nDÖNGÜ_BİTİR\n\nDÖNGÜ i = 10, 1, -1\n  YAZ "Geri sayım: ", i\nDÖNGÜ_BİTİR`,
  },
  {
    tag: 'DÖNGÜ_BİTİR',
    title: '🔁 DÖNGÜ_BİTİR',
    desc: 'DÖNGÜ bloğunu kapatır. Her DÖNGÜ için bir DÖNGÜ_BİTİR yazılmalıdır.',
    example: `DÖNGÜ i = 1, 5, 1\n  YAZ i * i\nDÖNGÜ_BİTİR`,
  },
  {
    tag: 'GİT n. Adıma',
    title: '🟣 GİT n. Adıma',
    desc: 'Belirtilen adıma / satıra atlar. Döngü veya koşul kurmak için kullanılabilir. "Adıma Dön" veya "Adıma Git" şeklinde de yazılabilir.',
    example: `GİT 3. Adıma\n3. Adıma Dön\n5. Adıma Git`,
  },
];

// ============================================================
// Tooltip bileşeni
// ============================================================
function HelpTooltip({ item, anchorRef, visible }) {
  const tooltipRef = useRef(null);
  const [pos, setPos] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (!visible || !anchorRef.current || !tooltipRef.current) return;
    const anchor = anchorRef.current.getBoundingClientRect();
    const tip = tooltipRef.current.getBoundingClientRect();
    const vw = window.innerWidth;

    let left = anchor.left;
    let top = anchor.bottom + 8;

    // Sağa taşıyorsa sola kaydır
    if (left + tip.width > vw - 12) {
      left = vw - tip.width - 12;
    }
    if (left < 8) left = 8;

    setPos({ top, left });
  }, [visible, anchorRef]);

  if (!visible || !item) return null;

  return (
    <div
      ref={tooltipRef}
      className="help-tooltip"
      style={{ top: pos.top, left: pos.left }}
    >
      <div className="help-tooltip-title">{item.title}</div>
      <div className="help-tooltip-desc">{item.desc}</div>
      <div className="help-tooltip-example-label">Örnek:</div>
      <pre className="help-tooltip-code">{item.example}</pre>
    </div>
  );
}

// ============================================================
// HelpTag bileşeni
// ============================================================
function HelpTag({ item }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);
  const timerRef = useRef(null);

  const show = () => {
    clearTimeout(timerRef.current);
    setVisible(true);
  };
  const hide = () => {
    timerRef.current = setTimeout(() => setVisible(false), 120);
  };

  return (
    <>
      <div
        ref={ref}
        className={`help-tag ${visible ? 'help-tag-active' : ''}`}
        onMouseEnter={show}
        onMouseLeave={hide}
      >
        {item.tag}
      </div>
      {visible && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 9999, pointerEvents: 'none' }}
        >
          <HelpTooltip item={item} anchorRef={ref} visible={visible} />
        </div>
      )}
    </>
  );
}

// ============================================================
// Ana bileşen
// ============================================================
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
        {HELP_ITEMS.map(item => (
          <HelpTag key={item.tag} item={item} />
        ))}
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
          placeholder={"Algoritmanızı buraya yazın...\n\nÖrnek:\nBAŞLA\nOKU \"Sayıyı girin\" sayi\nYAZ sayi * 2\nBİTİR"}
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
