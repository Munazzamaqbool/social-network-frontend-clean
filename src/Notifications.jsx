import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { FaHeart, FaComment, FaUserPlus, FaTimes } from 'react-icons/fa';

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');
  const backendUrl = 'https://social-network-backend-clean.vercel.app';
  const socketRef = useRef(null);

  // Fetch existing notifications
  useEffect(() => {
    const fetchNotifs = async () => {
      try {
        // We will add a backend route for this soon
        // For now, we will rely purely on socket for live alerts
        setLoading(false);
      } catch (err) {
        setLoading(false);
      }
    };
    if (token) fetchNotifs();
  }, [token]);

  // Listen for real-time notifications via Socket.io
  useEffect(() => {
    socketRef.current = io(backendUrl);

    // Join a room with your User ID to receive private messages
    socketRef.current.emit('join_notifications', userId);

    socketRef.current.on('new_notification', (notif) => {
      setNotifications((prev) => [notif, ...prev]);
      // Play a gentle sound if you want
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [userId]);

  const getMessage = (notif) => {
    switch(notif.type) {
      case 'like': return `❤️ ${notif.sender?.username || 'Someone'} liked your post`;
      case 'comment': return `💬 ${notif.sender?.username || 'Someone'} commented on your post`;
      case 'friend_request': return `👋 ${notif.sender?.username || 'Someone'} sent you a friend request`;
      default: return 'New notification';
    }
  };

  if (loading) return <div className="text-center mt-20 text-pink-600">Loading notifications...</div>;

  return (
    <div className="max-w-2xl mx-auto mt-10 px-4 pb-10">
      <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-6 text-center">🔔 Notifications</h2>
      
      {notifications.length === 0 ? (
        <div className="bg-white/70 dark:bg-darkcard backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-white/40 dark:border-gray-700 text-center text-gray-500 dark:text-gray-400">
          <p className="text-lg">No notifications yet. Go interact with the app!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notif) => (
            <div key={notif._id} className="bg-white/70 dark:bg-darkcard backdrop-blur-sm p-4 rounded-xl shadow border border-white/40 dark:border-gray-700 flex items-center gap-4 transition-all hover:scale-[1.01]">
              <div className="text-2xl text-barbie">
                {notif.type === 'like' && <FaHeart />}
                {notif.type === 'comment' && <FaComment />}
                {notif.type === 'friend_request' && <FaUserPlus />}
              </div>
              <div className="flex-1">
                <p className="text-gray-800 dark:text-gray-200 font-medium">{getMessage(notif)}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  {new Date(notif.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Notifications;