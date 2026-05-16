// Akış şeması düğümlerinden algoritma metni üretir

export function flowchartToAlgorithm(nodes, connections) {
  if (!nodes || nodes.length === 0) return '';

  // Gerçek node'ları filtrele (connector hariç)
  const realNodes = nodes.filter(n => n.type !== 'connector');
  if (realNodes.length === 0) return '';

  // Start node'u bul
  const startNode = realNodes.find(n => n.type === 'start');

  if (!startNode) {
    // Start yoksa y pozisyonuna göre sırala
    return realNodes
      .sort((a, b) => a.y - b.y)
      .map(n => nodeToAlgoText(n))
      .filter(Boolean)
      .join('\n');
  }

  // Bağlantı grafiğini takip ederek sıralı algoritma üret
  const lines = [];
  const visited = new Set();

  function getOutgoing(nodeId) {
    return connections.filter(c => c.from === nodeId && !c.isBack);
  }

  function traverse(nodeId, indentLevel) {
    if (!nodeId || visited.has(nodeId)) return;
    visited.add(nodeId);

    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;

    // Connector'ları atla, devam et
    if (node.type === 'connector') {
      const nexts = getOutgoing(nodeId);
      for (const conn of nexts) {
        traverse(conn.to, indentLevel);
      }
      return;
    }

    const pad = '  '.repeat(indentLevel);

    if (node.type === 'decision') {
      const evetConn = connections.find(c => c.from === nodeId && (c.label === 'Evet' || c.side === 'bottom'));
      const hayirConn = connections.find(c => c.from === nodeId && (c.label === 'Hayır' || c.side === 'right' || c.side === 'right-down'));

      lines.push(`${pad}EĞER ${node.text} İSE`);
      if (evetConn) {
        traverse(evetConn.to, indentLevel + 1);
      }
      if (hayirConn) {
        lines.push(`${pad}DEĞİLSE`);
        traverse(hayirConn.to, indentLevel + 1);
      }
      lines.push(`${pad}EĞER_BİTİR`);
    } else {
      lines.push(pad + nodeToAlgoText(node));
      // Sonraki düğüme git
      const nexts = getOutgoing(nodeId);
      for (const conn of nexts) {
        traverse(conn.to, indentLevel);
      }
    }
  }

  traverse(startNode.id, 0);
  return lines.join('\n');
}

function nodeToAlgoText(node) {
  switch (node.type) {
    case 'start': return 'BAŞLA';
    case 'end': return 'BİTİR';
    case 'process': return node.text || '';
    case 'input':
      if (node.text && (node.text.startsWith('OKU') || node.text.startsWith('oku'))) return node.text;
      return `OKU ${node.text || 'değişken'}`;
    case 'output':
      if (node.text && (node.text.startsWith('YAZ') || node.text.startsWith('yaz'))) return node.text;
      return `YAZ ${node.text || 'sonuç'}`;
    case 'decision':
      return `EĞER ${node.text || 'koşul'} İSE`;
    default:
      return node.text || '';
  }
}
