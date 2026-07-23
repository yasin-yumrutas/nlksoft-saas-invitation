"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface VisualSeatMapProps {
  tenantId: string;
  onSeatSelect: (tableId: string, seatNumber: number) => void;
}

export default function VisualSeatMap({ tenantId, onSeatSelect }: VisualSeatMapProps) {
  const [tables, setTables] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSeat, setSelectedSeat] = useState<{ tableId: string; seatNumber: number } | null>(null);

  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      // Fetch Tables
      const { data: tablesData } = await supabase
        .from("tables")
        .select("*")
        .eq("tenant_id", tenantId);

      // Fetch Assignments
      const { data: assignmentsData } = await supabase
        .from("table_assignments")
        .select("table_id, seat_number")
        .eq("tenant_id", tenantId);

      if (tablesData) setTables(tablesData);
      if (assignmentsData) setAssignments(assignmentsData);
      setLoading(false);
    };

    fetchData();
  }, [tenantId, supabase]);

  if (loading) {
    return <div className="text-center text-gold py-8">Koltuk planı yükleniyor...</div>;
  }

  const isSeatTaken = (tableId: string, seatNumber: number) => {
    return assignments.some((a) => a.table_id === tableId && a.seat_number === seatNumber);
  };

  const handleSeatClick = (tableId: string, seatNumber: number) => {
    if (isSeatTaken(tableId, seatNumber)) return;
    setSelectedSeat({ tableId, seatNumber });
    onSeatSelect(tableId, seatNumber);
  };

  return (
    <div className="w-full bg-black/40 border border-gold/20 rounded-2xl p-6 overflow-x-auto">
      <h3 className="font-serif text-2xl text-gold-dark text-center mb-6">Oturma Planı</h3>
      <p className="text-center text-sm text-foreground/60 mb-8">
        Lütfen oturmak istediğiniz sandalyeyi seçin. Gri koltuklar doludur.
      </p>

      <div className="flex flex-wrap justify-center gap-12 min-w-[600px]">
        {tables.map((table) => (
          <div key={table.id} className="relative flex flex-col items-center">
            <h4 className="text-gold mb-8 font-serif text-lg">{table.table_name}</h4>
            
            {/* The Table itself */}
            <div className="relative w-32 h-32 bg-gradient-to-br from-gold/20 to-gold-dark/20 rounded-full border border-gold/40 shadow-[0_0_15px_rgba(212,175,55,0.1)] flex items-center justify-center">
              <div className="w-24 h-24 bg-background rounded-full flex items-center justify-center opacity-50">
                <span className="text-gold text-xs">{table.capacity} Kişilik</span>
              </div>

              {/* 8 Seats arrayed around the table */}
              {[...Array(table.capacity || 8)].map((_, index) => {
                const seatNumber = index + 1;
                const taken = isSeatTaken(table.id, seatNumber);
                const isSelected = selectedSeat?.tableId === table.id && selectedSeat?.seatNumber === seatNumber;
                
                // Math to position seats in a circle
                const angle = (index / (table.capacity || 8)) * 360;
                const radius = 80; // Distance from center
                const x = Math.cos((angle - 90) * (Math.PI / 180)) * radius;
                const y = Math.sin((angle - 90) * (Math.PI / 180)) * radius;

                return (
                  <button
                    type="button"
                    key={seatNumber}
                    onClick={() => handleSeatClick(table.id, seatNumber)}
                    disabled={taken}
                    className={`absolute w-8 h-8 rounded-t-xl transition-all duration-300 transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center text-[10px] font-bold shadow-md
                      ${taken ? "bg-gray-600/50 border-gray-500 text-gray-400 cursor-not-allowed" : 
                        isSelected ? "bg-gold border-2 border-white text-black scale-125 z-10 shadow-[0_0_10px_rgba(212,175,55,1)]" : 
                        "bg-white/10 border border-gold/50 text-gold hover:bg-gold/40 hover:scale-110 cursor-pointer"}
                    `}
                    style={{
                      left: `calc(50% + ${x}px)`,
                      top: `calc(50% + ${y}px)`,
                      transform: `translate(-50%, -50%) rotate(${angle}deg)`, // Point the seat towards the table
                    }}
                    title={taken ? "Dolu" : `${seatNumber}. Koltuk`}
                  >
                    <span style={{ transform: `rotate(-${angle}deg)` }}>{seatNumber}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
