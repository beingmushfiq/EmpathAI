"use client";

import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX, Loader2 } from "lucide-react";

export function AudioPlayer({ text, autoPlay = true }: { text: string; autoPlay?: boolean }) {
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (!text) return;
    
    let isMounted = true;
    let localUrl: string | null = null;
    (async () => {
      setIsSynthesizing(true);
      try {
        const res = await fetch("http://localhost:8000/api/voice/synthesize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text })
        });
        
        if (res.ok) {
          const blob = await res.blob();
          const url = URL.createObjectURL(blob);
          localUrl = url;
          if (isMounted) {
            setAudioUrl(url);
          }
        }
      } catch (e) {
        console.error("Synthesize error:", e);
      } finally {
        if (isMounted) setIsSynthesizing(false);
      }
    })();

    return () => {
      isMounted = false;
      if (localUrl) {
        URL.revokeObjectURL(localUrl);
      }
    };
  }, [text]);

  useEffect(() => {
    if (audioUrl && autoPlay && audioRef.current && !isMuted) {
      audioRef.current.play().catch((e) => console.log("Audio play error", e));
      setIsPlaying(true);
    }
  }, [audioUrl, autoPlay, isMuted]);

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/[0.08] bg-white/[0.02]">
      {audioUrl && (
        <audio 
          ref={audioRef} 
          src={audioUrl} 
          className="hidden" 
          muted={isMuted}
          onEnded={() => setIsPlaying(false)}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />
      )}
      
      <button 
        onClick={() => setIsMuted(!isMuted)}
        className="text-brand-300 hover:text-brand-400 transition-colors"
      >
        {isSynthesizing ? (
           <Loader2 size={14} className="animate-spin text-white/40" />
        ) : isMuted ? (
           <VolumeX size={14} />
        ) : (
           <Volume2 size={14} />
        )}
      </button>

      {/* Mini equalizer visualizer */}
      <div className="flex items-center gap-0.5 h-3 overflow-hidden">
        {[1, 2, 3, 4, 5].map((i) => (
          <div 
            key={i} 
            className={`w-1 bg-brand-400 rounded-full origin-bottom transition-all duration-75 ${isPlaying && !isMuted ? 'animate-waveform' : 'h-1 opacity-40'}`}
            style={{ 
              animationDelay: `${i * 0.15}s`, 
              height: isPlaying && !isMuted ? `${40 + Math.random() * 60}%` : '4px' 
            }}
          />
        ))}
      </div>
      
      <style jsx>{`
        @keyframes waveform {
          0% { transform: scaleY(0.4); }
          50% { transform: scaleY(1); }
          100% { transform: scaleY(0.4); }
        }
        .animate-waveform {
          animation: waveform 0.8s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
