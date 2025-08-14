import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { AiFillEye, AiFillEyeInvisible } from 'react-icons/ai';
import 'react-toastify/dist/ReactToastify.css';

interface SignInFormData {
  email: string;
  password: string;
}

export default function SignInForm() {
  const [formData, setFormData] = useState<SignInFormData>({ email: '', password: '' });
  const [otp, setOtp] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState<'login' | 'verify'>('login');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      toast.error('Email and password are required');
      return;
    }
    try {
      setLoading(true);
      const res = await axios.post('https://server-orohange.onrender.com/api/auth/send-otp', formData);
      toast.success(res.data.message);
      setStep('verify');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'OTP sending failed');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) return toast.error('OTP is required');
    try {
      setLoading(true);
      const res = await axios.post('https://server-orohange.onrender.com/api/auth/verify-otp', {
        ...formData,
        otp
      });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      toast.success('Login successful');
      if (res.data.user.role === 'staff') {
        navigate('/staff-dashboard');
      } else {
        navigate('/admin-dashboard');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 px-4">
      <form
        onSubmit={step === 'login' ? handleLogin : handleVerify}
        className="w-full max-w-md bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg space-y-6"
      >
        <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-white">
          {step === 'login' ? 'Sign In to Your Account' : 'Verify OTP'}
        </h2>

        {step === 'login' && (
          <>
            <div>
              <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>

            <div className="relative">
              <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Password"
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-400 pr-10"
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[42px] cursor-pointer text-gray-500 dark:text-gray-300"
              >
                {showPassword ? <AiFillEyeInvisible size={20} /> : <AiFillEye size={20} />}
              </span>
            </div>
          </>
        )}

        {step === 'verify' && (
          <div>
            <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">OTP Code</label>
            <input
              type="text"
              name="otp"
              placeholder="Enter OTP"
              onChange={(e) => setOtp(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 text-white font-semibold bg-[#F97316] hover:bg-[#EA580C] rounded-lg transition"
        >
          {loading
            ? step === 'login'
              ? 'Sending OTP...'
              : 'Verifying...'
            : step === 'login'
            ? 'Send OTP'
            : 'Verify OTP'}
        </button>

        {step === 'login' && (
          <p className="text-center text-sm text-gray-600 dark:text-gray-300">
            Don't have an account?{' '}
            <span
              onClick={() => navigate('/signup')}
              className="text-[#F97316] hover:underline cursor-pointer font-medium"
            >
              Sign Up
            </span>
          </p>
          
        )}
        <p className="text-sm text-right text-gray-600 dark:text-gray-300">
  <span
    onClick={() => navigate('/forgot-password')}
    className="text-[#F97316] hover:underline cursor-pointer font-medium"
  >
    Forgot Password?
  </span>
</p>

      </form>
    </div>
  );
}
