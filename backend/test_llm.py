from tools.llm import llm

response = llm.invoke("Reply with exactly: Groq connection successful!")

print(response.content)