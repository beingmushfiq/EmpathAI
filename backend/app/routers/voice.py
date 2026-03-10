from fastapi import APIRouter, UploadFile, File, HTTPException, Body
from fastapi.responses import StreamingResponse
import io
from app.services.voice_service import voice_service

router = APIRouter()

@router.post("/transcribe", summary="Transcribe a voice note to text (STT)")
async def transcribe_voice(file: UploadFile = File(...)):
    """
    Accepts an audio file upload and returns the text transcription using Deepgram.
    """
    try:
        audio_bytes = await file.read()
        mimetype = file.content_type or "audio/wav"
        
        transcript = await voice_service.transcribe_audio(audio_bytes, mimetype)
        
        return {
            "text": transcript
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/synthesize", summary="Synthesize text to speech (TTS)")
async def synthesize_voice(
    text: str = Body(..., embed=True),
    voice_id: str = Body(None, embed=True)
):
    """
    Accepts text and streams back MP3 audio representing the AI speaking the text, using ElevenLabs.
    """
    try:
        audio_buffer = await voice_service.synthesize_speech(text, voice_id)
        
        # Return as streaming response
        return StreamingResponse(
            io.BytesIO(audio_buffer), 
            media_type="audio/mpeg",
            headers={
                "Content-Disposition": "attachment; filename=response.mp3"
            }
        )
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
