// Algoritmayı çalıştırır - GİT (goto) desteği ile step-based execution

/**
 * Algoritma metnini gösterilecek JavaScript koduna çevirir (kod görüntüleyici için).
 * GİT komutu labeled-loop ile simüle edilir.
 */
export function algorithmToJS(text) {
  const lines = text.split('\n');
  const hasGoto = lines.some(l => {
    const t = l.trim();
    return (
      t.startsWith('GİT ') ||
      /^\d+\.\s*Adım[aA]/i.test(t) ||
      /Adım[aA]\s+git/i.test(t)
    );
  });

  if (hasGoto) {
    return algorithmToJS_StepBased(lines);
  }
  return algorithmToJS_Simple(lines);
}

// ─── Basit (goto yok) ─────────────────────────────────────────────────────
function algorithmToJS_Simple(lines) {
  let jsCode = '';
  let indent = 0;
  const declaredVars = new Set();

  function addLine(code) {
    jsCode += '  '.repeat(indent) + code + '\n';
  }

  for (let line of lines) {
    line = line.trim();
    if (!line) continue;
    handleLine(line, addLine, indent, declaredVars, (v) => { indent = v; });
  }

  return jsCode;
}

function handleLine(line, addLine, currentIndent, declaredVars, setIndent) {
  let indent = currentIndent;

  if (line === 'BAŞLA') {
    addLine('// Program Başlangıcı');
  } else if (line === 'BİTİR') {
    addLine('// Program Sonu');
  } else if (line.startsWith('OKU ')) {
    const rest = line.substring(4).trim();
    const match = rest.match(/^"([^"]*?)"\s+(\w+)$/);
    if (match) {
      const [, prompt, varName] = match;
      declaredVars.add(varName);
      addLine(`let ${varName} = parseFloat(await girdi("${prompt}"));`);
    } else {
      const varName = rest;
      declaredVars.add(varName);
      addLine(`let ${varName} = parseFloat(await girdi("${varName} değerini girin:"));`);
    }
  } else if (line.startsWith('YAZ ')) {
    const expr = line.substring(4).trim();
    const parts = parseYazExpression(expr);
    addLine(`cikti(${parts});`);
  } else if (line.startsWith('EĞER ')) {
    const condition = line.replace(/^EĞER\s+/, '').replace(/\s+İSE$/, '');
    const jsCond = convertCondition(condition);
    addLine(`if (${jsCond}) {`);
    setIndent(indent + 1);
  } else if (line === 'DEĞİLSE') {
    setIndent(indent - 1);
    addLine(`} else {`);
    setIndent(indent);
  } else if (line === 'EĞER_BİTİR') {
    setIndent(indent - 1);
    addLine(`}`);
  } else if (line.startsWith('DÖNGÜ ')) {
    const loopDef = line.substring(6).trim();
    const match = loopDef.match(/(\w+)\s*=\s*(.+?)\s*,\s*(.+?)\s*,\s*(.+)/);
    if (match) {
      const [, varName, start, end, step] = match;
      declaredVars.add(varName);
      const op = step.trim().startsWith('-') ? '>=' : '<=';
      addLine(`for (let ${varName} = ${start}; ${varName} ${op} ${end}; ${varName} += ${step}) {`);
      setIndent(indent + 1);
    }
  } else if (line === 'DÖNGÜ_BİTİR') {
    setIndent(indent - 1);
    addLine(`}`);
  } else if (line.startsWith('TEKRARLA ')) {
    const condition = line.substring(9).trim();
    const jsCond = convertCondition(condition);
    addLine(`while (${jsCond}) {`);
    setIndent(indent + 1);
  } else if (line === 'TEKRARLA_BİTİR') {
    setIndent(indent - 1);
    addLine(`}`);
  } else if (line.includes('=') && !line.startsWith('EĞER') && !line.startsWith('DÖNGÜ')) {
    const eqIdx = line.indexOf('=');
    const varName = line.substring(0, eqIdx).trim();
    const expr = line.substring(eqIdx + 1).trim();
    const prefix = declaredVars.has(varName) ? '' : 'let ';
    if (!declaredVars.has(varName)) declaredVars.add(varName);
    addLine(`${prefix}${varName} = ${expr};`);
  } else {
    addLine(`// ${line}`);
  }
}

// ─── GİT (goto) ile step-based kod üretimi ────────────────────────────────
function algorithmToJS_StepBased(lines) {
  // Gerçek satır numaralarını sakla (1-indexed, boş satırlar dahil)
  const steps = [];
  for (let idx = 0; idx < lines.length; idx++) {
    const t = lines[idx].trim();
    if (t) steps.push({ lineNum: idx + 1, line: t });
  }

  // ── Adım 1: Tüm değişken isimlerini önceden tara ──────────────────────
  // switch/case içinde `let` kullanmak TDZ hatasına yol açar.
  // Çözüm: tüm değişkenleri switch'ten önce declare et.
  const allVars = new Set();
  const loopVars = new Set();

  for (const { line } of steps) {
    if (line.startsWith('OKU ')) {
      const rest = line.substring(4).trim();
      const match = rest.match(/^"([^"]*?)"\s+(\w+)$/);
      allVars.add(match ? match[2] : rest);
    } else if (
      line.includes('=') &&
      !line.startsWith('EĞER') &&
      !line.startsWith('DÖNGÜ') &&
      !line.startsWith('GİT') &&
      !/^\d+\.\s*Adım/i.test(line) &&
      !/Adım\s+git/i.test(line)
    ) {
      const eqIdx = line.indexOf('=');
      const varName = line.substring(0, eqIdx).trim();
      if (/^\w+$/.test(varName)) allVars.add(varName);
    } else if (line.startsWith('DÖNGÜ ')) {
      const loopDef = line.substring(6).trim();
      const m = loopDef.match(/(\w+)\s*=/);
      if (m) { allVars.add(m[1]); loopVars.add(m[1]); }
    }
  }

  // ── Adım 2: Kod üret ──────────────────────────────────────────────────
  let jsCode = '';

  // Tüm değişkenleri switch'ten önce declare et
  if (allVars.size > 0) {
    jsCode += `let ${[...allVars].join(', ')};\n`;
  }
  // Döngü değişkenleri için init-flag
  if (loopVars.size > 0) {
    for (const v of loopVars) {
      jsCode += `let _init_${v} = false;\n`;
    }
  }

  jsCode += `let _step = 1;\n`;
  jsCode += `_loop: while (true) {\n`;
  jsCode += `  switch (_step) {\n`;

  for (const { lineNum, line } of steps) {
    const isGoto = (
      line.startsWith('GİT ') ||
      /^\d+\.\s*Adım[aA]/i.test(line) ||
      /Adım[aA]\s+git/i.test(line)
    );

    const pad = '    ';
    const inner = '      ';

    jsCode += `${pad}case ${lineNum}:\n`;

    if (line === 'BAŞLA') {
      jsCode += `${inner}// Program Başlangıcı\n`;
      jsCode += `${inner}_step = ${lineNum + 1}; break;\n`;
    } else if (line === 'BİTİR') {
      jsCode += `${inner}break _loop;\n`;
    } else if (line.startsWith('OKU ')) {
      const rest = line.substring(4).trim();
      const match = rest.match(/^"([^"]*?)"\s+(\w+)$/);
      if (match) {
        const [, prompt, varName] = match;
        jsCode += `${inner}${varName} = parseFloat(await girdi("${prompt}"));\n`;
      } else {
        jsCode += `${inner}${rest} = parseFloat(await girdi("${rest} değerini girin:"));\n`;
      }
      jsCode += `${inner}_step = ${lineNum + 1}; break;\n`;
    } else if (line.startsWith('YAZ ')) {
      const expr = line.substring(4).trim();
      const parts = parseYazExpression(expr);
      jsCode += `${inner}cikti(${parts});\n`;
      jsCode += `${inner}_step = ${lineNum + 1}; break;\n`;
    } else if (line.startsWith('EĞER ')) {
      const condition = line.replace(/^EĞER\s+/, '').replace(/\s+İSE$/, '');
      const jsCond = convertCondition(condition);
      const falseTarget = findMatchingElseOrEnd(steps, lineNum);
      jsCode += `${inner}if (${jsCond}) { _step = ${lineNum + 1}; } else { _step = ${falseTarget}; } break;\n`;
    } else if (line === 'DEĞİLSE') {
      const endTarget = findMatchingEğerBitir(steps, lineNum);
      jsCode += `${inner}_step = ${endTarget + 1}; break;\n`;
    } else if (line === 'EĞER_BİTİR') {
      jsCode += `${inner}_step = ${lineNum + 1}; break;\n`;
    } else if (line.startsWith('DÖNGÜ ')) {
      const loopDef = line.substring(6).trim();
      const match = loopDef.match(/(\w+)\s*=\s*(.+?)\s*,\s*(.+?)\s*,\s*(.+)/);
      if (match) {
        const [, varName, start, end, step] = match;
        const op = step.trim().startsWith('-') ? '>=' : '<=';
        // İlk geçişte init, sonraki geçişlerde artır
        jsCode += `${inner}if (!_init_${varName}) { ${varName} = ${start}; _init_${varName} = true; } else { ${varName} += ${step}; }\n`;
        const exitTarget = findLoopEnd(steps, lineNum);
        jsCode += `${inner}if (${varName} ${op} ${end}) { _step = ${lineNum + 1}; } else { _init_${varName} = false; _step = ${exitTarget + 1}; } break;\n`;
      } else {
        jsCode += `${inner}_step = ${lineNum + 1}; break;\n`;
      }
    } else if (line === 'DÖNGÜ_BİTİR') {
      const loopStart = findLoopStart(steps, lineNum);
      jsCode += `${inner}_step = ${loopStart}; break;\n`;
    } else if (isGoto) {
      const stepMatch = line.match(/(\d+)/);
      const targetStep = stepMatch ? parseInt(stepMatch[1], 10) : 1;
      const targetLineNum = resolveStepToLine(steps, targetStep);
      jsCode += `${inner}_step = ${targetLineNum}; break;\n`;
    } else if (line.includes('=') && !line.startsWith('EĞER') && !line.startsWith('DÖNGÜ')) {
      const eqIdx = line.indexOf('=');
      const varName = line.substring(0, eqIdx).trim();
      const expr = line.substring(eqIdx + 1).trim();
      // Prefix yok - değişken zaten yukarıda declare edildi
      jsCode += `${inner}${varName} = ${expr};\n`;
      jsCode += `${inner}_step = ${lineNum + 1}; break;\n`;
    } else {
      jsCode += `${inner}// ${line}\n`;
      jsCode += `${inner}_step = ${lineNum + 1}; break;\n`;
    }
  }

  jsCode += `    default: break _loop;\n`;
  jsCode += `  }\n`;
  jsCode += `}\n`;

  return jsCode;
}


// ─── Yardımcılar ──────────────────────────────────────────────────────────

/** GİT N. Adıma → N, gerçek satır numarasına çevir */
function resolveStepToLine(steps, stepNum) {
  // stepNum = algoritma satır sırası (boş satırlar hariç, 1-indexed)
  const target = steps[stepNum - 1];
  return target ? target.lineNum : 1;
}

/** EĞER'den sonraki DEĞİLSE veya EĞER_BİTİR satır numarasını bul */
function findMatchingElseOrEnd(steps, eğerLineNum) {
  let depth = 0;
  for (const { lineNum, line } of steps) {
    if (lineNum <= eğerLineNum) continue;
    if (line.startsWith('EĞER ')) depth++;
    if (line === 'DEĞİLSE' && depth === 0) return lineNum;
    if (line === 'EĞER_BİTİR') {
      if (depth === 0) return lineNum;
      depth--;
    }
  }
  return eğerLineNum + 1;
}

/** DEĞİLSE'den sonraki EĞER_BİTİR satır numarasını bul */
function findMatchingEğerBitir(steps, değilseLineNum) {
  let depth = 0;
  for (const { lineNum, line } of steps) {
    if (lineNum <= değilseLineNum) continue;
    if (line.startsWith('EĞER ')) depth++;
    if (line === 'EĞER_BİTİR') {
      if (depth === 0) return lineNum;
      depth--;
    }
  }
  return değilseLineNum + 1;
}

/** DÖNGÜ'nün DÖNGÜ_BİTİR satır numarasını bul */
function findLoopEnd(steps, döngüLineNum) {
  let depth = 0;
  for (const { lineNum, line } of steps) {
    if (lineNum <= döngüLineNum) continue;
    if (line.startsWith('DÖNGÜ ')) depth++;
    if (line === 'DÖNGÜ_BİTİR') {
      if (depth === 0) return lineNum;
      depth--;
    }
  }
  return döngüLineNum + 1;
}

/** DÖNGÜ_BİTİR'den önceki DÖNGÜ satır numarasını bul */
function findLoopStart(steps, bitirLineNum) {
  let depth = 0;
  for (let i = steps.length - 1; i >= 0; i--) {
    const { lineNum, line } = steps[i];
    if (lineNum >= bitirLineNum) continue;
    if (line === 'DÖNGÜ_BİTİR') depth++;
    if (line.startsWith('DÖNGÜ ')) {
      if (depth === 0) return lineNum;
      depth--;
    }
  }
  return 1;
}

// ─── YAZ ifadesi parse ────────────────────────────────────────────────────
function parseYazExpression(expr) {
  const parts = [];
  let current = '';
  let inString = false;
  let stringChar = '';
  for (let i = 0; i < expr.length; i++) {
    const ch = expr[i];
    if (inString) {
      current += ch;
      if (ch === stringChar) inString = false;
    } else if (ch === '"' || ch === "'") {
      inString = true;
      stringChar = ch;
      current += ch;
    } else if (ch === ',') {
      parts.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  if (current.trim()) parts.push(current.trim());
  return parts.join(' + ');
}

function convertCondition(cond) {
  return cond
    .replace(/==/g, '===')
    .replace(/!=/g, '!==')
    .replace(/VE/g, '&&')
    .replace(/VEYA/g, '||')
    .replace(/DEĞİL/g, '!');
}

// ─── Çalıştırıcı ──────────────────────────────────────────────────────────
export async function executeAlgorithm(text, onOutput, onInput) {
  const jsCode = algorithmToJS(text);

  const outputs = [];
  const cikti = (...args) => {
    const msg = args.map(a => String(a)).join('');
    outputs.push(msg);
    onOutput(msg);
  };

  const girdi = async (prompt) => {
    const val = await onInput(prompt);
    return val;
  };

  try {
    const asyncFn = new Function('cikti', 'girdi', `return (async () => {\n${jsCode}\n})()`);
    await asyncFn(cikti, girdi);
    return { success: true, outputs, code: jsCode };
  } catch (err) {
    return { success: false, error: err.message, outputs, code: jsCode };
  }
}
