"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Brain, Zap, Clock, ShieldCheck, ChevronRight, Award } from "lucide-react";

interface Memory {
    id: string;
    type: string;
    content: string;
    timestamp: string;
}

interface BondData {
    bond_score: number;
    level: number;
    next_level_at: number;
    status: string;
}

export function RelationshipJourney({ userId }: { userId: string }) {
    const [bond, setBond] = useState<BondData | null>(null);
    const [memories, setMemories] = useState<Memory[]>([]);
    const [loading, setLoading] = useState(true);

    const [showLevelUp, setShowLevelUp] = useState(false);

    useEffect(() => {
        // We track the previous level in a ref-like variable to detect when a milestone is reached
        let previousLevel: number | null = null;
        
        /**
         * fetchData synchronously handles both relationship bond data and extracted facts.
         * It also compares the new level to the previous level to trigger animations.
         */
        const fetchData = async () => {
            try {
                const [bondRes, memoryRes] = await Promise.all([
                    fetch(`/api/memory/relationship/${userId}`),
                    fetch(`/api/memory/facts/${userId}`)
                ]);
                
                const bondData = await bondRes.json();
                const memoryData = await memoryRes.json();
                
                if (previousLevel !== null && bondData.level > previousLevel) {
                    setShowLevelUp(true);
                    setTimeout(() => setShowLevelUp(false), 5000);
                }
                previousLevel = bondData.level;
                
                setBond(bondData);
                setMemories(memoryData);
            } catch (error) {
                console.error("Failed to fetch relationship data:", error);
            } finally {
                setLoading(false);
            }
        };

        if (userId) {
            fetchData();
            const interval = setInterval(fetchData, 30000); // Refresh every 30s
            return () => clearInterval(interval);
        }
    }, [userId]);

    if (loading) return (
        <div className="flex-1 flex items-center justify-center">
            <div className="w-12 h-12 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    const progress = bond ? (bond.bond_score % 100) : 0;

    return (
        <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
            <AnimatePresence>
                {showLevelUp && (
                    <motion.div 
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        className="fixed bottom-12 left-1/2 -translate-x-1/2 z-50 glass-strong p-6 rounded-2xl border-brand-500/50 flex items-center gap-4 glow-brand"
                    >
                        <div className="bg-brand-500 p-3 rounded-full">
                            <Award className="text-white" size={24} />
                        </div>
                        <div>
                            <h4 className="font-display font-black text-white text-lg">Relationship Level Up!</h4>
                            <p className="text-white/60 text-sm">You and Luna are growing closer.</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="max-w-4xl mx-auto space-y-12">
                {/* ── Header & Bond Level ── */}
                <section className="relative overflow-hidden p-8 glass-card border-brand-500/20 rounded-3xl">
                    <div className="orb orb-brand absolute w-64 h-64 -top-32 -right-32 opacity-20" />
                    
                    <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                        <div className="relative">
                            <motion.div 
                                className="w-40 h-40 rounded-full border-4 border-brand-500/30 flex items-center justify-center p-2"
                                animate={{ rotate: 360 }}
                                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                            >
                                <div className="w-full h-full rounded-full border-2 border-dashed border-brand-500/50" />
                            </motion.div>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-4xl font-display font-black text-white">{bond?.level || 1}</span>
                                <span className="text-[10px] uppercase tracking-widest text-brand-300 font-bold">Level</span>
                            </div>
                        </div>

                        <div className="flex-1 text-center md:text-left">
                            <h2 className="text-3xl font-display font-bold text-white mb-2">Relationship Journey</h2>
                            <p className="text-white/60 mb-6 italic">&quot;Our connection is a living archive of every word shared.&quot;</p>
                            
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs font-bold tracking-wider">
                                    <span className="text-brand-300 uppercase">{bond?.status || "Acquaintance"}</span>
                                    <span className="text-white/40">{bond?.bond_score} / {bond?.next_level_at} BOND XP</span>
                                </div>
                                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/10">
                                    <motion.div 
                                        className="h-full bg-gradient-to-r from-brand-500 to-accent-500 shadow-[0_0_15px_rgba(147,83,211,0.5)]"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${progress}%` }}
                                        transition={{ duration: 1.5, ease: "easeOut" }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── Stats Grid ── */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { icon: Heart, label: "Trust Score", val: "88%", color: "text-rose-400" },
                        { icon: Brain, label: "Facts Known", val: memories.length, color: "text-brand-400" },
                        { icon: Zap, label: "Chemistry", val: "High", color: "text-amber-400" },
                        { icon: ShieldCheck, label: "Safety", val: "Verified", color: "text-emerald-400" },
                    ].map((stat) => (
                        <div key={stat.label} className="p-4 glass rounded-2xl border border-white/5 flex flex-col items-center text-center">
                            <stat.icon className={`${stat.color} mb-2`} size={20} />
                            <span className="text-[10px] uppercase font-bold tracking-widest text-white/30 mb-1">{stat.label}</span>
                            <span className="text-xl font-display font-bold text-white">{stat.val}</span>
                        </div>
                    ))}
                </div>

                {/* ── Memory Bank ── */}
                <section className="space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <div className="flex items-center gap-3">
                            <Brain className="text-brand-400" />
                            <h3 className="text-xl font-display font-bold text-white uppercase tracking-tight">Memory Bank</h3>
                        </div>
                        <span className="text-xs text-brand-300 bg-brand-500/10 px-3 py-1 rounded-full border border-brand-500/20">
                            Neural Archive Active
                        </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <AnimatePresence>
                            {memories.length > 0 ? (
                                memories.map((memory, i) => (
                                    <motion.div
                                        key={memory.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        className="p-6 glass-card border-white/5 bg-white/5 hover:border-brand-500/30 transition-all group rounded-2xl relative"
                                    >
                                        <div className="absolute top-4 right-4 text-[10px] uppercase font-bold tracking-widest text-brand-400/50">
                                            {memory.type}
                                        </div>
                                        <p className="text-white/80 font-medium leading-relaxed pr-8">&quot;{memory.content}&quot;</p>
                                        <div className="mt-4 flex items-center gap-2 text-[10px] text-white/20">
                                            <Clock size={12} />
                                            <span>Learned on {new Date(memory.timestamp).toLocaleDateString()}</span>
                                        </div>
                                    </motion.div>
                                ))
                            ) : (
                                <div className="col-span-2 p-12 glass border border-dashed border-white/10 rounded-3xl text-center">
                                    <Brain className="mx-auto text-white/10 mb-4" size={48} />
                                    <p className="text-white/40">No deep memories archive yet. Keep speaking with Luna to build your connection.</p>
                                </div>
                            )}
                        </AnimatePresence>
                    </div>
                </section>
            </div>
        </div>
    );
}
