import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Skeleton from 'react-loading-skeleton';
import Modal from 'react-modal';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'react-loading-skeleton/dist/skeleton.css';

Modal.setAppElement('#root');

type Staff = {
  _id: string;
  name: string;
  staffRole: string;
  phone: string;
  password?: string;
  email: string;
  salary: number;
  image?: string;
};

type StaffFormData = {
  name: string;
  staffRole: string;
  phone: string;
  email: string;
  salary: number;
  password?: string;
  image: FileList;
};

export default function StaffPage() {
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
    clearErrors,
  } = useForm<StaffFormData>();

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const res = await axios.get('https://server-orohange.onrender.com/api/staff');
      setStaffList(res.data);
    } catch (error) {
      toast.error('Failed to load staff');
    } finally {
      setLoading(false);
    }
  };

  const openModal = (staff?: Staff) => {
    if (staff) {
      setIsEdit(true);
      setSelectedStaff(staff);
      setValue('name', staff.name);
      setValue('staffRole', staff.staffRole);
      setValue('phone', staff.phone);
      setValue('email', staff.email);
      setValue('salary', staff.salary);
      setPreview(staff.image ?? null);
    } else {
      setIsEdit(false);
      setSelectedStaff(null);
      reset();
      setPreview(null);
      clearErrors();
    }
    setModalOpen(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPreview(URL.createObjectURL(e.target.files[0]));
    }
  };

  const onSubmit = async (data: StaffFormData) => {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('staffRole', data.staffRole);
    formData.append('phone', data.phone);
    formData.append('email', data.email);
    formData.append('salary', data.salary.toString());

    if (data.password && data.password.trim() !== '') {
      formData.append('password', data.password);
    }

    if (data.image && data.image[0]) {
      formData.append('image', data.image[0]);
    }

    try {
      setSubmitLoading(true);
      if (isEdit && selectedStaff) {
        await axios.put(`https://server-orohange.onrender.com/api/staff/${selectedStaff._id}`, formData);
        toast.success('Staff updated successfully');
      } else {
        await axios.post('https://server-orohange.onrender.com/api/staff', formData);
        toast.success('Staff created successfully');
      }
      setModalOpen(false);
      fetchStaff();
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.response?.statusText ||
        error.message ||
        'Failed to submit staff';
      toast.error(message);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this staff?')) {
      axios
        .delete(`https://server-orohange.onrender.com/api/staff/${id}`)
        .then(() => {
          toast.success('Staff deleted');
          fetchStaff();
        })
        .catch((error) => {
          const message = error.response?.data?.message || 'Failed to delete staff';
          toast.error(message);
        });
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-orange-600">Staff Management</h1>
        <button
          onClick={() => openModal()}
          className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-4 py-2 rounded"
        >
          Add Staff
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
        {loading ? (
          <Skeleton count={8} height={40} className="mb-2" />
        ) : (
          <table className="w-full text-left border-collapse dark:text-white">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-700">
                <th className="p-3">Name</th>
                <th className="p-3">Role</th>
                <th className="p-3">Phone</th>
                <th className="p-3">Email</th>
                <th className="p-3">Salary</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {staffList.map((staff) => (
                <tr key={staff._id} className="border-b hover:bg-gray-100 dark:hover:bg-gray-700">
                  <td className="p-3">{staff.name}</td>
                  <td className="p-3 capitalize">{staff.staffRole}</td>
                  <td className="p-3">{staff.phone}</td>
                  <td className="p-3">{staff.email}</td>
                  <td className="p-3">${staff.salary}</td>
                  <td className="p-3">
                    <button
                      onClick={() => openModal(staff)}
                      className="bg-green-600 text-white mr-4 px-4 py-2 rounded-[10px]"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(staff._id)}
                      className="bg-red-600 text-white px-4 py-2 rounded-[10px]"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal
        isOpen={modalOpen}
        onRequestClose={() => {
          setModalOpen(false);
          reset();
          clearErrors();
        }}
        className="bg-white rounded mx-auto p-4 fixed z-50 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 max-w-lg w-full"
        style={{
          overlay: { zIndex: 9999 },
          content: { boxShadow: '0 4px 8px rgba(0,0,0,0.2)' },
        }}
      >
        <h2 className="text-2xl font-bold text-orange-500 mb-4">
          {isEdit ? 'Edit Staff' : 'Add Staff'}
        </h2>
        <form
          key={`${isEdit}-${selectedStaff?._id}`}
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              {...register('name', {
                required: 'Name is required',
                minLength: { value: 2, message: 'Name must be at least 2 characters' },
                maxLength: { value: 50, message: 'Name cannot exceed 50 characters' },
                pattern: {
                  value: /^[A-Za-z\s]+$/,
                  message: 'Name must contain only letters and spaces',
                },
              })}
              className="w-full border border-gray-300 rounded-md p-2"
              placeholder="Enter full name"
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Staff Role</label>
            <select
              {...register('staffRole', { required: 'Role is required' })}
              className="w-full border border-gray-300 rounded-md p-2"
            >
              <option value="">Select Role</option>
              <option value="caretaker">Caretaker</option>
              <option value="teacher">Teacher</option>
              <option value="nurse">Nurse</option>
              <option value="driver">Driver</option>
              <option value="cleaner">Cleaner</option>
            </select>
            {errors.staffRole && (
              <p className="text-red-500 text-xs mt-1">{errors.staffRole.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="tel"
                {...register('phone', {
                  required: 'Phone is required',
                  pattern: {
                    value: /^[0-9]{10,15}$/,
                    message: 'Phone must be 10–15 digits',
                  },
                })}
                className="w-full border border-gray-300 rounded-md p-2"
                placeholder="e.g. 9876543210"
              />
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                    message: 'Enter a valid email address',
                  },
                })}
                className="w-full border border-gray-300 rounded-md p-2"
                placeholder="staff@example.com"
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Salary</label>
              <input
                type="number"
                {...register('salary', {
                  required: 'Salary is required',
                  min: { value: 0, message: 'Salary must be non-negative' },
                  valueAsNumber: true,
                })}
                className="w-full border border-gray-300 rounded-md p-2"
                placeholder="e.g. 30000"
              />
              {errors.salary && <p className="text-red-500 text-xs mt-1">{errors.salary.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                {...register('password', {
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters',
                  },
                })}
                className="w-full border border-gray-300 rounded-md p-2"
                placeholder="••••••"
              />
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Image (Optional)</label>
            <input
              type="file"
              accept="image/*"
              {...register('image', {
                validate: (value) => {
                  if (!value || value.length === 0) return true;
                  const file = value[0];
                  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
                  if (!validTypes.includes(file.type)) {
                    return 'Only JPEG, PNG, JPG, and WebP images allowed.';
                  }
                  if (file.size > 5 * 1024 * 1024) {
                    return 'Image must be less than 5MB';
                  }
                  return true;
                },
              })}
              onChange={handleImageChange}
              className="w-full border border-gray-300 rounded-md p-2 bg-white"
            />
            {errors.image && <p className="text-red-500 text-xs mt-1">{errors.image.message}</p>}
            {preview && (
              <img
                src={preview}
                alt="Preview"
                className="w-20 h-20 rounded-full object-cover mt-2 border"
              />
            )}
          </div>

          <button
            type="submit"
            disabled={submitLoading}
            className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-semibold py-2 rounded transition"
          >
            {submitLoading ? 'Processing...' : isEdit ? 'Update Staff' : 'Add Staff'}
          </button>
        </form>
      </Modal>
    </div>
  );
}
