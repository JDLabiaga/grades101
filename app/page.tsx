"use client";
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase'; 

export default function Home() {
  const [name, setName] = useState('');
  const [scores, setScores] = useState({
    quiz: { score: 0, total: 100 },
    lab: { score: 0, total: 100 },
    assign: { score: 0, total: 100 },
    atten: { score: 0, total: 100 },
    exam: { score: 0, total: 100 },
  });
  const [records, setRecords] = useState([]);
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

  const getPercent = (part) => (part.total > 0 ? (part.score / part.total) * 100 : 0);

  // Weights: Quiz 20%, Lab 30%, Assign 10%, Atten 10%, Exam 30%
  const rawGrade = (
    (getPercent(scores.quiz) * 0.20) +
    (getPercent(scores.lab) * 0.30) +
    (getPercent(scores.assign) * 0.10) +
    (getPercent(scores.atten) * 0.10) +
    (getPercent(scores.exam) * 0.30)
  );

  const addStudent = async () => {
    if (!name.trim()) return alert("Enter Student Name");
    
    const { error } = await supabase.from('student_grades').insert([{ 
      student_name: name, 
      quiz: getPercent(scores.quiz), 
      laboratory: getPercent(scores.lab), 
      assignment: getPercent(scores.assign), 
      attendance: getPercent(scores.atten), 
      major_exam: getPercent(scores.exam) 
    }]);

    if (error) {
      alert("Error saving to Supabase. Check your table columns.");
    } else {
      setName('');
      fetchRecords();
    }
  };

  const deleteRecord = async (id: string) => {
    if (confirm("Delete this record?")) {
      const { error } = await supabase.from('student_grades').delete().eq('id', id);
      if (!error) fetchRecords();
    }
  };

  return (
    <main className="p-4 md:p-10 bg-slate-50 min-h-screen text-slate-900">
      <div className="max-w-6xl mx-auto bg-white shadow-xl rounded-3xl overflow-hidden border border-slate-200">
        
        {/* Header Section */}
        <div className="p-8 bg-slate-900 text-white flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <h1 className="text-3xl font-black tracking-tight uppercase">Midterm Grade Portal</h1>
            <p className="text-blue-400 text-xs font-bold tracking-widest uppercase mt-1">Passi City College • IT Dept</p>
          </div>
          <div className="bg-blue-600 px-8 py-4 rounded-2xl text-center shadow-lg border border-blue-400">
            <span className="block text-[10px] font-black text-blue-100 uppercase mb-1">Calculated Grade</span>
            <span className="text-5xl font-black">{rawGrade.toFixed(1)}</span>
          </div>
        </div>

        {/* Input Interface */}
        <div className="p-8 border-b bg-slate-50/50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="md:col-span-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block">Student Identity</label>
              <input 
                className="w-full p-4 bg-white border-2 border-slate-200 rounded-xl font-bold focus:border-blue-500 outline-none transition-all"
                placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <button onClick={addStudent} className="w-full bg-slate-900 text-white p-4 rounded-xl font-black hover:bg-blue-700 transition-all active:scale-95 shadow-md">
                SAVE TO CLOUD
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {Object.keys(scores).map(k => (
              <div key={k} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <label className="block text-[10px] font-black text-slate-500 uppercase mb-2">{k}</label>
                <div className="flex gap-1 items-center bg-slate-50 p-1 rounded-lg border">
                  <input type="number" className="w-full text-center font-bold bg-transparent outline-none" placeholder="0" 
                    onChange={(e) => setScores({...scores, [k]: {...scores[k], score: Number(e.target.value)}})} 
                  />
                  <span className="text-slate-300">/</span>
                  <input type="number" className="w-full text-center font-black text-blue-600 bg-transparent outline-none" placeholder="100" 
                    onChange={(e) => setScores({...scores, [k]: {...scores[k], total: Number(e.target.value)}})} 
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cloud Records Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-900 text-slate-400 text-[10px] font-black uppercase">
              <tr>
                <th className="p-6">Student</th>
                <th className="p-6 text-center">QZ(20%)</th>
                <th className="p-6 text-center">LB(30%)</th>
                <th className="p-6 text-center">AS(10%)</th>
                <th className="p-6 text-center">AT(10%)</th>
                <th className="p-6 text-center">EX(30%)</th>
                <th className="p-6 text-center">Final</th>
                <th className="p-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {records.map((r: any) => (
                <tr key={r.id} className="hover:bg-blue-50/50 transition-colors">
                  <td className="p-6 font-black text-slate-800 uppercase text-sm">{r.student_name}</td>
                  <td className="p-6 text-center font-bold text-slate-500">{r.quiz?.toFixed(1)}</td>
                  <td className="p-6 text-center font-bold text-slate-500">{r.laboratory?.toFixed(1)}</td>
                  <td className="p-6 text-center font-bold text-slate-500">{r.assignment?.toFixed(1)}</td>
                  <td className="p-6 text-center font-bold text-slate-500">{r.attendance?.toFixed(1)}</td>
                  <td className="p-6 text-center font-bold text-slate-500">{r.major_exam?.toFixed(1)}</td>
                  <td className="p-6 text-center">
                    <span className="bg-slate-900 text-white px-3 py-1 rounded-md font-black text-xs">
                      {(r.final_grade || 0).toFixed(1)}
                    </span>
                  </td>
                  <td className="p-6 text-right">
                    <button onClick={() => deleteRecord(r.id)} className="text-red-400 hover:text-red-600">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {loading && (
            <div className="p-10 text-center animate-pulse text-slate-400 font-black text-xs uppercase tracking-widest">
              Syncing Cloud Data...
            </div>
          )}
        </div>
      </div>
    </main>
  );
}