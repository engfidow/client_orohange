import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Skeleton from 'react-loading-skeleton';
import Modal from 'react-modal';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'react-loading-skeleton/dist/skeleton.css';
Modal.setAppElement('#root');

type User = {
  _id: string;
  name: string;
  email: string;
  password?: string;
  role: 'admin' | 'staff' | 'user';
  image?: string;
};

type UserFormData = {
  name: string;
  email: string;
  password?: string;
  role: 'admin' | 'staff' | 'user';
};

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<UserFormData>();

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get('https://server-orohange.onrender.com/api/users');
      const filteredUsers = res.data.filter((user: User) => user.role !== 'admin');
      setUsers(filteredUsers);
    } catch {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const openModal = (user?: User) => {
    if (user) {
      
      setIsEdit(true);
      setSelectedUser(user);
      setValue('name', user.name);
      setValue('email', user.email);
      setValue('role', user.role);
      setValue('password', user.password)
      setPreview(user.image ? `https://server-orohange.onrender.com/uploads/${user.image}` : null);
    } else {
      setIsEdit(false);
      reset();
      setPreview(null);
    }
    setModalOpen(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
      setPreview(URL.createObjectURL(e.target.files[0]));
    }
  };

  const onSubmit = async (data: UserFormData) => {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('email', data.email);
    formData.append('role', data.role);
    if (!isEdit && data.password) formData.append('password', data.password);
    if (imageFile) formData.append('image', imageFile);

    try {
      setSubmitLoading(true);
      if (isEdit && selectedUser) {
        await axios.patch(`https://server-orohange.onrender.com/api/users/update/${selectedUser._id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('User updated successfully');
      } else {
        await axios.post('https://server-orohange.onrender.com/api/users', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('User created successfully');
      }
      setModalOpen(false);
      fetchUsers();
    } catch {
      toast.error('Failed to submit user');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      axios.delete(`https://server-orohange.onrender.com/api/users/${id}`)
        .then(() => {
          toast.success('User deleted');
          fetchUsers();
        }).catch(() => toast.error('Failed to delete user'));
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-orange-600">User Management</h1>
        <button onClick={() => openModal()} className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-4 py-2 rounded">Add User</button>
      </div>
      <div className="bg-white rounded-lg shadow-md p-4">
        {loading ? <Skeleton count={8} height={40} className="mb-2" /> : (
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3">Image</th>
                <th className="p-3">Name</th>
                <th className="p-3">Email</th>
                <th className="p-3">Role</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user._id} className="border-b hover:bg-gray-100">
                  <td className="p-3">
                    <img src={user.image ? `https://server-orohange.onrender.com/uploads/${user.image}` : '/images/avatar-placeholder.png'} className="w-10 h-10 rounded-full object-cover border" alt={user.name} />
                  </td>
                  <td className="p-3 font-medium">{user.name}</td>
                  <td className="p-3">{user.email}</td>
                  <td className="p-3 capitalize">{user.role}</td>
                  <td className="p-3">
                    <button onClick={() => openModal(user)} className="bg-green-600 text-white mr-3 px-4 py-2 rounded">Edit</button>
                    <button onClick={() => handleDelete(user._id)} className="bg-red-600 text-white px-4 py-2 rounded">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal isOpen={modalOpen} onRequestClose={() => setModalOpen(false)} className="bg-white rounded-lg mx-auto p-6 fixed z-50 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-lg" style={{ overlay: { zIndex: 51 }, content: { boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)' } }}>
        <h2 className="text-2xl font-bold text-orange-500 mb-4">{isEdit ? 'Edit User' : 'Add User'}</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input {...register('name', { required: 'Name required' })} className="w-full border border-gray-300 rounded-md p-2" />
            {errors.name && <p className="text-red-500 text-xs">{errors.name.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input {...register('email', { required: 'Email required' })} className="w-full border border-gray-300 rounded-md p-2" />
            {errors.email && <p className="text-red-500 text-xs">{errors.email.message}</p>}
          </div>
          {!isEdit && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input type="password" {...register('password', { required: 'Password required' })} className="w-full border border-gray-300 rounded-md p-2" />
              {errors.password && <p className="text-red-500 text-xs">{errors.password.message}</p>}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select {...register('role', { required: 'Role required' })} className="w-full border border-gray-300 rounded-md p-2">
              <option value="">Select Role</option>
              <option value="staff">Staff</option>
              <option value="user">User</option>
            </select>
            {errors.role && <p className="text-red-500 text-xs">{errors.role.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Profile Image</label>
            <input type="file" onChange={handleImageChange} className="w-full border border-gray-300 rounded-md p-2 bg-white" />
            {preview && <img src={preview} className="w-20 h-20 rounded-full object-cover mt-2" />}
          </div>
          <button type="submit" disabled={submitLoading} className="w-full bg-orange-500 text-white font-semibold py-2 rounded">
            {submitLoading ? 'Processing...' : isEdit ? 'Update User' : 'Add User'}
          </button>
        </form>
      </Modal>
    </div>
  );
}
