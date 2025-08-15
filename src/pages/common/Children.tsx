// ✅ FULL UPDATED VERSION OF CHILD MANAGEMENT UI WITH PRINCIPAL FIELDS + VALIDATION

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Skeleton from 'react-loading-skeleton';
import Modal from 'react-modal';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'react-loading-skeleton/dist/skeleton.css';

Modal.setAppElement('#root');

// Extended type
interface Child {
  _id: string;
  name: string;
  gender: string;
  dateOfBirth: string;
  dateOfAdmission: string;
  health: {
    vaccinations: string;
    allergies: string;
  };
  image: string;
  principalName: string;
  principalPhone: string;
  principalLocation: string;
}

interface ChildFormData {
  name: string;
  gender: string;
  dateOfBirth: string;
  dateOfAdmission: string;
  vaccinations: string;
  allergies: string;
  principalName: string;
  principalPhone: string;
  principalLocation: string;
  image: FileList;
}

export default function Children() {
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isEdit, setIsEdit] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);


  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<ChildFormData>();

  useEffect(() => {
    fetchChildren();
  }, []);

  const fetchChildren = async () => {
    try {
      const res = await axios.get('https://server-orohange.onrender.com/api/children');
      setChildren(res.data);
    } catch {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const openModal = (child?: Child) => {
    if (child) {
      setIsEdit(true);
      setSelectedChild(child);
      setValue('name', child.name);
      setValue('gender', child.gender);
      setValue('dateOfBirth', child.dateOfBirth.split('T')[0]);
      setValue('dateOfAdmission', child.dateOfAdmission.split('T')[0]);
      setValue('vaccinations', child.health.vaccinations);
      setValue('allergies', child.health.allergies);
      setValue('principalName', child.principalName);
      setValue('principalPhone', child.principalPhone);
      setValue('principalLocation', child.principalLocation);
      setPreview(child.image);
    } else {
      setIsEdit(false);
      reset();
      setPreview(null);
    }
    setModalOpen(true);
  };

  const onSubmit = async (data: ChildFormData) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (key === 'image') {
        if (value[0]) formData.append('image', value[0]);
      } else {
        formData.append(key, value);
      }
    });

    setSubmitLoading(true);
    try {
      if (isEdit && selectedChild) {
        await axios.put(`https://server-orohange.onrender.com/api/children/${selectedChild._id}`, formData);
        toast.success('Updated Successfully');
      } else {
        await axios.post('https://server-orohange.onrender.com/api/children', formData);
        toast.success('Added Successfully');
      }
      setModalOpen(false);
      fetchChildren();
    } catch {
      toast.error('Operation failed');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this child?')) {
      try {
        await axios.delete(`https://server-orohange.onrender.com/api/children/${id}`);
        toast.success('Deleted Successfully');
        fetchChildren();
      } catch {
        toast.error('Delete failed');
      }
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPreview(URL.createObjectURL(e.target.files[0]));
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-orange-600">Children Management</h1>
        <button
          onClick={() => openModal()}
          className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-4 py-2 rounded"
        >
          Add Child
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
        {loading ? (
          <Skeleton count={8} height={40} className="mb-2" />
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-700">
                <th className="p-3">Image</th>
                <th className="p-3">Name</th>
                <th className="p-3">DOB</th>
                <th className="p-3">Gender</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {children.map(child => (
                <tr
                  key={child._id}
                  className="border-b hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <td className="p-3">
                    <img src={`https://server-orohange.onrender.com${child.image}`} className="w-12 h-12 rounded-full object-cover" />
                  </td>
                  <td className="p-3">{child.name}</td>
                  <td className="p-3">{child.dateOfBirth.split('T')[0]}</td>
                  <td className="p-3 capitalize">{child.gender}</td>
                  <td className="p-3">
                    <button onClick={() => openModal(child)} className="bg-green-500 text-white px-3 py-1 rounded mr-2">Edit</button>
                    <button onClick={() => handleDelete(child._id)} className="bg-red-500 text-white px-3 py-1 rounded">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* MODAL form omitted for brevity - add new fields & apply validations there */}
      <Modal
  isOpen={modalOpen}
  onRequestClose={() => setModalOpen(false)}
  className="bg-white rounded mx-auto p-4 fixed z-50 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-2xl"
  style={{ overlay: { zIndex: 51, backgroundColor: 'rgba(0,0,0,0.5)' } }}
>
  <h2 className="text-2xl font-bold text-orange-500 mb-6">{isEdit ? 'Edit Child' : 'Add Child'}</h2>

  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
    {/* Row 1: Name + Gender */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="text-sm text-gray-700">Name</label>
       <input
  {...register('name', {
    required: 'Name is required',
    pattern: {
      value: /^[A-Za-z\s]+$/,
      message: 'Name must contain letters and spaces only',
    },
  })}
  placeholder="Child Name"
  className="w-full border border-gray-300 rounded-md p-2"
/>
{errors.name && <p className="text-red-500 text-xs">{errors.name.message}</p>}

      </div>

      <div>
        <label className="text-sm text-gray-700">Gender</label>
        <select
          {...register('gender', { required: 'Gender is required' })}
          className="w-full border border-gray-300 rounded-md p-2"
        >
          <option value="">Select Gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
         
        </select>
        {errors.gender && <p className="text-red-500 text-xs">{errors.gender.message}</p>}
      </div>
    </div>

    {/* Row 2: Date of Birth + Date of Admission */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="text-sm text-gray-700">Date of Birth</label>
        <input
          type="date"
          {...register('dateOfBirth', { required: 'Date of Birth is required' })}
          className="w-full border border-gray-300 rounded-md p-2"
        />
        {errors.dateOfBirth && <p className="text-red-500 text-xs">{errors.dateOfBirth.message}</p>}
      </div>

      <div>
        <label className="text-sm text-gray-700">Date of Admission</label>
        <input
          type="date"
          {...register('dateOfAdmission', { required: 'Date of Admission is required' })}
          className="w-full border border-gray-300 rounded-md p-2"
        />
        {errors.dateOfAdmission && <p className="text-red-500 text-xs">{errors.dateOfAdmission.message}</p>}
      </div>
    </div>

    {/* Row 3: Vaccinations + Allergies */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="text-sm text-gray-700">Vaccinations</label>
        <input
          {...register('vaccinations')}
          placeholder="Vaccinations"
          className="w-full border border-gray-300 rounded-md p-2"
        />
      </div>

      <div>
        <label className="text-sm text-gray-700">Allergies</label>
        <input
          {...register('allergies')}
          placeholder="Allergies"
          className="w-full border border-gray-300 rounded-md p-2"
        />
      </div>
    </div>

    {/* Row 4: Principal Name + Principal Phone */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="text-sm text-gray-700">Principal Name</label>
        <input
          {...register('principalName', {
            required: 'Principal name is required',
            pattern: {
              value: /^[A-Za-z\\s]+$/,
              message: 'Only letters and spaces allowed',
            },
          })}
          placeholder="Principal Name"
          className="w-full border border-gray-300 rounded-md p-2"
        />
        {errors.principalName && <p className="text-red-500 text-xs">{errors.principalName.message}</p>}
      </div>

      <div>
        <label className="text-sm text-gray-700">Principal Phone</label>
        <input
          {...register('principalPhone', {
            required: 'Principal phone is required',
            pattern: {
              value: /^[0-9]+$/,
              message: 'Only numbers allowed',
            },
          })}
          placeholder="61xxxxxxxx"
          className="w-full border border-gray-300 rounded-md p-2"
        />
        {errors.principalPhone && <p className="text-red-500 text-xs">{errors.principalPhone.message}</p>}
      </div>
    </div>

    {/* Row 5: Principal Location + Image */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="text-sm text-gray-700">Principal Location</label>
        <input
          {...register('principalLocation', { required: 'Location is required' })}
          placeholder="Location"
          className="w-full border border-gray-300 rounded-md p-2"
        />
        {errors.principalLocation && <p className="text-red-500 text-xs">{errors.principalLocation.message}</p>}
      </div>

      <div>
        <label className="text-sm text-gray-700">Image</label>
        <input
          type="file"
          {...register('image')}
          onChange={handleImageChange}
          className="w-full border border-gray-300 rounded-md p-2 bg-white"
        />
        {preview && (
          <div className="mt-3">
            <img src={preview} alt="Preview" className="w-20 h-20 rounded-full object-cover" />
          </div>
        )}
      </div>
    </div>

    {/* Submit */}
    <button
      type="submit"
      disabled={submitLoading}
      className="w-full bg-orange-500 text-white font-semibold py-2 rounded-md mt-4 flex justify-center items-center"
    >
      {submitLoading ? (
        <span className="loader border-white border-t-transparent border-4 rounded-full w-5 h-5 animate-spin"></span>
      ) : (
        isEdit ? 'Update' : 'Add'
      )}
    </button>
  </form>
</Modal>

    </div>
  );
}
