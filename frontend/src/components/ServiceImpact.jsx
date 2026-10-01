function ServiceImpact({ data }) {
  const graph = data.governance?.dependency_graph;
  if (!graph) return null;

  return (
    <section className="panel service-impact">
      <div className="panel-header"><h3>Blast Radius</h3><span>{graph.blast_radius.toUpperCase()}</span></div>
      <p className="impact-description">Dependency path for <strong>{graph.primary}</strong>. Affected services are highlighted.</p>
      <div className="dependency-flow" aria-label="Service dependency graph">
        {graph.nodes.map((node, index) => (
          <div className="dependency-unit" key={node}>
            <span className={graph.affected.includes(node) ? "dependency-node affected" : "dependency-node"}>{node}</span>
            {index < graph.nodes.length - 1 && <i aria-hidden="true"></i>}
          </div>
        ))}
      </div>
      <div className="impact-legend"><span></span> Directly impacted by this incident</div>
    </section>
  );
}

export default ServiceImpact;
