from typing import List, Dict, Any
from app.module7.quarc.models import ClusterNode, ClusterLink
from app.module7.quarc.cluster_engine import cluster_engine


class ClusterGraphGenerator:
    """Cluster Graph Generator.
    Compresses detailed 50+ node graphs into an abstract Cluster Super-Node Graph.
    """

    def generate_cluster_graph(self) -> Dict[str, Any]:
        clusters: List[ClusterNode] = cluster_engine.form_clusters()

        # Inter-cluster boundary link definitions
        cluster_links = [
            ClusterLink(
                source_cluster="Cluster-A",
                target_cluster="Cluster-B",
                boundary_nodes=["Repeater_R2"],
                inter_cluster_cost=1.2,
                health_score=96.5
            ),
            ClusterLink(
                source_cluster="Cluster-B",
                target_cluster="Cluster-C",
                boundary_nodes=["Repeater_R3"],
                inter_cluster_cost=1.4,
                health_score=95.8
            ),
            ClusterLink(
                source_cluster="Cluster-A",
                target_cluster="Cluster-C",
                boundary_nodes=["Control_Center", "Substation_A"],
                inter_cluster_cost=2.8,
                health_score=91.2
            ),
        ]

        return {
            "clusters": clusters,
            "inter_cluster_links": cluster_links,
            "total_super_nodes": len(clusters),
            "super_graph_healthy": all(c.health_score >= 85.0 for c in clusters)
        }


cluster_graph_generator = ClusterGraphGenerator()
