import React, { useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from '@/utils/axiosInstance';
import { FaUserCircle, FaEnvelope, FaUserTag, FaEdit, FaBriefcase, FaUsers, FaComments, FaCamera, FaTimes } from 'react-icons/fa';
import Navbar from '@/composant/Navbar';

const fetchProfile = async () => {
  //const response = await axios.get('/api/profile');
  const response = await axios.get('/profile');
  return response.data;
};

const fetchStats = async () => {
  //const response = await axios.get('/api/profile/stats');
  const response = await axios.get('/profile/stats');
  return response.data;
};

const updateProfile = async (formData: FormData) => {
  //const response = await axios.patch('/api/profile', formData, {
  const response = await axios.patch('/profile', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

const Profile = () => {
  const { data: user, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: fetchProfile,
  });
  const { data: stats = {} } = useQuery({
    queryKey: ['profileStats'],
    queryFn: fetchStats,
  });
  const queryClient = useQueryClient();

  // Edit modal state
  const [showEdit, setShowEdit] = useState(false);
  const [editData, setEditData] = useState({ name: '', email: '' });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (user) setEditData({ name: user.name, email: user.email });
  }, [user]);

  const mutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      setShowEdit(false);
      setAvatarFile(null);
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
  const isSaving = mutation.status === 'pending';

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAvatarFile(e.target.files[0]);
    }
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', editData.name);
    formData.append('email', editData.email);
    if (avatarFile) formData.append('avatar', avatarFile);
    mutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 flex flex-col">
      <Navbar />
      <div className="flex flex-col items-center py-10 px-4">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 w-full max-w-2xl p-8 flex flex-col items-center">
          {/* Avatar */}
          <div className="relative mb-4">
            {user?.avatar ? (
              <img src={user.avatar} alt="Avatar" className="w-28 h-28 rounded-full object-cover border-4 border-blue-200" />
            ) : (
              <FaUserCircle className="w-28 h-28 text-gray-300" />
            )}
            <button
              className="absolute bottom-2 right-2 bg-blue-600 text-white rounded-full p-2 shadow hover:bg-blue-700 transition"
              onClick={() => setShowEdit(true)}
              title="Modifier le profil"
            >
              <FaEdit className="w-5 h-5" />
            </button>
            <button
              className="absolute bottom-2 left-2 bg-gray-100 text-blue-600 rounded-full p-2 shadow hover:bg-blue-100 transition"
              onClick={() => fileInputRef.current?.click()}
              title="Changer la photo"
            >
              <FaCamera className="w-5 h-5" />
            </button>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={fileInputRef}
              onChange={handleAvatarChange}
            />
          </div>
          {/* Name & Email */}
          <h2 className="text-2xl font-bold text-gray-900 mb-1">{user?.name}</h2>
          <div className="flex items-center text-gray-600 mb-2">
            <FaEnvelope className="mr-2" />
            <span>{user?.email}</span>
          </div>
          <div className="flex items-center text-blue-600 font-semibold mb-6">
            <FaUserTag className="mr-2" />
            <span className="capitalize">{user?.role}</span>
          </div>
          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 w-full mb-8">
            <div className="flex flex-col items-center">
              <FaBriefcase className="w-6 h-6 text-blue-500 mb-1" />
              <span className="font-bold text-lg text-gray-900">{stats.jobOffers ?? 0}</span>
              <span className="text-xs text-gray-500 text-center">Offres<br/>partagées</span>
            </div>
            <div className="flex flex-col items-center">
              <FaBriefcase className="w-6 h-6 text-green-500 mb-1" />
              <span className="font-bold text-lg text-gray-900">{stats.appliedOffers ?? 0}</span>
              <span className="text-xs text-gray-500 text-center">Offres<br/>postulées</span>
            </div>
            <div className="flex flex-col items-center">
              <FaUsers className="w-6 h-6 text-purple-500 mb-1" />
              <span className="font-bold text-lg text-gray-900">{stats.friends ?? 0}</span>
              <span className="text-xs text-gray-500 text-center">Amis</span>
            </div>
            <div className="flex flex-col items-center">
              <FaComments className="w-6 h-6 text-pink-500 mb-1" />
              <span className="font-bold text-lg text-gray-900">{stats.messages ?? 0}</span>
              <span className="text-xs text-gray-500 text-center">Messages</span>
            </div>
          </div>
          {/* Edit Profile Button */}
          <button
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition mb-2"
            onClick={() => setShowEdit(true)}
          >
            Modifier le profil
          </button>
          <p className="text-xs text-gray-400">Vous pouvez modifier vos informations et votre photo de profil</p>
        </div>
      </div>
      {/* Edit Modal */}
      {showEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative">
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
              onClick={() => setShowEdit(false)}
            >
              <FaTimes className="w-6 h-6" />
            </button>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Modifier le profil</h2>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet</label>
                <input
                  type="text"
                  name="name"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  value={editData.name}
                  onChange={handleEditChange}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  value={editData.email}
                  onChange={handleEditChange}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Photo de profil</label>
                <input
                  type="file"
                  accept="image/*"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  onChange={handleAvatarChange}
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
                disabled={isSaving}
              >
                {isSaving ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile; 