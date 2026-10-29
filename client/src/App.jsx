import { useState } from "react";
import api from "./api";

function App() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      if (isLogin) {
        const response = await api.post("auth/login/", { username, password });
        localStorage.setItem("access_token", response.data.access);
        localStorage.setItem("refresh_token", response.data.refresh);
        window.location.href = "/dashboard";
      } else {
        await api.post("auth/register/", { username, email, password });
        alert("Account created successfully! Please log in.");
        setIsLogin(true);
      }
    } catch (err) {
      if (err.response && err.response.data) {
        setError(JSON.stringify(err.response.data));
      } else {
        setError("An error occurred. Please try again.");
      }
    }
  };

  return (
    // Dark background with a subtle radial gradient
    <div className="flex items-center justify-center min-h-screen bg-[#1A1A1A] p-4">
      <div className="bg-[#222222] p-10 rounded-2xl shadow-2xl w-full max-w-md border border-[#333]">
        <h2 className="text-3xl font-black mb-2 text-center text-white tracking-tight">
          Project Management Tool
        </h2>
        <p className="text-center text-gray-400 mb-8 font-medium">
          {isLogin ? "Welcome back! Please login." : "Create a new account."}
        </p>
        
        {error && <div className="bg-red-900/50 text-red-400 p-3 rounded-lg mb-4 text-sm text-center border border-red-900">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-5">
            <label className="block text-sm font-bold text-[#D37627] mb-2 uppercase tracking-widest">Username</label>
            <input
              type="text"
              className="w-full bg-[#111111] border border-[#444] text-white p-3 rounded-lg focus:outline-none focus:border-[#D37627] transition-colors"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          {!isLogin && (
            <div className="mb-5">
              <label className="block text-sm font-bold text-[#D37627] mb-2 uppercase tracking-widest">Email</label>
              <input
                type="email"
                className="w-full bg-[#111111] border border-[#444] text-white p-3 rounded-lg focus:outline-none focus:border-[#D37627] transition-colors"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          )}

          <div className="mb-6">
            <label className="block text-sm font-bold text-[#D37627] mb-2 uppercase tracking-widest">Password</label>
            <input
              type="password"
              className="w-full bg-[#111111] border border-[#444] text-white p-3 rounded-lg focus:outline-none focus:border-[#D37627] transition-colors"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {isLogin && (
            <div className="flex justify-end mb-6">
              <button type="button" onClick={() => alert("Forgot password feature coming soon!")} className="text-sm text-[#D37627] hover:text-white transition-colors">
                Forgot password?
              </button>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-[#D37627] text-white p-4 rounded-lg font-black uppercase tracking-wider hover:bg-[#b8621f] shadow-lg transition-transform transform hover:-translate-y-0.5"
          >
            {isLogin ? "Login" : "Register"}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-400">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <button onClick={() => setIsLogin(!isLogin)} className="text-[#D37627] font-bold hover:text-white transition-colors">
              {isLogin ? "Sign up" : "Login"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;