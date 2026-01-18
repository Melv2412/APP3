import { useEffect } from "react";
import { speakFrench } from "../utils/tts";

export default function useAlertSSE() {
  useEffect(() => {
    const source = new EventSource("http://localhost:8000/api/alerts/stream/");

    source.onmessage = (event) => {
      const data = JSON.parse(event.data);

      // On ne lit que les messages Phase 1
      if (data.phase === "PHASE_1") {
        console.log("Received SSE:", data.message);
        speakFrench(data.message);
      }
    };

    source.onerror = () => {
      console.warn("SSE disconnected");
      source.close();
    };

    return () => source.close();
  }, []);
}
