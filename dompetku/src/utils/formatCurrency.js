/**
 * Format nilai ke format mata uang Indonesia (Rupiah)
 * @param {number} amount - Jumlah uang
 * @returns {string} Format mata uang
 */
export const formatCurrency = (amount) => {
  const formatter = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  });
  
  return formatter.format(amount);
};

/**
 * Format nilai ke format mata uang tanpa simbol
 * @param {number} amount - Jumlah uang
 * @returns {string} Format angka dengan separator
 */
export const formatNumber = (amount) => {
  const formatter = new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: 0,
  });
  
  return formatter.format(amount);
};