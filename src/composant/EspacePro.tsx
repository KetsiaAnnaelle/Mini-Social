import React, { useRef, useState, useEffect } from 'react';
import { FaPaperPlane, FaReply, FaTimes, FaComments, FaSpinner, FaEdit, FaTrash } from 'react-icons/fa';
import axios from '@/utils/axiosInstance';
import Swal from 'sweetalert2';
import * as Yup from 'yup';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import echo from '@/lib/echo';

// Type definitions
interface JobOffer {
  id: number;
  title: string;
  description: string;
  skills: string;
  link?: string;
  liked_by_user: boolean;
  like_count: number;
}

interface SharedOffer {
  id: number;
  teacher_name: string;
  teacher_id: number;
  job_offer_id: number;
  comment?: string;
  created_at: string;
  job_offer: JobOffer;
  is_new: boolean;
}

interface Message {
  id: number;
  content: string;
  sender_id: number;
  receiver_id: number;
  sender_name: string;
  created_at: string;
  is_from_current_user: boolean;
  edited?: boolean;
}

interface ReplyTo {
  offer: SharedOffer;
  message?: string;
}

const fetchSharedOffers = async (): Promise<SharedOffer[]> => {
  const response = await axios.get('/shared-offers');
  //const response = await axios.get('/api/shared-offers');
  return response.data;
};

const fetchMessages = async (jobOfferId: number): Promise<Message[]> => {
  //const response = await axios.get(`/api/job-offers/${jobOfferId}/messages`);
  const response = await axios.get(`/job-offers/${jobOfferId}/messages`);
  return response.data.map((msg: any) => ({ ...msg, edited: msg.edited ?? false }));
};

const sendMessage = async ({ content, receiver_id, job_offer_id }: any) => {
  const response = await axios.post('/messages', {
    //const response = await axios.post('/api/messages', {
    content,
    receiver_id,
    job_offer_id,
  });
  return response.data;
};

const formatLink = (link: string) => {
  if (!link) return '#';
  if (link.startsWith('/')) return `https://www.emploi.cm${link}`;
  let cleaned = link.trim().replace(/^https?:\/\//, '').replace(/^www\./, '');
  if (!cleaned.includes('emploi.cm')) return '#';
  return `https://www.${cleaned}`;
};

// Helper to get and set seen offers in localStorage
const getSeenSharedOffers = (): number[] => {
  try {
    return JSON.parse(localStorage.getItem('seenSharedOffers') || '[]');
  } catch {
    return [];
  }
};

const markOfferAsSeen = (offerId: number) => {
  const seen = getSeenSharedOffers();
  if (!seen.includes(offerId)) {
    localStorage.setItem('seenSharedOffers', JSON.stringify([...seen, offerId]));
  }
};

const EspacePro = () => {
  const [inputValue, setInputValue] = useState('');
  const [selectedOffer, setSelectedOffer] = useState<SharedOffer | null>(null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '', email: '', filiere: '', niveau: '', etablissement: '', cv: null as File | null,
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [messages, setMessages] = useState<Message[]>([]);
  const [replyTo, setReplyTo] = useState<ReplyTo | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const [echoConnected, setEchoConnected] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState<number | null>(null);
  const [editingContent, setEditingContent] = useState<string>('');

  // Debug: Check authentication status on component mount
  useEffect(() => {
    const authStorage = localStorage.getItem('auth-storage');
    const parsedAuth = JSON.parse(authStorage || '{}');
    console.log('🔍 Auth Debug - Storage:', parsedAuth);
    console.log('🔍 Auth Debug - Token:', parsedAuth.state?.token);
    console.log('🔍 Auth Debug - User:', parsedAuth.state?.user);
    
    if (!parsedAuth.state?.token) {
      console.warn('⚠️ No authentication token found!');
    }
  }, []);

  // Fetch messages when replyTo changes
  const { data: fetchedMessages = [], isLoading: isMessagesLoading } = useQuery({
    queryKey: ['messages', replyTo?.offer?.job_offer_id],
    queryFn: () => fetchMessages(replyTo!.offer.job_offer_id),
    enabled: !!replyTo?.offer?.job_offer_id,
  });

  // Update messages when fetchedMessages changes
  useEffect(() => {
    if (fetchedMessages.length > 0) {
      setMessages(fetchedMessages);
    }
  }, [fetchedMessages]);

  useEffect(() => {
    // Initialize Echo connection
    const initializeEcho = () => {
      try {
    if (echo && echo.connector) {
          if (echo.connector.pusher) {
            const pusher = echo.connector.pusher;
            pusher.connection.bind('connecting', () => setEchoConnected(false));
            pusher.connection.bind('connected', () => setEchoConnected(true));
            pusher.connection.bind('error', () => setEchoConnected(false));
            pusher.connection.bind('disconnected', () => setEchoConnected(false));
            pusher.connection.bind('state_change', () => {});
          } else {
            setEchoConnected(true);
          }
        } else {
          setEchoConnected(false);
        }
      } catch (error) {
        setEchoConnected(false);
      }
    };
    initializeEcho();
      return () => {
      if (echo && echo.connector && echo.connector.pusher) {
        const pusher = echo.connector.pusher;
        pusher.connection.unbind('connecting');
        pusher.connection.unbind('connected');
        pusher.connection.unbind('error');
        pusher.connection.unbind('disconnected');
        pusher.connection.unbind('state_change');
      }
    };
  }, []);

  useEffect(() => {
    if (echoConnected && replyTo?.offer) {
      try {
        const channel = echo.channel(`chat.${replyTo.offer.job_offer_id}`);
        channel.listen('.new.message', (event: any) => {
          const authStorage = localStorage.getItem('auth-storage');
          const parsedAuth = JSON.parse(authStorage || '{}');
          const currentUserId = parsedAuth.state?.user?.id;
          setMessages((prev) => [...prev, {
            id: event.id,
            content: event.content,
            sender_id: event.sender_id,
            receiver_id: event.receiver_id,
            sender_name: event.sender_name,
            created_at: event.created_at,
            is_from_current_user: event.sender_id === currentUserId,
          }]);
        });
        channel.subscribed(() => {});
        channel.error(() => {});
        return () => {
          channel.stopListening('.new.message');
        };
      } catch (error) {}
    }
  }, [echoConnected, replyTo]);

  const { data: sharedOffers = [] } = useQuery({
    queryKey: ['sharedOffers'],
    queryFn: fetchSharedOffers,
  });

  useEffect(() => {
    if (sharedOffers.length > 0) {
      // console.log('Shared offers data:', sharedOffers);
    }
  }, [sharedOffers]);

  const { mutate: postMessage } = useMutation({
    mutationFn: sendMessage,
    onSuccess: (data) => {
      setMessages((prev) => [...prev, {
        id: data.id,
        content: data.content,
        sender_id: data.sender_id,
        receiver_id: data.receiver_id,
        sender_name: data.sender_name,
        created_at: data.created_at,
        is_from_current_user: data.is_from_current_user,
      }]);
    },
    onError: (error: any) => {
      if (error.response?.data) {
        // handle error
      }
    },
  });

  const validationSchema = Yup.object().shape({
    name: Yup.string().required('Nom requis'),
    email: Yup.string().email('Email invalide').required('Email requis'),
    filiere: Yup.string().required('Filière requise'),
    niveau: Yup.string().required('Niveau requis'),
    etablissement: Yup.string().required('Établissement requis'),
    cv: Yup.mixed().required('CV requis'),
  });

  const handleSendMessage = () => {
    if (inputValue.trim() && replyTo?.offer) {
      const messageData = {
        content: inputValue,
        receiver_id: replyTo.offer.teacher_id,
        job_offer_id: replyTo.offer.job_offer_id,
      };
      postMessage(messageData);
      setInputValue('');
    }
  };

  const handleReplyToOffer = (offer: SharedOffer) => {
    setReplyTo({ offer });
    setSelectedOffer(offer);
  };

  const cancelReply = () => {
    setReplyTo(null);
    setSelectedOffer(null);
    setMessages([]);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData({ ...formData, cv: file });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const jobOfferId = selectedOffer?.id;
    if (!jobOfferId) return Swal.fire('Erreur', 'Offre non sélectionnée', 'error');
    
    // Debug: Check authentication status
    const authStorage = localStorage.getItem('auth-storage');
    const parsedAuth = JSON.parse(authStorage || '{}');
    console.log('Auth storage:', parsedAuth);
    console.log('Token:', parsedAuth.state?.token);
    console.log('User:', parsedAuth.state?.user);
    
    if (!parsedAuth.state?.token) {
      return Swal.fire('Erreur', 'Vous devez être connecté pour postuler', 'error');
    }
    
    try {
      await validationSchema.validate(formData, { abortEarly: false });
      setErrors({});
      const payload = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value) payload.append(key, value);
      });
      
      console.log('Submitting application for job offer ID:', jobOfferId);
      console.log('Form data:', formData);
      
      //await axios.post(`/api/job-offers/${jobOfferId}/apply`, payload);
      await axios.post(`/job-offers/${jobOfferId}/apply`, payload);
      await queryClient.invalidateQueries({ queryKey: ['sharedOffers'] });
      Swal.fire('Succès', 'Votre candidature a été envoyée', 'success').then(() => {
        if (selectedOffer?.job_offer?.link) {
          const finalLink = formatLink(selectedOffer.job_offer.link);
          window.open(finalLink, '_blank');
        }
      });
      setFormData({ name: '', email: '', filiere: '', niveau: '', etablissement: '', cv: null });
      setShowApplyModal(false);
    } catch (err: any) {
      console.error('Application error:', err);
      if (err.name === 'ValidationError') {
        const formErrors: { [key: string]: string } = {};
        err.inner.forEach((e: any) => (formErrors[e.path] = e.message));
        setErrors(formErrors);
      } else if (err.response?.status === 409) {
        Swal.fire('Attention', 'Vous avez déjà postulé à cette offre.', 'warning');
      } else if (err.response?.status === 401) {
        Swal.fire('Erreur', 'Vous devez être connecté pour postuler', 'error');
      } else if (err.response?.status === 403) {
        Swal.fire('Erreur', 'Seuls les étudiants peuvent postuler à une offre.', 'error');
      } else {
        Swal.fire('Erreur', 'Une erreur est survenue', 'error');
      }
    }
  };

  const handleApplyClick = (offer: SharedOffer) => {
    // Check if user is logged in
    const authStorage = localStorage.getItem('auth-storage');
    const parsedAuth = JSON.parse(authStorage || '{}');
    
    if (!parsedAuth.state?.token) {
      Swal.fire({
        icon: 'warning',
        title: 'Connexion requise',
        text: 'Vous devez être connecté pour postuler à une offre.',
        showCancelButton: true,
        confirmButtonText: 'Se connecter',
        cancelButtonText: 'Annuler'
      }).then((result) => {
        if (result.isConfirmed) {
          // Redirect to login page
          window.location.href = '/login';
        }
      });
      return;
    }
    
    // Check if user is a student
    if (parsedAuth.state?.user?.role !== 'student') {
      Swal.fire({
        icon: 'error',
        title: 'Accès refusé',
        text: 'Seuls les étudiants peuvent postuler à une offre.',
      });
      return;
    }
    
    setSelectedOffer(offer);
    setShowApplyModal(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 flex flex-col">
      {/* Header */}
      <div className="mb-4 p-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Espace de Chat Professionnel
        </h1>
        <p className="text-gray-600">
          Connectez-vous avec les enseignants et discutez des opportunités d'emploi
        </p>
      </div>
      {/* Connection Status */}
      <div className={`mb-4 mx-4 p-4 rounded-xl border ${
        echoConnected 
          ? 'bg-green-50 border-green-200 text-green-800' 
          : 'bg-red-50 border-red-200 text-red-800'
      }`}>
        <div className="flex items-center">
          <div className={`w-3 h-3 rounded-full mr-3 ${
            echoConnected ? 'bg-green-500' : 'bg-red-500'
          }`}></div>
          <span className="font-medium">
            {echoConnected ? 'Connecté au chat en temps réel' : 'Déconnecté du chat en temps réel'}
          </span>
        </div>
      </div>
      
      {/* Authentication Status */}
      {(() => {
        const authStorage = localStorage.getItem('auth-storage');
        const parsedAuth = JSON.parse(authStorage || '{}');
        const isLoggedIn = !!parsedAuth.state?.token;
        const userRole = parsedAuth.state?.user?.role;
        
        return (
          <div className={`mb-4 mx-4 p-4 rounded-xl border ${
            isLoggedIn 
              ? 'bg-blue-50 border-blue-200 text-blue-800' 
              : 'bg-yellow-50 border-yellow-200 text-yellow-800'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full mr-3 ${
                  isLoggedIn ? 'bg-blue-500' : 'bg-yellow-500'
                }`}></div>
                <span className="font-medium">
                  {isLoggedIn 
                    ? `Connecté en tant que ${userRole || 'utilisateur'}`
                    : 'Non connecté - Connectez-vous pour postuler'
                  }
                </span>
              </div>
              {!isLoggedIn && (
                <button
                  onClick={() => window.location.href = '/login'}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm font-medium"
                >
                  Se connecter
                </button>
              )}
            </div>
          </div>
        );
      })()}
      {/* Responsive grid: 2 columns on desktop, 1 on mobile */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 px-4 pb-4" style={{minHeight: '0'}}>
        {/* Left: Shared Job Offers (scrollable) */}
        <div className="flex flex-col h-[50vh] lg:h-[80vh] bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900 mb-1">
              Offres Partagées
            </h2>
            <p className="text-gray-600 text-sm">
              {sharedOffers.length} offre{sharedOffers.length !== 1 ? 's' : ''} disponible{sharedOffers.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ maxHeight: '100%' }}>
            {sharedOffers.map((offer) => {
              const isNew = !getSeenSharedOffers().includes(offer.id);
              return (
                <div key={offer.id} className="bg-gradient-to-r from-gray-50 to-white rounded-xl p-6 border border-gray-100 hover:shadow-md transition-all duration-300 hover:border-blue-200">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-lg">
                          {offer.teacher_name?.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{offer.teacher_name}</h3>
                        <p className="text-sm text-gray-500">
                          {new Date(offer.created_at).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                    {isNew && (
                      <span className="bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full">
                        Nouveau
                      </span>
                    )}
                  </div>
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-900 mb-2">{offer.job_offer.title}</h4>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{offer.job_offer.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {offer.job_offer.skills.split(',').map((skill, index) => (
                        <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                          {skill.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                  {offer.comment && (
                    <div className="mb-4 p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded-r-lg">
                      <p className="text-sm text-yellow-800 italic">"{offer.comment}"</p>
                    </div>
                  )}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          handleReplyToOffer(offer);
                          markOfferAsSeen(offer.id);
                        }}
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm font-medium"
                      >
                        <FaReply className="w-4 h-4" />
                        <span>Répondre</span>
              </button>
              <button
                onClick={() => {
                          handleApplyClick(offer);
                }}
                        className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 text-sm font-medium"
              >
                        <FaPaperPlane className="w-4 h-4" />
                        <span>Postuler</span>
              </button>
            </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        {/* Right: Chat Area (always visible, takes remaining space) */}
        <div className="flex flex-col h-[50vh] lg:h-[80vh] bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          {replyTo ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50 sticky top-0 z-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">
                        {replyTo.offer.teacher_name?.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{replyTo.offer.teacher_name}</h3>
                      <p className="text-sm text-gray-600">{replyTo.offer.job_offer.title}</p>
                    </div>
                  </div>
                  <button
                    onClick={cancelReply}
                    className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  >
                    <FaTimes className="w-5 h-5" />
                  </button>
                </div>
              </div>
              {/* Messages (scrollable) */}
              <div className="flex-1 min-h-0 overflow-y-auto p-4 bg-gray-50 w-full">
                {isMessagesLoading ? (
                  <div className="flex flex-col items-center justify-center h-full">
                    <FaSpinner className="animate-spin text-blue-500 w-8 h-8 mb-2" />
                    <span className="text-blue-500 font-medium">Chargement des messages...</span>
                  </div>
                ) : (
                  <div className="space-y-4">
          {messages.map((msg, i) => (
                      <div key={msg.id || i} className={`flex ${msg.is_from_current_user ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs sm:max-w-sm md:max-w-md px-4 py-3 rounded-2xl ${
                          msg.is_from_current_user 
                            ? 'bg-blue-600 text-white rounded-br-md' 
                            : 'bg-white text-gray-900 rounded-bl-md shadow-sm border border-gray-200'
                        }`}>
                          <div className="text-xs opacity-70 mb-1 flex items-center justify-between">
                            <span>{msg.sender_name}</span>
                            {msg.is_from_current_user && (
                              <span className="flex items-center gap-2 ml-2">
                                <FaEdit className="cursor-pointer" title="Éditer" onClick={() => { setEditingMessageId(msg.id); setEditingContent(msg.content); }} />
                                <FaTrash className="cursor-pointer" title="Supprimer" onClick={async () => {
                                  const result = await Swal.fire({
                                    title: 'Supprimer ce message ?',
                                    text: 'Cette action est irréversible.',
                                    icon: 'warning',
                                    showCancelButton: true,
                                    confirmButtonColor: '#3085d6',
                                    cancelButtonColor: '#d33',
                                    confirmButtonText: 'Oui, supprimer',
                                    cancelButtonText: 'Annuler',
                                  });
                                  if (result.isConfirmed) {
                                    //await axios.delete(`/api/messages/${msg.id}`);
                                    await axios.delete(`/messages/${msg.id}`);
                                    queryClient.invalidateQueries({ queryKey: ['messages', replyTo?.offer?.job_offer_id] });
                                  }
                                }} />
                              </span>
                            )}
                          </div>
                          {editingMessageId === msg.id ? (
                            <div className="flex items-center gap-2 mt-1">
                              <input
                                className="flex-1 px-2 py-1 rounded border"
                                value={editingContent}
                                onChange={e => setEditingContent(e.target.value)}
                              />
                              <button
                                className="text-blue-600 font-bold"
                                onClick={async () => {
                                  //await axios.put(`/api/messages/${msg.id}`, { content: editingContent });
                                  await axios.put(`/messages/${msg.id}`, { content: editingContent });
                                  setEditingMessageId(null);
                                  setEditingContent('');
                                  setMessages((prev) => prev.map(m => m.id === msg.id ? { ...m, content: editingContent, edited: true } : m));
                                  queryClient.invalidateQueries({ queryKey: ['messages', replyTo?.offer?.job_offer_id] });
                                }}
                              >OK</button>
                              <button className="text-gray-400" onClick={() => setEditingMessageId(null)}><FaTimes /></button>
                            </div>
                          ) : (
                            <>
                              <div className="text-sm">{msg.content}</div>
                              {msg.edited && (
                                <div className="text-xs text-gray-400 italic">édité</div>
                              )}
                            </>
                          )}
                          <div className={`text-xs mt-1 ${
                            msg.is_from_current_user ? 'opacity-70' : 'text-gray-500'
                          }`}>
                            {new Date(msg.created_at).toLocaleTimeString('fr-FR', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>
                )}
      </div>
              {/* Message Input (always at bottom) */}
              <div className="p-2 border-t border-gray-100 bg-white z-10">
                <div className="flex items-center gap-2 w-full">
                  <div className="flex items-center bg-gray-100 rounded-xl px-3 py-2 flex-1">
        <input
          type="text"
                      className="flex-1 bg-transparent focus:outline-none text-gray-900"
                      placeholder={`Répondre à ${replyTo.offer.teacher_name}...`}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
        />
                  </div>
                  <button 
                    onClick={handleSendMessage}
                    className="w-6 h-6 flex items-center justify-center bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
                  >
                    <FaPaperPlane className="w-4 h-4" />
        </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center px-4 py-8">
              <div className="bg-white rounded-xl shadow-md border border-gray-200 w-full max-w-sm sm:max-w-md lg:max-w-lg text-center p-6 sm:p-8 flex flex-col items-center justify-center">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
                  <FaComments className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                  Aucune conversation active
                </h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                  Cliquez sur <strong>"Répondre"</strong> pour commencer une conversation avec un enseignant.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Apply Modal */}
      {showApplyModal && selectedOffer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Formulaire de Candidature</h2>
            <button
              onClick={() => setShowApplyModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  <FaTimes className="w-6 h-6" />
                </button>
              </div>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nom complet</label>
                <input
                  type="text"
                  name="name"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  onChange={handleChange}
                  value={formData.name}
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  onChange={handleChange}
                  value={formData.email}
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Filière</label>
                <input
                  type="text"
                  name="filiere"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  onChange={handleChange}
                  value={formData.filiere}
                />
                {errors.filiere && <p className="text-red-500 text-sm mt-1">{errors.filiere}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Niveau</label>
                <input
                  type="text"
                  name="niveau"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  onChange={handleChange}
                  value={formData.niveau}
                />
                {errors.niveau && <p className="text-red-500 text-sm mt-1">{errors.niveau}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Établissement</label>
                <input
                  type="text"
                  name="etablissement"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  onChange={handleChange}
                  value={formData.etablissement}
                />
                {errors.etablissement && <p className="text-red-500 text-sm mt-1">{errors.etablissement}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">CV</label>
                <input
                  type="file"
                  name="cv"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                />
                {errors.cv && <p className="text-red-500 text-sm mt-1">{errors.cv}</p>}
              </div>
              <button 
                type="submit" 
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
              >
                Envoyer la candidature
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EspacePro;
