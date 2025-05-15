import { format, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';

/**
 * Format tanggal ISO ke format tanggal Indonesia
 * @param {string} isoDate - Tanggal dalam format ISO
 * @param {string} formatStr - Format yang diinginkan (default: 'd MMMM yyyy')
 * @returns {string} Tanggal dalam format yang ditentukan
 */
export const formatDate = (isoDate, formatStr = 'd MMMM yyyy') => {
  if (!isoDate) return '-';
  try {
    const date = typeof isoDate === 'string' ? parseISO(isoDate) : isoDate;
    return format(date, formatStr, { locale: id });
  } catch (error) {
    console.error('Error formatting date:', error);
    return '-';
  }
};

/**
 * Format tanggal ISO ke format waktu Indonesia
 * @param {string} isoDate - Tanggal dalam format ISO
 * @returns {string} Tanggal dan waktu dalam format Indonesia
 */
export const formatDateTime = (isoDate) => {
  if (!isoDate) return '-';
  try {
    const date = typeof isoDate === 'string' ? parseISO(isoDate) : isoDate;
    return format(date, 'd MMMM yyyy, HH:mm', { locale: id });
  } catch (error) {
    console.error('Error formatting datetime:', error);
    return '-';
  }
};

/**
 * Format relatif, misal: "2 hari yang lalu"
 * @param {string} isoDate - Tanggal dalam format ISO
 * @returns {string} Format relatif
 */
export const formatRelative = (isoDate) => {
  if (!isoDate) return '-';
  
  try {
    const date = typeof isoDate === 'string' ? parseISO(isoDate) : isoDate;
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) {
      return 'baru saja';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} menit yang lalu`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} jam yang lalu`;
    } else if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} hari yang lalu`;
    } else {
      return formatDate(date);
    }
  } catch (error) {
    console.error('Error formatting relative date:', error);
    return '-';
  }
};