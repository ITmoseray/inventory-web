'use client';

import React, { useState, useTransition } from 'react';
import { Home, Plus, Users, UserMinus, Building } from 'lucide-react';
import { addHostelRoom, allocateBed, vacateBed } from '@/actions/hostelActions';
import { toast } from 'sonner';
import { Modal } from '@/components/ui/modal';

export default function HostelClient({ initialHostels, students }: any) {
  const [isPending, startTransition] = useTransition();

  // Add Room Modal State
  const [showAddRoom, setShowAddRoom] = useState(false);
  const [roomForm, setRoomForm] = useState({ blockName: '', roomNumber: '', capacity: 1, type: 'MIXED' });

  // Allocation Modal State
  const [showAllocate, setShowAllocate] = useState(false);
  const [allocateForm, setAllocateForm] = useState({ hostelId: '', studentId: '' });

  const handleAddRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await addHostelRoom(roomForm);
      if (res.success) {
        toast.success("Room added to hostel!");
        setShowAddRoom(false);
        setRoomForm({ blockName: '', roomNumber: '', capacity: 1, type: 'MIXED' });
      } else {
        toast.error("Failed to add room.");
      }
    });
  };

  const handleAllocate = async (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await allocateBed(allocateForm.hostelId, allocateForm.studentId);
      if (res.success) {
        toast.success("Student allocated to room successfully!");
        setShowAllocate(false);
        setAllocateForm({ hostelId: '', studentId: '' });
      } else {
        toast.error(res.error || "Failed to allocate room.");
      }
    });
  };

  const handleVacate = async (allocationId: string) => {
    if (!confirm("Are you sure you want to remove this student from the room?")) return;
    startTransition(async () => {
      const res = await vacateBed(allocationId);
      if (res.success) {
        toast.success("Student vacated successfully!");
      } else {
        toast.error("Failed to vacate student.");
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button onClick={() => setShowAddRoom(true)} className="px-4 py-2 bg-violet-600 text-white rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-violet-700">
          <Plus className="w-4 h-4" /> Add Room
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {initialHostels.map((room: any) => {
          const isFull = room.allocations.length >= room.capacity;
          return (
            <div key={room.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-xl text-slate-900 dark:text-white flex items-center gap-2">
                    <Building className="w-5 h-5 text-violet-500" /> {room.blockName}
                  </h3>
                  <p className="text-slate-500 text-sm mt-1">Room {room.roomNumber} • {room.type}</p>
                </div>
                <div className={`text-xs font-bold px-2 py-1 rounded-md ${isFull ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
                  {room.allocations.length} / {room.capacity} Beds
                </div>
              </div>

              <div className="p-4 flex-1 bg-slate-50 dark:bg-slate-900/50">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">Occupants</h4>
                {room.allocations.length > 0 ? (
                  <ul className="space-y-2">
                    {room.allocations.map((alloc: any) => (
                      <li key={alloc.id} className="flex justify-between items-center bg-white dark:bg-slate-800 p-2 rounded-lg border border-slate-200 dark:border-slate-700">
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          {alloc.student.firstName} {alloc.student.lastName}
                        </span>
                        <button onClick={() => handleVacate(alloc.id)} disabled={isPending} className="text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 p-1.5 rounded-md transition-colors">
                          <UserMinus className="w-4 h-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-slate-400 italic">Room is empty.</p>
                )}
              </div>

              <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
                <button 
                  onClick={() => { setAllocateForm({ ...allocateForm, hostelId: room.id }); setShowAllocate(true); }}
                  disabled={isFull}
                  className="w-full py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Users className="w-4 h-4" /> Allocate Student
                </button>
              </div>
            </div>
          );
        })}
        {initialHostels.length === 0 && (
          <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center py-16 text-slate-500 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            <Home className="w-12 h-12 mx-auto mb-4 text-slate-300" />
            <p>No hostel blocks or rooms have been configured yet.</p>
          </div>
        )}
      </div>

      {/* Add Room Modal */}
      {showAddRoom && (
        <Modal isOpen={showAddRoom} onClose={() => setShowAddRoom(false)} title="Add Hostel Room">
          <form onSubmit={handleAddRoom} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-sm font-medium">Block Name</label><input required placeholder="e.g. Block A" value={roomForm.blockName} onChange={e => setRoomForm({...roomForm, blockName: e.target.value})} className="w-full mt-1 p-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700" /></div>
              <div><label className="text-sm font-medium">Room Number</label><input required placeholder="e.g. 101" value={roomForm.roomNumber} onChange={e => setRoomForm({...roomForm, roomNumber: e.target.value})} className="w-full mt-1 p-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-sm font-medium">Bed Capacity</label><input type="number" min="1" required value={roomForm.capacity} onChange={e => setRoomForm({...roomForm, capacity: parseInt(e.target.value)})} className="w-full mt-1 p-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700" /></div>
              <div>
                <label className="text-sm font-medium">Type</label>
                <select value={roomForm.type} onChange={e => setRoomForm({...roomForm, type: e.target.value})} className="w-full mt-1 p-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700">
                  <option value="MIXED">Mixed</option>
                  <option value="BOYS">Boys Only</option>
                  <option value="GIRLS">Girls Only</option>
                </select>
              </div>
            </div>
            <button type="submit" disabled={isPending} className="w-full py-2 bg-violet-600 text-white rounded-lg font-semibold mt-4">{isPending ? 'Saving...' : 'Add Room'}</button>
          </form>
        </Modal>
      )}

      {/* Allocate Modal */}
      {showAllocate && (
        <Modal isOpen={showAllocate} onClose={() => setShowAllocate(false)} title="Allocate Student to Room">
          <form onSubmit={handleAllocate} className="space-y-4">
            <div>
              <label className="text-sm font-medium">Select Student</label>
              <select required value={allocateForm.studentId} onChange={e => setAllocateForm({...allocateForm, studentId: e.target.value})} className="w-full mt-1 p-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700">
                <option value="">Search student...</option>
                {students.map((s: any) => (
                  <option key={s.id} value={s.id}>{s.firstName} {s.lastName} ({s.studentId})</option>
                ))}
              </select>
            </div>
            <button type="submit" disabled={isPending || !allocateForm.studentId} className="w-full py-2 bg-violet-600 text-white rounded-lg font-semibold mt-4">{isPending ? 'Processing...' : 'Confirm Allocation'}</button>
          </form>
        </Modal>
      )}
    </div>
  );
}
