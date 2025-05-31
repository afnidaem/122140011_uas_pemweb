import React, { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import Navbar from '../components/common/Navbar';
import Sidebar from '../components/common/Sidebar';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { useTransaction } from '../context/TransactionContext';
import { useWallet } from '../context/WalletContext';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

const ExportPDF = () => {
  const { transactions } = useTransaction();
  const { wallets } = useWallet();
  
  // State untuk filter dan opsi
  const [dateRange, setDateRange] = useState('this-month');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedWalletId, setSelectedWalletId] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [showCustomDateRange, setShowCustomDateRange] = useState(false);
  const [includeChart, setIncludeChart] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  
  // Mengatur rentang tanggal berdasarkan pilihan dateRange
  useEffect(() => {
    const now = new Date();
    let start, end;
    
    switch (dateRange) {
      case 'today':
        start = new Date(now.setHours(0, 0, 0, 0));
        end = new Date(now.setHours(23, 59, 59, 999));
        break;
      case 'this-week':
        // Start of week (Sunday)
        start = new Date(now);
        start.setDate(now.getDate() - now.getDay());
        start.setHours(0, 0, 0, 0);
        // End of week (Saturday)
        end = new Date(start);
        end.setDate(start.getDate() + 6);
        end.setHours(23, 59, 59, 999);
        break;
      case 'this-month':
        // Start of month
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        // End of month
        end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
        break;
      case 'last-month':
        // Start of last month
        start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        // End of last month
        end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
        break;
      case 'this-year':
        // Start of year
        start = new Date(now.getFullYear(), 0, 1);
        // End of year
        end = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
        break;
      case 'all-time':
        start = null;
        end = null;
        break;
      case 'custom':
        setShowCustomDateRange(true);
        return;
      default:
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    }
    
    if (start) setStartDate(format(start, 'yyyy-MM-dd'));
    if (end) setEndDate(format(end, 'yyyy-MM-dd'));
    
    setShowCustomDateRange(dateRange === 'custom');
  }, [dateRange]);
  
  // Filter transaksi berdasarkan kriteria
  const getFilteredTransactions = () => {
    return transactions.filter(transaction => {
      // Filter berdasarkan tanggal
      if (startDate && endDate) {
        const transDate = new Date(transaction.date);
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        
        if (transDate < start || transDate > end) return false;
      }
      
      // Filter berdasarkan wallet
      if (selectedWalletId !== 'all' && transaction.walletId !== selectedWalletId) {
        return false;
      }
      
      // Filter berdasarkan tipe (income/expense)
      if (selectedType !== 'all' && transaction.type !== selectedType) {
        return false;
      }
      
      return true;
    });
  };
  
  // Hitung ringkasan transaksi
  const calculateSummary = (filteredTransactions) => {
    const income = filteredTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
      
    const expense = filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
      
    return {
      count: filteredTransactions.length,
      income,
      expense,
      balance: income - expense
    };
  };
  
  // Format mata uang
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  // Format tanggal
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return format(date, 'd MMMM yyyy', { locale: id });
  };
  
  // Fungsi untuk membuat chart transaksi (canvas untuk PDF)
  const createTransactionChart = (income, expense) => {
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 300;
    const ctx = canvas.getContext('2d');
    
    // Warna
    const incomeColor = '#10B981'; // Green-500
    const expenseColor = '#EF4444'; // Red-500
    
    // Judul
    ctx.fillStyle = '#111827'; // Gray-900
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Ringkasan Transaksi', 300, 30);
    
    // Pie chart sederhana
    const total = income + expense;
    const incomeAngle = (income / total) * Math.PI * 2;
    const expenseAngle = (expense / total) * Math.PI * 2;
    
    ctx.beginPath();
    ctx.moveTo(200, 150);
    ctx.arc(200, 150, 100, 0, incomeAngle, false);
    ctx.closePath();
    ctx.fillStyle = incomeColor;
    ctx.fill();
    
    ctx.beginPath();
    ctx.moveTo(200, 150);
    ctx.arc(200, 150, 100, incomeAngle, incomeAngle + expenseAngle, false);
    ctx.closePath();
    ctx.fillStyle = expenseColor;
    ctx.fill();
    
    // Legend
    ctx.fillStyle = incomeColor;
    ctx.fillRect(400, 100, 20, 20);
    ctx.fillStyle = '#111827';
    ctx.font = '14px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`Pemasukan: ${formatCurrency(income)} (${Math.round(income/total*100)}%)`, 430, 115);
    
    ctx.fillStyle = expenseColor;
    ctx.fillRect(400, 130, 20, 20);
    ctx.fillStyle = '#111827';
    ctx.fillText(`Pengeluaran: ${formatCurrency(expense)} (${Math.round(expense/total*100)}%)`, 430, 145);
    
    ctx.fillStyle = '#111827';
    ctx.fillText(`Saldo: ${formatCurrency(income - expense)}`, 430, 175);
    
    return canvas.toDataURL('image/png');
  };
  
  // Fungsi untuk menghasilkan PDF
  const generatePDF = (preview = false) => {
    try {
      setIsExporting(true);
      
      const filteredTransactions = getFilteredTransactions();
      const summary = calculateSummary(filteredTransactions);
      
      // Buat dokumen PDF
      const doc = new jsPDF();
      
      // Tambahkan judul
      doc.setFontSize(20);
      doc.setTextColor(79, 70, 229); // Indigo-600
      doc.text('MoneyMate', 14, 20);
      
      doc.setFontSize(16);
      doc.setTextColor(0, 0, 0);
      doc.text('Laporan Transaksi Keuangan', 14, 30);
      
      // Tambahkan info periode
      doc.setFontSize(10);
      doc.setTextColor(107, 114, 128); // Gray-500
      
      // Tambahkan rentang tanggal
      if (startDate && endDate) {
        const formattedStartDate = formatDate(startDate);
        const formattedEndDate = formatDate(endDate);
        doc.text(`Periode: ${formattedStartDate} - ${formattedEndDate}`, 14, 38);
      } else {
        doc.text(`Periode: Semua Waktu`, 14, 38);
      }
      
      // Tambahkan filter tambahan
      let filterText = '';
      if (selectedWalletId !== 'all') {
        const wallet = wallets.find(w => w.id === selectedWalletId);
        filterText += `Wallet: ${wallet ? wallet.name : 'Tidak ditemukan'} | `;
      }
      
      if (selectedType !== 'all') {
        filterText += `Tipe: ${selectedType === 'income' ? 'Pemasukan' : 'Pengeluaran'} | `;
      }
      
      if (filterText) {
        doc.text(`Filter: ${filterText.slice(0, -3)}`, 14, 44);
      }
      
      doc.text(`Dicetak pada: ${formatDate(new Date().toISOString())}`, 14, filterText ? 50 : 44);
      
      // Tambahkan chart jika diaktifkan
      let currentY = filterText ? 55 : 49;
      
      if (includeChart && summary.income > 0 && summary.expense > 0) {
        try {
          const chartImageUrl = createTransactionChart(summary.income, summary.expense);
          doc.addImage(chartImageUrl, 'PNG', 14, currentY, 180, 90);
          currentY += 95;
        } catch (error) {
          console.error('Error creating chart:', error);
        }
      }
      
      // Siapkan data untuk tabel
      const tableColumn = ["Tanggal", "Kategori", "Deskripsi", "Wallet", "Jumlah", "Tipe"];
      const tableRows = [];
      
      filteredTransactions.forEach(transaction => {
        const wallet = wallets.find(w => w.id === transaction.walletId);
        const transactionData = [
          formatDate(transaction.date),
          transaction.category || '-',
          transaction.description || '-',
          wallet ? wallet.name : '-',
          formatCurrency(transaction.amount).replace('Rp', ''),
          transaction.type === 'income' ? 'Pemasukan' : 'Pengeluaran'
        ];
        tableRows.push(transactionData);
      });
      
      // Buat tabel
      doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: currentY,
        theme: 'grid',
        styles: {
          fontSize: 9,
          cellPadding: 3
        },
        columnStyles: {
          0: { cellWidth: 25 },
          1: { cellWidth: 25 },
          2: { cellWidth: 50 },
          3: { cellWidth: 25 },
          4: { cellWidth: 30, halign: 'right' },
          5: { cellWidth: 25, halign: 'center' }
        },
        headStyles: {
          fillColor: [79, 70, 229], // Indigo-600
          textColor: [255, 255, 255]
        },
        alternateRowStyles: {
          fillColor: [243, 244, 246] // Gray-100
        },
        didParseCell: (data) => {
          // Warna berbeda untuk pemasukan dan pengeluaran
          if (data.section === 'body' && data.column.index === 5) {
            if (data.cell.raw === 'Pemasukan') {
              data.cell.styles.textColor = [16, 185, 129]; // Green-600
            } else if (data.cell.raw === 'Pengeluaran') {
              data.cell.styles.textColor = [239, 68, 68]; // Red-600
            }
          }
        }
      });
      
      // Tampilkan ringkasan
      const finalY = doc.lastAutoTable.finalY + 15;
      
      // Kotak ringkasan
      doc.setFillColor(249, 250, 251); // Gray-50
      doc.setDrawColor(229, 231, 235); // Gray-200
      doc.roundedRect(14, finalY, 182, 40, 3, 3, 'FD');
      
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text('Ringkasan Keuangan', 20, finalY + 10);
      
      // Pemasukan
      doc.setFontSize(10);
      doc.setTextColor(16, 185, 129); // Green-600
      doc.text(`Total Pemasukan:`, 20, finalY + 20);
      doc.text(`${formatCurrency(summary.income).replace('Rp', 'Rp ')}`, 130, finalY + 20);
      
      // Pengeluaran
      doc.setTextColor(239, 68, 68); // Red-600
      doc.text(`Total Pengeluaran:`, 20, finalY + 28);
      doc.text(`${formatCurrency(summary.expense).replace('Rp', 'Rp ')}`, 130, finalY + 28);
      
      // Saldo
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(11);
      doc.text(`Saldo:`, 20, finalY + 36);
      
      // Set warna saldo sesuai dengan nilainya
      if (summary.balance >= 0) {
        doc.setTextColor(16, 185, 129); // Green-600
      } else {
        doc.setTextColor(239, 68, 68); // Red-600
      }
      doc.text(`${formatCurrency(summary.balance).replace('Rp', 'Rp ')}`, 130, finalY + 36);
      
      // Footer
      const pageCount = doc.internal.getNumberOfPages();
      doc.setFontSize(8);
      doc.setTextColor(107, 114, 128); // Gray-500
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.text(
          `Halaman ${i} dari ${pageCount} - MoneyMate © ${new Date().getFullYear()}`,
          doc.internal.pageSize.width / 2,
          doc.internal.pageSize.height - 10,
          { align: 'center' }
        );
      }
      
      if (preview) {
        // Buat data URL untuk preview
        const pdfDataUrl = doc.output('datauristring');
        setPdfPreviewUrl(pdfDataUrl);
        setShowPreview(true);
      } else {
        // Buat nama file
        let fileName = 'laporan-transaksi';
        if (startDate && endDate) {
          const startFormatted = startDate.replace(/-/g, '');
          const endFormatted = endDate.replace(/-/g, '');
          fileName += `_${startFormatted}_${endFormatted}`;
        }
        if (selectedWalletId !== 'all') {
          const wallet = wallets.find(w => w.id === selectedWalletId);
          if (wallet) {
            fileName += `_${wallet.name.toLowerCase().replace(/\s+/g, '-')}`;
          }
        }
        if (selectedType !== 'all') {
          fileName += `_${selectedType}`;
        }
        fileName += '.pdf';
        
        // Simpan PDF
        doc.save(fileName);
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Terjadi kesalahan saat membuat PDF. Silakan coba lagi.');
    } finally {
      setIsExporting(false);
    }
  };
  
  // Jumlah transaksi yang akan diekspor
  const filteredTransactions = getFilteredTransactions();
  const summary = calculateSummary(filteredTransactions);
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      
      <div className="flex-1 flex">
        <Sidebar />
        
        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Ekspor Laporan PDF</h1>
            
            <Card className="mb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Filter Laporan</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Periode
                  </label>
                  <select
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="today">Hari Ini</option>
                    <option value="this-week">Minggu Ini</option>
                    <option value="this-month">Bulan Ini</option>
                    <option value="last-month">Bulan Lalu</option>
                    <option value="this-year">Tahun Ini</option>
                    <option value="all-time">Sepanjang Waktu</option>
                    <option value="custom">Kustom...</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Wallet
                  </label>
                  <select
                    value={selectedWalletId}
                    onChange={(e) => setSelectedWalletId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="all">Semua Wallet</option>
                    {wallets.map(wallet => (
                      <option key={wallet.id} value={wallet.id}>
                        {wallet.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              {showCustomDateRange && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tanggal Mulai
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tanggal Akhir
                    </label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipe Transaksi
                  </label>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="all">Semua Tipe</option>
                    <option value="income">Pemasukan</option>
                    <option value="expense">Pengeluaran</option>
                  </select>
                </div>
                
                <div className="flex items-center mt-7">
                  <input
                    type="checkbox"
                    id="includeChart"
                    checked={includeChart}
                    onChange={(e) => setIncludeChart(e.target.checked)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="includeChart" className="ml-2 block text-sm text-gray-700">
                    Sertakan grafik ringkasan transaksi
                  </label>
                </div>
              </div>
            </Card>
            
            <Card className="mb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Ringkasan Laporan</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-500">Jumlah Transaksi</p>
                  <p className="text-xl font-semibold">{summary.count}</p>
                </div>
                
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-500">Total Pemasukan</p>
                  <p className="text-xl font-semibold text-green-600">{formatCurrency(summary.income)}</p>
                </div>
                
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-500">Total Pengeluaran</p>
                  <p className="text-xl font-semibold text-red-600">{formatCurrency(summary.expense)}</p>
                </div>
                
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-500">Saldo</p>
                  <p className={`text-xl font-semibold ${summary.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(summary.balance)}
                  </p>
                </div>
              </div>
              
              <div className="flex flex-wrap justify-between items-center">
                <p className="text-sm text-gray-500 mb-4 md:mb-0">
                  {summary.count === 0 ? (
                    'Tidak ada transaksi yang sesuai dengan filter.'
                  ) : (
                    `${summary.count} transaksi akan diekspor ke dalam laporan PDF.`
                  )}
                </p>
                
                <div className="space-x-3">
                  <Button
                    onClick={() => generatePDF(true)}
                    variant="secondary"
                    disabled={summary.count === 0 || isExporting}
                  >
                    {isExporting ? 'Memproses...' : 'Preview PDF'}
                  </Button>
                  
                  <Button
                    onClick={() => generatePDF(false)}
                    disabled={summary.count === 0 || isExporting}
                  >
                    {isExporting ? 'Memproses...' : 'Unduh PDF'}
                  </Button>
                </div>
              </div>
            </Card>
            
            {/* Preview Modal */}
            {showPreview && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-5/6 flex flex-col">
                  <div className="p-4 border-b flex justify-between items-center">
                    <h3 className="text-lg font-medium">Preview PDF</h3>
                    <button 
                      onClick={() => setShowPreview(false)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <div className="flex-1 overflow-auto p-4">
                    <iframe 
                      src={pdfPreviewUrl} 
                      className="w-full h-full border" 
                      title="PDF Preview"
                    />
                  </div>
                  <div className="p-4 border-t flex justify-end gap-3">
                    <Button 
                      onClick={() => setShowPreview(false)}
                      variant="secondary"
                    >
                      Tutup
                    </Button>
                    <Button 
                      onClick={() => {
                        generatePDF(false);
                        setShowPreview(false);
                      }}
                    >
                      Unduh PDF
                    </Button>
                  </div>
                </div>
              </div>
            )}
            
          </div>
        </main>
      </div>
    </div>
  );
};

export default ExportPDF;