import { useState, useEffect } from "react";
import api from "./api";
import { getSocket } from "./socket";
import { toast } from "react-toastify";

export default function TaskModal({ task, onClose, updateTaskInState }) {
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState(task.comments || []);
  const [description, setDescription] = useState(task.description || "");
  const [status, setStatus] = useState(task.status);

  useEffect(() => {
    const ws = getSocket();
    if (!ws) return;
    const handleMessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "NEW_COMMENT" && data.taskId === task.id) {
        setComments((prev) => [...prev, data.comment]);
        toast.info(`New comment from ${data.comment.author.username}`);
      }
    };
    ws.addEventListener("message", handleMessage);
    return () => ws.removeEventListener("message", handleMessage);
  }, [task.id]);

  const handleSaveDescription = async () => {
    try {
      await api.patch(`tasks/${task.id}/`, { description });
      toast.success("Description saved!");
    } catch (err) { console.error(err); }
  };

  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    setStatus(newStatus);
    updateTaskInState(task.id, newStatus);
    await api.patch(`tasks/${task.id}/`, { status: newStatus });
    const ws = getSocket();
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: "TASK_MOVED", taskId: task.id, newStatus }));
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    try {
      const res = await api.post("comments/", { text: comment, task: task.id });
      setComments([...comments, res.data]);
      setComment("");
      const ws = getSocket();
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: "NEW_COMMENT", taskId: task.id, comment: res.data }));
      }
    } catch (err) { toast.error("Failed to send comment."); }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure?")) return;
    try {
      await api.delete(`tasks/${task.id}/`);
      window.location.reload(); 
    } catch (err) { console.error(err); }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-[#222222] text-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-8 relative border border-[#444]">
        <button onClick={onClose} className="absolute top-6 right-6 text-gray-400 hover:text-white font-bold text-xl bg-[#333] w-10 h-10 rounded-full flex items-center justify-center transition">✕</button>
        <h2 className="text-3xl font-black text-white mb-6 pr-10">{task.title}</h2>

        <div className="mb-6">
          <label className="block text-sm font-bold text-[#D37627] mb-2 uppercase tracking-widest">Status</label>
          <select value={status} onChange={handleStatusChange} className="w-full bg-[#111] border border-[#444] text-white p-3 rounded-lg focus:border-[#D37627] outline-none font-medium appearance-none">
            <option value="todo">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="done">Done</option>
          </select>
        </div>

        <div className="mb-8">
          <label className="block text-sm font-bold text-[#D37627] mb-2 uppercase tracking-widest">Description</label>
          <textarea className="w-full bg-[#111] border border-[#444] text-white p-3 rounded-lg focus:border-[#D37627] outline-none" rows="3" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Add a detailed description..." />
          <div className="flex justify-between mt-3">
            <button onClick={handleSaveDescription} className="bg-[#D37627] text-white px-5 py-2 rounded-lg hover:bg-[#b8621f] text-sm font-bold shadow transition-colors">Save Description</button>
            <button onClick={handleDelete} className="bg-red-900/50 text-red-400 px-5 py-2 rounded-lg hover:bg-red-900 text-sm font-bold border border-red-900/50 transition-colors">Delete Task</button>
          </div>
        </div>

        <div>
          <h3 className="font-black text-white mb-4 text-lg border-b border-[#444] pb-2 uppercase tracking-widest">Comments</h3>
          <div className="space-y-3 mb-5 max-h-48 overflow-y-auto pr-2">
            {comments.length === 0 && <p className="text-sm text-gray-500 italic">No comments yet.</p>}
            {comments.map((c) => (
              <div key={c.id} className="bg-[#111] p-4 rounded-xl border border-[#333] text-sm">
                <span className="font-bold text-[#D37627] block mb-1">{c.author.username}</span>
                <span className="text-gray-300">{c.text}</span>
              </div>
            ))}
          </div>
          <form onSubmit={handleAddComment} className="flex gap-2">
            <input type="text" className="flex-1 bg-[#111] border border-[#444] text-white p-3 rounded-lg focus:border-[#D37627] outline-none text-sm" placeholder="Write a comment..." value={comment} onChange={(e) => setComment(e.target.value)} />
            <button className="bg-[#D37627] text-white px-6 py-2 rounded-lg hover:bg-[#b8621f] font-bold text-sm shadow transition-colors">Send</button>
          </form>
        </div>
      </div>
    </div>
  );
}