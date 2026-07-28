/**
 * Dedicated Mock Data Layer for WebSocket Event Payload Structures
 */

import { WebSocketEvent } from "../types";

export const MOCK_WEBSOCKET_EVENTS: WebSocketEvent[] = [
  {
    event_type: "SESSION_STARTED",
    session_id: "qkd-8f92a1-mock",
    timestamp: "2026-07-28T20:55:01Z",
    data: { target_bits: 128 },
  },
  {
    event_type: "PAIR_GENERATED",
    session_id: "qkd-8f92a1-mock",
    timestamp: "2026-07-28T20:55:02Z",
    data: { pair_count: 512, state: "|Φ+⟩" },
  },
  {
    event_type: "MEASUREMENT_COMPLETED",
    session_id: "qkd-8f92a1-mock",
    timestamp: "2026-07-28T20:55:03Z",
    data: { shots: 1024 },
  },
  {
    event_type: "CHSH_COMPLETED",
    session_id: "qkd-8f92a1-mock",
    timestamp: "2026-07-28T20:55:03Z",
    data: { s_value: 2.828, is_entangled: true },
  },
  {
    event_type: "SESSION_COMPLETED",
    session_id: "qkd-8f92a1-mock",
    timestamp: "2026-07-28T20:55:05Z",
    data: { sifted_bits: 128 },
  },
];
