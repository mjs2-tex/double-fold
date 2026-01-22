import { Suspense } from "react";
import InspectAfqView from "./InspectAfqView"; // Pindahkan kodingan sebelumnya ke sini

export default function Page() {
  return (
    // Skeleton loading sederhana saat menunggu Suspense siap
    <Suspense fallback={
      <div className="w-full h-screen flex items-center justify-center bg-gray-50">
        <p className="text-slate-400 font-medium animate-pulse">Loading Search Params...</p>
      </div>
    }>
      <InspectAfqView />
    </Suspense>
  );
}