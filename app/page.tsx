"use client";
import axios from 'axios';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';


const CekProduksi = () => {
  const [productionName, setProductionName] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleCheck = async (e: any) => {
    e.preventDefault();
    if (!productionName) return alert("Silahkan masukkan kode produksi");

    setLoading(true);

    try {
      // Menggunakan Axios GET dengan params
      const response = await axios.get('/api/cek_kartu_produksi', {
        params: {
          production_name: productionName
        }
      });

      // Axios otomatis memparsing JSON, jadi kita langsung akses .data
      if (response.data.success) {
        router.push(`/hasilkartu?production_name=${encodeURIComponent(productionName)}`);
      } else {
        alert(response.data.message || "Kode produksi tidak ditemukan");
      }
    } catch (error: any) {
      console.error("Error fetching data:", error);
      // Error handling axios sedikit berbeda (error.response)
      const errorMsg = error.response?.data?.message || "Terjadi kesalahan pada server";
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-[calc(100vh-70px)] flex items-center justify-center p-2 gap-2 bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-lg border border-gray-100">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Cek Kartu Produksi</h2>

        <form onSubmit={handleCheck} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="production_name" className="text-sm font-medium text-gray-700">
              Kode Produksi
            </label>
            <input
              id="production_name"
              type="text"
              placeholder="Masukkan kode produksi"
              value={productionName}
              autoFocus
              autoComplete='off'
              onChange={(e) => setProductionName(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full p-3 text-white font-semibold rounded-lg transition-colors ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
              }`}
          >
            {loading ? 'MEMERIKSA...' : 'CEK'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CekProduksi;