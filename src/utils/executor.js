// Algoritmayı JavaScript'e çevirip çalıştırır

export function algorithmToJS(text) {
  const lines = text.split('\n');
  let jsCode = '';
  let indent = 0;
  const declaredVars = new Set();

  function addLine(code) {
    jsCode += '  '.repeat(indent) + code + '\n';
  }

  for (let line of lines) {
    line = line.trim();
    if (!line) continue;

    if (line === 'BAŞLA') {
      addLine('// Program Başlangıcı');
    } else if (line === 'BİTİR') {
      addLine('// Program Sonu');
    } else if (line.startsWith('OKU ')) {
      const rest = line.substring(4).trim();
      // OKU "Metin" değişken  veya  OKU değişken
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
      indent++;
    } else if (line === 'DEĞİLSE') {
      indent--;
      addLine(`} else {`);
      indent++;
    } else if (line === 'EĞER_BİTİR') {
      indent--;
      addLine(`}`);
    } else if (line.startsWith('DÖNGÜ ')) {
      const loopDef = line.substring(6).trim();
      const match = loopDef.match(/(\w+)\s*=\s*(.+?)\s*,\s*(.+?)\s*,\s*(.+)/);
      if (match) {
        const [, varName, start, end, step] = match;
        declaredVars.add(varName);
        addLine(`for (let ${varName} = ${start}; ${varName} <= ${end}; ${varName} += ${step}) {`);
        indent++;
      }
    } else if (line === 'DÖNGÜ_BİTİR') {
      indent--;
      addLine(`}`);
    } else if (line.startsWith('TEKRARLA ')) {
      const condition = line.substring(9).trim();
      const jsCond = convertCondition(condition);
      addLine(`while (${jsCond}) {`);
      indent++;
    } else if (line === 'TEKRARLA_BİTİR') {
      indent--;
      addLine(`}`);
    } else if (line.includes('=')) {
      // Assignment
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

  return jsCode;
}

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
