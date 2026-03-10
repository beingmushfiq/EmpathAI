"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

const STEPS = [
  {
    step: 1,
    emoji: "👂",
    title: "A companion that truly listens",
    description:
      "EmpathAI isn't just a chatbot. It's designed to understand the emotional weight of your words, validate your feelings, and respond with genuine empathy — like talking to a thoughtful friend who's always available.",
    feature: "Emotionally-aware AI responses",
    featureIcon: "💜",
  },
  {
    step: 2,
    emoji: "🎙️",
    title: "Speak, write, or just show up",
    description:
      "Interact however feels natural to you. Send a text message, drop a voice note, hop on a live voice call, or even have a face-to-face video conversation with your AI companion. EmpathAI adapts to your preferred modality.",
    feature: "Text · Voice Notes · Live Calls · Video",
    featureIcon: "🔮",
  },
  {
    step: 3,
    emoji: "🚀",
    title: "From feelings to action",
    description:
      "When you're ready to move from processing emotions to taking steps forward, EmpathAI switches into Helper Mode — generating structured plans, step-by-step guides, and actionable checklists tailored to exactly what you need.",
    feature: "Empathy → Actionable Plans",
    featureIcon: "⚡",
  },
  {
    step: 4,
    emoji: "✨",
    title: "Make it uniquely yours",
    description:
      "Create a personalized AI companion with a name, personality, communication style, and even a visual avatar. Your companion learns from your conversations, building a shared memory to better understand you over time.",
    feature: "Persistent memory & custom persona",
    featureIcon: "🧠",
  },
];

const pageVariants = {
  enter: (dir: number) => ({ opacity: 0, x: dir > 0 ? 40 : -40 }),
  center: { opacity: 1, x: 0 },
  exit: (dir: number) => ({ opacity: 0, x: dir > 0 ? -40 : 40 }),
};

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const router = useRouter();
  const current = STEPS[step];

  const go = (delta: number) => {
    setDirection(delta);
    setStep((s) => Math.max(0, Math.min(STEPS.length - 1, s + delta)));
  };

  const finish = () => router.push("/onboarding/persona");

  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center bg-[hsl(240,15%,6%)] p-6 overflow-hidden">
      {/* Background */}
      <div className="orb orb-brand absolute w-[700px] h-[700px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-20" />
      <div className="orb orb-accent absolute w-[400px] h-[400px] bottom-0 right-0 opacity-10" />

      {/* Logo */}
      <motion.div
        className="flex items-center gap-2 mb-12"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-400 to-accent-500 flex items-center justify-center">
          <span>✦</span>
        </div>
        <span className="font-display text-lg font-bold gradient-text">EmpathAI</span>
      </motion.div>

      {/* Card */}
      <div className="relative w-full max-w-xl overflow-hidden">
        <AnimatePresence custom={direction} mode="wait">
          <motion.div
            key={step}
            custom={direction}
            variants={pageVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="glass-card p-8 md:p-10 shadow-glass"
          >
            {/* Emoji Icon */}
            <motion.div
              className="w-20 h-20 rounded-3xl bg-gradient-to-br from-brand-500/20 to-accent-500/20 border border-brand-500/20 flex items-center justify-center text-4xl mb-6 shadow-brand-sm"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
            >
              {current.emoji}
            </motion.div>

            <h2 className="font-display text-2xl md:text-3xl font-bold text-white mb-3 leading-tight">
              {current.title}
            </h2>
            <p className="text-white/55 leading-relaxed mb-6">{current.description}</p>

            {/* Feature tag */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-300 text-sm font-medium">
              <span>{current.featureIcon}</span>
              <span>{current.feature}</span>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Progress dots */}
      <div className="flex gap-2 mt-8">
        {STEPS.map((_, i) => (
          <button
            key={i}
            onClick={() => { setDirection(i > step ? 1 : -1); setStep(i); }}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === step
                ? "w-8 bg-gradient-to-r from-brand-400 to-accent-400"
                : "w-1.5 bg-white/20 hover:bg-white/30"
            }`}
          />
        ))}
      </div>

      {/* Navigation buttons */}
      <div className="flex gap-3 mt-8 w-full max-w-xl">
        <motion.button
          onClick={() => go(-1)}
          disabled={step === 0}
          className="flex-1 py-3 rounded-2xl glass border border-white/[0.07] text-white/60 font-medium hover:text-white hover:bg-white/[0.06] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          Back
        </motion.button>

        {step < STEPS.length - 1 ? (
          <motion.button
            onClick={() => go(1)}
            className="flex-[2] py-3 rounded-2xl bg-gradient-to-r from-brand-500 to-accent-500 text-white font-semibold shadow-brand hover:shadow-glow transition-all"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Continue
          </motion.button>
        ) : (
          <motion.button
            onClick={finish}
            className="flex-[2] py-3 rounded-2xl bg-gradient-to-r from-brand-500 to-accent-500 text-white font-semibold shadow-brand hover:shadow-glow transition-all"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Create My Companion ✨
          </motion.button>
        )}
      </div>

      <p className="text-white/20 text-xs mt-6">
        Step {step + 1} of {STEPS.length}
      </p>
    </main>
  );
}
