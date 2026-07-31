from typing import List
from app.module7.quarc.models import SwapTask, RoutePath
from app.module7.quarc.routing_engine import quarc_routing_engine


class EntanglementResourceScheduler:
    """Entanglement Resource Scheduler.
    Schedules executable BSM (Bell State Measurement) swap operations across repeaters
    allocating memory slots, swap timing, and resource priorities.
    """

    def generate_schedule(self, route_path: Optional[RoutePath] = None) -> List[SwapTask]:
        if not route_path:
            route_path = quarc_routing_engine.compute_route()

        local_route = route_path.local_node_route
        repeaters = [n for n in local_route if "Repeater_" in n]

        schedule: List[SwapTask] = []

        for idx, rep in enumerate(repeaters):
            rep_index_in_route = local_route.index(rep)
            left_node = local_route[rep_index_in_route - 1] if rep_index_in_route > 0 else "Control_Center"
            right_node = local_route[rep_index_in_route + 1] if rep_index_in_route < len(local_route) - 1 else "Substation_A"

            # Allocate quantum memory slot and calculate swap probability
            memory_slot = (idx * 2) + 1
            swap_prob = round(0.96 - (idx * 0.02), 2)

            schedule.append(
                SwapTask(
                    task_id=f"swap-task-{idx + 1:03d}",
                    repeater=rep,
                    memory_slot=memory_slot,
                    left_neighbor=left_node,
                    right_neighbor=right_node,
                    swap_success_probability=swap_prob,
                    priority=idx + 1,
                    status="SCHEDULED"
                )
            )

        return schedule


entanglement_scheduler = EntanglementResourceScheduler()
