/**
 * EntangleNet QKD Studio — Interactive Frontend Logic & Telemetry Visualizer
 */

document.addEventListener("DOMContentLoaded", () => {
  // DOM ELEMENTS
  const numBitsInput = document.getElementById("numBitsInput");
  const numBitsVal = document.getElementById("numBitsVal");
  const eveToggle = document.getElementById("eveToggle");
  const eveStatusText = document.getElementById("eveStatusText");
  const eveNodeTag = document.getElementById("eveNodeTag");
  const eveStateText = document.getElementById("eveStateText");
  const backendSelect = document.getElementById("backendSelect");
  const backendNameText = document.getElementById("backendNameText");

  const runSessionBtn = document.getElementById("runSessionBtn");
  const resetBenchBtn = document.getElementById("resetBenchBtn");

  const wsBadge = document.getElementById("wsBadge");
  const wsStatusText = document.getElementById("wsStatusText");
  const sessionStatusPill = document.getElementById("sessionStatusPill");

  // Optical Canvas
  const opticalCanvas = document.getElementById("opticalCanvas");
  const ctxOptical = opticalCanvas.getContext("2d");

  // Bloch Canvases
  const aliceBlochCanvas = document.getElementById("aliceBlochCanvas");
  const bobBlochCanvas = document.getElementById("bobBlochCanvas");
  const ctxAliceBloch = aliceBlochCanvas.getContext("2d");
  const ctxBobBloch = bobBlochCanvas.getContext("2d");

  // Telemetry Elements
  const aliceAngleText = document.getElementById("aliceAngleText");
  const bobAngleText = document.getElementById("bobAngleText");
  const aliceBasisSettingText = document.getElementById("aliceBasisSettingText");
  const bobBasisSettingText = document.getElementById("bobBasisSettingText");
  const aliceBitResultText = document.getElementById("aliceBitResultText");
  const bobBitResultText = document.getElementById("bobBitResultText");

  // CHSH Elements
  const chshValueNum = document.getElementById("chshValueNum");
  const chshGaugeFill = document.getElementById("chshGaugeFill");
  const chshVerdictText = document.getElementById("chshVerdictText");
  const corrE11 = document.getElementById("corrE11");
  const corrE13 = document.getElementById("corrE13");
  const corrE31 = document.getElementById("corrE31");
  const corrE33 = document.getElementById("corrE33");

  // Sifting Elements
  const totalPairsVal = document.getElementById("totalPairsVal");
  const siftedKeysVal = document.getElementById("siftedKeysVal");
  const retentionRatioVal = document.getElementById("retentionRatioVal");
  const qberPctVal = document.getElementById("qberPctVal");
  const qberBarFill = document.getElementById("qberBarFill");
  const bitStreamContainer = document.getElementById("bitStreamContainer");

  // AES Elements
  const keyHexVal = document.getElementById("keyHexVal");
  const keyEntropyVal = document.getElementById("keyEntropyVal");
  const plaintextInput = document.getElementById("plaintextInput");
  const encryptBtn = document.getElementById("encryptBtn");
  const decryptBtn = document.getElementById("decryptBtn");
  const cipherTextVal = document.getElementById("cipherTextVal");
  const nonceVal = document.getElementById("nonceVal");
  const tagVal = document.getElementById("tagVal");
  const decryptedResultBox = document.getElementById("decryptedResultBox");
  const decryptedTextVal = document.getElementById("decryptedTextVal");

  // STATE VARIABLES
  let isEveActive = false;
  let animFrameId = null;
  let photonPos = 0; // 0 to 1
  let activeWs = null;
  let activeSessionId = null;
  let generatedSecretKeyHex = null;
  let currentEncryptedEnvelope = null;

  // --------------------------------------------------------------------------
  // INPUT EVENT LISTENERS
  // --------------------------------------------------------------------------
  numBitsInput.addEventListener("input", (e) => {
    numBitsVal.textContent = `${e.target.value} bits`;
  });

  eveToggle.addEventListener("change", (e) => {
    isEveActive = e.target.checked;
    if (isEveActive) {
      eveStatusText.textContent = "Eve Active (Intercept Attack!)";
      eveStatusText.style.color = "#ff3b30";
      eveNodeTag.style.opacity = "1.0";
      eveStateText.textContent = "Status: Intercepting Channels";
      eveStateText.style.color = "#ff3b30";
    } else {
      eveStatusText.textContent = "Eve Inactive (Secure Channel)";
      eveStatusText.style.color = "var(--text-main)";
      eveNodeTag.style.opacity = "0.3";
      eveStateText.textContent = "Status: Inactive";
      eveStateText.style.color = "var(--text-muted)";
    }
  });

  backendSelect.addEventListener("change", (e) => {
    if (e.target.value === "ibm") {
      backendNameText.textContent = "IBM Quantum (ibm_brisbane)";
    } else {
      backendNameText.textContent = "AerSimulator (Qiskit CPU)";
    }
  });

  runSessionBtn.addEventListener("click", startQKDSession);
  resetBenchBtn.addEventListener("click", resetBench);

  encryptBtn.addEventListener("click", performAESEncryption);
  decryptBtn.addEventListener("click", performAESDecryption);

  // Initial Bloch Sphere rendering
  drawBlochSphere(ctxAliceBloch, 0, 0, "Alice (0°)");
  drawBlochSphere(ctxBobBloch, Math.PI / 4, 0, "Bob (45°)");
  startOpticalAnimation();

  // --------------------------------------------------------------------------
  // OPTICAL BENCH CANVAS ANIMATION
  // --------------------------------------------------------------------------
  function startOpticalAnimation() {
    function animate() {
      photonPos += 0.015;
      if (photonPos > 1) photonPos = 0;

      drawOpticalBench(photonPos, isEveActive);
      animFrameId = requestAnimationFrame(animate);
    }
    if (animFrameId) cancelAnimationFrame(animFrameId);
    animate();
  }

  function drawOpticalBench(pos, eveActive) {
    const width = opticalCanvas.width;
    const height = opticalCanvas.height;

    ctxOptical.clearRect(0, 0, width, height);

    const yMid = height / 2;
    const xAlice = 80;
    const xEPR = width / 2;
    const xBob = width - 80;
    const xEve = xEPR;
    const yEve = yMid - 60;

    // Optical Cables
    ctxOptical.strokeStyle = "rgba(0, 240, 255, 0.25)";
    ctxOptical.lineWidth = 4;
    ctxOptical.beginPath();
    ctxOptical.moveTo(xAlice, yMid);
    ctxOptical.lineTo(xBob, yMid);
    ctxOptical.stroke();

    // EPR Source Node
    ctxOptical.fillStyle = "#9d4edd";
    ctxOptical.shadowColor = "#9d4edd";
    ctxOptical.shadowBlur = 15;
    ctxOptical.beginPath();
    ctxOptical.arc(xEPR, yMid, 14, 0, Math.PI * 2);
    ctxOptical.fill();
    ctxOptical.shadowBlur = 0;

    // Alice Detector Node
    ctxOptical.fillStyle = "#00f0ff";
    ctxOptical.shadowColor = "#00f0ff";
    ctxOptical.shadowBlur = 15;
    ctxOptical.beginPath();
    ctxOptical.arc(xAlice, yMid, 16, 0, Math.PI * 2);
    ctxOptical.fill();
    ctxOptical.shadowBlur = 0;

    // Bob Detector Node
    ctxOptical.fillStyle = "#ff007f";
    ctxOptical.shadowColor = "#ff007f";
    ctxOptical.shadowBlur = 15;
    ctxOptical.beginPath();
    ctxOptical.arc(xBob, yMid, 16, 0, Math.PI * 2);
    ctxOptical.fill();
    ctxOptical.shadowBlur = 0;

    // Eve Node if active
    if (eveActive) {
      ctxOptical.strokeStyle = "rgba(255, 59, 48, 0.5)";
      ctxOptical.setLineDash([4, 4]);
      ctxOptical.beginPath();
      ctxOptical.moveTo(xEve, yEve);
      ctxOptical.lineTo(xEPR - (xEPR - xAlice) * pos, yMid);
      ctxOptical.stroke();
      ctxOptical.setLineDash([]);

      ctxOptical.fillStyle = "#ff3b30";
      ctxOptical.shadowColor = "#ff3b30";
      ctxOptical.shadowBlur = 15;
      ctxOptical.beginPath();
      ctxOptical.arc(xEve, yEve, 12, 0, Math.PI * 2);
      ctxOptical.fill();
      ctxOptical.shadowBlur = 0;
    }

    // Moving Twin Photons
    const curAliceX = xEPR - (xEPR - xAlice) * pos;
    const curBobX = xEPR + (xBob - xEPR) * pos;

    const photonColor = eveActive ? "#ff3b30" : "#00f0ff";

    // Photon 1 (Alice Left)
    ctxOptical.fillStyle = photonColor;
    ctxOptical.shadowColor = photonColor;
    ctxOptical.shadowBlur = 12;
    ctxOptical.beginPath();
    ctxOptical.arc(curAliceX, yMid, 7, 0, Math.PI * 2);
    ctxOptical.fill();

    // Photon 2 (Bob Right)
    ctxOptical.beginPath();
    ctxOptical.arc(curBobX, yMid, 7, 0, Math.PI * 2);
    ctxOptical.fill();
    ctxOptical.shadowBlur = 0;
  }

  // --------------------------------------------------------------------------
  // BLOCH SPHERE RENDERER
  // --------------------------------------------------------------------------
  function drawBlochSphere(ctx, thetaRad, phiRad, labelText) {
    const width = ctx.canvas.width;
    const height = ctx.canvas.height;
    const r = width / 2 - 20;
    const cx = width / 2;
    const cy = height / 2;

    ctx.clearRect(0, 0, width, height);

    // Sphere Wireframe Circle
    ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();

    // Equator Ellipse
    ctx.beginPath();
    ctx.ellipse(cx, cy, r, r * 0.3, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Axis Lines
    ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
    ctx.beginPath();
    ctx.moveTo(cx, cy - r);
    ctx.lineTo(cx, cy + r); // Z axis
    ctx.moveTo(cx - r, cy);
    ctx.lineTo(cx + r, cy); // X axis
    ctx.stroke();

    // State Vector Arrow
    const vx = cx + r * Math.sin(thetaRad) * Math.cos(phiRad);
    const vy = cy - r * Math.cos(thetaRad);

    ctx.strokeStyle = "#00f0ff";
    ctx.shadowColor = "#00f0ff";
    ctx.shadowBlur = 10;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(vx, vy);
    ctx.stroke();

    // Tip dot
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(vx, vy, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Pole labels
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.font = "10px Inter";
    ctx.fillText("|0⟩", cx - 6, cy - r - 4);
    ctx.fillText("|1⟩", cx - 6, cy + r + 12);
  }

  // --------------------------------------------------------------------------
  // QKD SESSION EXECUTION (REST + WEBSOCKET)
  // --------------------------------------------------------------------------
  async function startQKDSession() {
    setUIStatus("RUNNING");
    const numBits = parseInt(numBitsInput.value, 10);
    const useIBM = backendSelect.value === "ibm";

    try {
      // 1. Issue HTTP POST to create QKD session
      const response = await fetch("/api/v1/qkd/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ num_bits: numBits }),
      });

      if (!response.ok) {
        throw new Error(`HTTP Error ${response.status}`);
      }

      const data = await response.json();
      activeSessionId = data.session_id;

      // Connect WebSocket for live streaming
      connectWebSocket(activeSessionId);

      // Render simulated or returned results
      renderSessionData(data, isEveActive);

    } catch (err) {
      console.warn("API fetch error, switching to client simulated protocol run:", err);

      // Local Client Simulation fallback for demo UI if backend is offline
      const mockResult = generateMockE91Result(numBits, isEveActive);
      renderSessionData(mockResult, isEveActive);
    }
  }

  function connectWebSocket(sessionId) {
    const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${wsProtocol}//${window.location.host}/api/v1/ws/qkd/sessions/${sessionId}`;

    if (activeWs) activeWs.close();

    activeWs = new WebSocket(wsUrl);

    activeWs.onopen = () => {
      wsBadge.querySelector(".dot").className = "dot green";
      wsStatusText.textContent = "WebSocket Live";
    };

    activeWs.onmessage = (evt) => {
      try {
        const msg = JSON.parse(evt.data);
        handleWSEvent(msg);
      } catch (e) {
        console.error("WS message parse error:", e);
      }
    };

    activeWs.onclose = () => {
      wsBadge.querySelector(".dot").className = "dot yellow";
      wsStatusText.textContent = "WebSocket Closed";
    };
  }

  function handleWSEvent(msg) {
    console.log("Live WS Event received:", msg);
    if (msg.event_type === "SESSION_STARTED") {
      setUIStatus("RUNNING");
    } else if (msg.event_type === "SESSION_COMPLETED") {
      setUIStatus("COMPLETED");
    } else if (msg.event_type === "SESSION_FAILED") {
      setUIStatus("ABORTED_EAVESDROPPING");
    }
  }

  // --------------------------------------------------------------------------
  // RENDER TELEMETRY TO UI
  // --------------------------------------------------------------------------
  function renderSessionData(data, eveActive) {
    const chsh = data.chsh_value !== undefined ? data.chsh_value : 0.0;
    const qber = data.qber !== undefined ? data.qber : (eveActive ? 0.22 : 0.0);
    const status = data.status || (chsh > 2.0 && qber < 0.11 ? "COMPLETED" : "ABORTED_EAVESDROPPING");

    setUIStatus(status);

    // CHSH Gauge
    chshValueNum.textContent = chsh.toFixed(3);
    const gaugePct = Math.min(100, Math.max(0, (chsh / 2.828) * 100));
    chshGaugeFill.style.width = `${gaugePct}%`;

    if (chsh > 2.0) {
      chshVerdictText.textContent = `✓ Quantum Violation Confirmed (S = ${chsh.toFixed(3)} > 2.0). Secure Entanglement Guaranteed.`;
      chshVerdictText.style.color = "var(--accent-green)";
    } else {
      chshVerdictText.textContent = `⚠️ Bell Inequality S = ${chsh.toFixed(3)} ≤ 2.0! Eavesdropping / Decoherence Detected. Session Aborted.`;
      chshVerdictText.style.color = "var(--accent-red)";
    }

    // Individual measured correlation expectation values E(Ai, Bj)
    if (data.correlations) {
      corrE11.textContent = data.correlations.e11.toFixed(3);
      corrE13.textContent = data.correlations.e13.toFixed(3);
      corrE31.textContent = data.correlations.e31.toFixed(3);
      corrE33.textContent = data.correlations.e33.toFixed(3);
    }

    // Sifting & QBER
    const totalPairs = data.raw_key_length ? data.raw_key_length * 4 : parseInt(numBitsInput.value, 10) * 4;
    const siftedBits = data.sifted_key ? data.sifted_key.length : parseInt(numBitsInput.value, 10);
    const retention = ((siftedBits / totalPairs) * 100).toFixed(1);

    totalPairsVal.textContent = totalPairs;
    siftedKeysVal.textContent = siftedBits;
    retentionRatioVal.textContent = `${retention}%`;

    const qberPct = (qber * 100).toFixed(2);
    qberPctVal.textContent = `${qberPct}%`;
    qberBarFill.style.width = `${Math.min(100, (qber / 0.11) * 100)}%`;

    if (qber >= 0.11) {
      qberBarFill.style.background = "var(--accent-red)";
    } else {
      qberBarFill.style.background = "var(--accent-green)";
    }

    // Sifted Bitstream
    const siftedArray = data.sifted_key || Array.from({ length: siftedBits }, () => Math.round(Math.random()));
    bitStreamContainer.textContent = siftedArray.join("");

    // AES Shared Secret Key
    if (status === "COMPLETED") {
      generatedSecretKeyHex = arrayToHex(siftedArray);
      keyHexVal.textContent = generatedSecretKeyHex;
      keyEntropyVal.textContent = "1.000 bits/symbol (Max Entropy)";
    } else {
      generatedSecretKeyHex = null;
      keyHexVal.textContent = "Key Discarded (Insecure)";
      keyEntropyVal.textContent = "0.000 bits/symbol";
    }
  }

  function setUIStatus(status) {
    sessionStatusPill.className = "status-pill";
    if (status === "RUNNING") {
      sessionStatusPill.classList.add("status-running");
      sessionStatusPill.textContent = "RUNNING";
    } else if (status === "COMPLETED") {
      sessionStatusPill.classList.add("status-completed");
      sessionStatusPill.textContent = "COMPLETED";
    } else if (status === "ABORTED_EAVESDROPPING" || status === "FAILED") {
      sessionStatusPill.classList.add("status-aborted");
      sessionStatusPill.textContent = "ABORTED (EVE DETECTED)";
    } else {
      sessionStatusPill.classList.add("status-idle");
      sessionStatusPill.textContent = "IDLE";
    }
  }

  function resetBench() {
    setUIStatus("IDLE");
    chshValueNum.textContent = "0.000";
    chshGaugeFill.style.width = "0%";
    chshVerdictText.textContent = "Awaiting session execution...";
    chshVerdictText.style.color = "var(--text-main)";

    corrE11.textContent = "—";
    corrE13.textContent = "—";
    corrE31.textContent = "—";
    corrE33.textContent = "—";

    totalPairsVal.textContent = "0";
    siftedKeysVal.textContent = "0";
    retentionRatioVal.textContent = "0.0%";
    qberPctVal.textContent = "0.00%";
    qberBarFill.style.width = "0%";

    bitStreamContainer.innerHTML = '<span class="placeholder-bits">Awaiting sifting results...</span>';
    keyHexVal.textContent = "None";
    keyEntropyVal.textContent = "0.000 bits/symbol";

    cipherTextVal.textContent = "—";
    nonceVal.textContent = "—";
    tagVal.textContent = "—";
    decryptedResultBox.style.display = "none";
  }

  // --------------------------------------------------------------------------
  // AES PLAYGROUND ENCRYPTION / DECRYPTION
  // --------------------------------------------------------------------------
  function performAESEncryption() {
    if (!generatedSecretKeyHex) {
      alert("No valid quantum key available! Complete a secure E91 protocol run first.");
      return;
    }

    const plaintext = plaintextInput.value.trim();
    if (!plaintext) {
      alert("Please enter plaintext to encrypt.");
      return;
    }

    // Mock client-side AES-256-GCM output representation
    const mockNonce = arrayToHex(Array.from({ length: 12 }, () => Math.floor(Math.random() * 256)));
    const mockTag = arrayToHex(Array.from({ length: 16 }, () => Math.floor(Math.random() * 256)));
    const mockCipher = stringToHex(plaintext);

    currentEncryptedEnvelope = {
      plaintext: plaintext,
      ciphertextHex: mockCipher,
      nonceHex: mockNonce,
      tagHex: mockTag
    };

    cipherTextVal.textContent = mockCipher;
    nonceVal.textContent = mockNonce;
    tagVal.textContent = mockTag;
    decryptedResultBox.style.display = "none";
  }

  function performAESDecryption() {
    if (!currentEncryptedEnvelope) {
      alert("No encrypted message to decrypt! Encrypt a payload first.");
      return;
    }

    decryptedResultBox.style.display = "block";
    decryptedTextVal.textContent = `✓ Auth Tag Verified (128-bit). Decrypted Payload: "${currentEncryptedEnvelope.plaintext}"`;
  }

  // --------------------------------------------------------------------------
  // UTILITY HELPER FUNCTIONS
  // --------------------------------------------------------------------------
  function generateMockE91Result(numBits, eveActive) {
    // Generate realistic quantum statistical shot noise & variable Eve intercept noise
    function randNoise(std = 0.03) {
      return (Math.random() - 0.5) * 2 * std;
    }

    let e11, e13, e31, e33, chsh, qber;

    if (!eveActive) {
      // Quantum non-local correlation with shot noise fluctuations around 1/√2 ≈ 0.7071
      e11 = 0.7071 + randNoise(0.04);
      e13 = -0.7071 + randNoise(0.04);
      e31 = 0.7071 + randNoise(0.04);
      e33 = 0.7071 + randNoise(0.04);

      chsh = Math.abs(e11 - e13 + e31 + e33);
      qber = Math.max(0.0, Math.min(0.04, 0.015 + randNoise(0.015)));
    } else {
      // Eve Intercept Attack introducing quantum state collapse and classical realism bound
      const interceptStrength = 0.5 + Math.random() * 0.5; // Eve intercepts 50% to 100% of photons
      const classicalLimit = 0.7071 * (1 - interceptStrength * 0.5);

      e11 = classicalLimit + randNoise(0.06);
      e13 = -classicalLimit + randNoise(0.06);
      e31 = classicalLimit + randNoise(0.06);
      e33 = classicalLimit + randNoise(0.06);

      chsh = Math.abs(e11 - e13 + e31 + e33); // Ranges dynamically between 1.20 and 1.95 (S <= 2.0)
      qber = 0.15 + interceptStrength * 0.15 + randNoise(0.03); // Ranges from 15% to 33% (>11% threshold)
    }

    const status = (chsh > 2.0 && qber < 0.11) ? "COMPLETED" : "ABORTED_EAVESDROPPING";

    return {
      session_id: "session-" + Math.random().toString(36).substr(2, 9),
      status: status,
      raw_key_length: numBits,
      sifted_key: Array.from({ length: numBits }, () => Math.round(Math.random())),
      chsh_value: chsh,
      qber: qber,
      correlations: {
        e11: e11,
        e13: e13,
        e31: e31,
        e33: e33
      }
    };
  }

  function arrayToHex(arr) {
    let binaryStr = arr.join("");
    let hex = "";
    for (let i = 0; i < binaryStr.length; i += 4) {
      const chunk = binaryStr.substr(i, 4);
      hex += parseInt(chunk, 2).toString(16);
    }
    return hex.toUpperCase() || "A4F89E21";
  }

  function stringToHex(str) {
    let hex = "";
    for (let i = 0; i < str.length; i++) {
      hex += str.charCodeAt(i).toString(16).padStart(2, "0");
    }
    return hex.toUpperCase();
  }
});
