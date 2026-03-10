"use client";

import { useEffect, useState } from "react";
import {
  LiveKitRoom,
  VideoConference,
  ControlBar,
  RoomAudioRenderer,
  DisconnectButton,
} from "@livekit/components-react";
import "@livekit/components-styles";
import { PhoneOff } from "lucide-react";
import { motion } from "framer-motion";

interface LiveCallInterfaceProps {
  roomName: string;
  identity: string;
  type: "voice" | "video";
  onDisconnect: () => void;
}

export function LiveCallInterface({ roomName, identity, type, onDisconnect }: LiveCallInterfaceProps) {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const resp = await fetch("/api/livekit/token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ room_name: roomName, identity }),
        });
        const data = await resp.json();
        setToken(data.token);
      } catch (e) {
        console.error(e);
      }
    })();
  }, [roomName, identity]);

  if (!token) {
    return (
      <div className="flex flex-col items-center justify-center p-12 gap-4">
        <div className="w-12 h-12 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-white/40 text-sm animate-pulse">Initializing encrypted connection...</p>
      </div>
    );
  }

  return (
    <LiveKitRoom
      video={type === "video"}
      audio={true}
      token={token}
      serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
      onDisconnected={onDisconnect}
      className="flex-1 flex flex-col relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm -z-10" />
      
      {type === "video" ? (
         <VideoConference 
           className="livekit-conference"
           style={{ height: '100%', background: 'transparent' }}
         />
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center gap-12 p-8">
           {/* Cyberpunk Voice Call UI */}
           <motion.div
              className="w-48 h-48 rounded-full bg-gradient-to-br from-brand-500/20 to-accent-500/20 border-2 border-brand-500/40 flex items-center justify-center text-7xl shadow-[0_0_50px_rgba(147,83,211,0.3)] relative"
              animate={{ 
                scale: [1, 1.05, 1],
                boxShadow: [
                  "0 0 50px rgba(147,83,211,0.3)",
                  "0 0 80px rgba(147,83,211,0.5)",
                  "0 0 50px rgba(147,83,211,0.3)"
                ]
              }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              🦋
           </motion.div>

           <div className="text-center z-10">
              <h2 className="text-3xl font-bold font-display text-white mb-2">Luna</h2>
              <p className="text-brand-300 font-medium tracking-widest text-xs uppercase animate-pulse">Live Link Active</p>
           </div>

           <div className="flex gap-6 z-10">
              <ControlBar 
                variation="minimal" 
                className="bg-transparent border-0 gap-4" 
              />
              <DisconnectButton className="bg-danger/20 hover:bg-danger/40 border border-danger/30 text-white px-8 rounded-full transition-all">
                  <PhoneOff className="mr-2" size={18} />
                  End Call
              </DisconnectButton>
           </div>

           {/* Audio rendering for voice call */}
           <RoomAudioRenderer />
        </div>
      )}
    </LiveKitRoom>
  );
}
