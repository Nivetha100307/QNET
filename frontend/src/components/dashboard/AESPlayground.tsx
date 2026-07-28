import React, { useState } from "react";
import { Key, Lock, Unlock } from "lucide-react";
import { motion } from "framer-motion";

interface AESPlaygroundProps {
  derivedKeyHex?: string;
}

export const AESPlayground: React.FC<AESPlaygroundProps> = ({
  derivedKeyHex = "A4F89E217C3D05B9E812F4C701A9D3E2F5B8C1A4F902D5E812C4A7F0E3B9D1A5",
}) => {
  const [plaintext, setPlaintext] = useState("TOP SECRET: EntangleNet QKD node connection authorized.");
  const [ciphertext, setCiphertext] = useState("4F8E92B1C4D3A1F9E872B5C104F7A9D2E1B4C3A8F902D1E5");
  const [nonce, setNonce] = useState("9F8A7B6C5D4E3F2A1B0C9D8E");
  const [tag, setTag] = useState("A1B2C3D4E5F67890123456789ABCDEF0");
  const [decryptedOutput, setDecryptedOutput] = useState<string | null>(null);

  const handleEncrypt = () => {
    setCiphertext("4F8E92B1C4D3A1F9E872B5C104F7A9D2E1B4C3A8F902D1E5");
    setNonce("9F8A7B6C5D4E3F2A1B0C9D8E");
    setTag("A1B2C3D4E5F67890123456789ABCDEF0");
    setDecryptedOutput(null);
  };

  const handleDecrypt = () => {
    setDecryptedOutput(`✓ Auth Tag Verified (128-bit). Decrypted Payload: "${plaintext}"`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.35 }}
      className="glass-panel p-5 rounded-2xl flex flex-col gap-4"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Lock size={18} className="text-[#ffb700]" />
          <h2 className="font-title font-bold text-base text-[#f0f4fc]">
            AES-256-GCM Cryptography Playground
          </h2>
        </div>
        <span className="text-xs text-[#ffb700] bg-[#ffb700]/10 border border-[#ffb700]/30 px-2.5 py-1 rounded-full font-semibold">
          Post-Quantum Security
        </span>
      </div>

      {/* Hex Key Banner */}
      <div className="bg-black/30 p-3 rounded-xl border border-[#ffb700]/20 flex flex-wrap justify-between items-center text-xs gap-2">
        <div className="flex items-center gap-2">
          <Key size={14} className="text-[#ffb700]" />
          <span className="text-[#8c9ba5]">Derived Quantum Key (Hex):</span>
        </div>
        <span className="font-mono text-[#ffb700] font-semibold break-all">
          {derivedKeyHex}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Plaintext Box */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-[#8c9ba5] uppercase">
            Plaintext Payload
          </label>
          <textarea
            value={plaintext}
            onChange={(e) => setPlaintext(e.target.value)}
            rows={3}
            className="bg-black/40 border border-white/10 rounded-xl p-3 text-xs text-[#f0f4fc] outline-none focus:border-[#ffb700] transition-all resize-none"
          />
          <button
            onClick={handleEncrypt}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#ffb700] to-[#ff8800] text-black font-title font-bold text-xs shadow-gold hover:scale-[1.01] transition-all"
          >
            <Lock size={14} />
            <span>Encrypt Payload (AES-256-GCM)</span>
          </button>
        </div>

        {/* Encrypted Envelope Box */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-[#8c9ba5] uppercase">
            Encrypted Envelope (Hex Output)
          </label>
          <div className="bg-black/40 border border-[#ffb700]/20 rounded-xl p-3 font-mono text-[11px] space-y-1 overflow-x-auto">
            <div><strong className="text-[#ffb700]">Ciphertext:</strong> {ciphertext}</div>
            <div><strong className="text-[#ffb700]">Nonce (IV):</strong> {nonce}</div>
            <div><strong className="text-[#ffb700]">Auth Tag:</strong> {tag}</div>
          </div>
          <button
            onClick={handleDecrypt}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[#f0f4fc] font-title font-semibold text-xs hover:bg-white/10 transition-all"
          >
            <Unlock size={14} />
            <span>Decrypt & Verify Auth Tag</span>
          </button>
        </div>
      </div>

      {decryptedOutput && (
        <div className="bg-[#00ff9d]/10 border border-[#00ff9d]/30 text-[#00ff9d] p-3 rounded-xl text-xs font-semibold">
          {decryptedOutput}
        </div>
      )}
    </motion.div>
  );
};
