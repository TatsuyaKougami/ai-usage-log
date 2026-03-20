"use client";

import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";

type Log = {
  tool: string;
  task: string;
  time_saved: number;
  date: string;
};

type Stats = {
  total_tasks: number;
  total_time_saved: number;
  unique_tools: number;
};

export default function Dashboard() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [stats, setStats] = useState<Stats>({ total_tasks: 0, total_time_saved: 0, unique_tools: 0 });
  const [form, setForm] = useState({ tool: "", task: "", timeSaved: "" });

  useEffect(() => {
    loadLogs();
  }, []);

  async function loadLogs() {
    const { data, error } = await supabase
      .from("logs")
      .select("*")
      .order("date", { ascending: false });

    if (error) {
      alert(`Load failed: ${error.message}`);
      return;
    }

    const rows: Log[] = data || [];
    setLogs(rows);
    setStats({
      total_tasks: rows.length,
      total_time_saved: rows.reduce((sum, r) => sum + r.time_saved, 0),
      unique_tools: new Set(rows.map((r) => r.tool.toLowerCase())).size,
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const { error } = await supabase.from("logs").insert([
      {
        tool: form.tool,
        task: form.task,
        time_saved: Number(form.timeSaved),
        date: new Date().toISOString().split("T")[0],
      },
    ]);

    if (error) {
      alert(`Insert failed: ${error.message}`);
      return;
    }

    await loadLogs();
    setForm({ tool: "", task: "", timeSaved: "" });
  }

  const statCards = [
    { label: "AI Tasks Logged", value: stats.total_tasks },
    { label: "Time Saved (minutes)", value: stats.total_time_saved },
    { label: "Unique Tools", value: stats.unique_tools },
  ];

  return (
    <main style={{ padding: "2rem", fontFamily: "sans-serif", maxWidth: 800 }}>
      <h1>AI Usage Log</h1>
      <p style={{ color: "#555" }}>How is the world using AI? Add your entry.</p>

      <section style={{ marginTop: "1.5rem" }}>
        <h2>Overview</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem", marginTop: "1rem" }}>
          {statCards.map((s) => (
            <div key={s.label} style={{ border: "1px solid #ddd", borderRadius: 8, padding: "1rem", textAlign: "center" }}>
              <div style={{ fontSize: "2rem", fontWeight: "bold" }}>{s.value}</div>
              <div style={{ fontSize: "0.85rem", color: "#555" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ marginTop: "2rem" }}>
        <h2>Log Your AI Usage</h2>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginTop: "1rem", maxWidth: 400 }}>
          <input
            placeholder="Tool name (e.g. ChatGPT, Claude)"
            value={form.tool}
            onChange={(e) => setForm({ ...form, tool: e.target.value })}
            maxLength={50}
            required
            style={{ padding: "0.5rem", border: "1px solid #ddd", borderRadius: 4 }}
          />
          <input
            placeholder="What did you use it for?"
            value={form.task}
            onChange={(e) => setForm({ ...form, task: e.target.value })}
            maxLength={120}
            required
            style={{ padding: "0.5rem", border: "1px solid #ddd", borderRadius: 4 }}
          />
          <input
            type="number"
            placeholder="Time saved (minutes)"
            value={form.timeSaved}
            onChange={(e) => setForm({ ...form, timeSaved: e.target.value })}
            min={1}
            max={600}
            required
            style={{ padding: "0.5rem", border: "1px solid #ddd", borderRadius: 4 }}
          />
          <button type="submit" style={{ padding: "0.5rem", cursor: "pointer" }}>Submit</button>
        </form>
      </section>

      <section style={{ marginTop: "2rem" }}>
        <h2>Recent Entries</h2>
        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "1rem" }}>
          <thead>
            <tr style={{ textAlign: "left", borderBottom: "1px solid #ddd" }}>
              <th style={{ padding: "0.5rem" }}>Tool</th>
              <th style={{ padding: "0.5rem" }}>Task</th>
              <th style={{ padding: "0.5rem" }}>Time Saved</th>
              <th style={{ padding: "0.5rem" }}>Date</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((row, i) => (
              <tr key={i} style={{ borderBottom: "1px solid #eee" }}>
                <td style={{ padding: "0.5rem" }}>{row.tool}</td>
                <td style={{ padding: "0.5rem" }}>{row.task}</td>
                <td style={{ padding: "0.5rem" }}>{row.time_saved}m</td>
                <td style={{ padding: "0.5rem" }}>{row.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}
