

export function connectAlertsStream(onMessage) {
    const host = window.location.hostname;
    const streamURL = host.includes('devtunnels.ms') 
        ? `https://${host.replace('5173', '8000')}/api/alerts/stream/`
        : "http://localhost:8000/api/alerts/stream/";

    const eventSource = new EventSource(
        streamURL,
        { withCredentials: true }
    );

    eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);
        onMessage(data);
    };

    eventSource.onerror = () => {
        console.warn("SSE disconnected, retrying...");
        eventSource.close();
        setTimeout(() => connectAlertsStream(onMessage), 3000);
    };

    return eventSource;
}
