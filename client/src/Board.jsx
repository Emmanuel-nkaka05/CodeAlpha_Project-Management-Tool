import { useEffect, useState } from "react";
import { useParams } from "react-router-dom"; // <--- The magic hook
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import api from "./api";
import { connectSocket, closeSocket, getSocket } from "./socket";
import TaskModal from "./TaskModal";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const COLUMNS = {
  "todo": { name: "To Do", color: "bg-[#9D2620] border-[#7a1d18] text-white" },
  "in-progress": { name: "In Progress", color: "bg-[#0B2340] border-[#08182c] text-white" },
  "done": { name: "Done", color: "bg-[#4E5A28] border-[#3d4720] text-white" },
};

function Board() {
  const { id } = useParams(); // <--- Grabs the ID from the URL automatically!
  const [tasks, setTasks] = useState([]);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [selectedTask, setSelectedTask] = useState(null);
  const [inviteUsername, setInviteUsername] = useState("");

  const updateTaskInState = (taskId, newStatus) => {
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)));
  };

  useEffect(() => {
    if (!id) return; // Wait for the ID to load

    // Fetch tasks for this specific project ID
    api.get(`tasks/?project=${id}`).then((res) => setTasks(res.data)).catch(console.error);
    
    // Connect WebSocket
    const ws = connectSocket(id);
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "TASK_MOVED") {
        updateTaskInState(data.taskId, data.newStatus);
        if (selectedTask && selectedTask.id === data.taskId) {
          setSelectedTask(prev => ({ ...prev, status: data.newStatus }));
        }
      } else if (data.type === "NEW_TASK") {
        setTasks((prev) => [...prev, data.task]);
      }
    };
    return () => closeSocket();
  }, [id, selectedTask]);

  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;
    if (!destination || destination.droppableId === source.droppableId) return;
    
    const taskId = parseInt(draggableId);
    const newStatus = destination.droppableId;
    updateTaskInState(taskId, newStatus);
    
    try {
      await api.patch(`tasks/${taskId}/`, { status: newStatus });
      const ws = getSocket();
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: "TASK_MOVED", taskId: taskId, newStatus: newStatus }));
      }
    } catch (err) { console.error(err); }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    try {
      const res = await api.post("tasks/", { title: newTaskTitle, project: id, status: "todo" });
      setTasks([...tasks, res.data]);
      setNewTaskTitle("");
      const ws = getSocket();
      if (ws && ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify({ type: "NEW_TASK", task: res.data }));
    } catch (err) { console.error(err); }
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!inviteUsername.trim()) return;
    try {
      await api.patch(`projects/${id}/`, { add_member: inviteUsername });
      toast.success(`${inviteUsername} added to the project!`);
      setInviteUsername("");
    } catch (err) { toast.error("Could not add user. Do they exist?"); }
  };

  const tasksByStatus = Object.keys(COLUMNS).reduce((acc, status) => {
    acc[status] = tasks.filter((t) => t.status === status);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-[#1A1A1A] p-8">
      <ToastContainer position="bottom-right" autoClose={3000} theme="dark" />
      
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-black text-white tracking-tight">Project Board</h1>
          <a href="/dashboard" className="text-[#D37627] font-bold hover:text-white transition-colors">
            ← Back to Dashboard
          </a>
        </div>

        <div className="mb-8 bg-[#222222] p-4 rounded-xl border border-[#333333] flex items-center gap-4 shadow-lg">
          <label className="font-bold text-gray-300 uppercase tracking-wide text-sm">Invite Member:</label>
          <form onSubmit={handleInvite} className="flex gap-2 flex-1">
            <input type="text" placeholder="Enter username..." className="bg-[#111111] border border-[#333] text-white p-3 rounded-lg flex-1 outline-none focus:border-[#D37627] transition-colors" value={inviteUsername} onChange={(e) => setInviteUsername(e.target.value)} />
            <button className="bg-[#D37627] text-white px-6 py-2 rounded-lg font-bold hover:bg-[#b8621f] shadow transition-colors">Invite</button>
          </form>
        </div>

        <form onSubmit={handleCreateTask} className="flex gap-4 mb-8">
          <input type="text" placeholder="Add a new task..." className="flex-1 bg-[#222222] border border-[#333] text-white p-4 rounded-xl shadow-sm focus:border-[#D37627] outline-none transition-colors" value={newTaskTitle} onChange={(e) => setNewTaskTitle(e.target.value)} />
          <button className="bg-[#D37627] text-white px-8 py-4 rounded-xl font-black uppercase tracking-wider hover:bg-[#b8621f] shadow-lg transition-transform transform hover:-translate-y-0.5">Add Task</button>
        </form>

        <DragDropContext onDragEnd={onDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.entries(COLUMNS).map(([statusId, column]) => (
              <div key={statusId} className={`${column.color} p-4 rounded-xl border shadow-xl h-[70vh] overflow-y-auto`}>
                <h2 className="font-black text-xl mb-4 text-white uppercase tracking-widest border-b border-white/20 pb-2">{column.name}</h2>
                <Droppable droppableId={statusId}>
                  {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef} className="min-h-[50px]">
                      {tasksByStatus[statusId].map((task, index) => (
                        <Draggable key={task.id} draggableId={task.id.toString()} index={index}>
                          {(provided) => (
                            <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} onClick={() => setSelectedTask(task)} className="bg-white text-gray-900 p-5 mb-3 rounded-lg shadow-md border-l-4 border-[#D37627] cursor-pointer active:cursor-grabbing hover:shadow-lg transition-all">
                              <h3 className="font-bold text-lg">{task.title}</h3>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            ))}
          </div>
        </DragDropContext>
        
        {selectedTask && (
          <TaskModal 
            task={selectedTask} 
            onClose={() => setSelectedTask(null)} 
            updateTaskInState={updateTaskInState} 
          />
        )}
      </div>
    </div>
  );
}
export default Board;