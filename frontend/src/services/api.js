import axios from "axios";

const BASE = "http://127.0.0.1:8000";

const api = axios.create({ baseURL: BASE });

export const analyzeComplaint = async (complaint) => {
  const response = await api.post("/analyze", { complaint });
  return response.data;
};

// SSE streaming — calls onAgentStart(key) and onAgentDone(key, data) for each agent
export const analyzeStream = (complaint, { onAgentStart, onAgentDone, onComplete, onError }) => {
  fetch(`${BASE}/analyze/stream`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ complaint }),
  })
    .then((res) => {
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      const read = () => {
        reader.read().then(({ done, value }) => {
          if (done) return;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop(); // keep incomplete line

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            try {
              const msg = JSON.parse(line.slice(6));
              if (msg.event === "agent_start") onAgentStart(msg.agent);
              if (msg.event === "agent_log")   onAgentLog(msg.agent, msg.log);
              if (msg.event === "agent_done")  onAgentDone(msg.agent, msg.data);
              if (msg.event === "done")         onComplete();
            } catch {}
          }
          read();
        });
      };
      read();
    })
    .catch(onError);
};
