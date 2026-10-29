let socket = null;

export function connectSocket(projectId) {
  // If we already have an open socket, don't create a new one
  if (socket && socket.readyState === WebSocket.OPEN) {
    return socket;
  }

  socket = new WebSocket(`ws://127.0.0.1:8000/ws/project/${projectId}/`);
  
  socket.onopen = () => console.log("✅ WebSocket connected");
  socket.onclose = () => {
    console.log("❌ WebSocket closed");
    socket = null;
  };
  socket.onerror = (e) => console.error("WebSocket error:", e);
  
  return socket;
}

export function getSocket() { 
  return socket; 
}

export function closeSocket() {
  if (socket) { 
    socket.close(); 
    socket = null; 
  }
}