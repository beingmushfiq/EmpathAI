import httpx
from app.core.config import settings

class VoiceService:
    def __init__(self):
        pass

    async def transcribe_audio(self, audio_data: bytes, mimetype: str = "audio/wav") -> str:
        """Transcribe an audio buffer using Deepgram's Nova-2 model."""
        if not settings.DEEPGRAM_API_KEY:
            return "Transcription failed: Deepgram API key missing."
            
        try:
            
            # Use the synchronous prerecorded client wrapped or just standard since this runs quickly.
            # In production, use async client `self.deepgram.listen.asyncprerecorded.v("1").transcribe_file(...)`
            # The python SDK structure requires careful async handling
            # For simplicity, using sync REST call via httpx directly
            
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    "https://api.deepgram.com/v1/listen?model=nova-2&smart_format=true",
                    headers={
                        "Authorization": f"Token {settings.DEEPGRAM_API_KEY}",
                        "Content-Type": mimetype
                    },
                    content=audio_data,
                    timeout=30.0
                )
                response.raise_for_status()
                data = response.json()
                transcript = data.get("results", {}).get("channels", [{}])[0].get("alternatives", [{}])[0].get("transcript", "")
                return transcript
                
        except Exception as e:
            print(f"Deepgram Error: {e}")
            return f"Error transcribing audio: {str(e)}"

    async def synthesize_speech(self, text: str, voice_id: str = None) -> bytes:
        """Generate audio buffer from text using ElevenLabs turbo model."""
        if not settings.ELEVENLABS_API_KEY:
            raise ValueError("ElevenLabs API Key is missing.")
            
        target_voice = voice_id or settings.ELEVENLABS_VOICE_ID
        url = f"https://api.elevenlabs.io/v1/text-to-speech/{target_voice}?output_format=mp3_44100_128"
        
        headers = {
            "Accept": "audio/mpeg",
            "Content-Type": "application/json",
            "xi-api-key": settings.ELEVENLABS_API_KEY
        }
        
        payload = {
            "text": text,
            "model_id": "eleven_turbo_v2_5",
            "voice_settings": {
                "stability": 0.5,
                "similarity_boost": 0.75,
                "use_speaker_boost": True
            }
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(url, json=payload, headers=headers, timeout=30.0)
            response.raise_for_status()
            
            return response.content

voice_service = VoiceService()
