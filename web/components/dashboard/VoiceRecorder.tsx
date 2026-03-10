"use client";

import { useState, useRef } from "react";
import { Mic, Square, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function VoiceRecorder({ onTranscribed }: { onTranscribed: (text: string) => void }) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        setIsProcessing(true);
        const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });
        
        // Setup FormData
        const formData = new FormData();
        formData.append("file", audioBlob, "recording.webm");

        try {
          const res = await fetch("http://localhost:8000/api/voice/transcribe", {
            method: "POST",
            body: formData,
          });
          
          if (res.ok) {
            const data = await res.json();
            if (data.text) {
              onTranscribed(data.text);
            }
          }
        } catch (error) {
          console.error("Transcription error:", error);
        } finally {
          setIsProcessing(false);
          // Stop stream tracks to free mic
          stream.getTracks().forEach(track => track.stop());
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing mic:", err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  return (
    <div className="relative flex items-center justify-center w-8 h-8">
      <AnimatePresence mode="wait">
        {isProcessing ? (
          <motion.div
            key="processing"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="w-8 h-8 rounded-full bg-brand-500/20 border border-brand-500/40 flex items-center justify-center text-brand-300"
            title="Transcribing..."
          >
            <Loader2 size={16} className="animate-spin" />
          </motion.div>
        ) : isRecording ? (
          <motion.button
            key="recording"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            onClick={stopRecording}
            className="w-8 h-8 rounded-full bg-danger/20 border border-danger/40 flex items-center justify-center text-danger relative group"
            title="Stop recording"
          >
            {/* Pulse ring */ }
            <span className="absolute inset-0 rounded-full border border-danger/50 animate-ping opacity-75"></span>
            <Square size={13} className="fill-current" />
          </motion.button>
        ) : (
          <motion.button
            key="idle"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            onClick={startRecording}
            className="w-full h-full rounded-full flex items-center justify-center text-white/35 hover:text-accent-400 transition-colors"
            title="Voice note"
          >
            <Mic size={18} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
