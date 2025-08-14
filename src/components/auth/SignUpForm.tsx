import { useState } from 'react';
import axios from 'axios';
import { AiFillEye, AiFillEyeInvisible } from 'react-icons/ai';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface SignUpFormData {
  fname: string;
  lname: string;
  email: string;
  password: string;
  image: File | null;
}

interface ValidationErrors {
  fname?: string;
  lname?: string;
  email?: string;
  password?: string;
  image?: string;
}

export default function SignUpForm() {
  const [formData, setFormData] = useState<SignUpFormData>({
    fname: '',
    lname: '',
    email: '',
    password: '',
    image: null,
  });
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, files } = e.target;
    if (name === 'image' && files && files[0]) {
      setFormData({ ...formData, image: files[0] });
      setPreview(URL.createObjectURL(files[0]));
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const validate = (): boolean => {
    const newErrors: ValidationErrors = {};
    const nameRegex = /^[A-Za-z\s]+$/;

    if (!formData.fname || !nameRegex.test(formData.fname)) {
      newErrors.fname = 'First name must contain only letters and spaces.';
    }

    if (!formData.lname || !nameRegex.test(formData.lname)) {
      newErrors.lname = 'Last name must contain only letters and spaces.';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required.';
    }

    if (!formData.password || formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters.';
    }

    if (!formData.image) {
      newErrors.image = 'Profile image is required.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setLoading(true);
      const data = new FormData();
      data.append('name', `${formData.fname} ${formData.lname}`);
      data.append('email', formData.email);
      data.append('password', formData.password);
      data.append('image', formData.image!);

      const res = await axios.post('/api/auth/register', data);
      toast.success(res.data.message);
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Something went wrong';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg space-y-6"
      >
        <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-white">
          Create Your Account
        </h2>

        <div>
          <label className="block font-medium text-gray-700 dark:text-gray-300">
            First Name
          </label>
          <input
            type="text"
            name="fname"
            placeholder="First Name"
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          {errors.fname && <p className="text-red-500 text-sm mt-1">{errors.fname}</p>}
        </div>

        <div>
          <label className="block font-medium text-gray-700 dark:text-gray-300">
            Last Name
          </label>
          <input
            type="text"
            name="lname"
            placeholder="Last Name"
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          {errors.lname && <p className="text-red-500 text-sm mt-1">{errors.lname}</p>}
        </div>

        <div>
          <label className="block font-medium text-gray-700 dark:text-gray-300">
            Email Address
          </label>
          <input
            type="email"
            name="email"
            placeholder="Email"
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
        </div>

        <div className="relative">
          <label className="block font-medium text-gray-700 dark:text-gray-300">
            Password
          </label>
          <input
            type={showPassword ? 'text' : 'password'}
            name="password"
            placeholder="Password"
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400 pr-10"
          />
          <span
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-[38px] cursor-pointer text-gray-500 dark:text-gray-300"
          >
            {showPassword ? <AiFillEyeInvisible size={20} /> : <AiFillEye size={20} />}
          </span>
          {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
        </div>

        <div>
          <label className="block font-medium text-gray-700 dark:text-gray-300">
            Profile Image
          </label>
          <div className="flex items-center gap-4">
            <input
              type="file"
              name="image"
              accept="image/*"
              onChange={handleChange}
              className="text-sm text-gray-600 dark:text-gray-300 w-full px-4 py-2 border border-gray-300 rounded-md bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            {preview && (
              <img
                src={preview}
                alt="Preview"
                className="w-12 h-12 rounded-full object-cover border border-gray-300"
              />
            )}
          </div>
          {errors.image && <p className="text-red-500 text-sm mt-1">{errors.image}</p>}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 text-white font-semibold bg-blue-600 hover:bg-blue-700 rounded-lg transition"
        >
          {loading ? 'Creating Account...' : 'Sign Up'}
        </button>
      </form>
    </div>
  );
}
