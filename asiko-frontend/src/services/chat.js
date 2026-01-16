import api from './api';

const chatService = {
  // Récupérer la liste des médecins (pour les patients)
  getDoctors: async (search = '') => {
    const response = await api.get(`/telemedicine/doctors/?search=${search}`);
    return Array.isArray(response.data) ? response.data : (response.data.results || []);
  },

  // Récupérer la liste des threads de l'utilisateur
  getThreads: async () => {
    const response = await api.get('/telemedicine/threads/');
    // Gérer la pagination Django REST (response.data peut être un objet avec 'results')
    return Array.isArray(response.data) ? response.data : (response.data.results || []);
  },

  // Récupérer ou créer un thread avec un médecin
  getOrCreateThread: async (doctorId) => {
    // Vérifier si un thread existe déjà
    const threads = await chatService.getThreads();
    const threadArray = Array.isArray(threads) ? threads : [];
    const existing = threadArray.find(t => t.doctor === doctorId);
    
    if (existing) return existing;

    // Sinon créer un nouveau
    const response = await api.post('/telemedicine/threads/', { doctor: doctorId });
    return response.data;
  },

  // Récupérer les messages d'un thread
  getMessages: async (threadId) => {
    const response = await api.get(`/telemedicine/threads/${threadId}/messages/`);
    return Array.isArray(response.data) ? response.data : (response.data.results || []);
  },

  // Envoyer un message
  sendMessage: async (threadId, content) => {
    const response = await api.post(`/telemedicine/threads/${threadId}/send_message/`, { content });
    return response.data;
  },

  // Activer/Désactiver le partage du carnet (patient uniquement)
  toggleJournalSharing: async (threadId) => {
    const response = await api.post(`/telemedicine/threads/${threadId}/toggle_journal/`);
    return response.data;
  }
};

export default chatService;
