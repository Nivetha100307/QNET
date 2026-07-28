/**
 * Dedicated Mock Data Layer for Session Records
 */

import { Session } from "../types";

export const MOCK_SESSIONS: Session[] = [
  {
    session_id: "qkd-8f92a1-mock",
    status: "COMPLETED",
    raw_key_length: 128,
    qber: 0.012,
    bell_parameter: 2.828,
    eavesdropping_detected: false,
    created_at: "2026-07-28T20:55:00Z",
  },
  {
    session_id: "qkd-3c11b4-mock",
    status: "ABORTED_EAVESDROPPING",
    raw_key_length: 128,
    qber: 0.25,
    bell_parameter: 1.414,
    eavesdropping_detected: true,
    created_at: "2026-07-28T20:52:00Z",
  },
  {
    session_id: "qkd-1a44e9-mock",
    status: "COMPLETED",
    raw_key_length: 256,
    qber: 0.018,
    bell_parameter: 2.812,
    eavesdropping_detected: false,
    created_at: "2026-07-28T20:48:00Z",
  },
];
