import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Bar, Pie } from 'react-chartjs-2';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend
} from 'chart.js';
ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

type DashboardStats = {
  childrenCount: number;
  staffCount: number;
  totalDonations: number;
  donationsThisWeek: number;
  donationsThisMonth: number;
  donationsThisYear: number;
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await axios.get('https://server-orohange.onrender.com/api/dashboard');
      setStats(res.data);
    } catch {
      alert('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-orange-600 mb-6">Orphanage Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {loading ? (
          <>
            <Skeleton height={120} count={3} />
          </>
        ) : (
          <>
            <div className="bg-white dark:bg-gray-700 dark:text-white rounded-lg shadow p-6 text-center">
              <h2 className="text-lg font-semibold text-gray-600 mb-2 dark:text-white">Children</h2>
              <p className="text-3xl font-bold text-orange-500 dark:text-white">{stats?.childrenCount}</p>
            </div>
            <div className="bg-white dark:bg-gray-700 dark:text-white rounded-lg shadow p-6 text-center">
              <h2 className="text-lg font-semibold text-gray-600 mb-2 dark:text-white">Staff</h2>
              <p className="text-3xl font-bold text-orange-500 dark:text-white">{stats?.staffCount}</p>
            </div>
            <div className="bg-white dark:bg-gray-700 dark:text-white rounded-lg shadow p-6 text-center">
              <h2 className="text-lg font-semibold text-gray-600 mb-2 dark:text-white">Total Donations</h2>
              <p className="text-3xl font-bold text-green-600 dark:text-white">${stats?.totalDonations}</p>
            </div>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-700 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-600 mb-4 dark:text-white">Donations Summary</h2>
          {loading ? (
            <Skeleton height={300} />
          ) : (
            <Bar
              data={{
                labels: ['This Week', 'This Month', 'This Year', 'All Time'],
                datasets: [{
                  label: 'Donations ($)',
                  data: [
                    stats?.donationsThisWeek,
                    stats?.donationsThisMonth,
                    stats?.donationsThisYear,
                    stats?.totalDonations
                  ],
                  backgroundColor: ['#F97316', '#60A5FA', '#16A34A', '#A855F7']
                }]
              }}
            />
          )}
        </div>

        <div className="bg-white dark:bg-gray-700 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-600 mb-4 dark:text-white">Distribution</h2>
          {loading ? (
            <Skeleton height={300} />
          ) : (
            <Pie
              data={{
                labels: ['Children', 'Staff'],
                datasets: [{
                  data: [stats?.childrenCount, stats?.staffCount],
                  backgroundColor: ['#F97316', '#60A5FA']
                }]
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
