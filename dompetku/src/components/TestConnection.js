import React, { useState, useEffect } from 'react';
import api from '../services/api';

function TestConnection() {
  const [status, setStatus] = useState('Menunggu...');
  const [error, setError] = useState(null);

  useEffect(() => {
    // Tes koneksi ke API
    const testConnection = async () => {
      try {
        const response = await api.get('/test');
        setStatus('Terhubung: ' + response.data.message);
      } catch (err) {
        setError('Gagal terhubung: ' + err.message);
      }
    };

    testConnection();
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold">Status Koneksi API</h2>
      {error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <p className="text-green-500">{status}</p>
      )}
    </div>
  );
}

export default TestConnection;