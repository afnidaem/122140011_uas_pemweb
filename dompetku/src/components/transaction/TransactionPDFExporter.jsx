import { useState, useContext } from 'react';
import { jsPDF } from 'jspdf';  // Menggunakan kurung kurawal
import 'jspdf-autotable';
import { useTransaction } from '../../context/TransactionContext';
import Card from '../common/Card';
import Button from '../common/Button';
import Modal from '../common/Modal';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate, formatDateTime } from '../../utils/dateFormatter';
import { FiDownload, FiEye, FiFilter, FiRefreshCw } from 'react-icons/fi';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

const TransactionPDFExporter = ({ period }) => {
  const { transactions, filters } = useTransaction();
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [pdfDataUrl, setPdfDataUrl] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [showCustomFilter, setShowCustomFilter] = useState(false);
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  // Format periode untuk judul laporan
  const getPeriodTitle = () => {
    switch (period) {
      case 'today':
        return 'Hari Ini';
      case 'this-week':
        return 'Minggu Ini';
      case 'this-month':
        return 'Bulan Ini';
      case 'last-month':
        return 'Bulan Lalu';
      case 'this-year':
        return 'Tahun Ini';
      case 'all-time':
        return 'Sepanjang Waktu';
      default:
        return 'Kustom';
    }
  };

  // Format rentang tanggal untuk nama file
  const formatDateRange = (startDate, endDate) => {
    if (!startDate && !endDate) return 'semua-transaksi';
    
    const formatFileDate = (date) => {
      if (!date) return '';
      return format(date, 'dd-MM-yyyy', { locale: id });
    };
    
    const start = startDate ? formatFileDate(startDate) : 'awal';
    const end = endDate ? formatFileDate(endDate) : 'sekarang';
    
    return `${start}_${end}`;
  };

  // Dapatkan tanggal untuk filter sesuai dengan periode dashboard
  const getFilterDates = () => {
    // Jika filter kustom diaktifkan, gunakan filter kustom
    if (showCustomFilter && customStartDate && customEndDate) {
      return {
        startDate: new Date(customStartDate),
        endDate: new Date(customEndDate)
      };
    }
    
    // Jika tidak, gunakan filter yang sudah ada di dashboard
    return {
      startDate: filters.startDate,
      endDate: filters.endDate
    };
  };

  // Hitung ringkasan transaksi
  const calculateSummary = (filteredTrans) => {
    const income = filteredTrans
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
      
    const expense = filteredTrans
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
      
    return {
      income,
      expense,
      balance: income - expense
    };
  };

  // Menghasilkan PDF
  const generatePDF = async (preview = false) => {
    try {
      setIsExporting(true);
      
      // Gunakan filter dari dashboard atau filter kustom
      const { startDate, endDate } = getFilterDates();
      
      // Filter transaksi
      let filteredTransactions = [...transactions];
      if (startDate && endDate) {
        filteredTransactions = transactions.filter(transaction => {
          const transDate = new Date(transaction.date);
          return transDate >= startDate && transDate <= endDate;
        });
      }
      
      const summary = calculateSummary(filteredTransactions);
      
      // Buat dokumen PDF
      const doc = new jsPDF();
      
      // Tambahkan judul
      doc.setFontSize(20);
      doc.setTextColor(79, 70, 229); // Primary color
      doc.text('MoneyMate', 14, 20);
      
      doc.setFontSize(16);
      doc.setTextColor(0, 0, 0);
      doc.text('Laporan Transaksi Keuangan', 14, 30);
      
      // Tambahkan info periode
      doc.setFontSize(10);
      doc.setTextColor(107, 114, 128); // Gray-500
      
      // Tambahkan periode yang dipilih
      const periodTitle = getPeriodTitle();
      doc.text(`Periode: ${periodTitle}`, 14, 38);
      
      // Tambahkan rentang tanggal jika ada
      if (startDate && endDate) {
        const formattedStartDate = formatDate(startDate);
        const formattedEndDate = formatDate(endDate);
        doc.text(`${formattedStartDate} - ${formattedEndDate}`, 14, 44);
      }
      
      doc.text(`Dicetak pada: ${formatDate(new Date())}`, 14, startDate && endDate ? 50 : 44);
      
      // Siapkan data untuk tabel
      const tableColumn = ["Tanggal", "Kategori", "Deskripsi", "Wallet", "Jumlah", "Tipe"];
      const tableRows = [];
      
      filteredTransactions.forEach(transaction => {
        const transactionData = [
          formatDate(transaction.date, 'd MMM yyyy'),
          transaction.category || '-',
          transaction.description || '-',
          transaction.wallet?.name || '-',
          formatCurrency(transaction.amount).replace('Rp', ''),
          transaction.type === 'income' ? 'Pemasukan' : 'Pengeluaran'
        ];
        tableRows.push(transactionData);
      });
      
      // Buat tabel
      doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: startDate && endDate ? 56 : 50,
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
          fillColor: [79, 70, 229], // Primary color
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
      doc.text(`Arus Kas:`, 20, finalY + 36);
      
      // Set warna arus kas sesuai dengan nilainya
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
        setPdfDataUrl(pdfDataUrl);
        setIsPreviewOpen(true);
      } else {
        // Simpan PDF
        const dateRangeStr = formatDateRange(startDate, endDate);
        const fileName = `moneymate_transaksi_${dateRangeStr}.pdf`;
        doc.save(fileName);
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Terjadi kesalahan saat membuat PDF. Silakan coba lagi.');
    } finally {
      setIsExporting(false);
    }
  };

  // Reset filter kustom
  const resetCustomFilter = () => {
    setCustomStartDate('');
    setCustomEndDate('');
    setShowCustomFilter(false);
  };

  return (
    <Card
      title="Ekspor Laporan Transaksi"
      className="mb-6"
    >
      <div className="space-y-4">
        {/* Filter Kustom Toggle */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Periode yang dipilih: <span className="font-medium">{getPeriodTitle()}</span>
          </p>
          <Button 
            variant="link" 
            onClick={() => setShowCustomFilter(!showCustomFilter)}
            className="text-sm flex items-center"
          >
            <FiFilter className="mr-1" />
            {showCustomFilter ? 'Sembunyikan Filter' : 'Filter Kustom'}
          </Button>
        </div>
        
        {/* Custom Date Filter */}
        {showCustomFilter && (
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Mulai:</label>
                <input 
                  type="date" 
                  value={customStartDate} 
                  onChange={(e) => setCustomStartDate(e.target.value)} 
                  className="w-full p-2 border border-gray-300 rounded focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Akhir:</label>
                <input 
                  type="date" 
                  value={customEndDate} 
                  onChange={(e) => setCustomEndDate(e.target.value)} 
                  className="w-full p-2 border border-gray-300 rounded focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>
            <div className="mt-3">
              <button 
                onClick={resetCustomFilter}
                className="text-sm text-gray-600 hover:text-gray-800 flex items-center"
              >
                <FiRefreshCw className="mr-1" />
                Reset dan Gunakan Filter Dashboard
              </button>
            </div>
          </div>
        )}
        
        {/* Transaction Summary */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">Transaksi yang akan diekspor</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {(() => {
              // Gunakan filter dari dashboard atau filter kustom
              const { startDate, endDate } = getFilterDates();
              
              // Filter transaksi
              let filteredTransactions = [...transactions];
              if (startDate && endDate) {
                filteredTransactions = transactions.filter(transaction => {
                  const transDate = new Date(transaction.date);
                  return transDate >= startDate && transDate <= endDate;
                });
              }
              
              const summary = calculateSummary(filteredTransactions);
              
              return (
                <>
                  <div className="p-3 rounded border border-gray-200 bg-white">
                    <p className="text-xs text-gray-600">Jumlah Transaksi</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {filteredTransactions.length}
                    </p>
                  </div>
                  <div className="p-3 rounded border border-gray-200 bg-white">
                    <p className="text-xs text-gray-600">Total Pemasukan</p>
                    <p className="text-lg font-semibold text-green-600">
                      {formatCurrency(summary.income)}
                    </p>
                  </div>
                  <div className="p-3 rounded border border-gray-200 bg-white">
                    <p className="text-xs text-gray-600">Total Pengeluaran</p>
                    <p className="text-lg font-semibold text-red-600">
                      {formatCurrency(summary.expense)}
                    </p>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
        
        {/* Export Buttons */}
        <div className="flex flex-wrap gap-3">
          <Button 
            onClick={() => generatePDF(false)}
            className="bg-primary-600 text-white flex items-center"
            disabled={isExporting}
          >
            <FiDownload className="mr-2" />
            {isExporting ? 'Memproses...' : 'Unduh PDF'}
          </Button>
          <Button 
            onClick={() => generatePDF(true)}
            className="bg-gray-100 text-gray-800 border border-gray-300 flex items-center"
            disabled={isExporting}
          >
            <FiEye className="mr-2" />
            {isExporting ? 'Memproses...' : 'Preview PDF'}
          </Button>
        </div>
      </div>
      
      {/* PDF Preview Modal */}
      <Modal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        title="Preview PDF"
      >
        <div className="h-[70vh]">
          <iframe 
            src={pdfDataUrl} 
            className="w-full h-full border" 
            title="PDF Preview"
          />
        </div>
        <div className="mt-4 flex justify-end gap-3">
          <Button 
            onClick={() => setIsPreviewOpen(false)}
            className="bg-gray-200 text-gray-800"
          >
            Tutup
          </Button>
          <Button 
            onClick={() => {
              generatePDF(false);
              setIsPreviewOpen(false);
            }}
            className="bg-primary-600 text-white"
          >
            Unduh PDF
          </Button>
        </div>
      </Modal>
    </Card>
  );
};

export default TransactionPDFExporter;