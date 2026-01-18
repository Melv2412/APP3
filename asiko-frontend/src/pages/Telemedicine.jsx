/**
 * Telemedicine - Version Premium Medical iOS
 */
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import chatService from '../services/chat';

const Telemedicine = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [threads, setThreads] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [selectedThread, setSelectedThread] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showDoctorList, setShowDoctorList] = useState(false);
  
  const messagesEndRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);

  const scrollToBottom = () => {
    if (shouldAutoScroll) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    // Si l'utilisateur est à moins de 100px du bas, on active l'auto-scroll
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;
    setShouldAutoScroll(isAtBottom);
  };

  useEffect(() => {
    fetchThreads();
    if (user?.role === 'PATIENT') fetchDoctors();
  }, [user]);

  useEffect(() => {
    if (selectedThread) {
      const refresh = async () => {
        await fetchMessages(selectedThread.id);
        // Refresh thread info for sharing status
        try {
          const updatedThreads = await chatService.getThreads();
          const current = updatedThreads.find(t => t.id === selectedThread.id);
          if (current) setSelectedThread(current);
        } catch (e) { console.error(e); }
      };
      
      refresh();
      const interval = setInterval(refresh, 5000);
      return () => clearInterval(interval);
    }
  }, [selectedThread?.id]);

  useEffect(scrollToBottom, [messages]);

  const fetchThreads = async () => {
    try {
      const data = await chatService.getThreads();
      setThreads(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const fetchDoctors = async () => {
    try {
      const data = await chatService.getDoctors();
      setDoctors(data);
    } catch (err) { console.error(err); }
  };

  const fetchMessages = async (threadId) => {
    try {
      const data = await chatService.getMessages(threadId);
      setMessages(data);
    } catch (err) { console.error(err); }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedThread) return;
    setSending(true);
    try {
      const data = await chatService.sendMessage(selectedThread.id, newMessage);
      setMessages([...messages, data]);
      setNewMessage('');
      fetchThreads();
    } catch (err) { console.error(err); }
    finally { setSending(false); }
  };

  const handleStartChat = async (doctorId) => {
    try {
      const thread = await chatService.getOrCreateThread(doctorId);
      setSelectedThread(thread);
      setShowDoctorList(false);
      fetchThreads();
    } catch (err) { console.error(err); }
  };

  const handleToggleJournal = async () => {
    if (!selectedThread || user.role !== 'PATIENT') return;
    try {
      const result = await chatService.toggleJournalSharing(selectedThread.id);
      setSelectedThread({ ...selectedThread, is_journal_shared: result.is_journal_shared });
    } catch (err) { console.error(err); }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F9FB] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FB] pb-32 pt-8 px-6">
      <div className="max-w-5xl mx-auto h-[70vh] flex bg-white rounded-[40px] border border-slate-100 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.1)] overflow-hidden animate-in zoom-in duration-700">
        
        {/* SIDEBAR */}
        <div className={`w-full md:w-80 border-r border-slate-50 flex flex-col ${selectedThread ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-6 border-b border-slate-50 flex justify-between items-center">
            <h2 className="text-lg font-black text-slate-900 tracking-tight">Conseils</h2>
            {user?.role === 'PATIENT' && (
              <button onClick={() => setShowDoctorList(!showDoctorList)} className="w-10 h-10 bg-emerald-500 text-white rounded-2xl shadow-lg shadow-emerald-200 flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-2 no-scrollbar">
            {showDoctorList ? (
              <div className="space-y-2 pt-2">
                <button onClick={() => setShowDoctorList(false)} className="flex items-center gap-2 px-4 py-2 text-[11px] font-black text-slate-400 uppercase tracking-widest">
                   <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg> Retour
                </button>
                {doctors.map(doc => (
                  <div key={doc.id} onClick={() => handleStartChat(doc.id)} className="p-4 bg-slate-50 hover:bg-emerald-50 rounded-3xl cursor-pointer transition-all border border-transparent hover:border-emerald-100 mx-2">
                    <p className="font-black text-slate-900 text-sm">Dr. {doc.last_name || doc.username}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Spécialiste IQA</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-2 pt-2">
                {threads.map(thread => {
                   const partner = user.role === 'PATIENT' ? thread.doctor_details : thread.patient_details;
                   const active = selectedThread?.id === thread.id;
                   return (
                     <div key={thread.id} onClick={() => setSelectedThread(thread)} className={`p-4 rounded-[28px] cursor-pointer transition-all mx-2 ${active ? 'bg-slate-900 text-white' : 'bg-transparent text-slate-900 hover:bg-slate-50' }`}>
                        <div className="flex justify-between items-center mb-1">
                           <p className="font-black text-sm">{user.role === 'PATIENT' ? `Dr. ${partner.last_name}` : partner.username}</p>
                           {thread.unread_count > 0 && <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>}
                        </div>
                        <p className={`text-[11px] font-medium truncate ${active ? 'text-slate-400' : 'text-slate-500'}`}>
                           {thread.last_message?.content || 'Nouvelle consultation...'}
                        </p>
                     </div>
                   );
                })}
              </div>
            )}
          </div>
        </div>

        {/* CHAT AREA */}
        <div className={`flex-1 flex flex-col bg-slate-50/30 ${!selectedThread ? 'hidden md:flex' : 'flex'}`}>
           {selectedThread ? (
             <>
               <div className="p-6 bg-white/80 backdrop-blur-md border-b border-slate-50 flex justify-between items-center">
                  <div className="flex items-center gap-4">
                     <button className="md:hidden" onClick={() => setSelectedThread(null)}><svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M15 18l-6-6 6-6" /></svg></button>
                     <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-500 font-black text-sm">
                        {user.role === 'PATIENT' ? 'DR' : 'PT'}
                     </div>
                     <div>
                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">
                           {user.role === 'PATIENT' ? `Dr. ${selectedThread.doctor_details.last_name}` : selectedThread.patient_details.username}
                        </h3>
                        <div className="flex items-center gap-1.5">
                           <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                           <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Disponible</span>
                        </div>
                     </div>
                  </div>
                  
                  {user.role === 'PATIENT' && (
                    <button onClick={handleToggleJournal} className={`px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${selectedThread.is_journal_shared ? 'bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-200' : 'bg-white text-slate-400 border-slate-100'}`}>
                       {selectedThread.is_journal_shared ? 'Journal Partagé' : 'Partager Journal'}
                    </button>
                  )}

                  {user.role === 'DOCTOR' && selectedThread.is_journal_shared && (
                    <button 
                      onClick={() => navigate(`/journal?user_id=${selectedThread.patient}`)} 
                      className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-tighter bg-indigo-50 text-indigo-600 border border-indigo-100 hover:bg-indigo-500 hover:text-white transition-all shadow-sm"
                    >
                       <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                         <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                       </svg>
                       Carnet
                    </button>
                  )}
               </div>

               <div 
                 className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar"
                 onScroll={handleScroll}
                 ref={scrollContainerRef}
               >
                  {messages.map((m, i) => (
                    <div key={i} className={`flex ${m.is_me ? 'justify-end' : 'justify-start'}`}>
                       <div className={`max-w-[75%] p-4 rounded-[28px] shadow-sm ${m.is_me ? 'bg-slate-900 text-white rounded-tr-lg' : 'bg-white text-slate-900 rounded-tl-lg border border-slate-50'}`}>
                          <p className="text-[14px] font-medium leading-relaxed">{m.content}</p>
                          <p className={`text-[8px] mt-2 font-bold uppercase tracking-widest ${m.is_me ? 'text-slate-500' : 'text-slate-300'}`}>
                             {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                       </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
               </div>

               <form onSubmit={handleSendMessage} className="p-6 bg-white/80 backdrop-blur-md flex gap-3">
                  <input type="text" value={newMessage} onChange={e => setNewMessage(e.target.value)} placeholder="Posez une question..." className="flex-1 bg-slate-50 border-none rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 transition-all placeholder:text-slate-300" disabled={sending} />
                  <button type="submit" disabled={sending || !newMessage.trim()} className="w-14 h-14 bg-emerald-500 text-white rounded-2xl shadow-xl shadow-emerald-100 flex items-center justify-center transition-transform active:scale-95 disabled:opacity-50">
                     <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                  </button>
               </form>
             </>
           ) : (
             <div className="flex-1 flex flex-col items-center justify-center p-12 text-center opacity-40">
                <div className="text-6xl mb-6">💬</div>
                <h3 className="text-xl font-black text-slate-900 mb-2">Conseil Médical</h3>
                <p className="text-sm font-bold text-slate-400 max-w-xs">Sélectionnez un expert pour discuter de votre santé respiratoire.</p>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default Telemedicine;
