import os
from dotenv import load_dotenv
from langchain_groq import ChatGroq

load_dotenv()

def test_initialization():
    print("Testing LLM Initialization (Groq Only)...")
    
    # 1. Test Groq Init
    try:
        groq = ChatGroq(model="llama-3.3-70b-versatile")
        print("✅ Groq initialized successfully.")
        
        # Simple test invoke
        # response = groq.invoke("Hello, say 'Groq is ready!'")
        # print(f"🤖 Response: {response.content}")
        
    except Exception as e:
        print(f"❌ Groq initialization failed: {e}")

if __name__ == "__main__":
    test_initialization()
