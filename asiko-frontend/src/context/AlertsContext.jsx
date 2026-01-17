import { createContext, useContext, useEffect, useState } from "react";
import { connectAlertsStream } from "../services/alertsStream";

const AlertsContext = createContext();

export function AlertsProvider({ children }) {
    const [alerts, setAlerts] = useState([]);

    const speakInFrench = (message) => {
        if (!window.speechSynthesis) return;

        const utterance = new SpeechSynthesisUtterance(message);

        // 1. Définir la langue prioritaire
        utterance.lang = "fr-FR";

        // 2. Récupérer et filtrer les voix
        const voices = window.speechSynthesis.getVoices();

        // On cherche d'abord une voix de France (fr-FR), sinon n'importe quelle voix française
        const frenchVoice = voices.find(v => v.lang === "fr-FR") ||
            voices.find(v => v.lang.startsWith("fr"));

        if (frenchVoice) {
            utterance.voice = frenchVoice;
        }

        // Optionnel : Ajuster le pitch et la vitesse pour un accent plus naturel
        utterance.pitch = 1;
        utterance.rate = 1;

        window.speechSynthesis.speak(utterance);
    };

    useEffect(() => {
        // Pré-chargement des voix (nécessaire pour Chrome/Edge)
        window.speechSynthesis.getVoices();

        const es = connectAlertsStream((alert) => {
            setAlerts((prev) => [alert, ...prev]);

            if (alert.message) {
                speakInFrench(alert.message);
            }
        });

        return () => es.close();
    }, []);

    return (
        <AlertsContext.Provider value={{ alerts }}>
            {children}
        </AlertsContext.Provider>
    );
}

export function useAlerts() {
    P
    return useContext(AlertsContext);
}