import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";

function App() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [score, setScore] = useState("");
  const [date, setDate] = useState("");
  const [recentScores, setRecentScores] = useState([]);
  const [charities, setCharities] = useState([]);
  const [selectedCharity, setSelectedCharity] = useState("");
  const [allScores, setAllScores] = useState([]);

  useEffect(() => {
    fetchCharities();
  }, []);

  const fetchCharities = async () => {
    const { data } = await supabase.from("charities").select("*");
    setCharities(data || []);
  };

  const fetchScores = async (userId) => {
    const { data } = await supabase
      .from("scores")
      .select("*")
      .eq("user_id", userId)
      .order("date", { ascending: false });
    setRecentScores(data || []);
  };

  const fetchAllDataForAdmin = async () => {
    const { data } = await supabase.from("scores").select("*").order("date", { ascending: false });
    setAllScores(data || []);
  };

  const handleSimpleLogin = async (e) => {
    e.preventDefault();
    const email = emailInput.toLowerCase();
    
    if (email === "admin@srec.ac.in") {
      setIsAdmin(true);
      setUser({ email: email });
      fetchAllDataForAdmin();
    } else if (email.includes("@")) {
      setIsAdmin(false); // User login-na admin false-ah irukanum
      const userId = '07e84b69-532b-4353-a50b-72ceaf893463';
      setUser({ email: email, id: userId });
      fetchScores(userId);
    } else {
      alert("Valid email podunga!");
    }
  };

  const handleScoreSubmit = async (e) => {
    e.preventDefault();
    const scoreVal = parseInt(score);
    if (scoreVal < 1 || scoreVal > 45) return alert("Score 1-45 kulla irukanum!");

    const { data: current } = await supabase
      .from("scores")
      .select("id")
      .eq("user_id", user.id)
      .order("date", { ascending: true });

    if (current && current.length >= 5) {
      await supabase.from("scores").delete().eq("id", current[0].id);
    }

    const { error } = await supabase.from("scores").insert([
      { user_id: user.id, score: scoreVal, date: date }
    ]);

    if (error) alert("Intha date-la already oru score irukku!");
    else {
      alert("Score saved successfully! 🔥");
      setScore(""); setDate(""); fetchScores(user.id);
    }
  };

  // 1. LOGIN SCREEN (If not logged in)
  if (!user) {
    return (
      <div style={{ backgroundColor: "#121212", minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center", color: "white", fontFamily: 'Segoe UI' }}>
        <div style={{ background: "#1e1e1e", padding: "40px", borderRadius: "15px", border: "1px solid #00ff88", width: "350px", textAlign: 'center' }}>
          <h1 style={{ color: "#00ff88" }}>Digital Heroes</h1>
          <form onSubmit={handleSimpleLogin}>
            <input type="email" placeholder="Email Address" value={emailInput} onChange={(e) => setEmailInput(e.target.value)} required 
              style={{ padding: "12px", width: "100%", marginBottom: "20px", borderRadius: "8px", border: "1px solid #333", background: "#121212", color: "white" }} />
            <button type="submit" style={{ background: "#00ff88", color: "black", border: "none", padding: "12px", fontWeight: "bold", cursor: "pointer", width: "100%", borderRadius: "8px" }}>
              Enter Dashboard
            </button>
          </form>
        </div>
      </div>
    );
  }

  // 2. ADMIN PANEL (If logged in as admin)
  if (isAdmin) {
    return (
      <div style={{ backgroundColor: "#121212", color: "white", minHeight: "100vh", padding: "40px", fontFamily: 'Segoe UI' }}>
        <h1 style={{ color: "#00ff88" }}>Admin Control Panel</h1>
        <p>Viewing all scores from the database [cite: 135]</p>
        <div style={{ background: "#1e1e1e", padding: "30px", borderRadius: "15px" }}>
          <table style={{ width: "100%", textAlign: "left", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #333", color: "#00ff88" }}>
                <th style={{ padding: "10px" }}>User Email (ID)</th>
                <th>Score</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {allScores.map(s => (
                <tr key={s.id} style={{ borderBottom: "1px solid #222" }}>
                  <td style={{ padding: "10px", fontSize: "12px" }}>{s.user_id}</td>
                  <td>{s.score}</td>
                  <td>{s.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button onClick={() => {setUser(null); setIsAdmin(false);}} style={{ marginTop: "20px", background: "#ff4444", border: "none", padding: "10px 20px", color: "white", borderRadius: "8px", cursor: "pointer" }}>Logout</button>
      </div>
    );
  }

  // 3. USER DASHBOARD (If logged in as normal user)
  return (
    <div style={{ backgroundColor: "#121212", color: "white", minHeight: "100vh", padding: "40px", fontFamily: 'Segoe UI' }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #333", paddingBottom: "20px", marginBottom: "40px" }}>
        <div>
          <h1 style={{ color: "#00ff88", margin: 0 }}>Dashboard</h1>
          <br></br>
          <p style={{ margin: 0, opacity: 0.6 }}>Welcome back, <strong>{user.email}</strong></p>
        </div>
        <button onClick={() => setUser(null)} style={{ background: "transparent", color: "#ff4444", border: "1px solid #ff4444", padding: "8px 20px", cursor: "pointer", borderRadius: "8px" }}>Logout</button>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "30px" }}>
        {/* Charity Section */}
        <div style={{ background: "#1e1e1e", padding: "30px", borderRadius: "15px" }}>
          <h2 style={{ color: "#00ff88" }}>Charity Selection [cite: 145]</h2>
          <select value={selectedCharity} onChange={(e) => setSelectedCharity(e.target.value)} 
            style={{ width: "100%", padding: "12px", background: "#121212", color: "white", border: "1px solid #333", borderRadius: "8px" }}>
            <option value="">-- Choose a Charity --</option>
            {charities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        {/* Score Entry Section */}
        <div style={{ background: "#1e1e1e", padding: "30px", borderRadius: "15px" }}>
          <h2 style={{ color: "#00ff88" }}>Submit Score [cite: 143]</h2>
          <form onSubmit={handleScoreSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
            <input type="number" placeholder="Stableford Score (1-45)" value={score} onChange={(e) => setScore(e.target.value)} required 
              style={{ padding: "12px", borderRadius: "8px", background: "#121212", color: "white", border: "1px solid #333" }} />
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required 
              style={{ padding: "12px", borderRadius: "8px", background: "#121212", color: "white", border: "1px solid #333" }} />
            <button type="submit" style={{ background: "#00ff88", color: "black", padding: "12px", fontWeight: "bold", borderRadius: "8px", border: "none", cursor: "pointer" }}>Save Performance</button>
          </form>
        </div>
      </div>

      {/* Rolling 5 Display */}
      <div style={{ background: "#1e1e1e", padding: "30px", borderRadius: "15px", marginTop: "30px" }}>
        <h2 style={{ color: "#00ff88" }}>Your Rolling 5 Performance [cite: 45]</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "15px" }}>
          {recentScores.map(s => (
            <div key={s.id} style={{ background: "#121212", padding: "20px", borderRadius: "10px", borderLeft: "4px solid #00ff88", display: "flex", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: "12px", opacity: 0.5 }}>{s.date}</div>
                <div style={{ fontSize: "1.2rem", fontWeight: "bold" }}>{s.score} pts</div>
              </div>
              <div>⛳</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;