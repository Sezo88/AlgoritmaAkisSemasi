// Algoritma metni parser - algoritmik dili AST'ye çevirir

export function parseAlgorithm(text) {
  const lines = text.split('\n').map(l => l.trimEnd());
  let i = 0;

  function currentLine() {
    while (i < lines.length && lines[i].trim() === '') i++;
    return i < lines.length ? lines[i].trim() : null;
  }

  function advance() { i++; }

  function parseBlock(endTokens = []) {
    const block = [];
    while (i < lines.length) {
      const line = currentLine();
      if (line === null) break;
      if (endTokens.some(t => line === t || line.startsWith(t))) break;

      if (line === 'BAŞLA') {
        block.push({ type: 'start', text: 'BAŞLA' });
        advance();
      } else if (line === 'BİTİR') {
        block.push({ type: 'end', text: 'BİTİR' });
        advance();
      } else if (line.startsWith('OKU ')) {
        const rest = line.substring(4).trim();
        // OKU "Metin" değişken  veya  OKU değişken formatı
        const match = rest.match(/^"([^"]*?)"\s+(\w+)$/);
        if (match) {
          const [, prompt, varName] = match;
          block.push({ type: 'input', text: line, variable: varName, prompt });
        } else {
          const varName = rest;
          block.push({ type: 'input', text: line, variable: varName, prompt: null });
        }
        advance();
      } else if (line.startsWith('YAZ ')) {
        const expr = line.substring(4).trim();
        block.push({ type: 'output', text: `YAZ ${expr}`, expression: expr });
        advance();
      } else if (line.startsWith('EĞER ')) {
        const condition = line.replace(/^EĞER\s+/, '').replace(/\s+İSE$/, '');
        advance();
        const trueBranch = parseBlock(['DEĞİLSE', 'EĞER_BİTİR']);
        let falseBranch = [];
        const next = currentLine();
        if (next === 'DEĞİLSE') {
          advance();
          falseBranch = parseBlock(['EĞER_BİTİR']);
        }
        if (currentLine() === 'EĞER_BİTİR') advance();
        block.push({ type: 'decision', text: condition, trueBranch, falseBranch });
      } else if (line.startsWith('DÖNGÜ ')) {
        const loopDef = line.substring(6).trim();
        advance();
        const body = parseBlock(['DÖNGÜ_BİTİR']);
        if (currentLine() === 'DÖNGÜ_BİTİR') advance();
        block.push({ type: 'loop', text: loopDef, body, loopType: 'for' });
      } else if (line.startsWith('TEKRARLA ')) {
        const condition = line.substring(9).trim();
        advance();
        const body = parseBlock(['TEKRARLA_BİTİR']);
        if (currentLine() === 'TEKRARLA_BİTİR') advance();
        block.push({ type: 'loop', text: condition, body, loopType: 'while' });
      } else {
        // Assignment or generic process
        block.push({ type: 'process', text: line });
        advance();
      }
    }
    return block;
  }

  return parseBlock();
}
