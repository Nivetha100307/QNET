import React from "react";

export const AboutPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="glass-panel p-6 rounded-2xl">
        <h1 className="font-title text-2xl font-bold text-[#f0f4fc]">About Ekert 91 (E91) Protocol</h1>
        <p className="text-xs text-[#8c9ba5]">Quantum non-locality, Bell inequality violations, and cybersecurity physics.</p>
      </div>

      <div className="glass-panel p-6 rounded-2xl space-y-4 text-xs text-[#8c9ba5] leading-relaxed max-w-3xl">
        <p>
          The Ekert 91 protocol (E91) was invented by Artur Ekert in 1991. Unlike single-photon protocols (such as BB84),
          E91 relies on quantum entanglement between pairs of photons generated in the Bell state |Φ+⟩ = 1/√2 (|00⟩ + |11⟩).
        </p>
        <p>
          Security is guaranteed by testing the Clauser-Horne-Shimony-Holt (CHSH) inequality parameter S.
          Quantum entanglement yields S = 2√2 ≈ 2.8284 &gt; 2.0, proving that the channels are free of eavesdropping.
        </p>
      </div>
    </div>
  );
};
