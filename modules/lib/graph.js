const {Graph, alg} = require('graphlib');

function createGraph(edges, nodes, labelFn = a => a) {
  const graph = new Graph();
  nodes.forEach(node => graph.setNode(labelFn(node), node));
  edges.forEach(([from, to]) => {
    graph.setNode(from);
    graph.setNode(to);
    graph.setEdge(to, from);
  });
  return graph;
}

exports.dag = (edges, nodes, labelFn) => {
  const graph = createGraph(edges, nodes, labelFn);
  let cycles = alg.findCycles(graph);
  if (cycles.length > 0) {
    throw new Error(`Cycles detected in dependency graph, aborting. Cycles: ${cycles}`)
  } else {
    return graph;
  }
};

exports.toposort = (edges, nodes, labelFn) => {
  let graph = exports.dag(edges, nodes, labelFn);
  return alg.topsort(graph).map(key => graph.node(key))
};

exports.startingFrom = (edges, nodes, labelFn, startingFrom) => {
  let graph = exports.dag(edges, nodes, labelFn);
  startingFrom.forEach(node => graph.setNode(node));
  return alg.preorder(graph, startingFrom).map(key => graph.node(key));
};