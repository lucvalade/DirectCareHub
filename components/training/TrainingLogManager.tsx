"use client";

import { useState } from "react";
import { logTrainingSession, acknowledgeTraining } from "@/app/actions/training";
import { TrainingLogEntry } from "@/types/training";
import { useAuth } from "@/context/AuthContext";
import { 
  ShieldAlert, 
  Award, 
  Plus, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Loader2, 
  FileCheck, 
  PenTool,
  Clock
} from "lucide-react";

interface TrainingLogManagerProps {
  employerId: string;
  attendants: { id: string; name: string }[];
  existingLogs: TrainingLogEntry[];
}

export default function TrainingLogManager({ employerId, attendants, existingLogs }: TrainingLogManagerProps) {
  const { userProfile, user } = useAuth();
  const currentUserId = user?.uid || "";
  const role = userProfile?.role || "employer";
  const isEmployer = role === "employer" || role === "bookkeeper";

  const [logs, setLogs] = useState<TrainingLogEntry[]>(existingLogs);
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    const form = new FormData(e.currentTarget);
    form.append("employerId", employerId);

    const selectedAtt = attendants.find(a => a.id === form.get("attendantId"));
    form.append("attendantName", selectedAtt?.name || "Attendant");

    const res = await logTrainingSession(form);
    setIsSubmitting(false);

    if (res.success && res.logId) {
      setMessage({
        type: "success",
        text: "Successfully registered and signed training session! Awaiting attendant bilateral acknowledgment.",
      });
      setShowModal(false);
      
      // Update local logs list immediately for a highly interactive experience
      const newEntry: TrainingLogEntry = {
        id: res.logId,
        employer_id: employerId,
        attendant_id: form.get("attendantId") as string,
        attendant_name: selectedAtt?.name || "Attendant",
        category: form.get("category") as any,
        skill_title: form.get("skillTitle") as string,
        equipment_model: (form.get("equipmentModel") as string) || undefined,
        training_date: form.get("trainingDate") as string,
        notes: (form.get("notes") as string) || "",
        employer_signed_at: new Date().toISOString(),
        attendant_acknowledged: false,
        expiry_or_renewal_date: (form.get("renewalDate") as string) || undefined,
      };
      setLogs([newEntry, ...logs]);
    } else {
      setMessage({
        type: "error",
        text: res.error || "Failed to log training session.",
      });
    }
  };

  const handleAcknowledge = async (logId: string, attendantId: string) => {
    setIsProcessing(logId);
    setMessage(null);

    const res = await acknowledgeTraining(logId, attendantId);
    setIsProcessing(null);

    if (res.success) {
      setMessage({
        type: "success",
        text: "Bilateral competency signature appended successfully. This record is now locked and legally audited.",
      });
      // Update local state
      setLogs(logs.map(log => 
        log.id === logId 
          ? { ...log, attendant_acknowledged: true, attendant_acknowledged_at: new Date().toISOString() } 
          : log
      ));
    } else {
      setMessage({
        type: "error",
        text: res.error || "Failed to sign acknowledgment.",
      });
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-xs space-y-6">
      
      {/* Header Register */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-100">
        <div className="space-y-1">
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Award className="text-emerald-600 h-6 w-6" />
            WSIB Training & Liability Register
          </h2>
          <p className="text-slate-500 text-xs font-semibold">
            Maintain official, bilateral proof of attendant competency for mechanical lifts and care transfers.
          </p>
        </div>
        {isEmployer && (
          <button
            onClick={() => setShowModal(true)}
            className="min-h-[44px] px-4 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer shadow-xs"
          >
            <Plus className="h-4 w-4" /> Log Training Session
          </button>
        )}
      </div>

      {/* Message Notifications */}
      {message && (
        <div className={`p-4 rounded-xl border text-xs font-bold flex items-center justify-between ${
          message.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'
        }`}>
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)} className="p-1 hover:bg-black/5 rounded cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Liability Warning Callout */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3 text-amber-900 text-xs leading-relaxed">
        <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <strong>🛡️ Ontario WSIB & Ministry of Labour Proof-of-Safety:</strong> As a self-directed manager, you hold personal legal liability for worker safety. Recording training sessions provides critical liability protection if an attendant claims a back strain or lift injury during transfers.
        </div>
      </div>

      {/* Training Table / Register */}
      <div className="divide-y divide-slate-100">
        {logs.map((log) => {
          const isOwnPendingAck = !log.attendant_acknowledged && currentUserId && (log.attendant_id === currentUserId || role === 'attendant');
          
          return (
            <div key={log.id} className="py-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="space-y-1.5 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-extrabold text-slate-900 text-sm">{log.skill_title}</span>
                  {log.equipment_model && (
                    <span className="bg-emerald-50 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-md border border-emerald-200 uppercase">
                      {log.equipment_model}
                    </span>
                  )}
                  <span className="bg-slate-100 text-slate-600 text-[9px] font-bold px-2 py-0.5 rounded-md uppercase">
                    {log.category.replace('_', ' ')}
                  </span>
                </div>
                
                <p className="text-xs text-slate-500 font-semibold">
                  Trained Worker: <strong className="text-slate-800 font-extrabold">{log.attendant_name}</strong> • Completed on <strong className="text-slate-700">{log.training_date}</strong>
                </p>
                
                {log.notes && <p className="text-xs text-slate-500 leading-relaxed italic bg-slate-50 p-2.5 rounded-xl">"{log.notes}"</p>}
                
                {log.expiry_or_renewal_date && (
                  <p className="text-[10px] text-rose-700 font-bold flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    Annual Refresher Suggested: {log.expiry_or_renewal_date}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3 shrink-0">
                {log.attendant_acknowledged ? (
                  <span className="flex items-center gap-1 text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-full text-[11px] font-bold border border-emerald-200">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Bilated Acknowledged
                  </span>
                ) : isOwnPendingAck ? (
                  <button
                    onClick={() => handleAcknowledge(log.id, log.attendant_id)}
                    disabled={isProcessing === log.id}
                    className="min-h-[38px] px-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    {isProcessing === log.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <PenTool className="w-3.5 h-3.5" />
                    )}
                    <span>Sign to Verify Competency</span>
                  </button>
                ) : (
                  <span className="flex items-center gap-1 text-amber-700 bg-amber-50 px-3 py-1.5 rounded-full text-[11px] font-bold border border-amber-200">
                    <AlertCircle className="h-4 w-4 text-amber-600" /> Employer Signed Only
                  </span>
                )}
              </div>
            </div>
          );
        })}

        {logs.length === 0 && (
          <div className="py-12 text-center text-slate-400 text-xs font-semibold leading-relaxed">
            No training sessions logged yet.<br />Tap "Log Training Session" to register attendant competency.
          </div>
        )}
      </div>

      {/* Modal Dialog */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-xl border border-slate-200 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-emerald-600" />
                <span>Record Attendant Competency</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-full hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-bold">
              <div>
                <label className="block text-slate-500 mb-1">Attendant Name</label>
                <select name="attendantId" required className="w-full min-h-[44px] px-3 bg-white border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-emerald-600">
                  {attendants.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-slate-500 mb-1">Category</label>
                <select name="category" required className="w-full min-h-[44px] px-3 bg-white border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-emerald-600">
                  <option value="mechanical_lift">Mechanical Ceiling/Floor Lift</option>
                  <option value="transfer_technique">Manual / Slide Sheet Transfer</option>
                  <option value="bowel_bladder_care">Bowel & Bladder Routines</option>
                  <option value="infection_control">Hygiene & PPE</option>
                  <option value="emergency_fire_safety">Emergency & Evacuation</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-500 mb-1">Skill / Protocol Title</label>
                <input name="skillTitle" required placeholder="e.g., Arjo Maxi Sky & Loop Setup" className="w-full min-h-[44px] px-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-emerald-600" />
              </div>

              <div>
                <label className="block text-slate-500 mb-1">Equipment Model (Optional)</label>
                <input name="equipmentModel" placeholder="e.g., Arjo 4-point spreader bar / Green Loop" className="w-full min-h-[44px] px-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-emerald-600" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 mb-1">Training Date</label>
                  <input name="trainingDate" type="date" required className="w-full min-h-[44px] px-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-emerald-600" />
                </div>
                <div>
                  <label className="block text-slate-500 mb-1">Renewal Date</label>
                  <input name="renewalDate" type="date" className="w-full min-h-[44px] px-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-emerald-600" />
                </div>
              </div>

              <div>
                <label className="block text-slate-500 mb-1">Training Observations & Notes</label>
                <textarea name="notes" rows={2} placeholder="Attendant demonstrated 3 successful independent transfers..." className="w-full p-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-emerald-600" />
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 min-h-[44px] border border-slate-300 rounded-xl text-slate-700 font-bold hover:bg-slate-50 cursor-pointer">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className="flex-1 min-h-[44px] bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold transition flex items-center justify-center gap-1 cursor-pointer">
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Signing...</span>
                    </>
                  ) : (
                    <span>Sign & Lock Record</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
