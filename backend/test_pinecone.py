import sys
import traceback

try:
    from pinecone import Pinecone
    print("Import success")
except Exception as e:
    print("ERROR:")
    traceback.print_exc()
