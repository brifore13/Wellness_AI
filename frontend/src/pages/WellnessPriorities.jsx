import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import { useSession } from '../contexts/SessionContext';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  useDroppable,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  FaWeight,
  FaShoePrints,
  FaMoon,
  FaDumbbell,
  FaHeartbeat,
  FaTint,
  FaSpa,
  FaBacon,
  FaHandPointer,
} from 'react-icons/fa';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const ALL_GOALS = [
  { id: 'goal-1', content: 'Lose Weight', icon: <FaWeight /> },
  { id: 'goal-2', content: 'Improve Nutrition', icon: <FaBacon /> },
  { id: 'goal-3', content: 'Increase Daily Steps', icon: <FaShoePrints /> },
  { id: 'goal-4', content: 'Build Muscle', icon: <FaDumbbell /> },
  { id: 'goal-5', content: 'Improve Sleep Quality', icon: <FaMoon /> },
  { id: 'goal-6', content: 'Manage Stress', icon: <FaHeartbeat /> },
  { id: 'goal-7', content: 'Drink More Water', icon: <FaTint /> },
  { id: 'goal-8', content: 'Improve Flexibility', icon: <FaSpa /> },
];

// --- Reusable Item Component (for both lists) ---
const SortableItem = ({ id, content, icon, index, isTopGoal }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="flex items-center bg-white p-4 mb-3 rounded-lg shadow-sm"
    >
      {isTopGoal && (
        <span className="w-6 h-6 flex items-center justify-center bg-black text-white rounded-full mr-4 font-bold text-sm">
          {index + 1}
        </span>
      )}
      <span className="mr-3 text-gray-500">{icon}</span>
      <span className="flex-grow text-gray-800">{content}</span>
      <span className="text-gray-400">☰</span>
    </div>
  );
};

// --- Drag Overlay Item ---
const DragItem = ({ content, icon }) => (
  <div className="flex items-center bg-white p-4 mb-3 rounded-lg shadow-sm opacity-100">
    <span className="mr-3 text-gray-500">{icon}</span>
    <span className="flex-grow text-gray-800">{content}</span>
    <span className="text-gray-400">☰</span>
  </div>
);

// --- Main Page Component ---
const WellnessPriorities = () => {
  const { getToken, guestMode } = useSession();
  const [items, setItems] = useState({
    'available-goals': ALL_GOALS,
    'top-goals': [],
  });
  const [activeId, setActiveId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const sensors = useSensors(useSensor(PointerSensor));

  useEffect(() => {
    loadSavedPriorities();
  }, []);

  const loadSavedPriorities = async () => {
    if (guestMode) return;
    try {
      const token = getToken();
      const response = await axios.get(`${BACKEND_URL}/api/priorities`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const saved = response.data.priorities;
      if (saved.length === 0) return;

      const savedIds = new Set(saved.map((p) => p.goal_id));
      const topGoals = saved
        .map((p) => ALL_GOALS.find((g) => g.id === p.goal_id))
        .filter(Boolean);
      const available = ALL_GOALS.filter((g) => !savedIds.has(g.id));

      setItems({ 'available-goals': available, 'top-goals': topGoals });
    } catch (error) {
      console.error('Failed to load priorities:', error);
    }
  };

  const handleDone = async () => {
    if (guestMode) {
      setSaveMessage('Sign up to save your priorities!');
      return;
    }
    setSaving(true);
    setSaveMessage('');
    try {
      const token = getToken();
      const priorities = items['top-goals'].map((goal, index) => ({
        rank: index + 1,
        goal_id: goal.id,
        goal_name: goal.content,
      }));

      await axios.post(
        `${BACKEND_URL}/api/priorities/save`,
        { priorities },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSaveMessage('Priorities saved!');
    } catch (error) {
      console.error('Failed to save priorities:', error);
      setSaveMessage('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const getItemById = (id) =>
    items['available-goals'].find((goal) => goal.id === id) ||
    items['top-goals'].find((goal) => goal.id === id);

  const handleDragEnd = ({ active, over }) => {
    setActiveId(null);
    if (!over) return;

    const activeContainer = active.data.current.sortable.containerId;
    const overContainer = over.data.current?.sortable.containerId || over.id;

    if (activeContainer !== overContainer) {
      if (items['top-goals'].length >= 5 && overContainer === 'top-goals') return;

      const activeItems = items[activeContainer];
      const overItems = items[overContainer];
      const activeIndex = activeItems.findIndex((item) => item.id === active.id);
      const overIndex =
        over.id in items ? overItems.length : overItems.findIndex((item) => item.id === over.id);

      setItems((prev) => ({
        ...prev,
        [activeContainer]: prev[activeContainer].filter((item) => item.id !== active.id),
        [overContainer]: [
          ...prev[overContainer].slice(0, overIndex),
          activeItems[activeIndex],
          ...prev[overContainer].slice(overIndex),
        ],
      }));
    } else {
      const activeIndex = items[activeContainer].findIndex((item) => item.id === active.id);
      const overIndex = items[overContainer].findIndex((item) => item.id === over.id);

      if (activeIndex !== overIndex) {
        setItems((prev) => ({
          ...prev,
          [overContainer]: arrayMove(prev[overContainer], activeIndex, overIndex),
        }));
      }
    }
  };

  const handleDragStart = ({ active }) => setActiveId(active.id);
  const handleDragCancel = () => setActiveId(null);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 ml-20 overflow-y-auto">
      <div className="flex flex-col items-center py-10 px-4">
        <div className="w-full max-w-4xl bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-3xl font-bold text-center text-gray-800">Your Wellness Priorities</h1>
          <p className="text-center text-gray-500 mt-2 mb-8">Rank your top 5 wellness goals.</p>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragCancel={handleDragCancel}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <AvailableGoalsContainer items={items['available-goals']} />
              <TopGoalsContainer items={items['top-goals']} />
            </div>
            <DragOverlay>
              {activeId ? <DragItem {...getItemById(activeId)} /> : null}
            </DragOverlay>
          </DndContext>

          <div className="text-center mt-8">
            {saveMessage && (
              <p className={`mb-3 text-sm ${saveMessage.includes('Failed') ? 'text-red-500' : 'text-green-600'}`}>
                {saveMessage}
              </p>
            )}
            <button
              onClick={handleDone}
              disabled={saving}
              className="bg-black text-white font-bold py-3 px-8 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Done'}
            </button>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

// --- Available Goals Container ---
const AvailableGoalsContainer = ({ items }) => {
  const { setNodeRef } = useDroppable({ id: 'available-goals' });

  return (
    <div ref={setNodeRef} className="bg-gray-100 p-4 rounded-lg min-h-[400px]">
      <h2 className="text-xl font-semibold mb-4 text-gray-700">Available Goals</h2>
      <SortableContext
        id="available-goals"
        items={items.map((goal) => goal.id)}
        strategy={verticalListSortingStrategy}
      >
        {items.map((goal, index) => (
          <SortableItem
            key={goal.id}
            id={goal.id}
            content={goal.content}
            icon={goal.icon}
            index={index}
            isTopGoal={false}
          />
        ))}
      </SortableContext>
    </div>
  );
};

// --- Top Goals Container ---
const TopGoalsContainer = ({ items }) => {
  const { setNodeRef } = useDroppable({ id: 'top-goals' });

  return (
    <div ref={setNodeRef} className="border-2 border-dashed rounded-lg p-4 min-h-[400px] border-gray-300">
      <h2 className="text-xl font-semibold mb-4 text-gray-700">Your Top 5 Goals</h2>
      <SortableContext
        id="top-goals"
        items={items.map((goal) => goal.id)}
        strategy={verticalListSortingStrategy}
      >
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-start h-full text-gray-400 pt-5">
            <FaHandPointer className="text-4xl mb-2" />
            <p>Drag goals here to rank them</p>
          </div>
        ) : (
          items.map((goal, index) => (
            <SortableItem
              key={goal.id}
              id={goal.id}
              content={goal.content}
              icon={goal.icon}
              index={index}
              isTopGoal={true}
            />
          ))
        )}
      </SortableContext>
    </div>
  );
};

export default WellnessPriorities;
