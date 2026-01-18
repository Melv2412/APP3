import { useEffect } from "react";

export default function useAlertSSE(token) {
  useEffect(() => {
    if (!token) return;

    const source = new EventSource(
      `http://localhost:8000/alerts/stream/?token=${token}`
    );

    source.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.phase === "PHASE_1") {
        speakFrench(data.message);
      }
    };

    source.onerror = () => {
      console.warn("SSE disconnected");
      source.close();
    };

    return () => source.close();
  }, [token]);
}
