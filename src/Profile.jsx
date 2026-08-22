import { useState, useEffect } from 'react';
import axios from 'axios';

function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const token = localStorage.getItem('token');
  const backendUrl = 'https://social-network-backend-clean.vercel.app'; // ✅ UPDATED URL

  // Fetch current user data
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(`${backendUrl}/api/users/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(res.data.user);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    if (token) fetchUser();
  }, [token]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) return alert('Please select a photo first!');
    
    setUploading(true);
    const formData = new FormData();
    formData.append('avatar', selectedFile);

    try {
      const res = await axios.put(`${backendUrl}/api/users/avatar`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setUser(prev => ({ ...prev, avatar: res.data.avatar }));
      setSelectedFile(null);
      alert('Profile photo updated successfully!');
    } catch (err) {
      console.error(err);
      alert('Error uploading photo');
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <div className="text-center mt-20 text-pink-600">Loading profile...</div>;

  return (
    <div className="max-w-2xl mx-auto mt-10 px-4 pb-10">
      <div className="bg-white/70 dark:bg-darkcard backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-white/40 dark:border-gray-700">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-6 text-center">My Profile</h2>
        
        <div className="flex flex-col items-center mb-8">
          <div className="w-32 h-32 rounded-full bg-barbie flex items-center justify-center text-white text-5xl font-bold overflow-hidden shadow-lg mb-4">
            {user?.avatar ? (
              <img 
                src={`${backendUrl}/images/${user.avatar}`} 
                alt="Profile" 
                className="w-full h-full object-cover"
              />
            ) : (
              user?.username ? user.username.charAt(0).toUpperCase() : '?'
            )}
          </div>

          <h3 className="text-2xl font-bold text-gray-800 dark:text-white">{user?.username}</h3>
          <p className="text-gray-500 dark:text-gray-400">{user?.email}</p>
        </div>

        <form onSubmit={handleUpload} className="border-t border-pink-200 dark:border-gray-600 pt-6">
          <p className="text-center text-gray-600 dark:text-gray-300 mb-4 font-medium">Update Profile Photo</p>
          <div className="flex flex-col items-center gap-4">
            <div className="relative group">
              <input 
                type="file" 
                accept="image/*"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-3 file:px-6 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-pink-50 file:text-barbie hover:file:bg-pink-100 dark:file:bg-gray-700 dark:file:text-gray-300"
              />
            </div>
            <button 
              type="submit" 
              disabled={uploading || !selectedFile}
              className="px-8 py-3 bg-barbie text-white rounded-full font-semibold hover:bg-barbie-dark transition-colors shadow-md disabled:opacity-50"
            >
              {uploading ? 'Uploading...' : 'Upload Photo'}
            </button>
          </div>
        </form>

        {/* DELETE ACCOUNT BUTTON */}
        <div className="mt-8 border-t border-red-200 dark:border-red-800 pt-6 flex justify-center">
          <button 
            onClick={async () => {
              if (window.confirm('⚠️ Are you sure you want to delete your account? This will permanently delete all your posts, comments, and data. This action cannot be undone!')) {
                try {
                  await axios.delete(`${backendUrl}/api/users/delete-account`, {
                    headers: { Authorization: `Bearer ${token}` }
                  });
                  localStorage.clear();
                  window.location.reload(); // Redirects to login page
                } catch (err) {
                  alert('Failed to delete account');
                }
              }
            }}
            className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-full font-semibold transition-colors shadow-sm"
          >
            🗑️ Delete My Account
          </button>
        </div>
      </div>
    </div>
  );
}

export default Profile;