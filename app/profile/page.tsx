"use client";

import React, { useState, useEffect } from "react";
import NavigationHeader from "@/components/NavigationHeader";
import { useAuth } from "@/context/AuthContext";
import { Settings, User, Phone, ShieldCheck, Mail, FileText, Edit2, CheckCircle2, Loader2, Save, X } from "lucide-react";
import AudioAlertSettings from "@/components/settings/AudioAlertSettings";

export default function ProfilePage() {
  const { userProfile, loginAsDemoUser } = useAuth();

  // Local state for editable settings
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [ilCentre, setIlCentre] = useState("Centre for Independent Living in Toronto (CILT)");
  const [approvedHours, setApprovedHours] = useState("180.0");
  const [emergencyContact, setEmergencyContact] = useState("");

  // Populate form with current auth context values
  useEffect(() => {
    if (userProfile) {
      setDisplayName(userProfile.displayName || "Direct Funding Employer");
      setEmail(userProfile.email || "luc.valade@directfunding.ca");
      setPhone(userProfile.phone || "416-555-0192");
      setEmergencyContact(userProfile.emergencyContact || "Sarah Miller (Sister) - 416-555-0199");
      
      // Load custom overrides from localStorage if present
      const savedEmail = localStorage.getItem(`profile_email_${userProfile.uid}`);
      const savedPhone = localStorage.getItem(`profile_phone_${userProfile.uid}`);
      const savedHours = localStorage.getItem(`profile_hours_${userProfile.uid}`);
      const savedEmergency = localStorage.getItem(`profile_emergency_${userProfile.uid}`);
      const savedIlCentre = localStorage.getItem(`profile_ilcentre_${userProfile.uid}`);
      
      if (savedEmail) setEmail(savedEmail);
      if (savedPhone) setPhone(savedPhone);
      if (savedHours) setApprovedHours(savedHours);
      if (savedEmergency) setEmergencyContact(savedEmergency);
      if (savedIlCentre) setIlCentre(savedIlCentre);
    }
  }, [userProfile]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile) return;

    setIsSaving(true);
    setSaveSuccess(false);

    // Simulate database write with 800ms lag
    setTimeout(() => {
      localStorage.setItem(`profile_email_${userProfile.uid}`, email);
      localStorage.setItem(`profile_phone_${userProfile.uid}`, phone);
      localStorage.setItem(`profile_hours_${userProfile.uid}`, approvedHours);
      localStorage.setItem(`profile_emergency_${userProfile.uid}`, emergencyContact);
      localStorage.setItem(`profile_ilcentre_${userProfile.uid}`, ilCentre);

      // Mutate local session state for seamless real-time visual alignment
      userProfile.email = email;
      userProfile.phone = phone;
      userProfile.emergencyContact = emergencyContact;

      setIsSaving(false);
      setIsEditing(false);
      setSaveSuccess(true);

      // Auto dismiss success alert
      setTimeout(() => {
        setSaveSuccess(false);
      }, 4000);
    }, 800);
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reload original states
    if (userProfile) {
      setEmail(userProfile.email || "luc.valade@directfunding.ca");
      setPhone(userProfile.phone || "416-555-0192");
      setEmergencyContact(userProfile.emergencyContact || "Sarah Miller (Sister) - 416-555-0199");
      
      const savedEmail = localStorage.getItem(`profile_email_${userProfile.uid}`);
      const savedPhone = localStorage.getItem(`profile_phone_${userProfile.uid}`);
      const savedHours = localStorage.getItem(`profile_hours_${userProfile.uid}`);
      const savedEmergency = localStorage.getItem(`profile_emergency_${userProfile.uid}`);
      const savedIlCentre = localStorage.getItem(`profile_ilcentre_${userProfile.uid}`);

      if (savedEmail) setEmail(savedEmail);
      if (savedPhone) setPhone(savedPhone);
      if (savedHours) setApprovedHours(savedHours);
      if (savedEmergency) setEmergencyContact(savedEmergency);
      if (savedIlCentre) setIlCentre(savedIlCentre);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <NavigationHeader />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-8 space-y-6">
        
        {/* Top title */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-slate-700 text-white rounded-2xl shadow-sm">
              <Settings className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Household & Profile Settings</h1>
              <p className="text-xs font-medium text-slate-500">
                Direct Funding Program participant agreement details and contact parameters
              </p>
            </div>
          </div>

          {!isEditing && (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black rounded-xl shadow-sm flex items-center gap-2 cursor-pointer transition-transform hover:scale-[1.02]"
            >
              <Edit2 className="w-4 h-4" />
              <span>Edit Profile</span>
            </button>
          )}
        </div>

        {/* Success Alert */}
        {saveSuccess && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center gap-3 animate-in fade-in duration-200 text-xs font-bold shadow-xs">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>Profile and Direct Funding program specifications successfully saved to database.</span>
          </div>
        )}

        {/* Card Main Block */}
        <form onSubmit={handleSave} className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-xs space-y-6">
          
          <div className="flex items-center space-x-4 border-b pb-6 justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-2xl bg-blue-100 text-blue-800 flex items-center justify-center font-black text-xl shrink-0">
                {displayName.charAt(0)}
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-900 leading-tight">{displayName}</h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-100 text-blue-800 inline-block mt-1">
                  {userProfile?.role === "employer" ? "Self-Manager (Employer)" : userProfile?.role}
                </span>
              </div>
            </div>

            {isEditing && (
              <span className="bg-amber-50 text-amber-800 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border border-amber-200">
                Editing Mode
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            
            {/* Email Field */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col space-y-1.5">
              <label htmlFor="profile-email" className="font-extrabold text-slate-400 uppercase text-[10px] tracking-wider">
                Email Address
              </label>
              {isEditing ? (
                <input
                  id="profile-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full min-h-[40px] px-3 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              ) : (
                <p className="font-bold text-slate-900 py-1">{email}</p>
              )}
            </div>

            {/* Phone Field */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col space-y-1.5">
              <label htmlFor="profile-phone" className="font-extrabold text-slate-400 uppercase text-[10px] tracking-wider">
                Phone Number
              </label>
              {isEditing ? (
                <input
                  id="profile-phone"
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full min-h-[40px] px-3 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              ) : (
                <p className="font-bold text-slate-900 py-1">{phone}</p>
              )}
            </div>

            {/* IL Centre */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col space-y-1.5">
              <label htmlFor="profile-il" className="font-extrabold text-slate-400 uppercase text-[10px] tracking-wider">
                Direct Funding IL Resource Centre
              </label>
              {isEditing ? (
                <input
                  id="profile-il"
                  type="text"
                  required
                  value={ilCentre}
                  onChange={(e) => setIlCentre(e.target.value)}
                  className="w-full min-h-[40px] px-3 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              ) : (
                <p className="font-bold text-slate-900 py-1">{ilCentre}</p>
              )}
            </div>

            {/* Approved hours */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col space-y-1.5">
              <label htmlFor="profile-hours" className="font-extrabold text-slate-400 uppercase text-[10px] tracking-wider">
                Approved Monthly Hours
              </label>
              {isEditing ? (
                <input
                  id="profile-hours"
                  type="text"
                  required
                  value={approvedHours}
                  onChange={(e) => setApprovedHours(e.target.value)}
                  className="w-full min-h-[40px] px-3 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              ) : (
                <p className="font-bold text-slate-900 py-1">{approvedHours} Hours / Month</p>
              )}
            </div>

          </div>

          {/* Emergency Attendant Contact Block */}
          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 flex flex-col space-y-1.5">
            <label htmlFor="profile-emergency" className="font-extrabold text-amber-800 text-xs flex items-center gap-1.5">
              <Phone className="w-4 h-4 text-amber-600 shrink-0" />
              Emergency Attendant / Backup Contact:
            </label>
            {isEditing ? (
              <input
                id="profile-emergency"
                type="text"
                required
                value={emergencyContact}
                onChange={(e) => setEmergencyContact(e.target.value)}
                className="w-full min-h-[44px] px-3.5 bg-white border border-amber-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 mt-1"
                placeholder="Name (Relationship) - Phone Number"
              />
            ) : (
              <p className="text-slate-800 font-bold pl-1 text-xs">{emergencyContact}</p>
            )}
          </div>

          {/* Edit actions footer */}
          {isEditing && (
            <div className="flex items-center gap-3 pt-4 border-t border-slate-100 justify-end">
              <button
                type="button"
                onClick={handleCancel}
                className="min-h-[48px] px-5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                <X className="w-4 h-4" /> Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="min-h-[48px] px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black transition flex items-center gap-1.5 cursor-pointer shadow-md disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Saving Changes...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" /> Save Profile Details
                  </>
                )}
              </button>
            </div>
          )}

        </form>

        <AudioAlertSettings />
      </main>
    </div>
  );
}
