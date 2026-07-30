export interface SCADACategoryDefinition {
  id: string;
  categoryName: string;
  devices: string[];
  commands: string[];
}

export const SCADA_CATALOG: SCADACategoryDefinition[] = [
  {
    id: 'breaker',
    categoryName: '1. Circuit Breaker',
    devices: [
      'Vacuum Circuit Breaker (VCB)',
      'SF₆ Circuit Breaker',
      'Air Circuit Breaker (ACB)',
      'Oil Circuit Breaker',
      'Intelligent Electronic Breaker (IEC 61850)'
    ],
    commands: [
      'OPEN_BREAKER',
      'CLOSE_BREAKER',
      'TRIP_BREAKER',
      'RESET_BREAKER',
      'LOCK_BREAKER',
      'UNLOCK_BREAKER',
      'READ_BREAKER_STATUS'
    ]
  },
  {
    id: 'transformer',
    categoryName: '2. Power Transformer',
    devices: [
      'Step-Up Transformer',
      'Step-Down Transformer',
      'Auto Transformer',
      'Distribution Transformer',
      'Power Transformer'
    ],
    commands: [
      'READ_TRANSFORMER',
      'ENABLE_COOLING',
      'DISABLE_COOLING',
      'RESET_TRANSFORMER',
      'SET_TAP_POSITION',
      'READ_OIL_LEVEL',
      'READ_TEMPERATURE'
    ]
  },
  {
    id: 'relay',
    categoryName: '3. Protection Relay',
    devices: [
      'Overcurrent Relay',
      'Differential Relay',
      'Distance Relay',
      'Earth Fault Relay',
      'Numerical Relay'
    ],
    commands: [
      'ENABLE_RELAY',
      'DISABLE_RELAY',
      'RESET_RELAY',
      'READ_RELAY_STATUS',
      'UPDATE_RELAY_SETTINGS'
    ]
  },
  {
    id: 'generator',
    categoryName: '4. Generator',
    devices: [
      'Diesel Generator',
      'Gas Turbine Generator',
      'Hydro Generator',
      'Wind Generator',
      'Solar Inverter Controller'
    ],
    commands: [
      'START_GENERATOR',
      'STOP_GENERATOR',
      'SYNCHRONIZE_GENERATOR',
      'READ_GENERATOR_STATUS',
      'SET_OUTPUT_POWER'
    ]
  },
  {
    id: 'capacitor',
    categoryName: '5. Capacitor Bank',
    devices: [
      'Automatic Capacitor Bank',
      'Fixed Capacitor Bank',
      'Switched Capacitor Bank'
    ],
    commands: [
      'CONNECT_CAPACITOR',
      'DISCONNECT_CAPACITOR',
      'READ_REACTIVE_POWER'
    ]
  },
  {
    id: 'bess',
    categoryName: '6. Battery Energy Storage System (BESS)',
    devices: [
      'Lithium-ion Battery Bank',
      'Lead Acid Battery Bank',
      'UPS Battery System'
    ],
    commands: [
      'START_CHARGING',
      'STOP_CHARGING',
      'READ_BATTERY_STATUS',
      'ENABLE_BACKUP',
      'DISABLE_BACKUP'
    ]
  },
  {
    id: 'sensor',
    categoryName: '7. Measurement Devices / Sensors',
    devices: [
      'Voltage Sensor',
      'Current Transformer (CT)',
      'Potential Transformer (PT)',
      'Frequency Meter',
      'Power Meter',
      'Power Factor Meter',
      'Temperature Sensor',
      'Humidity Sensor',
      'Vibration Sensor',
      'Pressure Sensor'
    ],
    commands: [
      'READ_VOLTAGE',
      'READ_CURRENT',
      'READ_FREQUENCY',
      'READ_POWER',
      'READ_POWER_FACTOR',
      'READ_TEMPERATURE',
      'READ_HUMIDITY',
      'READ_VIBRATION',
      'READ_PRESSURE'
    ]
  },
  {
    id: 'rtu',
    categoryName: '8. RTU (Remote Terminal Unit)',
    devices: [
      'RTU Controller',
      'Intelligent RTU',
      'IEC 60870 RTU',
      'DNP3 RTU'
    ],
    commands: [
      'SYNC_TIME',
      'REBOOT_RTU',
      'READ_CONFIGURATION',
      'UPDATE_CONFIGURATION',
      'PING_DEVICE',
      'RESET_COMMUNICATION'
    ]
  },
  {
    id: 'plc',
    categoryName: '9. PLC (Programmable Logic Controller)',
    devices: [
      'Siemens S7 PLC',
      'Allen-Bradley PLC',
      'Schneider PLC',
      'Mitsubishi PLC',
      'Omron PLC'
    ],
    commands: [
      'START_PROGRAM',
      'STOP_PROGRAM',
      'UPLOAD_LOGIC',
      'DOWNLOAD_LOGIC',
      'READ_IO_STATUS',
      'RESET_PLC'
    ]
  },
  {
    id: 'network',
    categoryName: '10. Network Devices',
    devices: [
      'Industrial Router',
      'Layer-3 Switch',
      'Firewall',
      'Gateway',
      'Edge Switch',
      'Communication Controller'
    ],
    commands: [
      'PING_NODE',
      'CHECK_LINK',
      'RESET_CONNECTION',
      'GET_NETWORK_STATUS',
      'SYNC_NETWORK'
    ]
  },
  {
    id: 'quantum',
    categoryName: '11. Quantum Devices (QNetSecure)',
    devices: [
      'Entanglement Source',
      'Quantum Transmitter (Alice)',
      'Quantum Receiver (Bob)',
      'Quantum Repeater',
      'Quantum Channel Monitor'
    ],
    commands: [
      'GENERATE_ENTANGLEMENT',
      'START_E91',
      'STOP_E91',
      'GENERATE_SESSION_KEY',
      'CHECK_QBER',
      'VERIFY_ENTANGLEMENT',
      'ROTATE_KEY',
      'REFRESH_KEY',
      'READ_FIDELITY',
      'READ_CHSH',
      'CHECK_QUANTUM_CHANNEL'
    ]
  },
  {
    id: 'security',
    categoryName: '12. Security Devices / Services',
    devices: [
      'Identity Server',
      'Authentication Service',
      'Zero Trust Gateway',
      'Policy Engine',
      'Trust Manager',
      'Session Manager'
    ],
    commands: [
      'AUTHENTICATE_DEVICE',
      'AUTHORIZE_COMMAND',
      'VERIFY_HMAC',
      'VERIFY_INTEGRITY',
      'VALIDATE_SESSION',
      'CHECK_REPLAY',
      'UPDATE_TRUST_SCORE',
      'LOCK_DEVICE',
      'UNLOCK_DEVICE',
      'REVOKE_DEVICE',
      'ROTATE_SESSION_KEY'
    ]
  },
  {
    id: 'communication',
    categoryName: '13. Communication Services',
    devices: [
      'Secure Communication Engine',
      'Packet Manager',
      'Transport Layer',
      'Message Queue'
    ],
    commands: [
      'SEND_PACKET',
      'RECEIVE_PACKET',
      'ENCRYPT_MESSAGE',
      'DECRYPT_MESSAGE',
      'VERIFY_PACKET',
      'RESEND_PACKET',
      'DROP_PACKET',
      'QUEUE_PACKET'
    ]
  },
  {
    id: 'controller',
    categoryName: '14. System Controller',
    devices: [
      'SCADA Master Station',
      'Energy Management System (EMS)',
      'Grid Control Center'
    ],
    commands: [
      'EMERGENCY_SHUTDOWN',
      'ISOLATE_SUBSTATION',
      'TRIP_ALL_BREAKERS',
      'ENTER_SAFE_MODE',
      'EXIT_SAFE_MODE',
      'RESET_SYSTEM'
    ]
  }
];

export function getCategoryById(id: string): SCADACategoryDefinition {
  return SCADA_CATALOG.find((c) => c.id === id) || SCADA_CATALOG[0];
}

export function getCategoryByDevice(device: string): SCADACategoryDefinition {
  return SCADA_CATALOG.find((c) => c.devices.includes(device)) || SCADA_CATALOG[0];
}
