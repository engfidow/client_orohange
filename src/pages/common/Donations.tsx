import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import Select from 'react-select';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

type Donation = {
  _id: string;
  donorPhone: string;
  amount: number;
  date: string;
  user: {
    _id: string;
    name: string;
    email: string;
    image?: string;
  };
};

type OptionType = {
  label: string;
  value: string;
};

export default function Donations() {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [filteredDonations, setFilteredDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [userOptions, setUserOptions] = useState<OptionType[]>([]);
  const [selectedUser, setSelectedUser] = useState<OptionType | null>(null);

  const BASE_IMAGE_URL = 'https://server-orohange.onrender.com/uploads/';

  useEffect(() => {
    fetchDonations();
  }, []);

  const fetchDonations = async () => {
    try {
      const res = await axios.get('https://server-orohange.onrender.com/api/donations');
      setDonations(res.data);
      setFilteredDonations(res.data);

      // Build unique donor list for select filter
      const uniqueUsers = Array.from(new Set(res.data.map((d: Donation) => d.user._id)))
        .map((userId) => {
          const user = res.data.find((d: Donation) => d.user._id === userId)?.user;
          return { label: user?.name, value: user?._id } as OptionType;
        });

      setUserOptions(uniqueUsers);
    } catch {
      toast.error('Failed to load donations');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (selected: OptionType | null) => {
    setSelectedUser(selected);
    if (!selected) {
      setFilteredDonations(donations);
      return;
    }
    const filtered = donations.filter(d => d.user._id === selected.value);
    setFilteredDonations(filtered);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-orange-600">Donations</h1>

        <div className="w-72">
          <Select
            options={userOptions}
            value={selectedUser}
            onChange={handleFilterChange}
            placeholder="Filter by Donor"
            isClearable
            styles={{
              control: (provided) => ({
                ...provided,
                borderColor: '#d1d5db',
                padding: '2px'
              })
            }}
          />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
        {loading ? (
          <Skeleton count={8} height={40} className="mb-2" />
        ) : (
          <table className="w-full text-left border-collapse dark:text-white">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-700">
                <th className="p-3">Donor</th>
                <th className="p-3">Email</th>
                <th className="p-3">Phone</th>
                <th className="p-3">Amount</th>
                <th className="p-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredDonations.map((donation) => (
                <tr key={donation._id} className="border-b hover:bg-gray-100 dark:hover:bg-gray-700">
                  <td className="p-3 flex items-center gap-3">
                    <img
                      src={
                        donation.user.image
                          ? `${BASE_IMAGE_URL}${donation.user.image}`
                          : '/images/avatar-placeholder.png'
                      }
                      alt="avatar"
                      className="w-10 h-10 rounded-full object-cover border"
                    />
                    <span>{donation.user.name}</span>
                  </td>
                  <td className="p-3">{donation.user.email}</td>
                  <td className="p-3">{donation.donorPhone}</td>
                  <td className="p-3 text-green-600 font-semibold">${donation.amount}</td>
                  <td className="p-3">{new Date(donation.date).toLocaleDateString()}</td>
                </tr>
              ))}
              {filteredDonations.length === 0 && (
                <tr>
                  <td className="p-3 text-center text-gray-500" colSpan={5}>No donations found.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
