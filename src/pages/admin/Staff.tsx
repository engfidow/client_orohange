import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Skeleton from 'react-loading-skeleton';
import Modal from 'react-modal';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'react-loading-skeleton/dist/skeleton.css';

// Important: Set Modal root element
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

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<StaffFormData>();

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const res = await axios.get('https://server-orohange.onrender.com/api/staff');
      setStaffList(res.data);
    } catch {
      toast.error('Failed to load staff');
    } finally {
      setLoading(false);
    }
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

  // Only append password if it's a new staff member and password exists
  if (!isEdit && data.password) {
    formData.append('password', data.password);
  }

  // Handle image only if a new file is selected
  if (data.image && data.image[0]) {
    formData.append('image', data.image[0]);
  }

  try {
    setSubmitLoading(true);
    if (isEdit && selectedStaff) {
      await axios.put(`https://server-orohange.onrender.com/api/staff/${selectedStaff._id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      toast.success('Staff updated successfully');
    } else {
      
      await axios.post('https://server-orohange.onrender.com/api/staff', formData);

      toast.success('Staff created successfully');
    }
    setModalOpen(false);
    fetchStaff();
  } catch (error) {
    console.error('Error:', error);
    toast.error(`Failed to ${isEdit ? 'update' : 'create'} staff`);
  } finally {
    setSubmitLoading(false);
  }
};

// In your openModal function, remove the password setting:
const openModal = (staff?: Staff) => {
  if (staff) {
    setIsEdit(true);
    setSelectedStaff(staff);
    setValue('name', staff.name);
    setValue('staffRole', staff.staffRole);
    setValue('phone', staff.phone);
    setValue('email', staff.email);
    setValue('salary', staff.salary);
    setPreview(staff.image ?? '');
    // Remove this line: setValue('password', 'hh');
  } else {
    setIsEdit(false);
    reset();
    setPreview(null);
  }
  setModalOpen(true);
};

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this staff?')) {
      axios.delete(`https://server-orohange.onrender.com/api/staff/${id}`)
        .then(() => {
          toast.success('Staff deleted');
          fetchStaff();
        }).catch(() => toast.error('Failed to delete'));
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-orange-600">Staff Management</h1>
        <button onClick={() => openModal()} className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-4 py-2 rounded">
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
              {staffList.map(staff => (
                <tr key={staff._id} className="border-b hover:bg-gray-100 dark:hover:bg-gray-700">
                  <td className="p-3">{staff.name}</td>
                  <td className="p-3 capitalize">{staff.staffRole}</td>
                  <td className="p-3">{staff.phone}</td>
                  <td className="p-3">{staff.email}</td>
                  <td className="p-3">${staff.salary}</td>
                  <td className="p-3">
                    <button onClick={() => openModal(staff)} className="bg-green-600 text-white mr-4 px-4 py2 rounded-[10px]">Edit</button>
                    <button onClick={() => handleDelete(staff._id)} className="bg-red-600 text-white px-4 py2 rounded-[10px]">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal
        isOpen={modalOpen}
        onRequestClose={() => setModalOpen(false)}
        className="bg-white rounded mx-auto p-4 fixed z-50 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"

  style={{ overlay: { zIndex: 51 }, content: { boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)' } }}
      >
        <h2 className="text-2xl font-bold text-orange-500 mb-4">{isEdit ? 'Edit Staff' : 'Add Staff'}</h2>
       <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
  {/* Name & Role */}
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
      <input
        {...register('name', {
          required: 'Name is required',
          pattern: {
            value: /^[A-Za-z\s]+$/,
            message: 'Name must contain letters and spaces only',
          },
        })}
        className="w-full border border-gray-300 rounded-md p-2"
        placeholder="Full Name"
      />
      {errors.name && <p className="text-red-500 text-xs">{errors.name.message}</p>}
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Staff Role</label>
      <select
        {...register('staffRole', { required: 'Staff role is required' })}
        className="w-full border border-gray-300 rounded-md p-2"
      >
        <option value="">Select Role</option>
        <option value="caretaker">Caretaker</option>
        <option value="teacher">Teacher</option>
        <option value="nurse">Nurse</option>
        <option value="driver">Driver</option>
        <option value="cleaner">Cleaner</option>
      </select>
      {errors.staffRole && <p className="text-red-500 text-xs">{errors.staffRole.message}</p>}
    </div>
  </div>

  {/* Phone & Email */}
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
      <input
        {...register('phone', {
          required: 'Phone is required',
          pattern: {
            value: /^[0-9]+$/,
            message: 'Phone must contain numbers only',
          },
        })}
        className="w-full border border-gray-300 rounded-md p-2"
        placeholder="61xxxxxxxx"
      />
      {errors.phone && <p className="text-red-500 text-xs">{errors.phone.message}</p>}
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
      <input
        {...register('email', {
          required: 'Email is required',
          pattern: {
  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  message: 'Invalid email format',
}
        })}
      
        className="w-full border border-gray-300 rounded-md p-2"
        placeholder="example@email.com"
      />
      {errors.email && <p className="text-red-500 text-xs">{errors.email.message}</p>}
    </div>
  </div>

  {/* Salary & Password */}
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Salary</label>
      <input
        type="number"
        {...register('salary', {
          required: 'Salary is required',
          min: { value: 0, message: 'Salary must be positive' },
        })}
        className="w-full border border-gray-300 rounded-md p-2"
        placeholder="1000"
      />
      {errors.salary && <p className="text-red-500 text-xs">{errors.salary.message}</p>}
    </div>

    {!isEdit && (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
        <input
          type="password"
          {...register('password', {
            required: 'Password is required',
            minLength: { value: 6, message: 'Password must be at least 6 characters' },
          })}
          className="w-full border border-gray-300 rounded-md p-2"
          placeholder="******"
        />
        {errors.password && <p className="text-red-500 text-xs">{errors.password.message}</p>}
      </div>
    )}
  </div>

  {/* Image */}
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
    <input
      type="file"
      {...register('image')}
      onChange={handleImageChange}
      className="w-full border border-gray-300 rounded-md p-2 bg-white"
    />
    {preview && <img src={preview} className="w-20 h-20 rounded-full object-cover mt-2" />}
  </div>

  {/* Submit */}
  <button
    type="submit"
    disabled={submitLoading}
    className="w-full bg-orange-500 text-white font-semibold py-2 rounded"
  >
    {submitLoading ? 'Processing...' : isEdit ? 'Update' : 'Add'}
  </button>
</form>


      </Modal>
    </div>
  );
}
