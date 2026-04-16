"use client";
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase'; 

export default function Home() {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [scores, setScores] = useState<Record<string, { score: any; total: number }>>({
    quiz: { score: '', total: 25 },
    lab: { score: '', total: 100 },
    assign: { score: '', total: 100 },
    atten: { score: '', total: 100 },
    exam: { score: '', total: 100 },
  });
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('student_grades')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setRecords(data || []);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const getPercent = (part: { score: any; total: number }) => (part.total > 0 ? (Number(part.score || 0) / part.total) * 100 : 0);

  const rawGrade = (
    (getPercent(scores.quiz) * 0.20) +
    (getPercent(scores.lab) * 0.30) +
    (getPercent(scores.assign) * 0.10) +
    (getPercent(scores.atten) * 0.10) +
    (getPercent(scores.exam) * 0.30)
  );

  const resetForm = () => {
    setName('');
    setEditingId(null);
    setScores({
      quiz: { score: '', total: 25 },
      lab: { score: '', total: 100 },
      assign: { score: '', total: 100 },
      atten: { score: '', total: 100 },
      exam: { score: '', total: 100 },
    });
  };

  const addStudent = async () => {
    if (!name.trim()) return alert("Enter Student Name");
    
    const payload = { 
      student_name: name, 
      quiz: getPercent(scores.quiz), 
      laboratory: getPercent(scores.lab), 
      assignment: getPercent(scores.assign), 
      attendance: getPercent(scores.atten), 
      major_exam: getPercent(scores.exam) 
    };

    const { error } = editingId 
      ? await supabase.from('student_grades').update(payload).eq('id', editingId)
      : await supabase.from('student_grades').insert([payload]);

    if (error) {
      alert("Error saving data.");
    } else {
      resetForm();
      fetchRecords();
    }
  };

  const handleEdit = (r: any) => {
    setEditingId(r.id);
    setName(r.student_name);
    setScores({
      quiz: { score: r.quiz, total: 100 },
      lab: { score: r.laboratory, total: 100 },
      assign: { score: r.assignment, total: 100 },
      atten: { score: r.attendance, total: 100 },
      exam: { score: r.major_exam, total: 100 },
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const deleteRecord = async (id: string) => {
    if (confirm("Delete this record permanently?")) {
      const { error } = await supabase.from('student_grades').delete().eq('id', id);
      if (!error) fetchRecords();
    }
  };

  return (
    <main className="min-h-screen bg-[#f8fafc] p-4 md:p-12 text-slate-900 selection:bg-blue-100">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER WITH LOGO */}
        <div className="relative mb-12 overflow-hidden bg-slate-900 rounded-[2rem] p-8 md:p-12 shadow-2xl shadow-blue-900/20 border-b-8 border-blue-600">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[100px] rounded-full -mr-20 -mt-20"></div>
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex flex-col md:flex-row items-center gap-6">
              {/* LOGO SECTION */}
              <div className="w-20 h-20 bg-white rounded-2xl p-2 shadow-lg flex items-center justify-center overflow-hidden border-2 border-blue-500">
                <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
              </div>
              
              <div className="text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                  <span className="h-2 w-2 bg-blue-500 rounded-full animate-pulse"></span>
                  <span className="text-blue-400 font-black text-[10px] tracking-[0.4em] uppercase">Academic Management System</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase leading-none">
                  BSIT <span className="text-blue-500">Portal</span>
                </h1>
                <p className="text-slate-400 font-bold mt-2 text-xs opacity-80">Passi City College • IT Department</p>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-[2rem] min-w-[240px] text-center shadow-inner">
              <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Live Calculation</p>
              <div className="flex items-center justify-center gap-2">
                <span className="text-6xl font-black text-white tracking-tighter">
                  {rawGrade.toFixed(1)}
                </span>
                <span className="text-2xl font-black text-blue-500 mt-4">%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* CONTROL PANEL */}
          <section className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-[2rem] p-8 border border-slate-200 shadow-xl shadow-slate-200/50">
              <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-8 flex items-center gap-2">
                <div className="p-1.5 bg-blue-50 rounded-lg">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4"></path></svg>
                </div>
                {editingId ? 'Updating Record' : 'Enrollment Engine'}
              </h2>

              <div className="space-y-6">
                <div className="group">
                  <label className="text-[10px] font-black text-slate-500 uppercase ml-2 mb-2 block">Student Identifier</label>
                  <input 
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-5 text-base font-bold text-slate-900 focus:border-blue-500 outline-none transition-all placeholder:text-slate-300 shadow-inner"
                    placeholder="Full Student Name" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-500 uppercase ml-2 block">Scoring Matrix</label>
                  {Object.keys(scores).map(k => (
                    <div key={k} className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100 hover:border-blue-200 transition-colors">
                      <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-[10px] font-black text-blue-600 uppercase border border-slate-100">
                        {k.substring(0,3)}
                      </div>
                      <div className="flex-1 flex items-center justify-end gap-2">
                        <input 
                          type="number" 
                          className="w-full text-right font-black text-xl text-slate-900 bg-transparent outline-none placeholder:text-slate-200" 
                          placeholder="--" 
                          value={scores[k].score}
                          onChange={(e) => setScores({...scores, [k]: {...scores[k], score: e.target.value}})} 
                        />
                        <span className="text-slate-300 font-bold text-xl">/</span>
                        <input 
                          type="number" 
                          className="w-16 text-center font-black text-xs text-blue-500 bg-blue-50 py-1 rounded-lg border border-blue-100 outline-none" 
                          value={scores[k].total}
                          onChange={(e) => setScores({...scores, [k]: {...scores[k], total: Number(e.target.value)}})} 
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col gap-3">
                  <button 
                    onClick={addStudent} 
                    className="w-full bg-slate-900 hover:bg-blue-600 text-white p-6 rounded-2xl font-black text-xs tracking-[0.2em] transition-all active:scale-95 shadow-xl shadow-blue-900/10 group flex items-center justify-center gap-3"
                  >
                    {editingId ? 'COMMIT CHANGES' : 'TRANSMIT TO CLOUD'}
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                  </button>
                  {editingId && (
                    <button onClick={resetForm} className="text-[10px] font-black text-red-500 uppercase tracking-widest hover:underline">Cancel Edit Session</button>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* CLOUD DATABASE SECTION */}
          <section className="lg:col-span-8">
            <div className="bg-white rounded-[2rem] border border-slate-200 shadow-xl overflow-hidden">
              <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-white">
                <h2 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"></path></svg>
                  Validated Cloud Records
                </h2>
                <span className="px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full font-black text-[10px]">
                  {records.length} TOTAL ENTRIES
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-100">
                    <tr>
                      <th className="p-8">Student</th>
                      <th className="p-6 text-center">Score Metrics</th>
                      <th className="p-6 text-center">Final Average</th>
                      <th className="p-8 text-right">Utility</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {records.map((r: any) => (
                      <tr key={r.id} className="hover:bg-blue-50/30 transition-all group">
                        <td className="p-8">
                          <p className="font-black text-slate-900 uppercase text-sm tracking-tight">{r.student_name}</p>
                          <span className="text-[10px] text-blue-500 font-bold tracking-tighter uppercase">Cloud_UUID: {r.id.substring(0,8)}</span>
                        </td>
                        <td className="p-6">
                          <div className="flex justify-center gap-1.5">
                            {[r.quiz, r.laboratory, r.assignment, r.attendance, r.major_exam].map((val, idx) => (
                              <div key={idx} className="w-10 h-10 bg-white border border-slate-100 rounded-lg flex flex-col items-center justify-center shadow-sm">
                                <span className="text-[8px] font-black text-slate-400 uppercase leading-none mb-1">
                                  {['Qz', 'Lb', 'As', 'At', 'Ex'][idx]}
                                </span>
                                <span className="text-[10px] font-black text-slate-900">{val?.toFixed(0)}</span>
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="p-6 text-center">
                          <div className="inline-flex items-center justify-center bg-blue-600 px-6 py-2 rounded-xl shadow-lg shadow-blue-200">
                            <span className="font-black text-white text-sm">
                              {(r.final_grade || 0).toFixed(1)}%
                            </span>
                          </div>
                        </td>
                        <td className="p-8 text-right">
                          <div className="flex justify-end gap-2">
                             {/* EDIT BUTTON */}
                             <button 
                              onClick={() => handleEdit(r)} 
                              className="p-3 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                            </button>
                            {/* DELETE BUTTON */}
                            <button 
                              onClick={() => deleteRecord(r.id)} 
                              className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {loading && (
                  <div className="p-20 text-center animate-pulse">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Syncing Student Records...</p>
                  </div>
                )}
              </div>
            </div>
          </section>

        </div>
      </div>
    </main>
  );
}