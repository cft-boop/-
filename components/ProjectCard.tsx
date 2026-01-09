
import React, { useState } from 'react';
import { Project, Task } from '../types.ts';
import { formatToKST, getCurrentISO } from '../utils/dateUtils.ts';
import { generateSuggestedTasks } from '../services/geminiService.ts';

interface ProjectCardProps {
  project: Project;
  onUpdateProject: (updatedProject: Project) => void;
  onDeleteProject: (id: string) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onUpdateProject, onDeleteProject }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState(project);

  const calculateProgress = () => {
    if (project.tasks.length === 0) return 0;
    const completedCount = project.tasks.filter(t => t.completed).length;
    return Math.round((completedCount / project.tasks.length) * 100);
  };

  const toggleTask = (taskId: string) => {
    const updatedTasks = project.tasks.map(t => 
      t.id === taskId ? { ...t, completed: !t.completed } : t
    );
    onUpdateProject({ ...project, tasks: updatedTasks, lastRevision: getCurrentISO() });
  };

  const handleAiSuggest = async () => {
    setIsGenerating(true);
    const suggestions = await generateSuggestedTasks(project.name, project.description);
    if (suggestions.length > 0) {
      const newTasks: Task[] = suggestions.map(s => ({
        id: crypto.randomUUID(),
        title: s.title,
        completed: false
      }));
      onUpdateProject({ 
        ...project, 
        tasks: [...project.tasks, ...newTasks],
        lastRevision: getCurrentISO() 
      });
    }
    setIsGenerating(false);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProject({ ...editForm, lastRevision: getCurrentISO() });
    setIsEditing(false);
  };

  const progress = calculateProgress();

  if (isEditing) {
    return (
      <div className="bg-white p-6 rounded-2xl border-2 border-blue-100 shadow-xl">
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700">Project Name</label>
            <input 
              type="text" 
              value={editForm.name}
              onChange={(e) => setEditForm({...editForm, name: e.target.value})}
              className="w-full mt-1 p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700">Deadline (KST Selection)</label>
            <input 
              type="datetime-local" 
              value={editForm.deadline.substring(0, 16)}
              onChange={(e) => setEditForm({...editForm, deadline: new Date(e.target.value).toISOString()})}
              className="w-full mt-1 p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              required
            />
          </div>
          <div className="flex space-x-3">
            <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition">Save Changes</button>
            <button type="button" onClick={() => setIsEditing(false)} className="flex-1 bg-slate-100 text-slate-600 py-2 rounded-lg font-medium hover:bg-slate-200 transition">Cancel</button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition group h-full flex flex-col">
      <div className="p-6 flex-1">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h4 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition">{project.name}</h4>
            <p className="text-sm text-slate-500 mt-1 line-clamp-1">{project.description}</p>
          </div>
          <div className="flex space-x-1">
            <button onClick={() => setIsEditing(true)} className="p-2 text-slate-400 hover:text-blue-500 transition">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
            </button>
            <button onClick={() => onDeleteProject(project.id)} className="p-2 text-slate-400 hover:text-red-500 transition">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </button>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex justify-between text-xs font-bold mb-2">
            <span className="text-slate-600 uppercase tracking-tighter">Current Progress</span>
            <span className={`${progress === 100 ? 'text-green-600' : 'text-blue-600'}`}>{progress}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 ease-out ${progress === 100 ? 'bg-green-500' : 'bg-blue-500'}`} 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        <div className="space-y-3 mb-6 max-h-[160px] overflow-y-auto pr-2 custom-scrollbar">
          <h5 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Tasks & Checklist</h5>
          {project.tasks.length === 0 ? (
            <p className="text-sm text-slate-400 italic">No tasks assigned yet.</p>
          ) : (
            project.tasks.map(task => (
              <div key={task.id} className="flex items-center space-x-3 p-2 rounded-lg bg-slate-50 border border-slate-100 hover:border-blue-200 transition group/task">
                <input 
                  type="checkbox" 
                  checked={task.completed} 
                  onChange={() => toggleTask(task.id)}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <span className={`text-sm flex-1 ${task.completed ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                  {task.title}
                </span>
              </div>
            ))
          )}
        </div>

        <button 
          onClick={handleAiSuggest}
          disabled={isGenerating}
          className="w-full py-2 px-4 rounded-xl border border-indigo-200 text-indigo-600 text-sm font-semibold hover:bg-indigo-50 transition flex items-center justify-center space-x-2 disabled:opacity-50"
        >
          {isGenerating ? (
            <span className="animate-pulse">Thinking...</span>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              <span>AI Suggest Tasks</span>
            </>
          )}
        </button>
      </div>

      <div className="bg-slate-50 border-t border-slate-100 px-6 py-4 flex flex-col space-y-1">
        <div className="flex justify-between items-center text-[10px] text-slate-400">
          <span className="font-semibold uppercase">Deadline (KST)</span>
          <span className="text-slate-600">{formatToKST(project.deadline)}</span>
        </div>
        <div className="flex justify-between items-center text-[10px] text-slate-400">
          <span className="font-semibold uppercase">Last Revised (KST)</span>
          <span className="text-slate-600">{formatToKST(project.lastRevision)}</span>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
