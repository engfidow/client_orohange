import  { useEffect, useState } from 'react';
import axios from 'axios';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { Document, Packer, Paragraph, Table, TableRow, TableCell } from 'docx';

type Donation = {
  _id: string;
  donorPhone: string;
  amount: number;
  date: string;
  user: {
    name: string;
    email: string;
  };
};

export default function Reports() {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState('all');
  const [selectedDonor, setSelectedDonor] = useState<string>('all');

  useEffect(() => {
    fetchData();
  }, [range]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`https://server-orohange.onrender.com/api/reports/donations/${range}`);
      setDonations(res.data);
    } catch {
      alert('Failed to load report');
    } finally {
      setLoading(false);
    }
  };

  const uniqueDonors = Array.from(new Set(donations.map(d => d.user.name)));

  const filteredDonations =
    selectedDonor === 'all'
      ? donations
      : donations.filter(d => d.user.name === selectedDonor);

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.text("Donations Report", 14, 20);
    autoTable(doc, {
      startY: 30,
      head: [['Donor', 'Email', 'Phone', 'Amount', 'Date']],
      body: filteredDonations.map(d => [
        d.user.name,
        d.user.email,
        d.donorPhone,
        `$${d.amount}`,
        new Date(d.date).toLocaleDateString(),
      ]),
    });
    doc.save('donations_report.pdf');
  };

  const handleExportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      filteredDonations.map(d => ({
        Donor: d.user.name,
        Email: d.user.email,
        Phone: d.donorPhone,
        Amount: d.amount,
        Date: new Date(d.date).toLocaleDateString(),
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Donations');
    XLSX.writeFile(workbook, 'donations_report.xlsx');
  };

  const handleExportWord = async () => {
    const rows = filteredDonations.map(d => new TableRow({
      children: [
        new TableCell({ children: [new Paragraph(d.user.name)] }),
        new TableCell({ children: [new Paragraph(d.user.email)] }),
        new TableCell({ children: [new Paragraph(d.donorPhone)] }),
        new TableCell({ children: [new Paragraph(`$${d.amount}`)] }),
        new TableCell({ children: [new Paragraph(new Date(d.date).toLocaleDateString())] }),
      ]
    }));

    const doc = new Document({
      sections: [{
        children: [
          new Paragraph("Donations Report"),
          new Table({
            rows: [
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph("Donor")] }),
                  new TableCell({ children: [new Paragraph("Email")] }),
                  new TableCell({ children: [new Paragraph("Phone")] }),
                  new TableCell({ children: [new Paragraph("Amount")] }),
                  new TableCell({ children: [new Paragraph("Date")] }),
                ]
              }),
              ...rows
            ]
          })
        ]
      }]
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, 'donations_report.docx');
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-orange-600 mb-8 text-center">Donations Report</h1>

      <div className="flex flex-col md:flex-row md:justify-between items-center mb-6 gap-4">
        <div className="flex flex-wrap justify-center md:justify-start gap-2">
          {['week', 'month', 'year', 'all'].map(option => (
            <button
              key={option}
              onClick={() => setRange(option)}
              className={`px-4 py-2 rounded font-semibold border transition ${
                range === option ? 'bg-orange-500 text-white' : 'bg-white text-gray-700 border-gray-300'
              }`}
            >
              {option === 'week' && 'This Week'}
              {option === 'month' && 'This Month'}
              {option === 'year' && 'This Year'}
              {option === 'all' && 'All Time'}
            </button>
          ))}
        </div>

        <select
          value={selectedDonor}
          onChange={e => setSelectedDonor(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
        >
          <option value="all">All Donors</option>
          {uniqueDonors.map(donor => (
            <option key={donor} value={donor}>{donor}</option>
          ))}
        </select>

        <div className="flex gap-3">
          <button onClick={handleExportPDF} className="bg-red-500 text-white px-4 py-2 rounded shadow-md hover:bg-red-600">PDF</button>
          <button onClick={handleExportExcel} className="bg-green-500 text-white px-4 py-2 rounded shadow-md hover:bg-green-600">Excel</button>
          <button onClick={handleExportWord} className="bg-blue-500 text-white px-4 py-2 rounded shadow-md hover:bg-blue-600">Word</button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6 dark:bg-gray-700">
        {loading ? (
          <Skeleton count={8} height={40} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full table-auto text-sm text-left dark:bg-gray-700 dark:text-white">
              <thead className="bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-white">
                <tr>
                  <th className="p-3">Donor</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Phone</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredDonations.map(d => (
                  <tr key={d._id} className="border-b hover:bg-gray-100 hover:text-black">
                    <td className="p-3 font-medium">{d.user.name}</td>
                    <td className="p-3">{d.user.email}</td>
                    <td className="p-3">{d.donorPhone}</td>
                    <td className="p-3 text-green-600 font-bold">${d.amount}</td>
                    <td className="p-3">{new Date(d.date).toLocaleDateString()}</td>
                  </tr>
                ))}
                {filteredDonations.length === 0 && (
                  <tr>
                    <td className="p-4 text-center text-gray-500" colSpan={5}>
                      No donations found for selected filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
