

export function connectAlertsStream(onMessage) {
    const eventSource = new EventSource(
        "http://127.0.0.1:8000/api/alerts/stream/",
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
