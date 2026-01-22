import React from 'react'

const InfoItem = ({ label, value, icon, color = "text-slate-700 font-semibold" }: any) => (
  <div className="flex flex-col min-w-0">
    <span className="text-[9px] uppercase font-bold text-slate-400 tracking-tight flex items-center gap-1 mb-0.5">
      {icon} {label}
    </span>
    <span className={`text-[11px] ${color} truncate leading-tight`}>
      {value || "-"}
    </span>
  </div>
);

export default InfoItem