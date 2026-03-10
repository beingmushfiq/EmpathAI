"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

const PERSONALITIES = [
  { id: "empathetic", label: "Empathetic", emoji: "💜", desc: "Warm, validating, emotionally attuned" },
  { id: "encouraging", label: "Encouraging", emoji: "⚡️", desc: "Motivating, energetic, solution-focused" },
  { id: "analytical", label: "Analytical", emoji: "🧠", desc: "Thoughtful, structured, detail-oriented" },
  { id: "playful", label: "Playful", emoji: "🌟", desc: "Light-hearted, humorous, creative" },
];

const TONES = [
  { id: "warm", label: "Warm & Gentle" },
  { id: "professional", label: "Professional" },
  { id: "casual", label: "Casual & Friendly" },
  { id: "direct", label: "Direct & Concise" },
];

const AVATARS = ["🦋", "🌙", "🌸", "✨", "🔮", "🌿", "💫", "🎭"];

const itemVariant = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.45, ease: "easeOut" as const },
  }),
};

export default function PersonaPage() {
  const router = useRouter();
  const [name, setName] = useState("Luna");
  const [personality, setPersonality] = useState("empathetic");
  const [tone, setTone] = useState("warm");
  const [avatar, setAvatar] = useState("🦋");
  const [bio, setBio] = useState("");
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    setCreating(true);
    // Simulate API call
    await new Promise((r) => setTimeout(r, 2000));
    router.push("/dashboard");
  };

  return (
    <main className="min-h-screen bg-[hsl(240,15%,6%)] flex items-center justify-center p-6 relative overflow-hidden">
      <div className="orb orb-brand absolute w-[500px] h-[500px] -top-40 -right-40 opacity-20" />
      <div className="orb orb-accent absolute w-[400px] h-[400px] -bottom-20 -left-20 opacity-15" />

      <div className="w-full max-w-2xl">
        {/* Header */}
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-400 to-accent-500 flex items-center justify-center">
              <span>✦</span>
            </div>
            <span className="font-display text-lg font-bold gradient-text">EmpathAI</span>
          </div>
          <h1 className="font-display text-3xl font-bold text-white mb-2">Create Your AI Companion</h1>
          <p className="text-white/50">Personalize how your companion looks, feels, and communicates.</p>
        </motion.div>

        <div className="glass-card p-8 shadow-glass space-y-8">
          {/* Name */}
          <motion.div custom={0} variants={itemVariant} initial="hidden" animate="visible">
            <label className="block text-sm font-medium text-white/70 mb-2">Companion Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Luna, Sage, Aria..."
              className="w-full px-4 py-3 glass rounded-xl text-white placeholder-white/25 text-sm focus:outline-none focus:ring-1 focus:ring-brand-500/50 border border-white/[0.07] transition-all"
            />
          </motion.div>

          {/* Avatar */}
          <motion.div custom={1} variants={itemVariant} initial="hidden" animate="visible">
            <label className="block text-sm font-medium text-white/70 mb-3">Choose Avatar</label>
            <div className="flex gap-3 flex-wrap">
              {AVATARS.map((a) => (
                <button
                  key={a}
                  onClick={() => setAvatar(a)}
                  className={`w-12 h-12 rounded-xl text-2xl transition-all duration-200 ${
                    avatar === a
                      ? "bg-brand-500/25 border-2 border-brand-500/60 shadow-brand-sm scale-110"
                      : "glass border border-white/[0.07] hover:border-white/20 hover:scale-105"
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Personality */}
          <motion.div custom={2} variants={itemVariant} initial="hidden" animate="visible">
            <label className="block text-sm font-medium text-white/70 mb-3">Personality</label>
            <div className="grid grid-cols-2 gap-3">
              {PERSONALITIES.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPersonality(p.id)}
                  className={`p-4 rounded-xl text-left transition-all duration-200 border ${
                    personality === p.id
                      ? "bg-brand-500/15 border-brand-500/40 shadow-brand-sm"
                      : "glass border-white/[0.07] hover:border-white/15"
                  }`}
                >
                  <div className="text-xl mb-1">{p.emoji}</div>
                  <div className="text-sm font-semibold text-white">{p.label}</div>
                  <div className="text-xs text-white/40 mt-0.5">{p.desc}</div>
                </button>
              ))}
            </div>
          </motion.div>

          {/* Tone */}
          <motion.div custom={3} variants={itemVariant} initial="hidden" animate="visible">
            <label className="block text-sm font-medium text-white/70 mb-3">Communication Tone</label>
            <div className="flex flex-wrap gap-2">
              {TONES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTone(t.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border ${
                    tone === t.id
                      ? "bg-brand-500/20 border-brand-500/50 text-brand-200"
                      : "glass border-white/[0.07] text-white/50 hover:text-white hover:border-white/20"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Bio */}
          <motion.div custom={4} variants={itemVariant} initial="hidden" animate="visible">
            <label className="block text-sm font-medium text-white/70 mb-2">
              Additional Context <span className="text-white/30">(optional)</span>
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              placeholder="Tell your companion a bit about yourself, your interests, or what kind of support you're looking for..."
              className="w-full px-4 py-3 glass rounded-xl text-white placeholder-white/25 text-sm focus:outline-none focus:ring-1 focus:ring-brand-500/50 border border-white/[0.07] transition-all resize-none"
            />
          </motion.div>

          {/* Preview Banner */}
          <motion.div
            custom={5}
            variants={itemVariant}
            initial="hidden"
            animate="visible"
            className="flex items-center gap-4 p-4 rounded-xl bg-brand-500/10 border border-brand-500/20"
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-500/30 to-accent-500/30 border border-brand-500/30 flex items-center justify-center text-2xl">
              {avatar}
            </div>
            <div>
              <p className="text-white font-semibold">{name || "Your Companion"}</p>
              <p className="text-white/45 text-xs">
                {PERSONALITIES.find((p) => p.id === personality)?.emoji}{" "}
                {PERSONALITIES.find((p) => p.id === personality)?.label} ·{" "}
                {TONES.find((t) => t.id === tone)?.label}
              </p>
            </div>
          </motion.div>

          {/* Create Button */}
          <motion.button
            custom={6}
            variants={itemVariant}
            initial="hidden"
            animate="visible"
            onClick={handleCreate}
            disabled={creating || !name.trim()}
            className="btn-primary w-full py-4 rounded-2xl bg-gradient-to-r from-brand-500 to-accent-500 text-white font-semibold shadow-brand hover:shadow-glow transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            whileHover={!creating ? { scale: 1.02 } : {}}
            whileTap={!creating ? { scale: 0.98 } : {}}
          >
            {creating ? (
              <>
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Creating your companion...
              </>
            ) : (
              <>Bring {name || "Companion"} to Life ✨</>
            )}
          </motion.button>
        </div>
      </div>
    </main>
  );
}
