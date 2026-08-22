import { useState, useEffect } from 'react';
import axios from 'axios';
import { FaUserPlus, FaCheck, FaSearch } from 'react-icons/fa';

function Friends() {
  const [requests, setRequests] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const token = localStorage.getItem('token');
  const backendUrl = 'https://social-network-backend-clean.vercel.app'; // ✅ UPDATED URL

  // Load friend requests
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await axios.get(`${backendUrl}/api/friends/requests`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setRequests(res.data.requests);
      } catch (err) { console.error(err); }
    };
    if (token) fetchRequests();
  }, [token]);

  // Search for users
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery) return;
    try {
      const res = await axios.get(`${backendUrl}/api/friends/search/${searchQuery}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSearchResults(res.data.users);
    } catch (err) { alert('Error searching'); }
  };

  // Send Friend Request
  const sendRequest = async (userId) => {
    try {
      await axios.post(`${backendUrl}/api/friends/request/${userId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Request Sent!');
      setSearchResults([]);
    } catch (err) { alert(err.response?.data?.error || 'Error'); }
  };

  // Accept Friend Request
  const acceptRequest = async (userId) => {
    try {
      await axios.post(`${backendUrl}/api/friends/accept/${userId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRequests(requests.filter(r => r._id !== userId));
      alert('Friend Added!');
    } catch (err) { alert('Error accepting request'); }
  };

  return (
    <div className="max-w-4xl mx-auto mt-6 px-4 pb-10">
      <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">Friends</h2>
      
      {/* SEARCH FOR FRIENDS */}
      <div className="bg-white/70 dark:bg-darkcard backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/40 dark:border-gray-700 mb-6">
        <form onSubmit={handleSearch} className="flex gap-4">
          <div className="flex-1 flex items-center bg-white/50 dark:bg-gray-700/50 rounded-full px-4 border border-pink-200 dark:border-gray-600">
            <FaSearch className="text-gray-400" />
            <input 
              type="text" 
              placeholder="Search for users by username..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent border-none focus:ring-0 px-3 py-2 text-gray-800 dark:text-white"
            />
          </div>
          <button type="submit" className="px-6 py-2 bg-barbie text-white rounded-full font-semibold hover:bg-barbie-dark transition-colors">Search</button>
        </form>

        {/* SEARCH RESULTS */}
        {searchResults.length > 0 && (
          <div className="mt-4 space-y-2">
            {searchResults.map((user) => (
              <div key={user._id} className="flex justify-between items-center bg-white/50 dark:bg-gray-800/50 p-3 rounded-xl">
                <div>
                  <p className="font-semibold text-gray-800 dark:text-white">{user.username}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                </div>
                <button onClick={() => sendRequest(user._id)} className="flex items-center gap-2 px-4 py-1 bg-barbie-light text-barbie-dark rounded-full text-sm font-semibold hover:bg-barbie hover:text-white transition-colors">
                  <FaUserPlus /> Add Friend
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* INCOMING REQUESTS */}
      <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-3">Friend Requests</h3>
      {requests.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">No pending requests.</p>
      ) : (
        <div className="space-y-3">
          {requests.map((user) => (
            <div key={user._id} className="flex justify-between items-center bg-white/70 dark:bg-darkcard backdrop-blur-sm p-4 rounded-2xl shadow border border-white/40 dark:border-gray-700">
              <div>
                <p className="font-semibold text-gray-800 dark:text-white">{user.username}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
              </div>
              <button onClick={() => acceptRequest(user._id)} className="flex items-center gap-2 px-4 py-2 bg-barbie text-white rounded-full text-sm font-semibold hover:bg-barbie-dark transition-colors">
                <FaCheck /> Accept
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Friends;