import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import chatService from '../services/chat';

// Icônes SVG inline
const ChatIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
);

const UserIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const SendIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
  </svg>
);

const ChevronLeftIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
);

const DocumentIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const CheckIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const SpinnerIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

const Telemedicine = () => {
  const { user } = useAuth();
  const [threads, setThreads] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [selectedThread, setSelectedThread] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showDoctorList, setShowDoctorList] = useState(false);
  
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    fetchThreads();
    if (user?.role === 'PATIENT') {
      fetchDoctors();
    }
  }, [user]);

  useEffect(() => {
    if (selectedThread) {
      fetchMessages(selectedThread.id);
      // Polling pour les nouveaux messages (toutes les 5 secondes pour le MVP)
      const interval = setInterval(() => fetchMessages(selectedThread.id), 5000);
      return () => clearInterval(interval);
    }
  }, [selectedThread]);

  useEffect(scrollToBottom, [messages]);

  const fetchThreads = async () => {
    try {
      const data = await chatService.getThreads();
      setThreads(data);
    } catch (err) {
      console.error("Erreur threads:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDoctors = async () => {
    try {
      const data = await chatService.getDoctors();
      setDoctors(data);
    } catch (err) {
      console.error("Erreur docteurs:", err);
    }
  };

  const fetchMessages = async (threadId) => {
    try {
      const data = await chatService.getMessages(threadId);
      setMessages(data);
    } catch (err) {
      console.error("Erreur messages:", err);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedThread) return;

    setSending(true);
    try {
      const data = await chatService.sendMessage(selectedThread.id, newMessage);
      setMessages([...messages, data]);
      setNewMessage('');
      fetchThreads(); // Pour mettre à jour le dernier message dans la liste
    } catch (err) {
      console.error("Erreur envoi:", err);
    } finally {
      setSending(false);
    }
  };

  const handleStartChat = async (doctorId) => {
    try {
      const thread = await chatService.getOrCreateThread(doctorId);
      setSelectedThread(thread);
      setShowDoctorList(false);
      fetchThreads();
    } catch (err) {
      console.error("Erreur création thread:", err);
    }
  };

  const handleToggleJournal = async () => {
    if (!selectedThread || user.role !== 'PATIENT') return;
    try {
      const result = await chatService.toggleJournalSharing(selectedThread.id);
      setSelectedThread({ ...selectedThread, is_journal_shared: result.is_journal_shared });
      // Notification simple (optionnelle)
      alert(result.message);
    } catch (err) {
      console.error("Erreur toggle journal:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <SpinnerIcon className="w-8 h-8 text-primary-green animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-180px)] mt-4 flex flex-col md:flex-row bg-white rounded-asiko-lg shadow-sm border border-asiko-gray overflow-hidden">
        
        {/* Sidebar: Liste des threads */}
        <div className={`w-full md:w-80 border-r border-asiko-gray flex flex-col ${selectedThread ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-4 border-b border-asiko-gray flex justify-between items-center">
            <h2 className="font-bold text-heading-sm">Conversations</h2>
            {user?.role === 'PATIENT' && (
              <button 
                onClick={() => setShowDoctorList(!showDoctorList)}
                className="p-2 bg-primary-green text-white rounded-full hover:bg-dark-green transition-colors"
                title="Nouveau message"
              >
                <ChatIcon className="w-5 h-5" />
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto">
            {showDoctorList ? (
              <div className="p-2">
                <div className="flex items-center text-asiko-gray-dark mb-2 px-2">
                  <ChevronLeftIcon className="w-4 h-4 cursor-pointer" onClick={() => setShowDoctorList(false)} />
                  <span className="text-body-sm font-semibold ml-1">Choisir un médecin</span>
                </div>
                {doctors.map(doc => (
                  <div 
                    key={doc.id}
                    onClick={() => handleStartChat(doc.id)}
                    className="p-3 flex items-center gap-3 hover:bg-asiko-gray-light cursor-pointer rounded-asiko transition-colors"
                  >
                    <div className="w-10 h-10 bg-asiko-blue-light rounded-full flex items-center justify-center text-asiko-blue">
                      <UserIcon className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-semibold text-body-md">Dr. {doc.last_name || doc.username}</p>
                      <p className="text-body-sm text-asiko-gray-dark">Médecin généraliste</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              threads.map(thread => {
                if (!user || !thread.doctor_details || !thread.patient_details) return null;
                const partner = user.role === 'PATIENT' ? thread.doctor_details : thread.patient_details;
                return (
                  <div 
                    key={thread.id}
                    onClick={() => setSelectedThread(thread)}
                    className={`p-4 border-b border-asiko-gray-light cursor-pointer hover:bg-asiko-gray-light transition-colors ${selectedThread?.id === thread.id ? 'bg-light-green' : ''}`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <p className="font-semibold text-body-md">
                        {user.role === 'PATIENT' ? `Dr. ${partner.last_name || partner.username}` : (partner.username || 'Patient')}
                      </p>
                      {thread.unread_count > 0 && (
                        <span className="bg-asiko-red text-white text-[10px] px-1.5 py-0.5 rounded-full">
                          {thread.unread_count}
                        </span>
                      )}
                    </div>
                    <p className="text-body-sm text-asiko-gray-dark truncate">
                      {thread.last_message ? thread.last_message.content : "Nouvelle conversation"}
                    </p>
                  </div>
                );
              })
            )}
            {threads.length === 0 && !showDoctorList && (
              <div className="p-8 text-center text-asiko-gray-dark">
                <ChatIcon className="w-12 h-12 mx-auto mb-2 opacity-20" />
                <p className="text-body-sm">Aucune conversation active.</p>
              </div>
            )}
          </div>
        </div>

        {/* Zone de Chat */}
        <div className={`flex-1 flex flex-col bg-asiko-gray-light ${!selectedThread ? 'hidden md:flex' : 'flex'}`}>
          {selectedThread ? (
            <>
              {/* Header Chat */}
              <div className="p-4 bg-white border-b border-asiko-gray flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <button className="md:hidden p-1 mr-1" onClick={() => setSelectedThread(null)}>
                    <ChevronLeftIcon className="w-6 h-6" />
                  </button>
                  <div className="w-10 h-10 bg-primary-green/10 rounded-full flex items-center justify-center text-primary-green font-bold">
                    {user.role === 'PATIENT' ? 'DR' : 'PT'}
                  </div>
                  <div>
                    <h3 className="font-bold text-body-md">
                      {user.role === 'PATIENT' 
                        ? `Dr. ${selectedThread.doctor_details.last_name}` 
                        : selectedThread.patient_details.username}
                    </h3>
                    <p className="text-[10px] text-asiko-green-light flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-asiko-green-light rounded-full"></span> En ligne
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  {user.role === 'PATIENT' ? (
                    <button 
                      onClick={handleToggleJournal}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-body-sm font-semibold transition-all ${
                        selectedThread.is_journal_shared 
                        ? 'bg-asiko-green-success text-dark-green border border-primary-green' 
                        : 'bg-white text-asiko-gray-dark border border-asiko-gray'
                      }`}
                    >
                      <DocumentIcon className="w-4 h-4" />
                      {selectedThread.is_journal_shared ? 'Carnet partagé' : 'Partager carnet'}
                    </button>
                  ) : (
                    selectedThread.is_journal_shared && (
                      <button 
                        onClick={() => window.open(`/journal?user_id=${selectedThread.patient}`, '_blank')}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-asiko-blue-light text-asiko-blue border border-asiko-blue text-body-sm font-semibold hover:bg-asiko-blue hover:text-white transition-all cursor-pointer"
                        title="Cliquez pour voir le carnet du patient"
                      >
                        <CheckIcon className="w-4 h-4" />
                        Voir le carnet partagé
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
                {messages.map((msg, idx) => (
                  <div 
                    key={msg.id || idx} 
                    className={`max-w-[80%] p-3 rounded-asiko shadow-sm ${
                      msg.is_me 
                        ? 'self-end bg-primary-green text-white rounded-tr-none' 
                        : 'self-start bg-white text-asiko-gray-darker rounded-tl-none border border-asiko-gray/30'
                    }`}
                  >
                    <p className="text-body-md">{msg.content}</p>
                    <p className={`text-[9px] mt-1 text-right ${msg.is_me ? 'text-white/70' : 'text-asiko-gray-dark'}`}>
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Zone */}
              <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-asiko-gray flex gap-2">
                <input 
                  type="text" 
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Tapez votre message..."
                  className="flex-1 bg-asiko-gray-light border-none rounded-full px-4 py-2 text-body-md focus:ring-1 focus:ring-primary-green transition-all"
                  disabled={sending}
                />
                <button 
                  type="submit"
                  disabled={sending || !newMessage.trim()}
                  className="bg-primary-green text-white p-2 rounded-full disabled:opacity-50 hover:bg-dark-green transition-colors"
                >
                  <SendIcon className="w-5 h-5" />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-asiko-gray-dark">
              <div className="w-20 h-20 bg-asiko-gray-light rounded-full border-2 border-dashed border-asiko-gray flex items-center justify-center mb-4">
                <ChatIcon className="w-10 h-10 opacity-30" />
              </div>
              <h3 className="font-bold text-heading-sm mb-1">Sélectionnez une discussion</h3>
              <p className="text-body-sm max-w-xs">
                {user.role === 'PATIENT' 
                  ? "Choisissez un médecin dans la liste ou démarrez une nouvelle discussion." 
                  : "Sélectionnez un patient pour démarrer la consultation préventive."}
              </p>
            </div>
          )}
        </div>
      </div>
    );
};

export default Telemedicine;
