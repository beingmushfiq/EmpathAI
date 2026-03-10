import os
from fastapi import APIRouter, HTTPException, Depends
from livekit import api
from pydantic import BaseModel
from typing import Optional

router = APIRouter(prefix="/api/livekit", tags=["livekit"])

class TokenRequest(BaseModel):
    room_name: str
    identity: str

class TokenResponse(BaseModel):
    token: str

@router.post("/token", response_model=TokenResponse)
async def get_token(request: TokenRequest):
    api_key = os.getenv("LIVEKIT_API_KEY")
    api_secret = os.getenv("LIVEKIT_API_SECRET")
    
    if not api_key or not api_secret:
        raise HTTPException(
            status_code=500, 
            detail="LiveKit API keys not configured on server"
        )

    try:
        token = api.AccessToken(api_key, api_secret) \
            .with_identity(request.identity) \
            .with_name(request.identity) \
            .with_grants(api.VideoGrants(
                room_join=True,
                room=request.room_name,
            ))
        
        return TokenResponse(token=token.to_jwt())
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
