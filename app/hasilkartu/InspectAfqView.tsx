"use client";

import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation"; // Hook untuk ambil URL params
import { ChevronLeft, ChevronRight, Package, Calendar, Tag, Hash, Loader2, Search } from "lucide-react";

const InspectAfqView = () => {
    const searchParams = useSearchParams();
    const productionName = searchParams.get("production_name"); // Ambil 2026010907691

    const router = useRouter();
    const inputRef = useRef<HTMLInputElement>(null);
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [inputValue, setInputValue] = useState("");
    const itemsPerPage = 12;


    const handleFocus = () => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    };

    const handleCommand = (e: React.FormEvent) => {
        e.preventDefault();
        const command = inputValue.toUpperCase().trim();

        if (command === "EXIT") {
            router.push("/");
        }
        else if (command === "NEXT") {
            if (currentPage < totalPages) {
                setCurrentPage(prev => prev + 1);
            }
            setInputValue(""); // Bersihkan input agar siap perintah berikutnya
        }
        else if (command === "PREV") {
            if (currentPage > 1) {
                setCurrentPage(prev => prev - 1);
            }
            setInputValue("");
        }
        else {
            // Jika input bukan command navigasi, bisa dikosongkan atau diolah sebagai pencarian
            setInputValue("");
        }
    };


    // Fokus otomatis setiap kali halaman berubah
useEffect(() => {
  if (inputRef.current) {
    inputRef.current.focus();
  }
}, [currentPage]);
    // 1. Fetch Data berdasarkan production_name
    useEffect(() => {
        const fetchData = async () => {
            if (!productionName) {
                setError("Parameter production_name tidak ditemukan di URL");
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                // Panggil endpoint dengan query string
                const response = await axios.get(`/api/inspect-afq?production_name=${productionName}`);

                if (response.data.data) {
                    setData(response.data.data);
                } else {
                    setError("Data tidak ditemukan untuk nomor produksi ini.");
                }
            } catch (err: any) {
                setError(err.response?.data?.message || "Terjadi kesalahan saat mengambil data.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [productionName]);

    // 2. Logika Pagination
    const details = data?.details || [];
    const totalPages = Math.ceil(details.length / itemsPerPage);
    const currentDetails = details.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    if (loading) {
        return (
            <div className="w-full h-screen flex flex-col items-center justify-center bg-gray-50 text-slate-500">
                <Loader2 className="animate-spin mb-2" size={32} />
                <p className="text-sm font-medium">Sedang memproses data {productionName}...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-full h-screen flex items-center justify-center bg-gray-50 p-4">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-red-100 text-center">
                    <p className="text-red-500 font-bold mb-2">Error</p>
                    <p className="text-slate-600 text-sm">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-[calc(100vh-70px)] flex flex-col p-2 gap-2 bg-gray-50">

            {/* HEADER MASTER */}
            {/* HEADER MASTER - Diperkecil */}
            <div className="w-full h-fit bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col p-3">
                <div className="flex flex-col gap-2 mb-2 border-b pb-2 px-1">
                    {/* BARIS 1: Judul & Input Command */}
                    <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 shrink-0">
                            <Package className="text-blue-600" size={16} />
                            <h2 className="font-black text-slate-800 uppercase text-[11px] tracking-tighter whitespace-nowrap">
                                Hasil Kartu Inspect
                            </h2>
                        </div>

                        {/* Input Command dibuat lebih slim */}
                        <form onSubmit={handleCommand} className="relative flex-1 max-w-[120px]">
                            <input
                                ref={inputRef} // Hubungkan ref di sini
                                type="text"
                                placeholder="CMD..."
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                className="w-full bg-slate-100 border border-slate-200 rounded-md px-2 py-1 text-[10px] font-bold outline-none focus:bg-white focus:ring-1 focus:ring-blue-500 uppercase transition-all"
                                autoFocus
                            />
                            <Search className="absolute right-2 top-1.5 text-slate-300" size={10} />
                        </form>
                    </div>

                    {/* BARIS 2: Status Badges (OP & MO) */}
                    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                        {/* OP Badge - Dibuat lebih ringkas */}
                        <div className="flex items-center gap-1.5 bg-indigo-50 px-3 py-1 rounded-md border border-indigo-100 shrink-0">
                            <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse"></div>
                            <span className="text-[10px] font-black text-indigo-700 uppercase whitespace-nowrap">
                                OP: <span className="text-indigo-900">{data.name.split(' ')[0]}</span> {/* Hanya ambil nama depan */}
                            </span>
                        </div>

                        {/* MO Badge - Dibuat lebih ringkas */}
                        <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1 rounded-md border border-slate-200 shrink-0">
                            <span className="text-[10px] font-black text-slate-500 uppercase whitespace-nowrap">
                                MO: <span className="text-slate-900 font-mono">{productionName}</span>
                            </span>
                        </div>
                    </div>
                </div>

                {/* Grid lebih rapat: 4 kolom di layar sedang, 6 kolom di layar besar */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-x-3 gap-y-2">
                    <InfoItem label="Produk" value={data.nama_produk} icon={<Tag size={12} />} />
                    <InfoItem label="Batch" value={data.no_batch} icon={<Hash size={12} />} color="text-blue-700 font-black" />
                    <InfoItem label="OM" value={data.nama_om} />
                    <InfoItem label="Warna" value={data.nama_warna} />
                    <InfoItem label="Tgl Scan" value={data.date ? new Date(data.date).toLocaleDateString('id-ID') : '-'} icon={<Calendar size={12} />} />
                    <InfoItem label="Purpose" value={data.purpose} />
                    <InfoItem label="Finish" value={data.pick_finish} />
                    <InfoItem label="Roll" value={`${details.length} Pcs`} />
                </div>
            </div>

            {/* TABLE DETAIL */}
            <div className="w-full h-[calc(100%-280px)] bg-white rounded-lg shadow-md border border-gray-200 flex flex-col overflow-hidden">
                <div className="flex-1 overflow-auto">
                    <table className="w-full text-left text-[13px] border-collapse table-fixed">
                        <thead className="sticky top-0 bg-slate-900 text-white z-10">
                            <tr>
                                <th className="p-3 w-[50px]">ROLL</th>
                                <th className="p-3 w-[80px]">QTY</th>
                                <th className="p-3 w-[80px]">GRADE</th>
                                <th className="p-3 w-full">KETERANGAN</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {currentDetails.map((item: any, idx: number) => (
                                <tr key={idx} className="hover:bg-blue-50/30 transition-colors">
                                    <td className="p-3 font-mono font-bold text-slate-700 uppercase tracking-tighter">
                                        {item.no_piece}
                                    </td>
                                    <td className="p-3 text-right font-black text-blue-600">
                                        {Number(item.quantity).toLocaleString('id-ID')}
                                    </td>
                                    <td className="p-3 text-center">
                                        <span className={`px-3 py-1 rounded text-[11px] font-black ${item.grade_id === 'A' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                                            }`}>
                                            {item.nama_grade}
                                        </span>
                                    </td>
                                    <td className="p-3 text-slate-600 font-medium">
                                        {item.keterangan}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* PAGINATION */}
                <div className="h-14 border-t bg-slate-50 flex items-center justify-between px-6">
                    <p className="text-[11px] font-bold text-slate-400 uppercase">
                        Showing {indexOfFirstItem(currentPage, itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, details.length)} dari {details.length} Piece
                    </p>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => {
                                setCurrentPage(p => Math.max(1, p - 1));
                                handleFocus(); // Kembalikan fokus setelah klik
                            }}
                            disabled={currentPage === 1}
                            className="px-3 py-1.5 rounded-md border bg-white shadow-sm hover:bg-gray-100 disabled:opacity-30"
                        >
                            <ChevronLeft size={18} />
                        </button>

                        <div className="flex items-center gap-1">
                            <span className="text-sm font-black text-blue-600">{currentPage}</span>
                            <span className="text-sm font-medium text-slate-400">/ {totalPages}</span>
                        </div>

                        <button
                            onClick={() => {
                                setCurrentPage(p => Math.min(totalPages, p + 1));
                                handleFocus(); // Kembalikan fokus setelah klik
                            }}
                            disabled={currentPage === totalPages}
                            className="px-3 py-1.5 rounded-md border bg-white shadow-sm hover:bg-gray-100 disabled:opacity-30"
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const indexOfFirstItem = (page: number, perPage: number) => (page - 1) * perPage;

const InfoItem = ({ label, value, icon, color = "text-slate-800 font-bold" }: any) => (
    <div className="flex items-center gap-3 px-3 py-2 bg-slate-50/50 rounded-md border border-slate-100/50">
        {/* Label & Icon */}
        <div className="flex items-center gap-2 min-w-[100px] shrink-0 border-r border-slate-200">
            <span className="text-blue-500">{icon}</span>
            <span className="text-[11px] uppercase font-black text-slate-400 tracking-wider">
                {label}
            </span>
        </div>

        {/* Value - Dibuat lebih besar dan tegas */}
        <span className={`text-[14px] ${color} truncate leading-none`}>
            {value || "-"}
        </span>
    </div>
);


export default InspectAfqView;