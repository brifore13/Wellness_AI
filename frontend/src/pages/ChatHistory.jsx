import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSession } from '../contexts/SessionContext';
import Sidebar from '../components/Sidebar';
import { FaHistory, FaHeartbeat } from 'react-icons/fa';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000';

const ChatHistory = () => {
    const { getToken, guestMode } = useSession();
    const [recentMessages, setRecentMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadRecentMessages();
    }, []);

    const loadRecentMessages = async () => {
        if (guestMode) { setLoading(false); return; }
        try {
            setLoading(true);
            const token = getToken();
            const response = await axios.get(`${BACKEND_URL}/api/chat/recent`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) setRecentMessages(response.data.messages);
        } catch (error) {
            console.error('Error loading recent messages:', error);
            setError('Failed to load chat history');
        } finally {
            setLoading(false);
        }
    };

    const formatDateTime = (isoString) => {
        if (!isoString) return '';
        return new Date(isoString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    return (
        <div className="flex h-screen bg-wa-bg" style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>

            {/* Grid background */}
            <div
                className="fixed inset-0 pointer-events-none z-0"
                style={{
                    backgroundImage: 'linear-gradient(rgba(136,189,242,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(136,189,242,0.04) 1px, transparent 1px)',
                    backgroundSize: '48px 48px',
                }}
            />

            <Sidebar />

            <div className="flex-1 ml-20 overflow-y-auto p-6 relative z-10">
                <div className="w-full max-w-2xl mx-auto">

                    {/* Header */}
                    <div className="text-center mb-10">
                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5 bg-wa-accent/20 border border-wa-accent-lt/25">
                            <FaHeartbeat size={24} className="text-wa-accent-lt" />
                        </div>
                        <h2 className="text-3xl font-bold mb-2 text-wa-text" style={{ fontFamily: 'Georgia, serif', letterSpacing: '-0.5px' }}>
                            Chat History
                        </h2>
                        <p className="text-wa-dim text-sm">Your recent conversations with Benny</p>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="px-4 py-3 rounded-lg mb-6 text-sm border border-red-400/30 bg-red-400/10 text-red-300">
                            {error}
                        </div>
                    )}

                    {/* Loading */}
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-wa-accent-lt" />
                            <span className="ml-3 text-wa-dim text-sm">Loading recent chats...</span>
                        </div>

                    ) : recentMessages.length === 0 ? (
                        /* Empty state */
                        <div className="text-center py-16">
                            <FaHistory size={48} className="text-wa-dim/30 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-wa-dim mb-2">
                                {guestMode ? 'Sign up to save your chat history' : 'No chat history yet'}
                            </h3>
                            <p className="text-wa-dim/60 text-sm max-w-sm mx-auto">
                                {guestMode
                                    ? 'Create a free account to keep track of all your conversations with Benny.'
                                    : 'Start chatting with Benny to see your conversation history here.'}
                            </p>
                        </div>

                    ) : (
                        <>
                            {recentMessages.map((msg) =>
                                msg.is_ai ? (
                                    /* AI bubble — left corner */
                                    <div key={`${msg.timestamp}-${msg.sequence}`} className="mb-4">
                                        <div className="flex items-start">
                                            <div
                                                className="px-4 py-3 text-sm leading-relaxed max-w-xl"
                                                style={{
                                                    backgroundColor: 'rgba(46,61,74,0.9)',
                                                    color: '#f0f4f8',
                                                    borderRadius: '18px 18px 18px 4px',
                                                    border: '1px solid rgba(136,189,242,0.15)',
                                                }}
                                            >
                                                {msg.message}
                                            </div>
                                        </div>
                                        <div className="text-[11px] text-wa-dim/40 mt-1 ml-1">
                                            {formatDateTime(msg.timestamp)}
                                        </div>
                                    </div>
                                ) : (
                                    /* User bubble — right corner */
                                    <div key={`${msg.timestamp}-${msg.sequence}`} className="mb-4">
                                        <div className="flex justify-end">
                                            <div
                                                className="px-4 py-3 text-sm leading-relaxed max-w-md"
                                                style={{
                                                    backgroundColor: 'rgba(106,137,167,0.25)',
                                                    color: '#f0f4f8',
                                                    borderRadius: '18px 18px 4px 18px',
                                                }}
                                            >
                                                {msg.message}
                                            </div>
                                        </div>
                                        <div className="text-[11px] text-wa-dim/40 text-right mt-1 mr-1">
                                            {formatDateTime(msg.timestamp)}
                                        </div>
                                    </div>
                                )
                            )}

                            <div className="text-center py-6">
                                <p className="text-wa-dim/40 text-xs">
                                    Showing {recentMessages.length} messages from today
                                </p>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ChatHistory;
