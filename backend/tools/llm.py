import os
from dotenv import load_dotenv
from langchain_groq import ChatGroq

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "..", ".env"))

llm = ChatGroq(
    api_key=os.getenv("GROQ_API_KEY"),
    model=os.getenv("MODEL_NAME"),
    temperature=0,
)