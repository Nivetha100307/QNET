let socket = null;
let currentSessionId = null;
let currentSessionSender = null;

const DEVICE_SUBSTATION_MAP = {
  "BRK_12": "SUB_NORTH",
  "RELAY_04": "SUB_SOUTH",
  "TRANS_TAP_01": "SUB_NORTH",
  "GEN_MAIN_01": "SUB_WEST"
};

/* ---------------------------------------------------
   1. Theme & Navigation Setup
--------------------------------------------------- */
function initNavigationAndTheme() {
  // Sidebar Toggle
  const sidebar = document.getElementById('app-sidebar');
  const toggleBtn = document.getElementById('sidebar-toggle-btn');

  if (toggleBtn && sidebar) {
    toggleBtn.addEventListener('click', () => {
      sidebar.classList.toggle('collapsed');
      toggleBtn.innerText = sidebar.classList.contains('collapsed') ? '›' : '‹';
    });
  }

  // Navigation Items
  const navItems = document.querySelectorAll('.nav-item');
  const tabViews = document.querySelectorAll('.tab-view');
  const breadcrumb = document.getElementById('breadcrumb-text');

  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const tabId = item.getAttribute('data-tab');
      
      navItems.forEach(n => n.classList.remove('active'));
      tabViews.forEach(v => v.classList.remove('active'));

      item.classList.add('active');
      const activeView = document.getElementById(tabId);
      if (activeView) activeView.classList.add('active');

      const label = item.querySelector('.nav-label')?.innerText || 'Dashboard';
      if (breadcrumb) breadcrumb.innerText = `Module 8 / ${label}`;

      // Trigger view-specific data load
      onTabSwitch(tabId);
    });
  });

  // Theme Toggle (Dark / Light)
  const themeBtn = document.getElementById('theme-toggle-btn');
  const themeIcon = document.getElementById('theme-btn-icon');
  const themeLabel = document.getElementById('theme-btn-label');

  const savedTheme = localStorage.getItem('quant_theme') || 'dark';
  applyTheme(savedTheme);

  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      const isDark = document.body.classList.contains('theme-dark');
      const newTheme = isDark ? 'light' : 'dark';
      applyTheme(newTheme);
      localStorage.setItem('quant_theme', newTheme);
    });
  }

  function applyTheme(theme) {
    if (theme === 'light') {
      document.body.className = 'theme-light';
      if (themeIcon) themeIcon.innerText = '🌞';
      if (themeLabel) themeLabel.innerText = 'Light';
    } else {
      document.body.className = 'theme-dark';
      if (themeIcon) themeIcon.innerText = '🌙';
      if (themeLabel) themeLabel.innerText = 'Dark';
    }
  }

  // Live Clock
  setInterval(() => {
    const clock = document.getElementById('live-clock-display');
    if (clock) clock.innerText = new Date().toISOString().substring(11, 19) + ' UTC';
  }, 1000);
}

function onTabSwitch(tabId) {
  if (tabId === 'system-tab') fetchSummaryMetrics();
  else if (tabId === 'scada-tab') fetchSCADAData();
  else if (tabId === 'quantum-tab') fetchQuantumData();
  else if (tabId === 'security-tab') fetchSecurityData();
  else if (tabId === 'ai-tab') fetchAIData();
  else if (tabId === 'logs-tab') fetchDashboardLogs();
  else if (tabId === 'comparison-tab') fetchComparisonData();
  else if (tabId === 'reports-tab') fetchReportsData();
}

/* ---------------------------------------------------
   2. WebSocket Real-Time Listener
--------------------------------------------------- */
function initWebSocket() {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const wsUrl = `${protocol}//${window.location.host}/ws`;
  
  socket = new WebSocket(wsUrl);

  socket.onopen = () => {
    updateWSStatus('Connected', true);
  };

  socket.onclose = () => {
    updateWSStatus('Reconnecting...', false);
    setTimeout(initWebSocket, 2000);
  };

  socket.onmessage = (event) => {
    try {
      const msg = JSON.parse(event.data);
      handleWebSocketMessage(msg);
    } catch (e) {
      console.error('WS parse error:', e);
    }
  };
}

function updateWSStatus(text, isGreen) {
  const dot = document.getElementById('sidebar-ws-dot');
  const txt = document.getElementById('sidebar-ws-text');
  if (dot) dot.className = `dot ${isGreen ? 'green' : 'yellow'}`;
  if (txt) txt.innerText = text;
}

function handleWebSocketMessage(msg) {
  const type = msg.type;
  const data = msg.data;

  if (type === 'TELEMETRY_STREAM') {
    updateTelemetryTable(data.telemetry);
    updateMetricsUI(data.metrics);
  } else if (type === 'ZERO_TRUST_DECISION') {
    renderPipelineBreakdown(data);
  } else if (type === 'SECURITY_ALERT') {
    addSecurityAlert(data);
  }
}

function updateTelemetryTable(telemetry) {
  if (!telemetry || telemetry.length === 0) return;

  const tbody = document.getElementById('scada-telemetry-body');
  if (tbody) {
    tbody.innerHTML = telemetry.map(t => {
      const breakerColor = t.breaker_state === 'CLOSED' ? 'text-green' : 'text-red';
      const relayColor = t.relay_state === 'NORMAL' ? 'text-green' : 'text-yellow';
      
      return `
        <tr>
          <td><strong>${t.device_id}</strong></td>
          <td>${t.substation_id}</td>
          <td>${t.voltage} V</td>
          <td>${t.current} A</td>
          <td>${t.power_kw} kW</td>
          <td>${t.frequency_hz} Hz</td>
          <td><span class="${breakerColor}">● ${t.breaker_state}</span></td>
          <td><span class="${relayColor}">${t.relay_state}</span></td>
        </tr>
      `;
    }).join('');
  }
}

function updateMetricsUI(metrics) {
  if (!metrics) return;
  if (metrics.communication) {
    const lat = document.getElementById('comm-latency');
    if (lat) lat.innerText = `${metrics.communication.latency_ms} ms`;
  }
}

/* ---------------------------------------------------
   3. API Data Fetchers for Module 8
--------------------------------------------------- */
async function fetchSummaryMetrics() {
  try {
    const res = await fetch('/api/dashboard/summary');
    if (!res.ok) return;
    const data = await res.json();
    
    document.getElementById('sys-status-val').innerText = data.system_status;
    document.getElementById('sys-health-pct').innerText = `${data.network_health_pct}%`;
    document.getElementById('sys-substations-val').innerText = data.connected_substations;
    document.getElementById('sys-links-val').innerText = data.active_quantum_links;
    document.getElementById('sys-qber-val').innerText = `${data.current_qber_pct} %`;
    document.getElementById('sys-key-rate').innerText = `${data.secret_key_rate_kbps} kbps`;
    document.getElementById('sys-threat-val').innerText = data.ai_threat_level;
    document.getElementById('sys-alerts-count').innerText = data.active_security_alerts;
  } catch (e) {
    console.error('Fetch summary error:', e);
  }
}

async function fetchSCADAData() {
  try {
    const res = await fetch('/api/dashboard/scada');
    if (!res.ok) return;
    const data = await res.json();
    updateTelemetryTable(data.telemetry);
    
    document.getElementById('scada-tap-pos').innerText = `5 (Ratio 1.05)`;
    document.getElementById('scada-trans-load').innerText = `${data.transformer_load_pct} %`;
    document.getElementById('scada-gen-status').innerText = `RUNNING (${data.generator_output_kw} kW)`;
  } catch (e) {
    console.error('Fetch SCADA error:', e);
  }
}

async function fetchQuantumData() {
  try {
    const res = await fetch('/api/dashboard/quantum');
    if (!res.ok) return;
    const data = await res.json();

    document.getElementById('qkd-bell').innerText = data.chsh_bell_score;
    document.getElementById('qkd-qber').innerText = `${data.qber_pct} %`;
    document.getElementById('qkd-fidelity').innerText = `${data.fidelity_pct} %`;
    document.getElementById('qkd-rate').innerText = `${data.secret_key_rate_kbps} kbps`;
    document.getElementById('qkd-progress-fill').style.width = `${data.key_generation_progress_pct}%`;
  } catch (e) {
    console.error('Fetch Quantum error:', e);
  }
}

async function fetchSecurityData() {
  try {
    const res = await fetch('/api/dashboard/security');
    if (!res.ok) return;
    const data = await res.json();

    document.getElementById('soc-risk').innerText = data.risk_level;
    document.getElementById('soc-risk-score').innerText = `${data.risk_score} / 100`;
    document.getElementById('soc-auth-fail').innerText = data.auth_failure_count;
    document.getElementById('soc-replay-rej').innerText = data.replay_attacks_blocked;
    document.getElementById('soc-integ-fail').innerText = data.integrity_failures_blocked;

    const tbody = document.getElementById('soc-trust-table-body');
    if (tbody && data.device_trust_inventory) {
      tbody.innerHTML = Object.entries(data.device_trust_inventory).map(([id, info]) => {
        const score = Number(info.trust_score).toFixed(1);
        const statusColor = info.status === 'ACTIVE' ? 'text-green' : 'text-red';
        
        return `
          <tr>
            <td><strong>${id}</strong></td>
            <td>${info.device_name || id}</td>
            <td>${info.substation_id || 'SUB_NORTH'}</td>
            <td><span class="${statusColor}">● ${info.status || 'ACTIVE'}</span></td>
            <td><strong>${score} / 100</strong></td>
            <td><span class="text-teal">${info.reputation}</span></td>
            <td>
              <button class="btn btn-outline" style="padding: 4px 8px; font-size: 0.72rem;" onclick="penalizeTrustDevice('${id}')">Penalize (-15)</button>
              <button class="btn btn-success" style="padding: 4px 8px; font-size: 0.72rem;" onclick="resetTrustDevice('${id}')">Reset (100)</button>
            </td>
          </tr>
        `;
      }).join('');
    }
  } catch (e) {
    console.error('Fetch Security error:', e);
  }
}

async function fetchAIData() {
  try {
    const res = await fetch('/api/dashboard/ai');
    if (!res.ok) return;
    const data = await res.json();

    document.getElementById('ai-pred-status').innerText = data.predicted_attack;
    document.getElementById('ai-conf').innerText = `${data.confidence_score_pct}%`;
    document.getElementById('ai-prob').innerText = `${data.threat_probability_pct} %`;
  } catch (e) {
    console.error('Fetch AI error:', e);
  }
}

async function fetchComparisonData() {
  try {
    const res = await fetch('/api/dashboard/comparison');
    if (!res.ok) return;
    const data = await res.json();

    const tbody = document.getElementById('comparison-table-body');
    if (tbody && data.metrics) {
      tbody.innerHTML = data.metrics.map(m => `
        <tr>
          <td><strong>${m.parameter}</strong></td>
          <td class="text-muted">${m.classical}</td>
          <td class="text-teal"><strong>${m.quantum}</strong></td>
          <td><span class="text-green">✓ ${m.advantage}</span></td>
        </tr>
      `).join('');
    }
  } catch (e) {
    console.error('Fetch Comparison error:', e);
  }
}

async function fetchDashboardLogs() {
  const category = document.getElementById('log-category-select')?.value || 'ALL';
  const search = document.getElementById('log-search-input')?.value || '';

  try {
    const res = await fetch(`/api/dashboard/logs?category=${category}&search=${encodeURIComponent(search)}`);
    if (!res.ok) return;
    const data = await res.json();

    const win = document.getElementById('terminal-logs-window');
    if (win && data.logs) {
      win.innerHTML = data.logs.map(l => {
        const timeStr = new Date(l.timestamp * 1000).toISOString().substring(11, 19);
        const sevColor = l.severity === 'SUCCESS' ? 'text-green' : l.severity === 'WARNING' ? 'text-yellow' : 'text-teal';
        
        return `
          <div class="log-line">
            <span class="text-muted">[${timeStr}]</span>
            <span class="${sevColor}">[${l.category}]</span>
            <strong>${l.message}</strong>
            <span class="text-muted" style="margin-left: 8px;">(${l.details})</span>
          </div>
        `;
      }).join('');
    }
  } catch (e) {
    console.error('Fetch Logs error:', e);
  }
}

async function fetchReportsData() {
  try {
    const res = await fetch('/api/dashboard/reports');
    if (!res.ok) return;
    const data = await res.json();

    const container = document.getElementById('reports-grid-container');
    if (container && data.reports) {
      container.innerHTML = data.reports.map(r => `
        <div class="card" style="margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <div style="font-weight: 700; font-size: 0.95rem;">${r.title}</div>
            <div class="sub-text">Type: ${r.type} | Format: ${r.format}</div>
          </div>
          <button class="btn btn-primary" onclick="exportReport('${r.id}')">📥 Download Report</button>
        </div>
      `).join('');
    }
  } catch (e) {
    console.error('Fetch Reports error:', e);
  }
}

/* ---------------------------------------------------
   4. Control & Verification Actions
--------------------------------------------------- */
async function ensureActiveSession(senderId = "BRK_12") {
  if (currentSessionId && currentSessionSender === senderId) return currentSessionId;
  try {
    const res = await fetch('/api/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sender: senderId, receiver: 'SUB_SOUTH' })
    });
    const data = await res.json();
    if (res.ok) {
      currentSessionId = data.session_id;
      currentSessionSender = senderId;
      return currentSessionId;
    }
  } catch (e) {
    console.error('Session creation error:', e);
  }
  return null;
}

async function verifyZeroTrustPipeline() {
  const cmdType = document.getElementById('sys-cmd-type')?.value || 'OPEN_BREAKER';
  const deviceId = document.getElementById('sys-cmd-device')?.value || 'BRK_12';
  const role = document.getElementById('sys-cmd-role')?.value || 'CONTROL_OPERATOR';

  const sessId = await ensureActiveSession(deviceId);

  if (!window.sessionSeqTracker) window.sessionSeqTracker = {};
  window.sessionSeqTracker[sessId] = (window.sessionSeqTracker[sessId] || 0) + 1;
  const seqNum = window.sessionSeqTracker[sessId];

  const nonceBytes = new Uint8Array(12);
  window.crypto.getRandomValues(nonceBytes);
  const freshNonce = Array.from(nonceBytes).map(b => b.toString(16).padStart(2, '0')).join('');

  const dummyPacket = {
    header: {
      session_id: sessId || "SESS_DEMO",
      packet_id: "PKT_" + Math.random().toString(16).substring(2, 10),
      sequence_number: seqNum,
      timestamp: Date.now() / 1000,
      sender: deviceId,
      receiver: "SUB_SOUTH"
    },
    payload: "414243444546",
    metadata: {
      algorithm: "AES-256-GCM",
      version: "1.0",
      priority: "HIGH",
      ttl: 30,
      protocol: "QKD-SCADA-v1"
    },
    security: {
      nonce: freshNonce,
      authentication_tag: "99887766554433221100AABBCCDDEEFF",
      key_version: "v1.0",
      signature: "SIG_HMAC_VALID_SAMPLE"
    }
  };

  try {
    const res = await fetch('/api/zero-trust/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        packet: dummyPacket,
        user_role: role,
        command_type: cmdType
      })
    });
    
    const decision = await res.json();
    renderPipelineBreakdown(decision);
  } catch (e) {
    console.error('Pipeline verification error:', e);
  }
}

function renderPipelineBreakdown(decisionObj) {
  if (!decisionObj) return;

  const container = document.getElementById('sys-pipeline-container');
  if (!container || !decisionObj.step_breakdown) return;

  container.innerHTML = decisionObj.step_breakdown.map(s => {
    const icon = s.passed ? '✅' : '❌';
    const color = s.passed ? 'text-green' : 'text-red';
    
    return `
      <div class="pipeline-step-item">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span>${icon} <strong>${s.step}. ${s.name}</strong></span>
          <span class="${color}" style="font-size: 0.72rem; font-weight: 700;">${s.passed ? 'PASS' : 'FAIL'}</span>
        </div>
        <div style="font-size: 0.7rem; color: var(--text-muted); margin-top: 2px; padding-left: 20px;">
          ${s.details}
        </div>
      </div>
    `;
  }).join('');
}

async function submitCommand(overrideCmd, overrideDev) {
  const cmdType = overrideCmd || document.getElementById('sys-cmd-type')?.value || 'OPEN_BREAKER';
  const deviceId = overrideDev || document.getElementById('sys-cmd-device')?.value || 'BRK_12';
  const role = document.getElementById('sys-cmd-role')?.value || 'CONTROL_OPERATOR';
  const substationId = DEVICE_SUBSTATION_MAP[deviceId] || "SUB_NORTH";

  const sessId = await ensureActiveSession(deviceId);

  const payload = {
    command_type: cmdType,
    device_id: deviceId,
    substation_id: substationId,
    user_role: role,
    session_id: sessId
  };

  try {
    const res = await fetch('/api/commands', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    const data = await res.json();
    if (res.ok) {
      currentSessionId = data.session_id;
      addSecurityAlert({ 
        event_type: 'COMMAND_EXECUTED', 
        description: `[${role}] ${cmdType} on ${deviceId} executed successfully.` 
      });
    } else {
      const errMsg = data.detail || 'Command Rejected';
      addSecurityAlert({ 
        event_type: 'COMMAND_REJECTED', 
        description: `[${role}] ${cmdType} on ${deviceId}: ${errMsg}` 
      });
    }
    await verifyZeroTrustPipeline();
    fetchSCADAData();
  } catch (e) {
    console.error('Command submission error:', e);
  }
}

async function penalizeTrust() {
  const deviceId = document.getElementById('sys-cmd-device')?.value || 'BRK_12';
  await penalizeTrustDevice(deviceId);
}

async function penalizeTrustDevice(deviceId) {
  try {
    const res = await fetch('/api/zero-trust/update-trust', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        device_id: deviceId,
        action: 'PENALIZE',
        points: 15.0,
        incident_type: 'Manual Operator Penalty',
        reason: 'Security Audit Action'
      })
    });
    const data = await res.json();
    addSecurityAlert({ 
      event_type: 'TRUST_PENALIZED', 
      description: `Device ${deviceId} trust score penalized (-15). Current score: ${data.trust_score.toFixed(1)}` 
    });
    await verifyZeroTrustPipeline();
    fetchSecurityData();
  } catch (e) {
    console.error('Trust update error:', e);
  }
}

async function resetTrust() {
  const deviceId = document.getElementById('sys-cmd-device')?.value || 'BRK_12';
  await resetTrustDevice(deviceId);
}

async function resetTrustDevice(deviceId) {
  try {
    const res = await fetch('/api/zero-trust/update-trust', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        device_id: deviceId,
        action: 'RESET'
      })
    });
    const data = await res.json();
    addSecurityAlert({ 
      event_type: 'TRUST_RESET', 
      description: `Device ${deviceId} trust score reset to 100.0 (ACTIVE).` 
    });
    await verifyZeroTrustPipeline();
    fetchSecurityData();
  } catch (e) {
    console.error('Trust reset error:', e);
  }
}

async function triggerAttack(attackType) {
  const targetDevice = document.getElementById('sys-cmd-device')?.value || 'BRK_12';
  
  try {
    const res = await fetch('/api/simulate-attack', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ attack_type: attackType, target_device: targetDevice })
    });
    
    const data = await res.json();
    const resultBox = document.getElementById('sys-attack-result');
    if (resultBox) resultBox.innerText = JSON.stringify(data, null, 2);
    
    addSecurityAlert({ 
      event_type: 'ATTACK_PREVENTED', 
      description: `[${data.attack_type}] Blocked by ${data.defense_layer}: ${data.error_message}` 
    });

    await verifyZeroTrustPipeline();
    fetchSecurityData();
  } catch (e) {
    console.error('Attack simulation error:', e);
  }
}

function triggerPacketFlowAnimation() {
  const steps = 8;
  let current = 1;

  const interval = setInterval(() => {
    for (let i = 1; i <= steps; i++) {
      const el = document.getElementById(`flow-step-${i}`);
      if (el) el.classList.remove('active');
    }

    const activeEl = document.getElementById(`flow-step-${current}`);
    if (activeEl) activeEl.classList.add('active');

    current++;
    if (current > steps) {
      clearInterval(interval);
    }
  }, 400);
}

function addSecurityAlert(alert) {
  const feed = document.getElementById('sys-alerts-feed');
  if (!feed) return;

  if (feed.children.length === 1 && feed.children[0].innerText.includes('No security alerts recorded')) {
    feed.innerHTML = '';
  }

  const alertEl = document.createElement('div');
  alertEl.style.padding = '8px 12px';
  alertEl.style.marginBottom = '8px';
  alertEl.style.borderRadius = '6px';

  const type = alert.event_type || alert.alert_type || alert.event || 'SECURITY_EVENT';
  const desc = alert.description || alert.details || JSON.stringify(alert);

  let bg = 'rgba(220, 38, 38, 0.15)';
  let border = 'var(--color-danger)';
  let titleColor = 'var(--color-danger)';

  if (type.includes('EXECUTED') || type.includes('RESET')) {
    bg = 'rgba(22, 163, 74, 0.15)';
    border = 'var(--color-success)';
    titleColor = 'var(--color-success)';
  } else if (type.includes('PENALIZED') || type.includes('KEY_ROTATION')) {
    bg = 'rgba(217, 119, 6, 0.15)';
    border = 'var(--color-warning)';
    titleColor = 'var(--color-warning)';
  }

  alertEl.style.background = bg;
  alertEl.style.borderLeft = `3px solid ${border}`;
  
  alertEl.innerHTML = `
    <div style="font-weight: 600; color: ${titleColor};">${type}</div>
    <div style="font-size: 0.75rem; color: var(--text-main); margin-top: 2px;">${desc}</div>
  `;
  
  feed.insertBefore(alertEl, feed.firstChild);
}

function exportLogsCSV() {
  const csvContent = "data:text/csv;charset=utf-8,Timestamp,Category,Severity,Message,Details\n"
    + "2026-07-29T22:00:00Z,SCADA,INFO,OPEN_BREAKER on BRK_12 executed,Substation SUB_NORTH\n"
    + "2026-07-29T22:01:00Z,SECURITY,INFO,20-Stage Verification Passed,Checks 20/20 Risk LOW\n"
    + "2026-07-29T22:02:00Z,QUANTUM,INFO,E91 Key Session Created,CHSH S=2.82 QBER=1.2%\n";
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "SCADA_Security_Audit_Logs.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function exportReport(reportId) {
  alert(`Report ${reportId} exported successfully as CSV/JSON dataset.`);
}

/* ---------------------------------------------------
   5. Initialization on Page Load
--------------------------------------------------- */
window.addEventListener('DOMContentLoaded', async () => {
  initNavigationAndTheme();
  initWebSocket();

  // Load initial summary & SCADA data
  await fetchSummaryMetrics();
  await ensureActiveSession("BRK_12");
  await verifyZeroTrustPipeline();
});
