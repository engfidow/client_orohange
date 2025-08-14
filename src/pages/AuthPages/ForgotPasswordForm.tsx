import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState<'request' | 'reset'>('request');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); // 👈 Add navigate

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return toast.error('Email is required');
    try {
      setLoading(true);
      const res = await axios.post('https://server-orohange.onrender.com/api/auth/forgot-password', { email });
      toast.success(res.data.message);
      setStep('reset');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || !newPassword) return toast.error('All fields are required');
    try {
      setLoading(true);
      const res = await axios.post('https://server-orohange.onrender.com/api/auth/reset-password', {
        email,
        otp,
        newPassword
      });
      toast.success(res.data.message);
      navigate('/signin'); // 👈 Redirect to login
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 px-4">
      <form
        onSubmit={step === 'request' ? handleRequest : handleReset}
        className="w-full max-w-md bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg space-y-6"
      >
        <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-white">
          {step === 'request' ? 'Forgot Password' : 'Reset Password'}
        </h2>

        <div>
          <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-400"
            disabled={step === 'reset'}
          />
        </div>

        {step === 'reset' && (
          <>
            <div>
              <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">OTP</label>
              <input
                type="text"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>

            <div>
              <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">New Password</label>
              <input
                type="password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>
          </>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 text-white font-semibold bg-[#F97316] hover:bg-[#EA580C] rounded-lg transition"
        >
          {loading
            ? step === 'request'
              ? 'Sending OTP...'
              : 'Resetting...'
            : step === 'request'
            ? 'Send OTP'
            : 'Reset Password'}
        </button>
      </form>
    </div>
  );
}
