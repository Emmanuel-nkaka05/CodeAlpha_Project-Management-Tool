import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "./api";
import NotificationBell from "./NotificationBell";

function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [stats, setStats] = useState({ totalTasks: 0, completedTasks: 0 });
  const [title, setTitle] = useState("");
  const navigate = useNavigate(); // <--- Hook for navigation

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    api.get("projects/").then((res) => setProjects(res.data)).catch(console.error);
    api.get("tasks/").then((res) => {
      const allTasks = res.data;
      const completed = allTasks.filter(t => t.status === "done").length;
      setStats({ totalTasks: allTasks.length, completedTasks: completed });
    }).catch(console.error);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("projects/", { title, description: "" });
      setProjects([...projects, res.data]);
      setTitle("");
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation(); 
    if (!window.confirm("Are you sure you want to delete this project?")) return;
    try {
      await api.delete(`projects/${id}/`);
      setProjects(projects.filter(p => p.id !== id));
      fetchData();
    } catch (err) { alert("Failed to delete project. Are you the owner?"); }
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    navigate("/"); // <--- Use navigate instead of window.location
  };

  return (
    <div className="min-h-screen bg-[#1A1A1A] p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-10 border-b border-[#333] pb-6">
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">Project Management Tool</h1>
          <div className="flex gap-6 items-center">
            <NotificationBell />
            <button onClick={handleLogout} className="bg-[#9D2620] text-white px-6 py-2 rounded-lg font-bold hover:bg-[#7a1d18] shadow transition-colors">Logout</button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-[#222222] p-6 rounded-2xl border-l-4 border-[#D37627] shadow-lg">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Total Projects</h3>
            <p className="text-5xl font-black text-white mt-2">{projects.length}</p>
          </div>
          <div className="bg-[#222222] p-6 rounded-2xl border-l-4 border-[#D37627] shadow-lg">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Total Tasks</h3>
            <p className="text-5xl font-black text-white mt-2">{stats.totalTasks}</p>
          </div>
          <div className="bg-[#222222] p-6 rounded-2xl border-l-4 border-[#D37627] shadow-lg">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Tasks Completed</h3>
            <p className="text-5xl font-black text-white mt-2">{stats.completedTasks}</p>
          </div>
        </div>
        
        <form onSubmit={handleCreate} className="flex flex-col md:flex-row gap-4 mb-10">
          <input type="text" placeholder="New project title..." className="flex-1 bg-[#222222] border border-[#333] text-white p-4 rounded-xl shadow-sm focus:border-[#D37627] outline-none" value={title} onChange={(e) => setTitle(e.target.value)} required />
          <button className="bg-[#D37627] text-white px-8 py-4 rounded-xl font-black uppercase tracking-wider hover:bg-[#b8621f] shadow-lg transition-transform transform hover:-translate-y-0.5">Create Project</button>
        </form>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div 
              key={project.id} 
              onClick={() => navigate(`/board/${project.id}`)} // <--- Navigates to /board/ID
              className="relative bg-[#222222] p-8 rounded-2xl shadow-lg border border-[#333] cursor-pointer hover:border-[#D37627] transition-all transform hover:-translate-y-1 group"
            >
              <button 
                onClick={(e) => handleDelete(e, project.id)}
                className="absolute top-4 right-4 text-gray-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </button>
              <h3 className="text-2xl font-black text-white group-hover:text-[#D37627] transition-colors pr-8">{project.title}</h3>
              <p className="text-gray-400 text-sm mt-3">{project.description || "No description"}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
export default Dashboard;