import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import { useSession } from '../contexts/SessionContext';
import {
  DndContext, DragOverlay, PointerSensor,
  useSensor, useSensors, closestCorners, useDroppable,
} from '@dnd-kit/core';
import {
  arrayMove, SortableContext, useSortable, verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  FaWeight, FaShoePrints, FaMoon, FaDumbbell, FaHeartbeat,
  FaTint, FaSpa, FaBacon, FaHandPointer,
} from 'react-icons/fa';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const ALL_GOALS = [
  { id: 'goal-1', content: 'Lose Weight',         icon: <FaWeight /> },
  { id: 'goal-2', content: 'Improve Nutrition',   icon: <FaBacon /> },
  { id: 'goal-3', content: 'Increase Daily Steps',icon: <FaShoePrints /> },
  { id: 'goal-4', content: 'Build Muscle',         icon: <FaDumbbell /> },
  { id: 'goal-5', content: 'Improve Sleep Quality',icon: <FaMoon /> },
  { id: 'goal-6', content: 'Manage Stress',        icon: <FaHeartbeat /> },
  { id: 'goal-7', content: 'Drink More Water',     icon: <FaTint /> },
  { id: 'goal-8', content: 'Improve Flexibility',  icon: <FaSpa /> },
];

// ── Sortable Item ─────────────────────────────────────────────
const SortableItem = ({ id, content, icon, index, isTopGoal }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0 : 1,
        backgroundColor: 'rgba(56,73,89,0.8)',
        border: '1px solid rgba(136,189,242,0.15)',
        borderRadius: '10px',
        marginBottom: '10px',
        padding: '12px 14px',
        display: 'flex',
        alignItems: 'center',
        cursor: 'grab',
      }}
      {...attributes}
      {...listeners}
    >
      {isTopGoal && (
        <span style={{
          width: '22px', height: '22px', borderRadius: '50%',
          backgroundColor: '#6A89A7', color: '#f0f4f8',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '11px', fontWeight: 700, marginRight: '12px', flexShrink: 0,
        }}>
          {index + 1}
        </span>
      )}
      <span style={{ marginRight: '10px', color: '#88BDF2', fontSize: '14px' }}>{icon}</span>
      <span style={{ flexGrow: 1, color: '#f0f4f8', fontSize: '13px' }}>{content}</span>
      <span style={{ color: 'rgba(136,189,242,0.3)', fontSize: '14px' }}>☰</span>
    </div>
  );
};

// ── Drag Overlay Item ─────────────────────────────────────────
const DragItem = ({ content, icon }) => (
  <div style={{
    backgroundColor: 'rgba(106,137,167,0.3)',
    border: '1px solid rgba(136,189,242,0.4)',
    borderRadius: '10px',
    padding: '12px 14px',
    display: 'flex', alignItems: 'center',
  }}>
    <span style={{ marginRight: '10px', color: '#88BDF2' }}>{icon}</span>
    <span style={{ flexGrow: 1, color: '#f0f4f8', fontSize: '13px' }}>{content}</span>
    <span style={{ color: 'rgba(136,189,242,0.3)' }}>☰</span>
  </div>
);

// ── Available Goals Container ─────────────────────────────────
const AvailableGoalsContainer = ({ items }) => {
  const { setNodeRef } = useDroppable({ id: 'available-goals' });

  return (
    <div
      ref={setNodeRef}
      style={{
        backgroundColor: 'rgba(46,61,74,0.6)',
        border: '1px solid rgba(136,189,242,0.15)',
        borderRadius: '14px',
        padding: '20px',
        minHeight: '400px',
      }}
    >
      <h2 style={{ color: '#f0f4f8', fontSize: '15px', fontWeight: 600, marginBottom: '16px' }}>
        Available Goals
      </h2>
      <SortableContext id="available-goals" items={items.map(g => g.id)} strategy={verticalListSortingStrategy}>
        {items.map((goal, index) => (
          <SortableItem key={goal.id} id={goal.id} content={goal.content} icon={goal.icon} index={index} isTopGoal={false} />
        ))}
      </SortableContext>
    </div>
  );
};

// ── Top Goals Container ───────────────────────────────────────
const TopGoalsContainer = ({ items }) => {
  const { setNodeRef } = useDroppable({ id: 'top-goals' });

  return (
    <div
      ref={setNodeRef}
      style={{
        backgroundColor: 'rgba(46,61,74,0.3)',
        border: '2px dashed rgba(136,189,242,0.25)',
        borderRadius: '14px',
        padding: '20px',
        minHeight: '400px',
      }}
    >
      <h2 style={{ color: '#f0f4f8', fontSize: '15px', fontWeight: 600, marginBottom: '16px' }}>
        Your Top 5 Goals
      </h2>
      <SortableContext id="top-goals" items={items.map(g => g.id)} strategy={verticalListSortingStrategy}>
        {items.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '40px', color: 'rgba(136,189,242,0.3)' }}>
            <FaHandPointer size={36} style={{ marginBottom: '10px' }} />
            <p style={{ fontSize: '13px' }}>Drag goals here to rank them</p>
          </div>
        ) : (
          items.map((goal, index) => (
            <SortableItem key={goal.id} id={goal.id} content={goal.content} icon={goal.icon} index={index} isTopGoal={true} />
          ))
        )}
      </SortableContext>
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────────
const WellnessPriorities = () => {
  const { getToken, guestMode } = useSession();
  const [items, setItems] = useState({ 'available-goals': ALL_GOALS, 'top-goals': [] });
  const [activeId, setActiveId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const sensors = useSensors(useSensor(PointerSensor));

  useEffect(() => { loadSavedPriorities(); }, []);

  const loadSavedPriorities = async () => {
    if (guestMode) return;
    try {
      const token = getToken();
      const response = await axios.get(`${BACKEND_URL}/api/priorities`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const saved = response.data.priorities;
      if (saved.length === 0) return;
      const savedIds = new Set(saved.map(p => p.goal_id));
      const topGoals = saved.map(p => ALL_GOALS.find(g => g.id === p.goal_id)).filter(Boolean);
      const available = ALL_GOALS.filter(g => !savedIds.has(g.id));
      setItems({ 'available-goals': available, 'top-goals': topGoals });
    } catch (error) {
      console.error('Failed to load priorities:', error);
    }
  };

  const handleDone = async () => {
    if (guestMode) { setSaveMessage('Sign up to save your priorities!'); return; }
    setSaving(true); setSaveMessage('');
    try {
      const token = getToken();
      const priorities = items['top-goals'].map((goal, index) => ({
        rank: index + 1, goal_id: goal.id, goal_name: goal.content,
      }));
      await axios.post(`${BACKEND_URL}/api/priorities/save`, { priorities }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSaveMessage('Priorities saved!');
    } catch (error) {
      console.error('Failed to save priorities:', error);
      setSaveMessage('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const getItemById = (id) =>
    items['available-goals'].find(g => g.id === id) || items['top-goals'].find(g => g.id === id);

  const handleDragEnd = ({ active, over }) => {
    setActiveId(null);
    if (!over) return;
    const activeContainer = active.data.current.sortable.containerId;
    const overContainer = over.data.current?.sortable.containerId || over.id;

    if (activeContainer !== overContainer) {
      if (items['top-goals'].length >= 5 && overContainer === 'top-goals') return;
      const activeItems = items[activeContainer];
      const overItems = items[overContainer];
      const activeIndex = activeItems.findIndex(item => item.id === active.id);
      const overIndex = over.id in items ? overItems.length : overItems.findIndex(item => item.id === over.id);
      setItems(prev => ({
        ...prev,
        [activeContainer]: prev[activeContainer].filter(item => item.id !== active.id),
        [overContainer]: [...prev[overContainer].slice(0, overIndex), activeItems[activeIndex], ...prev[overContainer].slice(overIndex)],
      }));
    } else {
      const activeIndex = items[activeContainer].findIndex(item => item.id === active.id);
      const overIndex = items[overContainer].findIndex(item => item.id === over.id);
      if (activeIndex !== overIndex) {
        setItems(prev => ({ ...prev, [overContainer]: arrayMove(prev[overContainer], activeIndex, overIndex) }));
      }
    }
  };

  return (
    <div className="flex h-screen bg-wa-bg" style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>

      {/* Grid background */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: 'linear-gradient(rgba(136,189,242,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(136,189,242,0.04) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      <Sidebar />

      <div className="flex-1 ml-20 overflow-y-auto relative z-10">
        <div className="flex flex-col items-center py-10 px-4">
          <div className="w-full max-w-4xl">

            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-wa-text mb-2" style={{ fontFamily: 'Georgia, serif', letterSpacing: '-0.5px' }}>
                Wellness Priorities
              </h1>
              <p className="text-wa-dim text-sm">Drag your top 5 goals into the right column and rank them.</p>
            </div>

            <DndContext
              sensors={sensors}
              collisionDetection={closestCorners}
              onDragStart={({ active }) => setActiveId(active.id)}
              onDragEnd={handleDragEnd}
              onDragCancel={() => setActiveId(null)}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <AvailableGoalsContainer items={items['available-goals']} />
                <TopGoalsContainer items={items['top-goals']} />
              </div>
              <DragOverlay>
                {activeId ? <DragItem {...getItemById(activeId)} /> : null}
              </DragOverlay>
            </DndContext>

            {/* Save */}
            <div className="text-center mt-8">
              {saveMessage && (
                <p className={`mb-3 text-sm ${saveMessage.includes('Failed') ? 'text-red-400' : 'text-wa-accent-lt'}`}>
                  {saveMessage}
                </p>
              )}
              <button
                onClick={handleDone}
                disabled={saving}
                className="bg-wa-accent hover:bg-wa-accent-lt hover:text-[#1a2530] text-white font-semibold py-3 px-10 rounded-lg transition-all duration-150 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save priorities'}
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default WellnessPriorities;
