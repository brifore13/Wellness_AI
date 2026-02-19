import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSession } from '../contexts/SessionContext';
import Sidebar from '../components/Sidebar';
import bennyIcon from '../assets/benny_icon.png';
import { FaHistory } from 'react-icons/fa';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000';

const ChatHistory = () => {
    const { getToken } = useSession();
    const [recentMessages, setRecentMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadRecentMessages();
    }, []);

    const loadRecentMessages = async () => {
        try {
            setLoading(true);
            const token = getToken();
            const response = await axios.get(`${BACKEND_URL}/api/chat/recent`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                setRecentMessages(response.data.messages);
            }
        } catch (error) {
            console.error('Error loading recent messages:', error);
            setError('Failed to load chat history');
        } finally {
            setLoading(false);
        }
    };

    const formatDateTime = (isoString) => {
        if (!isoString) return '';
        return new Date(isoString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
        });
    };

    return (
        <div className="flex h-screen bg-gray-50">
            <Sidebar />

            <div className="flex-1 ml-20 overflow-y-auto p-6">
                <div className="w-full max-w-2xl mx-auto">
                    <div className="text-center mb-8">
                        <img src={bennyIcon} alt="Benny the Beaver" className="w-20 h-20 mb-4 mx-auto" />
                        <h2 className="text-3xl font-bold mb-2 text-gray-800">Chat History</h2>
                        <p className="text-gray-500">Your recent conversations with Benny</p>
                    </div>

                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                            {error}
                        </div>
                    )}

                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                            <span className="ml-3 text-gray-600">Loading recent chats...</span>
                        </div>
                    ) : recentMessages.length === 0 ? (
                        <div className="text-center py-12">
                            <FaHistory className="text-6xl text-gray-300 mx-auto mb-4" />
                            <h3 className="text-xl font-medium text-gray-600 mb-2">
                                No chat history yet
                            </h3>
                            <p className="text-gray-500">
                                Start chatting with Benny to see your conversation history here
                            </p>
                        </div>
                    ) : (
                        <>
                            {recentMessages.map((msg) => (
                                msg.is_ai ? (
                                    <div key={`${msg.timestamp}-${msg.sequence}`} className="mb-4">
                                        <div className="flex items-start">
                                            <img src={bennyIcon} alt="Benny" className="w-8 h-8 mr-2 rounded-full flex-shrink-0" />
                                            <div className="bg-white p-4 rounded-lg shadow-sm">
                                                <p className="text-gray-800">{msg.message}</p>
                                            </div>
                                        </div>
                                        <div className="text-xs text-gray-400 ml-10 mt-1">
                                            {formatDateTime(msg.timestamp)}
                                        </div>
                                    </div>
                                ) : (
                                    <div key={`${msg.timestamp}-${msg.sequence}`} className="mb-4">
                                        <div className="flex justify-end">
                                            <div className="bg-blue-100 p-4 rounded-lg max-w-md">
                                                <p className="text-gray-800">{msg.message}</p>
                                            </div>
                                        </div>
                                        <div className="text-xs text-gray-400 text-right mr-2 mt-1">
                                            {formatDateTime(msg.timestamp)}
                                        </div>
                                    </div>
                                )
                            ))}
                            <div className="text-center py-6">
                                <p className="text-gray-500 text-sm">
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
