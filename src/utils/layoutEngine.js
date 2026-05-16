// AST'den akış şeması düğümlerine ve bağlantılarına çevirir

const NODE_WIDTH = 180;
const NODE_HEIGHT = 56;
const DECISION_SIZE = 80;
const V_GAP = 70;
const H_GAP = 260;

let _nodeId = 0;
function nextId() { return `n${_nodeId++}`; }

function createNode(type, text, x, y) {
  const w = type === 'decision' ? NODE_WIDTH + 20 : NODE_WIDTH;
  const h = type === 'decision' ? DECISION_SIZE : NODE_HEIGHT;
  return { id: nextId(), type, text, x, y, width: w, height: h };
}

export function layoutFlowchart(ast) {
  _nodeId = 0;
  const nodes = [];
  const connections = [];
  const centerX = 400;

  function layoutBlock(block, x, y) {
    let curY = y;
    let prevId = null;

    for (const item of block) {
      if (item.type === 'decision') {
        // Decision diamond
        const decNode = createNode('decision', item.text, x, curY);
        nodes.push(decNode);
        if (prevId) connections.push({ from: prevId, to: decNode.id, label: '' });

        // True branch (Evet) - goes down
        const trueStartY = curY + DECISION_SIZE / 2 + V_GAP;
        let trueEndId = null;
        let trueEndY = trueStartY;
        if (item.trueBranch.length > 0) {
          const result = layoutBlock(item.trueBranch, x, trueStartY);
          trueEndId = result.lastId;
          trueEndY = result.endY;
          connections.push({ from: decNode.id, to: item.trueBranch.length > 0 ? nodes.find(n => n.y === trueStartY && n.x === x)?.id : null, label: 'Evet', side: 'bottom' });
        }

        // False branch (Hayır) - goes right
        const falseX = x + H_GAP;
        const falseStartY = curY;
        let falseEndId = null;
        let falseEndY = falseStartY;
        if (item.falseBranch.length > 0) {
          const result = layoutBlock(item.falseBranch, falseX, falseStartY + DECISION_SIZE / 2 + V_GAP);
          falseEndId = result.lastId;
          falseEndY = result.endY;
          connections.push({ from: decNode.id, to: nodes.find(n => n.y === (falseStartY + DECISION_SIZE / 2 + V_GAP) && n.x === falseX)?.id, label: 'Hayır', side: 'right' });
        }

        // Merge point
        const mergeY = Math.max(trueEndY, falseEndY) + V_GAP;
        const mergeNode = createNode('connector', '', x, mergeY);
        mergeNode.width = 10;
        mergeNode.height = 10;
        nodes.push(mergeNode);

        if (trueEndId) connections.push({ from: trueEndId, to: mergeNode.id, label: '' });
        else connections.push({ from: decNode.id, to: mergeNode.id, label: item.falseBranch.length > 0 ? 'Evet' : '', side: 'bottom' });

        if (falseEndId) connections.push({ from: falseEndId, to: mergeNode.id, label: '' });
        else if (item.falseBranch.length === 0) {
          connections.push({ from: decNode.id, to: mergeNode.id, label: 'Hayır', side: 'right-down' });
        }

        prevId = mergeNode.id;
        curY = mergeY + 20;

      } else if (item.type === 'loop') {
        // Loop condition as decision
        const loopNode = createNode('decision', item.text, x, curY);
        loopNode.isLoop = true;
        nodes.push(loopNode);
        if (prevId) connections.push({ from: prevId, to: loopNode.id, label: '' });

        // Loop body goes down
        const bodyStartY = curY + DECISION_SIZE / 2 + V_GAP;
        if (item.body.length > 0) {
          const result = layoutBlock(item.body, x, bodyStartY);
          const firstBodyNode = nodes.find(n => n.y === bodyStartY && n.x === x);
          if (firstBodyNode) {
            connections.push({ from: loopNode.id, to: firstBodyNode.id, label: 'Evet', side: 'bottom' });
          }
          // Back arrow to loop condition
          if (result.lastId) {
            connections.push({ from: result.lastId, to: loopNode.id, label: '', isBack: true });
          }
          curY = result.endY + V_GAP;
        } else {
          curY = bodyStartY + V_GAP;
        }

        // Exit (Hayır) continues
        const exitNode = createNode('connector', '', x, curY);
        exitNode.width = 10;
        exitNode.height = 10;
        nodes.push(exitNode);
        connections.push({ from: loopNode.id, to: exitNode.id, label: 'Hayır', side: 'right-down' });

        prevId = exitNode.id;
        curY += 20;

      } else {
        const node = createNode(item.type, item.text, x, curY);
        nodes.push(node);
        if (prevId) connections.push({ from: prevId, to: node.id, label: '' });
        prevId = node.id;
        curY += node.height + V_GAP;
      }
    }

    return { lastId: prevId, endY: curY };
  }

  layoutBlock(ast, centerX, 60);

  // Fix decision connections - remove null targets
  const validConnections = connections.filter(c => c.from && c.to);

  // Calculate canvas bounds
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const n of nodes) {
    minX = Math.min(minX, n.x - n.width / 2 - 40);
    maxX = Math.max(maxX, n.x + n.width / 2 + 40);
    minY = Math.min(minY, n.y - n.height / 2 - 40);
    maxY = Math.max(maxY, n.y + n.height / 2 + 40);
  }

  return {
    nodes,
    connections: validConnections,
    bounds: { minX, maxX, minY, maxY, width: maxX - minX, height: maxY - minY }
  };
}
