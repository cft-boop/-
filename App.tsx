
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import ProjectCard from './components/ProjectCard';
import ProjectCharts from './components/ProjectCharts';
import { Project, ProjectStats } from './types';
import { getCurrentISO } from './utils/dateUtils';

const STORAGE_KEY = 'workflow_kst_projects';

const App: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', description: '', deadline: '' });

  // Persistence
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setProjects(JSON.parse(saved));
    } else {
      // Mock initial data
      const initialProjects: Project[] = [
        {
          id: '1',
          name: 'Quarterly Financial Report',
          description: 'Consolidated fiscal year data analysis.',
          deadline: new Date(Date.now() + 86400000 * 5).toISOString(),
          lastRevision: getCurrentISO(),
          tasks: [
            { id: '1a', title: 'Collect regional data', completed: true },
            { id: '1b', title: 'Audit entries', completed: false },
            { id: '1c', title: 'Executive summary', completed: false }
          ]
        },
        {
          id: '2',
          name: 'Platform Infrastructure v2',
          description: 'Migrating to cloud-native architecture.',
          deadline: new Date(Date.now() + 86400000 * 12).toISOString(),
          lastRevision: getCurrentISO(),
          tasks: [
            { id: '2a', title: 'Provision clusters', completed: true },
            { id: '2b', title: 'Database replication', completed: true }
          ]
        }
      ];
      setProjects(initialProjects);
    }
  }, []);

  useEffect(() => {
    if (projects.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
    }
  }, [projects]);

  const handleUpdateProject = (updated: Project) => {
    setProjects(prev => prev.map(p => p.id === updated.id ? updated : p));
  };

  const handleDeleteProject = (id: string) => {
    setProjects(prev => prev.filter(p => p.id !== id));
  };

  const handleAddProject = (e: React.FormEvent) => {
    e.preventDefault();
    const project: Project = {
      id: crypto.randomUUID(),
      name: newProject.name,
      description: newProject.description,
      deadline: newProject.deadline ? new Date(newProject.deadline).toISOString() : getCurrentISO(),
      lastRevision: getCurrentISO(),
      tasks: []
    };
    setProjects(prev => [project, ...prev]);
    setShowAddForm(false);
    setNewProject({ name: '', description: '', deadline: '' });
  };

  const projectStats: ProjectStats[] = projects.map(p => {
    const completed = p.tasks.filter(t => t.completed).length;
    const progress = p.tasks.length === 0 ? 0 : Math.round((completed / p.tasks.length) * 100);
    return { name: p.name, progress };
  });

  return (
    <Layout>
      {/* Charts Section */}
      <ProjectCharts data={projectStats} />

      {/* Control Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h3 className="text-xl font-bold text-slate-800">Active Workstreams</h3>
        <button 
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-semibold shadow-lg shadow-blue-200 hover:bg-blue-700 hover:scale-[1.02] transition active:scale-95 flex items-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
          <span>New Project</span>
        </button>
      </div>

      {/* Grid of Projects */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {projects.map(project => (
          <ProjectCard 
            key={project.id} 
            project={project} 
            onUpdateProject={handleUpdateProject} 
            onDeleteProject={handleDeleteProject}
          />
        ))}
      </div>

      {/* Add Project Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-800">Initiate Project</h2>
                <button onClick={() => setShowAddForm(false)} className="text-slate-400 hover:text-slate-600">
                   <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <form onSubmit={handleAddProject} className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-slate-600 mb-1">Title</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Q4 Website Redesign"
                    value={newProject.name}
                    onChange={e => setNewProject({...newProject, name: e.target.value})}
                    className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-600 mb-1">Context / Description</label>
                  <textarea 
                    placeholder="Provide a brief project scope..."
                    value={newProject.description}
                    onChange={e => setNewProject({...newProject, description: e.target.value})}
                    className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none min-h-[100px]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-600 mb-1">Target Deadline (KST)</label>
                  <input 
                    type="datetime-local" 
                    value={newProject.deadline}
                    onChange={e => setNewProject({...newProject, deadline: e.target.value})}
                    className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                </div>
                <button type="submit" className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-slate-800 transition">
                  Create Project
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default App;
