"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { SignedIn, SignedOut } from "@clerk/nextjs";



const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

export default function LoginPage() {
  return (
    <main className="relative min-h-screen flex overflow-hidden bg-[hsl(240,15%,6%)]">
      {/* ── Left Panel: Branding ── */}
      <div className="hidden lg:flex flex-col justify-between w-[55%] relative p-12 overflow-hidden">
        {/* Background orbs */}
        <div className="orb orb-brand absolute w-[600px] h-[600px] -top-40 -left-40 opacity-60" />
        <div className="orb orb-accent absolute w-[400px] h-[400px] bottom-20 right-0 opacity-40" />

        {/* Animated mesh gradient */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `
              radial-gradient(ellipse 80% 50% at 20% 40%, hsla(261,75%,55%,0.4) 0%, transparent 50%),
              radial-gradient(ellipse 60% 40% at 80% 60%, hsla(330,70%,50%,0.3) 0%, transparent 50%)
            `,
          }}
        />

        {/* Floating AI card */}
        <motion.div
          className="absolute right-16 top-1/2 -translate-y-1/2 glass-card p-6 w-72 shadow-glass"
          animate={{ y: [0, -12, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-400 to-accent-500 flex items-center justify-center text-lg">
              🧠
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Luna</p>
              <p className="text-xs text-white/50">Your AI Companion</p>
            </div>
            <div className="ml-auto flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-success animate-pulse-slow" />
              <span className="text-xs text-white/40">online</span>
            </div>
          </div>
          <div className="space-y-2">
            {[
              { from: "ai", text: "Hey! I'm here whenever you need to talk 💜" },
              { from: "user", text: "I've been feeling overwhelmed lately..." },
              { from: "ai", text: "I hear you. Let's work through this together." },
            ].map((msg, i) => (
              <motion.div
                key={i}
                className={`text-xs px-3 py-2 rounded-xl max-w-[85%] ${
                  msg.from === "ai"
                    ? "bg-brand-500/20 text-brand-200 border border-brand-500/20"
                    : "bg-white/5 text-white/60 border border-white/5 ml-auto"
                }`}
                initial={{ opacity: 0, x: msg.from === "ai" ? -10 : 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.8 + 1, duration: 0.4 }}
              >
                {msg.text}
              </motion.div>
            ))}
            {/* Typing indicator */}
            <motion.div
              className="flex items-center gap-1 px-3 py-2 bg-brand-500/10 rounded-xl w-fit border border-brand-500/15"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 3.5 }}
            >
              <span className="typing-dot w-1.5 h-1.5 rounded-full bg-brand-400" />
              <span className="typing-dot w-1.5 h-1.5 rounded-full bg-brand-400" />
              <span className="typing-dot w-1.5 h-1.5 rounded-full bg-brand-400" />
            </motion.div>
          </div>
        </motion.div>

        {/* Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-brand-400 to-accent-500 flex items-center justify-center shadow-brand">
              <span className="text-xl">✦</span>
            </div>
            <span className="font-display text-2xl font-bold gradient-text">EmpathAI</span>
          </div>
        </div>

        {/* Tagline */}
        <div className="relative z-10">
          <motion.h1
            className="font-display text-5xl font-bold text-white leading-tight mb-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            Your AI companion
            <br />
            <span className="gradient-text">that truly listens.</span>
          </motion.h1>
          <motion.p
            className="text-white/50 text-lg max-w-sm leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Chat, voice, or video — EmpathAI meets you where you are and helps you move forward.
          </motion.p>
        </div>

        {/* Stats */}
        <motion.div
          className="relative z-10 flex gap-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {[
            { value: "50K+", label: "Daily conversations" },
            { value: "98%", label: "Satisfaction rate" },
            { value: "24/7", label: "Available" },
          ].map((stat) => (
            <div key={stat.label}>
              <p className="font-display text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-white/40 text-sm">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </div>

      {/* ── Right Panel: Auth Form ── */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 relative">
        {/* Subtle noise */}
        <div className="absolute inset-0 opacity-[0.02] bg-[url('/noise.png')] pointer-events-none" />

        <motion.div
          className="w-full max-w-md"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Mobile Logo */}
          <motion.div variants={itemVariants} className="flex lg:hidden items-center gap-3 mb-8">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-400 to-accent-500 flex items-center justify-center">
              <span className="text-lg">✦</span>
            </div>
            <span className="font-display text-xl font-bold gradient-text">EmpathAI</span>
          </motion.div>

          <motion.div variants={itemVariants} className="mb-8">
            <h2 className="font-display text-4xl font-bold text-white mb-4 leading-tight">Begin your<br/>journey to clarity.</h2>
            <p className="text-white/60 text-lg">Join thousands of others finding peace and taking action with Empathetic AI.</p>
          </motion.div>

          <motion.div variants={itemVariants} className="space-y-4 w-full">
            <SignedOut>
              <Link href="/sign-up" className="block w-full">
                <button className="w-full btn-primary py-4 rounded-xl bg-gradient-to-r from-brand-500 to-accent-500 text-white font-semibold shadow-brand hover:shadow-glow hover:scale-[1.02] transition-all text-lg mb-4">
                  Get Started Free
                </button>
              </Link>
              <Link href="/sign-in" className="block w-full">
                <button className="w-full px-4 py-4 glass rounded-xl text-white font-medium hover:bg-white/[0.08] transition-all border border-white/[0.1] hover:border-white/[0.2] text-lg">
                  Sign In
                </button>
              </Link>
            </SignedOut>
            <SignedIn>
              <Link href="/dashboard" className="block w-full">
                <button className="w-full btn-primary py-4 rounded-xl bg-gradient-to-r from-brand-500 to-accent-500 text-white font-semibold shadow-brand hover:shadow-glow hover:scale-[1.02] transition-all text-lg mb-4">
                  Go to Dashboard
                </button>
              </Link>
            </SignedIn>
          </motion.div>

          <motion.p variants={itemVariants} className="text-center text-white/25 text-xs mt-8">
            By proceeding, you agree to our{" "}
            <span className="underline cursor-pointer hover:text-white/40 transition-colors">Terms</span> and{" "}
            <span className="underline cursor-pointer hover:text-white/40 transition-colors">Privacy Policy</span>.
          </motion.p>
        </motion.div>
      </div>
    </main>
  );
}
