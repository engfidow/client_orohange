import { useEffect, useState } from 'react';
import axios from 'axios';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

export default function Profile() {
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [userId, setUserId] = useState<string>('');
  const [form, setForm] = useState({
    name: '',
    email: '',
    role: '',
    image: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      console.log(storedUser)
      const parsed = JSON.parse(storedUser);
      setUserId(parsed.id); // save user id for API update
      setTimeout(() => {
        setForm({
          name: parsed.name || '',
          email: parsed.email || '',
          role: parsed.role || '',
          image: parsed.image || '',
        });
        setLoading(false);
      }, 500);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
      setForm({ ...form, image: URL.createObjectURL(e.target.files[0]) });
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('email', form.email);
      if (imageFile) {
        formData.append('image', imageFile);
      }

      await axios.patch(`https://server-orohange.onrender.com/api/users/update/${userId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const updatedUser = { ...JSON.parse(localStorage.getItem('user') || '{}'), name: form.name, email: form.email, image: form.image };
      localStorage.setItem('user', JSON.stringify(updatedUser));

      setEditing(false);
    } catch (err) {
      alert('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-orange-600 text-center mb-2">My Profile</h1>
      <p className="text-center text-gray-500 dark:text-gray-400 mb-6">View and update your personal info.</p>

      <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 p-8 rounded-xl shadow">
        {loading ? (
          <Skeleton height={300} />
        ) : (
          <div className="space-y-6">
            <div className="flex flex-col items-center">
              <img
                src={form.image || '/images/avatar-placeholder.png'}
                alt="Profile"
                className="w-28 h-28 rounded-full object-cover border-2 border-orange-400 shadow"
              />
              <input
                type="file"
                name="image"
                onChange={handleImageChange}
                disabled={!editing}
                className="mt-3 w-full sm:w-2/3 text-center px-4 py-2 border rounded-md bg-gray-100 dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block mb-1 text-sm text-gray-600 dark:text-gray-300">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  disabled={!editing}
                  className="w-full px-4 py-2 border rounded-md bg-gray-100 dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50"
                />
              </div>
              <div>
                <label className="block mb-1 text-sm text-gray-600 dark:text-gray-300">Email</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  disabled={!editing}
                  className="w-full px-4 py-2 border rounded-md bg-gray-100 dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50"
                />
              </div>
              <div>
                <label className="block mb-1 text-sm text-gray-600 dark:text-gray-300">Role</label>
                <input
                  type="text"
                  name="role"
                  value={form.role}
                  disabled
                  className="w-full px-4 py-2 border rounded-md bg-gray-100 dark:bg-gray-700 text-sm text-gray-500 dark:text-gray-400 cursor-not-allowed"
                />
              </div>
            </div>

            <div className="flex justify-end">
              {editing ? (
                <button
                  onClick={handleSave}
                  className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-2 rounded-md transition"
                >
                  Save Changes
                </button>
              ) : (
                <button
                  onClick={() => setEditing(true)}
                  className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-2 rounded-md transition"
                >
                  Edit Profile
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
