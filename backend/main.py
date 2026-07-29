from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from graph.workflow import graph

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ComplaintRequest(BaseModel):
    complaint: str


@app.post("/analyze")
def analyze(request: ComplaintRequest):

    initial_state = {
        "complaint": request.complaint,
        "reasoning": {},
        "agent_logs": []
    }

    result = graph.invoke(initial_state)

    return result