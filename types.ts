
export interface Task {
  id: string;
  title: string;
  completed: boolean;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  deadline: string; // ISO String
  lastRevision: string; // ISO String
  tasks: Task[];
}

export interface ProjectStats {
  name: string;
  progress: number;
}
