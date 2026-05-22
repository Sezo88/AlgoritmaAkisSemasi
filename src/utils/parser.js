// Algoritma metni parser - algoritmik dili AST'ye çevirir
// Her node'a gerçek satır numarası (lineNum, 1-indexed) eklenir

export function parseAlgorithm(text) {
  const lines = text.split('\n').map(l => l.trimEnd());
  let i = 0;

  function skipEmpty() {
    while (i < lines.length && lines[i].trim() === '') i++;
  }

  function currentLine() {
    skipEmpty();
    return i < lines.length ? lines[i].trim() : null;
  }

  function currentLineNum() {
    skipEmpty();
    return i + 1; // 1-indexed
  }

  function advance() { i++; }

  function parseBlock(endTokens = []) {
    const block = [];
    while (i < lines.length) {
      const line = currentLine();
      if (line === null) break;
      if (endTokens.some(t => line === t || line.startsWith(t))) break;

      const lineNum = currentLineNum();

      if (line === 'BAŞLA') {
        block.push({ type: 'start', text: 'BAŞLA', lineNum });
        advance();
      } else if (line === 'BİTİR') {
        block.push({ type: 'end', text: 'BİTİR', lineNum });
        advance();
      } else if (line.startsWith('OKU ')) {
        const rest = line.substring(4).trim();
        const match = rest.match(/^"([^"]*?)"\s+(\w+)$/);
        if (match) {
          const [, prompt, varName] = match;
          block.push({ type: 'input', text: line, variable: varName, prompt, lineNum });
        } else {
          block.push({ type: 'input', text: line, variable: rest, prompt: null, lineNum });
        }
        advance();
      } else if (line.startsWith('YAZ ')) {
        const expr = line.substring(4).trim();
        block.push({ type: 'output', text: `YAZ ${expr}`, expression: expr, lineNum });
        advance();
      } else if (line.startsWith('EĞER ')) {
        const condition = line.replace(/^EĞER\s+/, '').replace(/\s+İSE$/, '');
        const decLineNum = currentLineNum();
        advance();
        const trueBranch = parseBlock(['DEĞİLSE', 'EĞER_BİTİR']);
        let falseBranch = [];
        const next = currentLine();
        if (next === 'DEĞİLSE') {
          advance();
          falseBranch = parseBlock(['EĞER_BİTİR']);
        }
        if (currentLine() === 'EĞER_BİTİR') advance();
        block.push({ type: 'decision', text: condition, trueBranch, falseBranch, lineNum: decLineNum });
      } else if (line.startsWith('DÖNGÜ ')) {
        const loopDef = line.substring(6).trim();
        const loopLineNum = currentLineNum();
        advance();
        const body = parseBlock(['DÖNGÜ_BİTİR']);
        if (currentLine() === 'DÖNGÜ_BİTİR') advance();
        block.push({ type: 'loop', text: loopDef, body, loopType: 'for', lineNum: loopLineNum });
      } else if (line.startsWith('TEKRARLA ')) {
        const condition = line.substring(9).trim();
        const loopLineNum = currentLineNum();
        advance();
        const body = parseBlock(['TEKRARLA_BİTİR']);
        if (currentLine() === 'TEKRARLA_BİTİR') advance();
        block.push({ type: 'loop', text: condition, body, loopType: 'while', lineNum: loopLineNum });
      } else if (
        line.startsWith('GİT ') ||
        /^\d+\.\s*Adım[aA]/i.test(line) ||
        /Adım[aA]\s+git/i.test(line)
      ) {
        // GİT 3. Adıma  |  3. Adıma Dön  |  5. Adıma Git
        const stepMatch = line.match(/(\d+)/);
        const stepNum = stepMatch ? parseInt(stepMatch[1], 10) : 1;
        block.push({ type: 'goto', text: line, stepNum, lineNum });
        advance();
      } else {
        // Assignment or generic process
        block.push({ type: 'process', text: line, lineNum });
        advance();
      }
    }
    return block;
  }

  return parseBlock();
}

/**
 * AST'yi düz satır listesine çevirir (her node'a sıra numarası atar).
 * Goto hedeflerini çözmek için kullanılır.
 * Döndürür: [ { stepIdx (0-based), node }, ... ]
 */
export function flattenAST(ast) {
  const flat = [];
  function walk(nodes) {
    for (const node of nodes) {
      flat.push(node);
      if (node.trueBranch) walk(node.trueBranch);
      if (node.falseBranch) walk(node.falseBranch);
      if (node.body) walk(node.body);
    }
  }
  walk(ast);
  return flat;
}
