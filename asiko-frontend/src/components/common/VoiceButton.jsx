import { useEffect, useRef, useState } from 'react';
import Vapi from '@vapi-ai/web';

export default function VoiceButton() {
  const vapiRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const key = import.meta.env.VITE_VAPI_PUBLIC_KEY;
    if (!key) {
      console.warn('VITE_VAPI_PUBLIC_KEY not set');
      return;
    }

    vapiRef.current = new Vapi(key);

    const handleStart = () => setIsConnected(true);
    const handleEnd = () => setIsConnected(false);

    vapiRef.current.on('call-start', handleStart);
    vapiRef.current.on('call-end', handleEnd);

    return () => {
      vapiRef.current?.stop();
    };
  }, []);

  const startCall = () => {
    const assistantId = import.meta.env.VITE_VAPI_ASSISTANT_ID || 'YOUR_ASSISTANT_ID';
    vapiRef.current?.start(assistantId);
  };

  const stopCall = () => {
    vapiRef.current?.stop();
  };

  return (
    <button
      onClick={isConnected ? stopCall : startCall}
      className="px-3 py-1 rounded-md bg-slate-100 hover:bg-slate-200 transition text-sm"
      aria-pressed={isConnected}
    >
      {isConnected ? '🔴 Stop' : '🎤 Start'}
    </button>
  );
}
