"use client";

import { use, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Plus, Trash2, Users } from "lucide-react";

type TableData = {
  id: string;
  table_name: string;
  capacity: number;
};

type AssignmentData = {
  table_id: string;
  seat_number: number;
  guests: {
    id: string;
    full_name: string;
  }
};

export default function TablesAdminPage({ params }: { params: Promise<{ locale: string, tenantSlug: string }> }) {
  const resolvedParams = use(params);
  const tenantSlug = resolvedParams.tenantSlug;
  const supabase = createClient();
  
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [tables, setTables] = useState<TableData[]>([]);
  const [assignments, setAssignments] = useState<AssignmentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTableName, setNewTableName] = useState("");

  useEffect(() => {
    fetchData();
  }, [tenantSlug]);

  const fetchData = async () => {
    setLoading(true);
    
    // Get tenant
    const { data: tenant } = await supabase.from('tenants').select('id').eq('slug', tenantSlug).single();
    if (!tenant) return;
    setTenantId(tenant.id);

    // Get tables
    const { data: tData } = await supabase.from('tables').select('*').eq('tenant_id', tenant.id).order('created_at');
    if (tData) setTables(tData);

    // Get assignments with guest names
    const { data: aData } = await supabase
      .from('table_assignments')
      .select('table_id, seat_number, guests(id, full_name)')
      .eq('tenant_id', tenant.id);
      
    if (aData) setAssignments(aData as any);
    
    setLoading(false);
  };

  const handleAddTable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTableName.trim() || !tenantId) return;

    await supabase.from('tables').insert({
      tenant_id: tenantId,
      table_name: newTableName.trim(),
      capacity: 8
    });

    setNewTableName("");
    fetchData();
  };

  const handleDeleteTable = async (id: string) => {
    if (!window.confirm("Bu masayı silmek istediğinizden emin misiniz? Masadaki misafirlerin koltukları iptal olacaktır.")) return;

    await supabase.from('tables').delete().eq('id', id);
    fetchData();
  };

  if (loading) return <div className="text-gold">Masalar yükleniyor...</div>;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-serif text-white">Masa Yönetimi</h1>
        <div className="flex items-center gap-2 text-white/50">
          <Users size={20} />
          <span>Toplam {tables.length} Masa</span>
        </div>
      </div>

      {/* Add New Table Form */}
      <form onSubmit={handleAddTable} className="bg-white/5 border border-white/10 rounded-2xl p-6 flex gap-4 items-end">
        <div className="flex-1 space-y-2">
          <label className="text-white/80 text-sm">Yeni Masa Adı</label>
          <input 
            type="text" 
            value={newTableName}
            onChange={(e) => setNewTableName(e.target.value)}
            placeholder="Örn: Aile Masası, Lise Arkadaşları..."
            className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-gold/50"
            required
          />
        </div>
        <button 
          type="submit"
          className="bg-gold hover:bg-gold-light text-black px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-colors"
        >
          <Plus size={20} />
          Ekle
        </button>
      </form>

      {/* Tables Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {tables.map(table => {
          const tableAssignments = assignments.filter(a => a.table_id === table.id);
          
          return (
            <div key={table.id} className="bg-black/40 border border-white/10 rounded-2xl p-6 relative">
              <button 
                onClick={() => handleDeleteTable(table.id)}
                className="absolute top-4 right-4 p-2 text-white/30 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-colors"
                title="Masayı Sil"
              >
                <Trash2 size={18} />
              </button>

              <h3 className="text-xl font-serif text-gold mb-2">{table.table_name}</h3>
              <p className="text-white/50 text-sm mb-6">{tableAssignments.length} / 8 Koltuk Dolu</p>

              <div className="space-y-3">
                {[1, 2, 3, 4, 5, 6, 7, 8].map(seatNum => {
                  const assignment = tableAssignments.find(a => a.seat_number === seatNum);
                  
                  return (
                    <div key={seatNum} className="flex items-center gap-3 bg-white/5 p-3 rounded-lg border border-white/5">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${assignment ? 'bg-gold/20 text-gold' : 'bg-white/10 text-white/30'}`}>
                        {seatNum}
                      </div>
                      <div className="flex-1 truncate">
                        {assignment ? (
                          <span className="text-white">{assignment.guests?.full_name}</span>
                        ) : (
                          <span className="text-white/30 italic">Boş</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
