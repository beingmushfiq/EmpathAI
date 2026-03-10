import os
from pinecone import Pinecone, ServerlessSpec
from .config import settings

class PineconeService:
    def __init__(self):
        # We check locally if the key exists to avoid crashing out automatically if not configured yet.
        if settings.PINECONE_API_KEY:
            self.pc = Pinecone(api_key=settings.PINECONE_API_KEY)
            self._ensure_index()
        else:
            self.pc = None

    def _ensure_index(self):
        # Create index if it doesn't exsit
        existing_indexes = [index_info["name"] for index_info in self.pc.list_indexes()]
        
        if settings.PINECONE_INDEX_NAME not in existing_indexes:
            print(f"Index {settings.PINECONE_INDEX_NAME} not found. Creating it now...")
            self.pc.create_index(
                name=settings.PINECONE_INDEX_NAME,
                dimension=1536, # OpenAI text-embedding-3-small dimension
                metric="cosine",
                spec=ServerlessSpec(
                    cloud="aws", 
                    region=settings.PINECONE_ENVIRONMENT
                )
            )

    def get_index(self):
        if not self.pc:
            return None
        return self.pc.Index(settings.PINECONE_INDEX_NAME)

pinecone_service = PineconeService()
