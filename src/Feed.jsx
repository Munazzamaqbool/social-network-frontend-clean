import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { FaHeart, FaRegHeart, FaComment, FaTrash } from 'react-icons/fa';

function Feed() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState({});
  const [postContent, setPostContent] = useState('');
  const [postImage, setPostImage] = useState(null);
  const [postPrivacy, setPostPrivacy] = useState('public'); // ✅ NEW: Privacy state
  const [uploading, setUploading] = useState(false);

  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');
  const backendUrl = 'https://social-network-backend-clean.vercel.app';
  const socketRef = useRef(null);

  useEffect(() => {
    socketRef.current = io(backendUrl);

    socketRef.current.on('receive_post', (newPost) => {
      setPosts((prevPosts) => [newPost, ...prevPosts]);
    });

    socketRef.current.on('receive_comment', ({ postId, comment }) => {
      setPosts((prevPosts) => 
        prevPosts.map(post => 
          post._id === postId 
            ? { ...post, comments: [...post.comments, comment] } 
            : post
        )
      );
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await axios.get(`${backendUrl}/api/posts`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPosts(res.data.posts);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    if (token) fetchPosts();
  }, [token]);

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!postContent && !postImage) {
      alert('Please add text or an image.');
      return;
    }
    setUploading(true);

    const formData = new FormData();
    formData.append('content', postContent);
    formData.append('privacy', postPrivacy); // ✅ Sending privacy to backend
    if (postImage) {
      formData.append('image', postImage);
    }

    try {
      const res = await axios.post(`${backendUrl}/api/posts/create`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data' 
        }
      });
      
      socketRef.current.emit('new_post', res.data.post);
      
      setPostContent('');
      setPostImage(null);
      setPostPrivacy('public'); // Reset to default
      setPosts((prev) => [res.data.post, ...prev]);
    } catch (err) {
      console.error('Frontend Error:', err);
      alert('Error creating post');
    } finally {
      setUploading(false);
    }
  };

  const toggleLike = async (postId) => {
    try {
      await axios.put(`${backendUrl}/api/posts/${postId}/like`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPosts((prev) => prev.map(p => 
        p._id === postId ? { ...p, likes: p.likes.includes(userId) ? p.likes.filter(id => id !== userId) : [...p.likes, userId] } : p
      ));
    } catch (err) { alert('Error liking post'); }
  };

  const handleCommentSubmit = async (e, postId) => {
    e.preventDefault();
    const text = commentText[postId];
    if (!text) return;
    try {
      const res = await axios.post(`${backendUrl}/api/posts/${postId}/comment`, 
        { text },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const newComment = res.data.comments[res.data.comments.length - 1];
      socketRef.current.emit('new_comment', { postId, comment: newComment });
      
      setPosts((prev) => prev.map(post => 
        post._id === postId ? { ...post, comments: [...post.comments, newComment] } : post
      ));
      setCommentText({ ...commentText, [postId]: '' });
    } catch (err) { alert('Error adding comment'); }
  };

  const handleDeletePost = async (postId) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await axios.delete(`${backendUrl}/api/posts/${postId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPosts((prev) => prev.filter(p => p._id !== postId));
      } catch (err) {
        alert('Failed to delete post');
      }
    }
  };

  const handleDeleteComment = async (postId, commentId) => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      await axios.delete(`${backendUrl}/api/posts/${postId}/comments/${commentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPosts((prev) => prev.map(post => 
        post._id === postId 
          ? { ...post, comments: post.comments.filter(c => c._id !== commentId) } 
          : post
      ));
    } catch (err) {
      alert('Failed to delete comment');
    }
  };

  if (loading) return <div className="text-center mt-20 text-pink-600">Loading glamorous posts...</div>;

  return (
    <div className="max-w-2xl mx-auto mt-4 px-4 pb-10">
      <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-6 text-center">Your Glam Feed</h2>
      
      <form onSubmit={handleCreatePost} className="bg-white/70 dark:bg-darkcard backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/40 dark:border-gray-700 mb-8">
        <textarea 
          placeholder="What's on your glamorous mind?" 
          value={postContent}
          onChange={(e) => setPostContent(e.target.value)}
          className="w-full bg-transparent border-none focus:ring-0 text-gray-800 dark:text-white resize-none text-lg p-2 placeholder-gray-400 dark:placeholder-gray-500"
          rows="3"
        />
        <div className="flex flex-wrap justify-between items-center mt-2 border-t border-pink-200 dark:border-gray-600 pt-4 gap-2">
          <div className="flex items-center gap-2">
            <input 
              type="file" 
              accept="image/*"
              onChange={(e) => setPostImage(e.target.files[0])}
              className="text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-pink-50 file:text-barbie hover:file:bg-pink-100 dark:file:bg-gray-700 dark:file:text-gray-300"
            />
            {postImage && <span className="text-xs text-barbie font-medium ml-2">📸 Image attached!</span>}
          </div>

          <div className="flex items-center gap-2">
            {/* ✅ NEW PRIVACY DROPDOWN */}
            <select 
              value={postPrivacy}
              onChange={(e) => setPostPrivacy(e.target.value)}
              className="px-3 py-1 rounded-full border border-pink-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-barbie"
            >
              <option value="public">🌍 Public</option>
              <option value="friends">🔒 Friends Only</option>
            </select>

            <button 
              type="submit" 
              disabled={uploading}
              className="px-6 py-2 bg-barbie text-white rounded-full font-semibold hover:bg-barbie-dark transition-colors shadow-md disabled:opacity-50"
            >
              {uploading ? 'Posting...' : 'Post'}
            </button>
          </div>
        </div>
      </form>

      <div className="space-y-6">
        {posts.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400">No posts yet. Be the first to post!</p>
        ) : (
          posts.map((post) => {
            const imageUrl = post.image ? `${backendUrl}/images/${post.image}` : null;
            const avatarUrl = post.user?.avatar ? `${backendUrl}/images/${post.user.avatar}` : null;

            return (
              <div key={post._id} className="bg-white/70 dark:bg-darkcard backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/40 dark:border-gray-700">
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm overflow-hidden bg-barbie">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt={post.user?.username} className="w-full h-full object-cover" />
                    ) : (
                      post.user?.username ? post.user.username.charAt(0).toUpperCase() : '?'
                    )}
                  </div>
                  <span className="ml-3 font-medium text-gray-700 dark:text-gray-300">
                    {post.user?.username || 'Unknown User'}
                  </span>
                  <span className="ml-auto text-xs text-gray-400 dark:text-gray-500">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </span>
                  {/* ✅ SHOW PRIVACY ICON */}
                  <span className="ml-2 text-xs text-gray-400" title={post.privacy === 'friends' ? 'Friends Only' : 'Public'}>
                    {post.privacy === 'friends' ? '🔒' : '🌍'}
                  </span>
                  {post.user?._id === userId && (
                    <button onClick={() => handleDeletePost(post._id)} className="ml-1 text-red-400 hover:text-red-600 transition-colors text-sm">
                      <FaTrash />
                    </button>
                  )}
                </div>
                
                {post.content && <p className="text-gray-800 dark:text-gray-200 text-lg mb-4">{post.content}</p>}
                
                {imageUrl && (
                  <div className="mb-4 rounded-xl overflow-hidden shadow-md bg-white/50">
                    <img src={imageUrl} alt="Post content" className="w-full h-auto object-cover max-h-[500px]" />
                  </div>
                )}

                <div className="flex items-center gap-4 mb-4 border-b border-pink-200 dark:border-gray-600 pb-3">
                  <button onClick={() => toggleLike(post._id)} className="flex items-center gap-2 text-pink-500 hover:text-pink-700 dark:text-pink-400 transition-colors">
                    {post.likes?.includes(userId) ? <FaHeart /> : <FaRegHeart />}
                    <span>{post.likes?.length || 0}</span>
                  </button>
                  <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                    <FaComment />
                    <span>{post.comments?.length || 0}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  {post.comments?.map((comment) => (
                    <div key={comment._id} className="flex items-start gap-2 bg-white/40 dark:bg-gray-800/40 p-3 rounded-xl relative group">
                      <div className="w-7 h-7 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                        {comment.user?.username ? comment.user.username.charAt(0).toUpperCase() : '?'}
                      </div>
                      <div className="flex-1">
                        <span className="font-semibold text-xs text-gray-700 dark:text-gray-300 mr-2">{comment.user?.username}</span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">{comment.text}</span>
                      </div>
                      {comment.user?._id === userId && (
                        <button onClick={() => handleDeleteComment(post._id, comment._id)} className="text-red-400 hover:text-red-600 transition-colors text-xs opacity-0 group-hover:opacity-100">
                          <FaTrash />
                        </button>
                      )}
                    </div>
                  ))}
                  <form onSubmit={(e) => handleCommentSubmit(e, post._id)} className="flex gap-2 mt-2">
                    <input type="text" placeholder="Write a comment..." value={commentText[post._id] || ''} onChange={(e) => setCommentText({ ...commentText, [post._id]: e.target.value })} className="flex-1 px-4 py-2 rounded-full bg-white/50 dark:bg-gray-700/50 border border-pink-200 dark:border-gray-600 focus:outline-none focus:ring-1 focus:ring-barbie text-sm dark:text-white placeholder-gray-400" />
                    <button type="submit" className="px-5 py-2 bg-barbie text-white text-sm font-semibold rounded-full hover:bg-barbie-dark transition-colors shadow-sm">Post</button>
                  </form>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default Feed;