'use client';

import React, { useState } from 'react';
import { RunbookTask } from '@/types/auth';
import { CheckSquare, Square, ClipboardList, AlertCircle, Wrench, ChevronDown, ChevronUp, Plus, Trash2, Edit3, Settings, Tag } from 'lucide-react';

interface CareRunbookProps {
  tasks: RunbookTask[];
  onAddTask?: (task: Omit<RunbookTask, 'id'>) => void;
  onUpdateTask?: (task: RunbookTask) => void;
  onDeleteTask?: (taskId: string) => void;
  isEmployer: boolean;
  userUid?: string;
}

export default function CareRunbook({ tasks, onAddTask, onUpdateTask, onDeleteTask, isEmployer, userUid }: CareRunbookProps) {
  const [completedTaskIds, setCompletedTaskIds] = useState<Record<string, boolean>>(() => {
    if (typeof window !== 'undefined' && userUid) {
      const saved = localStorage.getItem(`careself_completed_${userUid}`);
      if (saved) {
        try { return JSON.parse(saved); } catch {}
      }
    }
    return {};
  });
  const [expandedId, setExpandedId] = useState<string | null>(tasks[0]?.id || null);
  const [filterCategory, setFilterCategory] = useState<string>('All');

  // Categories list state for Admin/Employer management
  const [categories, setCategories] = useState<string[]>([
    'Morning Transfer',
    'Bowel & Bladder',
    'Evening Routine',
    'Medical Equipment',
    'Kitchen & Meal Prep'
  ]);
  const [showCategoryModal, setShowCategoryModal] = useState<boolean>(false);
  const [newCategoryName, setNewCategoryName] = useState<string>('');
  const [editingCategoryIndex, setEditingCategoryIndex] = useState<number | null>(null);
  const [editingCategoryValue, setEditingCategoryValue] = useState<string>('');

  // Delete confirmation modals state
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<RunbookTask | null>(null);

  // Modal state for Add/Edit Task
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingTask, setEditingTask] = useState<RunbookTask | null>(null);

  // Form state for Task
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(categories[0] || 'Morning Transfer');
  const [description, setDescription] = useState('');
  const [equipmentDetails, setEquipmentDetails] = useState('');
  const [slingSize, setSlingSize] = useState('');
  const [liftSettings, setLiftSettings] = useState('');
  const [shoulderLoopSetting, setShoulderLoopSetting] = useState('');
  const [legLoopSetting, setLegLoopSetting] = useState('');
  const [carryBarType, setCarryBarType] = useState('2-Point Loop Spreader Bar');
  const [legRoutingStyle, setLegRoutingStyle] = useState('Crossed (Divided)');
  const [attendantCount, setAttendantCount] = useState('2-Person Assist');
  const [transferPath, setTransferPath] = useState('Bed -> Power Wheelchair');
  const [headSupportNotes, setHeadSupportNotes] = useState('');
  const [precautionsNotes, setPrecautionsNotes] = useState('');
  const [emergencyLoweringNotes, setEmergencyLoweringNotes] = useState('');
  const [destinationNotes, setDestinationNotes] = useState('');
  const [isMandatory, setIsMandatory] = useState(true);

  const allCategoriesFilter = ['All', ...categories];
  const filteredTasks = tasks.filter(t => filterCategory === 'All' || t.category === filterCategory);

  const toggleCheck = (id: string) => {
    setCompletedTaskIds(prev => {
      const updated = { ...prev, [id]: !prev[id] };
      if (typeof window !== 'undefined' && userUid) {
        localStorage.setItem(`careself_completed_${userUid}`, JSON.stringify(updated));
      }
      return updated;
    });
  };

  const handleOpenAddModal = () => {
    setEditingTask(null);
    setTitle('');
    setCategory(categories[0] || 'Morning Transfer');
    setDescription('');
    setEquipmentDetails('');
    setSlingSize('');
    setLiftSettings('');
    setShoulderLoopSetting('');
    setLegLoopSetting('');
    setCarryBarType('2-Point Loop Spreader Bar');
    setLegRoutingStyle('Crossed (Divided)');
    setAttendantCount('2-Person Assist');
    setTransferPath('Bed -> Power Wheelchair');
    setHeadSupportNotes('');
    setPrecautionsNotes('');
    setEmergencyLoweringNotes('');
    setDestinationNotes('');
    setIsMandatory(true);
    setShowModal(true);
  };

  const handleOpenEditModal = (task: RunbookTask, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingTask(task);
    setTitle(task.title);
    setCategory(task.category);
    setDescription(task.description);
    setEquipmentDetails(task.equipmentDetails || '');
    setSlingSize(task.slingSize || '');
    setLiftSettings(task.liftSettings || '');
    setShoulderLoopSetting(task.shoulderLoopSetting || '');
    setLegLoopSetting(task.legLoopSetting || '');
    setCarryBarType(task.carryBarType || '2-Point Loop Spreader Bar');
    setLegRoutingStyle(task.legRoutingStyle || 'Crossed (Divided)');
    setAttendantCount(task.attendantCount || '2-Person Assist');
    setTransferPath(task.transferPath || 'Bed -> Power Wheelchair');
    setHeadSupportNotes(task.headSupportNotes || '');
    setPrecautionsNotes(task.precautionsNotes || '');
    setEmergencyLoweringNotes(task.emergencyLoweringNotes || '');
    setDestinationNotes(task.destinationNotes || '');
    setIsMandatory(task.isMandatory);
    setShowModal(true);
  };

  const handleSaveTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    const taskPayload = {
      title,
      category,
      description,
      equipmentDetails,
      slingSize,
      liftSettings,
      shoulderLoopSetting,
      legLoopSetting,
      carryBarType,
      legRoutingStyle,
      attendantCount,
      transferPath,
      headSupportNotes,
      precautionsNotes,
      emergencyLoweringNotes,
      destinationNotes,
      isMandatory,
    };

    if (editingTask && onUpdateTask) {
      onUpdateTask({
        ...editingTask,
        ...taskPayload,
      });
    } else if (onAddTask) {
      onAddTask({
        ...taskPayload,
        order: tasks.length + 1
      });
    }

    setShowModal(false);
  };

  // Category management handlers
  const handleAddCategory = () => {
    if (!newCategoryName.trim()) return;
    const formatted = newCategoryName.trim();
    if (!categories.includes(formatted)) {
      setCategories([...categories, formatted]);
    }
    setNewCategoryName('');
  };

  const confirmDeleteCategory = (cat: string) => {
    if (categories.length <= 1) {
      alert('You must have at least one category.');
      return;
    }
    setCategoryToDelete(cat);
  };

  const executeDeleteCategory = () => {
    if (!categoryToDelete) return;
    setCategories(categories.filter(c => c !== categoryToDelete));
    if (filterCategory === categoryToDelete) {
      setFilterCategory('All');
    }
    setCategoryToDelete(null);
  };

  const handleUpdateCategory = (oldName: string, newName: string) => {
    if (!newName.trim()) return;
    const trimmed = newName.trim();
    const updated = categories.map(c => c === oldName ? trimmed : c);
    setCategories(updated);
    if (filterCategory === oldName) {
      setFilterCategory(trimmed);
    }
    setEditingCategoryIndex(null);
    setEditingCategoryValue('');
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-8 capitalize">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200">
              Care Protocol
            </span>
            <span className="text-slate-400 text-sm">Step-by-Step Routines & Equipment Settings</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mt-1">Household Care Runbook & Lift Parameters</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {isEmployer ? 'Employer Mode: Add, modify, or delete tasks and manage categories below.' : 'View-only attendant mode.'}
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          {isEmployer && (
            <>
              <button
                onClick={() => setShowCategoryModal(true)}
                className="min-h-[40px] px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl flex items-center space-x-1.5 transition"
              >
                <Tag className="w-4 h-4 text-purple-700" />
                <span>Manage Categories</span>
              </button>
              <button
                onClick={handleOpenAddModal}
                className="min-h-[40px] px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white text-sm font-semibold rounded-xl flex items-center space-x-2 transition shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Add Care Task</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap gap-1 mt-4">
        {allCategoriesFilter.map(cat => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={`min-h-[38px] px-3 py-1.5 rounded-xl text-xs font-semibold transition capitalize ${
              filterCategory === cat 
                ? 'bg-purple-700 text-white shadow-sm' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="mt-6 space-y-3">
        {filteredTasks.length === 0 ? (
          <p className="text-center py-8 text-slate-500 text-sm">No care runbook tasks found for this category.</p>
        ) : (
          filteredTasks.map((task) => {
            const isCompleted = !!completedTaskIds[task.id];
            const isExpanded = expandedId === task.id;

            return (
              <div 
                key={task.id}
                className={`border rounded-xl transition-all hover:bg-[#1447e6] hover:text-white group capitalize ${
                  isCompleted ? 'bg-slate-50 border-slate-200 opacity-75' : 'bg-white border-slate-200 shadow-sm'
                }`}
              >
                <div className="p-4 flex items-start justify-between cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : task.id)}>
                  <div className="flex items-start space-x-3">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleCheck(task.id);
                      }}
                      className="mt-0.5 text-purple-700 group-hover:text-white focus:outline-none focus:ring-2 focus:ring-purple-600 rounded"
                    >
                      {isCompleted ? (
                        <CheckSquare className="w-6 h-6 text-purple-700 group-hover:text-white fill-purple-50 group-hover:fill-transparent" />
                      ) : (
                        <Square className="w-6 h-6 text-slate-400 group-hover:text-white" />
                      )}
                    </button>
                    <div>
                      <div className="flex items-center space-x-2 flex-wrap gap-1">
                        <span className="text-xs font-semibold text-purple-700 group-hover:text-white uppercase tracking-wide bg-purple-50 group-hover:bg-blue-800 px-2 py-0.5 rounded">
                          {task.category}
                        </span>
                        {task.attendantCount && (
                          <span className="text-xs font-semibold text-amber-700 group-hover:text-amber-200 bg-amber-50 group-hover:bg-blue-900 px-2 py-0.5 rounded">
                            {task.attendantCount}
                          </span>
                        )}
                        {task.isMandatory && (
                          <span className="text-xs font-semibold text-rose-700 group-hover:text-white bg-rose-50 group-hover:bg-rose-900 px-2 py-0.5 rounded">
                            Mandatory Protocol
                          </span>
                        )}
                      </div>
                      <h3 className={`text-base font-bold mt-1 capitalize ${isCompleted ? 'line-through text-slate-500 group-hover:text-blue-200' : 'text-slate-900 group-hover:text-white'}`}>
                        {task.title}
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {isEmployer && (
                      <>
                        <button
                          type="button"
                          onClick={(e) => handleOpenEditModal(task, e)}
                          title="Edit Task"
                          className="p-2 text-slate-400 group-hover:text-white hover:bg-white/10 rounded-lg transition"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setTaskToDelete(task);
                          }}
                          title="Delete Task"
                          className="p-2 text-rose-400 group-hover:text-rose-200 hover:bg-white/10 rounded-lg transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpandedId(isExpanded ? null : task.id);
                      }}
                      className="p-2 text-slate-400 group-hover:text-white hover:bg-white/10 rounded-lg transition"
                    >
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-4 pb-4 pt-2 border-t border-slate-100 group-hover:border-blue-700 bg-slate-50/50 group-hover:bg-[#1447e6] rounded-b-xl space-y-3">
                    <p className="text-sm text-slate-700 group-hover:text-white leading-relaxed capitalize">{task.description}</p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 p-3 bg-white group-hover:bg-blue-900/60 rounded-lg border border-slate-200 group-hover:border-blue-700 text-xs">
                      {task.transferPath && (
                        <div>
                          <span className="font-semibold text-slate-500 group-hover:text-blue-200 block">Transfer Path:</span>
                          <span className="text-slate-900 group-hover:text-white font-medium capitalize">{task.transferPath}</span>
                        </div>
                      )}
                      {task.shoulderLoopSetting && (
                        <div>
                          <span className="font-semibold text-slate-500 group-hover:text-blue-200 block">Shoulder Loop:</span>
                          <span className="text-slate-900 group-hover:text-white font-medium capitalize">{task.shoulderLoopSetting}</span>
                        </div>
                      )}
                      {task.legLoopSetting && (
                        <div>
                          <span className="font-semibold text-slate-500 group-hover:text-blue-200 block">Leg Loop:</span>
                          <span className="text-slate-900 group-hover:text-white font-medium capitalize">{task.legLoopSetting}</span>
                        </div>
                      )}
                      {task.carryBarType && (
                        <div>
                          <span className="font-semibold text-slate-500 group-hover:text-blue-200 block">Carry Bar Connection:</span>
                          <span className="text-slate-900 group-hover:text-white font-medium capitalize">{task.carryBarType}</span>
                        </div>
                      )}
                      {task.legRoutingStyle && (
                        <div>
                          <span className="font-semibold text-slate-500 group-hover:text-blue-200 block">Leg Routing Style:</span>
                          <span className="text-slate-900 group-hover:text-white font-medium capitalize">{task.legRoutingStyle}</span>
                        </div>
                      )}
                      {task.equipmentDetails && (
                        <div>
                          <span className="font-semibold text-slate-500 group-hover:text-blue-200 block">Equipment:</span>
                          <span className="text-slate-900 group-hover:text-white font-medium capitalize">{task.equipmentDetails}</span>
                        </div>
                      )}
                      {task.slingSize && (
                        <div>
                          <span className="font-semibold text-slate-500 group-hover:text-blue-200 block">Sling Size:</span>
                          <span className="text-slate-900 group-hover:text-white font-medium capitalize">{task.slingSize}</span>
                        </div>
                      )}
                      {task.liftSettings && (
                        <div>
                          <span className="font-semibold text-slate-500 group-hover:text-blue-200 block">Lift Height / Settings:</span>
                          <span className="text-slate-900 group-hover:text-white font-medium capitalize">{task.liftSettings}</span>
                        </div>
                      )}
                    </div>

                    {(task.headSupportNotes || task.precautionsNotes || task.emergencyLoweringNotes || task.destinationNotes) && (
                      <div className="space-y-2 p-3 bg-blue-50/80 group-hover:bg-blue-950/80 rounded-lg border border-blue-200 group-hover:border-blue-700 text-xs text-blue-900 group-hover:text-blue-100">
                        {task.headSupportNotes && (
                          <p><strong className="font-semibold">Head Support & Stiffener:</strong> <span className="capitalize">{task.headSupportNotes}</span></p>
                        )}
                        {task.precautionsNotes && (
                          <p><strong className="font-semibold">Precautions & Spasticity:</strong> <span className="capitalize">{task.precautionsNotes}</span></p>
                        )}
                        {task.emergencyLoweringNotes && (
                          <p><strong className="font-semibold">Emergency Lowering & Brakes:</strong> <span className="capitalize">{task.emergencyLoweringNotes}</span></p>
                        )}
                        {task.destinationNotes && (
                          <p><strong className="font-semibold">Destination & Positioning:</strong> <span className="capitalize">{task.destinationNotes}</span></p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Category Management Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4 capitalize">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
              <Tag className="w-5 h-5 text-purple-700" />
              <span>Manage Care Categories</span>
            </h3>
            <p className="text-xs text-slate-500">Add new categories or modify/delete existing ones.</p>

            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {categories.map((cat, idx) => (
                <div key={cat} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                  {editingCategoryIndex === idx ? (
                    <div className="flex items-center space-x-2 flex-1 mr-2">
                      <input
                        type="text"
                        value={editingCategoryValue}
                        onChange={(e) => setEditingCategoryValue(e.target.value)}
                        className="w-full px-2.5 py-1 text-sm border border-slate-300 rounded-lg capitalize"
                      />
                      <button
                        type="button"
                        onClick={() => handleUpdateCategory(cat, editingCategoryValue)}
                        className="px-3 py-1 bg-purple-700 hover:bg-purple-800 text-white text-xs font-semibold rounded-lg"
                      >
                        Save
                      </button>
                    </div>
                  ) : (
                    <span className="text-sm font-semibold text-slate-800 capitalize">{cat}</span>
                  )}

                  <div className="flex items-center space-x-1">
                    {editingCategoryIndex !== idx && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingCategoryIndex(idx);
                          setEditingCategoryValue(cat);
                        }}
                        className="p-1.5 text-slate-400 hover:text-purple-700 rounded-lg"
                        title="Edit Category"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => confirmDeleteCategory(cat)}
                      className="p-1.5 text-rose-400 hover:text-rose-600 rounded-lg"
                      title="Delete Category"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-100 space-y-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase">Add New Category</label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="e.g., Therapy & Stretching"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm capitalize focus:ring-2 focus:ring-purple-600 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddCategory}
                  className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-sm font-semibold whitespace-nowrap shadow-sm transition"
                >
                  Add
                </button>
              </div>
            </div>

            <div className="flex justify-end pt-3">
              <button
                type="button"
                onClick={() => {
                  setShowCategoryModal(false);
                  setEditingCategoryIndex(null);
                }}
                className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-sm font-semibold transition"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Category Delete Confirmation Popup */}
      {categoryToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Delete Category?</h3>
            <p className="text-sm text-slate-600 capitalize">Are you sure you want to delete <span className="font-semibold text-slate-900">"{categoryToDelete}"</span>? This action cannot be undone.</p>
            <div className="flex space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setCategoryToDelete(null)}
                className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-50 transition"
              >
                No
              </button>
              <button
                type="button"
                onClick={executeDeleteCategory}
                className="flex-1 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-semibold transition shadow-sm"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Task Delete Confirmation Popup */}
      {taskToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Delete Care Task?</h3>
            <p className="text-sm text-slate-600 capitalize">Are you sure you want to delete <span className="font-semibold text-slate-900">"{taskToDelete.title}"</span>? Yes or No?</p>
            <div className="flex space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setTaskToDelete(null)}
                className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-50 transition"
              >
                No
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onDeleteTask && taskToDelete) {
                    onDeleteTask(taskToDelete.id);
                  }
                  setTaskToDelete(null);
                }}
                className="flex-1 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-semibold transition shadow-sm"
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Task Modal with Comprehensive Lift & Transfer Parameters */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4 overflow-y-auto capitalize">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 my-8">
            <h3 className="text-xl font-bold text-slate-900">
              {editingTask ? 'Modify Care Runbook Task & Lift Parameters' : 'Add New Care Runbook Task & Lift Parameters'}
            </h3>
            
            <form onSubmit={handleSaveTask} className="space-y-4 max-h-[75vh] overflow-y-auto pr-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Task Title *</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Morning Ceiling Lift Transfer"
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm capitalize focus:ring-2 focus:ring-purple-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Category *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm bg-white capitalize focus:ring-2 focus:ring-purple-600 focus:outline-none"
                  >
                    {categories.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Detailed Description & Steps *</label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Step by step instructions for the attendant..."
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm capitalize focus:ring-2 focus:ring-purple-600 focus:outline-none"
                />
              </div>

              {/* 1. Loop Color / Strap Configurations & Presets */}
              <div className="p-4 bg-purple-50/50 rounded-xl border border-purple-100 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-purple-800">1. Loop Color & Strap Configuration</h4>
                  {/* Quick-Select Presets */}
                  <div className="flex items-center space-x-1.5">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Presets:</span>
                    <button
                      type="button"
                      onClick={() => {
                        setShoulderLoopSetting('Green — Short / Inner Loop (Maximum upright sitting; ideal for wheelchair, commode, or dining transfers)');
                        setLegLoopSetting('Yellow — Medium / Middle Loop (Standard 90° hip bend; balanced thigh support)');
                        setLegRoutingStyle('Crossed (Divided)');
                        setTransferPath('Power Wheelchair / Shower Commode');
                      }}
                      className="px-2 py-0.5 bg-white border border-purple-200 hover:bg-purple-100 text-purple-900 rounded text-[10px] font-bold shadow-2xs transition cursor-pointer"
                      title="Upright Sitting Preset"
                    >
                      Upright Sitting
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShoulderLoopSetting('Yellow — Medium / Middle Loop (Slight recline; standard comfort position)');
                        setLegLoopSetting('Blue — Long / Outer Loop (Extends legs lower; reduces abdominal and hip flexion pressure)');
                        setLegRoutingStyle('Crossed (Divided)');
                        setTransferPath('Recliner Chair / Ramped Seating');
                      }}
                      className="px-2 py-0.5 bg-white border border-purple-200 hover:bg-purple-100 text-purple-900 rounded text-[10px] font-bold shadow-2xs transition cursor-pointer"
                      title="Semi-Recline Preset"
                    >
                      Semi-Recline
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShoulderLoopSetting('Blue — Long / Outer Loop (Deep recline / supine; used for bed-to-bed transfers or extensor tone)');
                        setLegLoopSetting('Blue — Long / Outer Loop (Extends legs lower; reduces abdominal and hip flexion pressure)');
                        setLegRoutingStyle('Crossed (Divided)');
                        setTransferPath('Bed-to-Bed / Stretcher / Mat Table');
                      }}
                      className="px-2 py-0.5 bg-white border border-purple-200 hover:bg-purple-100 text-purple-900 rounded text-[10px] font-bold shadow-2xs transition cursor-pointer"
                      title="Full Recline / Supine Preset"
                    >
                      Full Recline
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShoulderLoopSetting('Green — Short / Inner Loop (Maximum upright sitting; ideal for wheelchair, commode, or dining transfers)');
                        setLegLoopSetting('Green — Short / Inner Loop (Raises knees higher than hips; tilts pelvis back to prevent sliding forward)');
                        setLegRoutingStyle('Crossed (Divided)');
                        setTransferPath('Deep Wheelchair Bucket Seating');
                      }}
                      className="px-2 py-0.5 bg-white border border-purple-200 hover:bg-purple-100 text-purple-900 rounded text-[10px] font-bold shadow-2xs transition cursor-pointer"
                      title="High Pelvic Tilt Preset"
                    >
                      High Pelvic Tilt
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Shoulder Loop Setting</label>
                    <select
                      value={shoulderLoopSetting}
                      onChange={(e) => setShoulderLoopSetting(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white capitalize focus:ring-2 focus:ring-purple-600 focus:outline-none"
                    >
                      <option value="">-- Select Shoulder Loop --</option>
                      <option value="Green — Short / Inner Loop (Maximum upright sitting; ideal for wheelchair, commode, or dining transfers)">Green — Short / Inner Loop (Upright / Wheelchair)</option>
                      <option value="Yellow — Medium / Middle Loop (Slight recline; standard comfort position)">Yellow — Medium / Middle Loop (Slight Recline)</option>
                      <option value="Blue — Long / Outer Loop (Deep recline / supine; used for bed-to-bed transfers or extensor tone)">Blue — Long / Outer Loop (Deep Recline / Supine)</option>
                      <option value="White — Extra Short / Innermost Loop (90° strict upright; found on select Arjo and clip-to-loop adapter slings)">White — Extra Short / Innermost Loop (90° Strict Upright)</option>
                      <option value="Red — Short / Inner Loop (Brand-specific short loop on Joerns (Hoyer) and generic slings)">Red — Short / Inner Loop (Joerns / Hoyer Brand)</option>
                      <option value="Black / Grey — Extra Long Loop (Maximum flat extension)">Black / Grey — Extra Long Loop (Max Flat Extension)</option>
                      <option value="Custom / Other">Custom / Other</option>
                    </select>
                    {shoulderLoopSetting.includes('Custom') && (
                      <input
                        type="text"
                        placeholder="Enter custom shoulder loop description..."
                        onChange={(e) => setShoulderLoopSetting(e.target.value)}
                        className="mt-1.5 w-full px-3 py-1.5 border border-purple-300 rounded-lg text-xs bg-white focus:ring-2 focus:ring-purple-600"
                      />
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Leg Loop Setting</label>
                    <select
                      value={legLoopSetting}
                      onChange={(e) => setLegLoopSetting(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white capitalize focus:ring-2 focus:ring-purple-600 focus:outline-none"
                    >
                      <option value="">-- Select Leg Loop --</option>
                      <option value="Yellow — Medium / Middle Loop (Standard 90° hip bend; balanced thigh support)">Yellow — Medium / Middle Loop (Standard 90° Hip Bend)</option>
                      <option value="Blue — Long / Outer Loop (Extends legs lower; reduces abdominal and hip flexion pressure)">Blue — Long / Outer Loop (Extends Legs Lower)</option>
                      <option value="Green — Short / Inner Loop (Raises knees higher than hips; tilts pelvis back to prevent sliding forward)">Green — Short / Inner Loop (Raises Knees / Anti-Slide)</option>
                      <option value="White — Extra Short / Innermost Loop (High knee tuck; used for compact transfers)">White — Extra Short / Innermost Loop (High Knee Tuck)</option>
                      <option value="Red — Long / Outer Loop (Brand-specific outer loop on select slings)">Red — Long / Outer Loop (Brand-Specific Outer)</option>
                      <option value="Custom / Other">Custom / Other</option>
                    </select>
                    {legLoopSetting.includes('Custom') && (
                      <input
                        type="text"
                        placeholder="Enter custom leg loop description..."
                        onChange={(e) => setLegLoopSetting(e.target.value)}
                        className="mt-1.5 w-full px-3 py-1.5 border border-purple-300 rounded-lg text-xs bg-white focus:ring-2 focus:ring-purple-600"
                      />
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Carry Bar Connection Type</label>
                    <select
                      value={carryBarType}
                      onChange={(e) => setCarryBarType(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white capitalize focus:ring-2 focus:ring-purple-600 focus:outline-none"
                    >
                      <option value="2-Point Loop Spreader Bar">2-Point Loop Spreader Bar</option>
                      <option value="4-Point Loop Spreader Bar">4-Point Loop Spreader Bar</option>
                      <option value="Clip Attachment Spreader Bar">Clip Attachment Spreader Bar</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Leg Routing Style</label>
                    <select
                      value={legRoutingStyle}
                      onChange={(e) => setLegRoutingStyle(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white capitalize focus:ring-2 focus:ring-purple-600 focus:outline-none"
                    >
                      <option value="Crossed / Divided (Standard)">Crossed / Divided (Standard)</option>
                      <option value="Hammocked / Cradle">Hammocked / Cradle (Spasms / Amputee)</option>
                      <option value="Uncrossed / Parallel">Uncrossed / Parallel (Hygiene / Commode)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* 2. Transfer Parameters & Staffing */}
              <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-blue-800">2. Transfer Parameters & Staffing</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Attendants Required</label>
                    <select
                      value={attendantCount}
                      onChange={(e) => setAttendantCount(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white capitalize focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    >
                      <option value="1-Person Assist">1-Person Assist</option>
                      <option value="2-Person Assist">2-Person Assist</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Transfer Path</label>
                    <input
                      type="text"
                      value={transferPath}
                      onChange={(e) => setTransferPath(e.target.value)}
                      placeholder="e.g., Bed -> Power Wheelchair"
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs capitalize focus:ring-2 focus:ring-blue-600 focus:outline-none bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* 3. Equipment & Sling Hardware */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Equipment</label>
                  <input
                    type="text"
                    value={equipmentDetails}
                    onChange={(e) => setEquipmentDetails(e.target.value)}
                    placeholder="e.g., Arjo Ceiling Lift"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs capitalize focus:ring-2 focus:ring-purple-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Sling Size</label>
                  <input
                    type="text"
                    value={slingSize}
                    onChange={(e) => setSlingSize(e.target.value)}
                    placeholder="e.g., Medium Mesh"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs capitalize focus:ring-2 focus:ring-purple-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Lift Settings</label>
                  <input
                    type="text"
                    value={liftSettings}
                    onChange={(e) => setLiftSettings(e.target.value)}
                    placeholder="e.g., Level 4 Height"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs capitalize focus:ring-2 focus:ring-purple-600 focus:outline-none"
                  />
                </div>
              </div>

              {/* 4. Precautions & Medical Notes */}
              <div className="space-y-3 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Head Support & Stiffener Notes</label>
                  <input
                    type="text"
                    value={headSupportNotes}
                    onChange={(e) => setHeadSupportNotes(e.target.value)}
                    placeholder="e.g., Insert plastic stiffener in back pocket"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs capitalize focus:ring-2 focus:ring-purple-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Spasticity, Skin & Medical Line Precautions</label>
                  <textarea
                    rows={2}
                    value={precautionsNotes}
                    onChange={(e) => setPrecautionsNotes(e.target.value)}
                    placeholder="e.g., Wait 10 seconds for leg spasm to relax. Ensure catheter tubing is slack."
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs capitalize focus:ring-2 focus:ring-purple-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Emergency Lowering & Brake Protocol</label>
                  <input
                    type="text"
                    value={emergencyLoweringNotes}
                    onChange={(e) => setEmergencyLoweringNotes(e.target.value)}
                    placeholder="e.g., Manual lowering pull strap on motor. Unlocked base for floor hoist."
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs capitalize focus:ring-2 focus:ring-purple-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Destination & Positioning Adjustments</label>
                  <input
                    type="text"
                    value={destinationNotes}
                    onChange={(e) => setDestinationNotes(e.target.value)}
                    placeholder="e.g., Roho cushion valve facing front-left, fasten lap belt."
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs capitalize focus:ring-2 focus:ring-purple-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center pt-2">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isMandatory}
                    onChange={(e) => setIsMandatory(e.target.checked)}
                    className="w-4 h-4 text-purple-700 rounded border-slate-300 focus:ring-purple-600"
                  />
                  <span className="text-sm font-semibold text-slate-700">Mandatory WSIB & Safety Protocol</span>
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-sm font-semibold transition shadow-sm"
                >
                  {editingTask ? 'Save Changes' : 'Add Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
