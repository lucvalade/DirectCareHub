'use client';

import React, { useState } from 'react';
import NavigationHeader from '@/components/NavigationHeader';
import { 
  ShieldAlert, 
  HeartPulse, 
  HelpCircle, 
  CheckCircle2, 
  AlertOctagon, 
  ChevronRight, 
  Activity,
  Layers,
  ArrowRight
} from 'lucide-react';

interface ProtocolSection {
  id: string;
  title: string;
  category: 'transfer' | 'emergency' | 'respiratory' | 'skin_care';
  importance: 'critical' | 'standard';
  description: string;
  steps: string[];
  safetyCheckpoints: string[];
}

const CLINICAL_PROTOCOLS: ProtocolSection[] = [
  {
    id: 'p1',
    title: 'Hoyer Ceiling Track & Hydraulic Lift Transfer Protocol',
    category: 'transfer',
    importance: 'critical',
    description: 'Zero-lift transfer protocol between motorized tilt-in-space wheelchair and electric profiling bed.',
    steps: [
      'Inspect sling fabric, loop stitching, and spreader bar clips for wear before each use.',
      'Log roll client gently onto right side; position sling centered under thoracic spine to mid-thigh.',
      'Roll client back and smooth leg straps under each thigh without creases.',
      'Cross leg straps in midline and attach color-coded loops evenly to the 4-point spreader bar (Yellow on shoulders, Green on thighs).',
      'Raise hoist 2 inches off surface, pause, and verify all four sling hooks remain securely seated.',
      'Smoothly maneuver sling to target surface, gently guide client posture, and lower slowly.'
    ],
    safetyCheckpoints: [
      'NEVER unhook sling until client is completely stable and supported by target surface.',
      'Keep remote control cord untangled and out of wheel tracks.'
    ]
  },
  {
    id: 'p2',
    title: 'Autonomic Dysreflexia (AD) Emergency Recognition & Rapid Response',
    category: 'emergency',
    importance: 'critical',
    description: 'Life-threatening medical emergency affecting individuals with spinal cord injury at T6 or above.',
    steps: [
      'IMMEDIATELY sit the client upright at 90 degrees to lower intracranial blood pressure.',
      'Loosen all tight clothing, abdominal binders, thigh straps, and compression stockings.',
      'Check urinary catheter drainage bag and tubing for kinks, twists, overfilling, or blockages.',
      'If catheter is blocked, perform gentle flush or replace immediately under standing medical orders.',
      'Check for bowel impaction using lidocaine jelly if trained, or tight shoes pinching toes.',
      'Monitor blood pressure every 3-5 minutes. If systolic remains >150 mmHg or symptoms persist, call 911 immediately and state "Suspected Autonomic Dysreflexia".'
    ],
    safetyCheckpoints: [
      'Pounding headache, flushing above injury level, sweating, goosebumps, and bradycardia are warning signs.',
      'NEVER lie the client flat — this significantly increases stroke risk.'
    ]
  },
  {
    id: 'p3',
    title: 'Skin Integrity & Pressure Injury Prevention Protocol',
    category: 'skin_care',
    importance: 'critical',
    description: 'Stage 1-4 pressure injury mitigation, daily skin assessments, and pressure relief scheduling.',
    steps: [
      'Perform full 360-degree visual and tactile skin inspection during morning and evening transfers.',
      'Check key bony prominences: sacrum, coccyx, ischia, trochanters, heels, and scapulae.',
      'Perform wheelchair tilt-in-space pressure relief (minimum 35 degrees tilt for 2 minutes every 60 minutes).',
      'Apply non-greasy dimethicone skin barrier cream after cleansing; never massage red bony areas.',
      'Ensure Roho or gel cushion cells are calibrated and properly inflated with hand-check clearance of 1 inch.'
    ],
    safetyCheckpoints: [
      'Non-blanchable erythema (redness that does not turn white when touched) requires immediate offloading and logging.',
      'Report any breaks in skin immediately in the ambient handover audio log.'
    ]
  }
];

export default function ProtocolsDashboardPage() {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [acknowledged, setAcknowledged] = useState<Record<string, boolean>>({});

  const toggleAcknowledge = (id: string) => {
    setAcknowledged((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredProtocols = activeCategory === 'all' 
    ? CLINICAL_PROTOCOLS 
    : CLINICAL_PROTOCOLS.filter((p) => p.category === activeCategory);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <NavigationHeader />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-emerald-600 text-white rounded-2xl shadow-sm">
              <HeartPulse className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Clinical & Safety Protocols</h1>
              <p className="text-xs font-medium text-slate-500">
                Ontario Direct Funding safe patient handling, Hoyer transfers, and emergency life safety guidelines
              </p>
            </div>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-2">
          {['all', 'transfer', 'emergency', 'skin_care'].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition capitalize cursor-pointer ${
                activeCategory === cat
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              {cat.replace(/_/g, ' ')}
            </button>
          ))}
        </div>

        {/* Protocols List */}
        <div className="space-y-6">
          {filteredProtocols.map((protocol) => (
            <div
              key={protocol.id}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-100 text-rose-800">
                      {protocol.importance}
                    </span>
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      {protocol.category.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-slate-900">{protocol.title}</h3>
                  <p className="text-xs text-slate-600">{protocol.description}</p>
                </div>

                <button
                  type="button"
                  onClick={() => toggleAcknowledge(protocol.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition shrink-0 cursor-pointer ${
                    acknowledged[protocol.id]
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{acknowledged[protocol.id] ? 'Protocol Verified' : 'Acknowledge Protocol'}</span>
                </button>
              </div>

              {/* Step by Step list */}
              <div className="space-y-2">
                <p className="text-xs font-bold text-slate-800 uppercase tracking-wider">Step-by-Step Procedure:</p>
                <ol className="list-decimal list-inside space-y-1.5 text-xs text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-100">
                  {protocol.steps.map((step, idx) => (
                    <li key={idx} className="leading-relaxed pl-1">
                      <span className="font-semibold text-slate-900">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Safety Checkpoints */}
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 space-y-1">
                <p className="text-xs font-bold text-amber-900 flex items-center">
                  <AlertOctagon className="w-4 h-4 mr-1.5 text-amber-600" />
                  Mandatory Safety Checkpoints:
                </p>
                <ul className="list-disc list-inside text-xs text-amber-800 space-y-0.5">
                  {protocol.safetyCheckpoints.map((chk, i) => (
                    <li key={i}>{chk}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
