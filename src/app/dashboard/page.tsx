"use client";

import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadLogs();
  }, []);

  async function loadLogs() {
    const { data, error } = await supabase
      .from("logs")
      .select("*")
      .order("date", { ascending: false });

    if (error) {
      console.error("Load failed:", error.message);
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
    setSubmitting(true);

    const { error } = await supabase.from("logs").insert([
      {
        tool: form.tool,
        task: form.task,
        time_saved: Number(form.timeSaved),
        date: new Date().toISOString().split("T")[0],
      },
    ]);

    setSubmitting(false);

    if (error) {
      console.error("Insert failed:", error.message);
      return;
    }

    await loadLogs();
    setForm({ tool: "", task: "", timeSaved: "" });
  }

  const statCards = [
    { label: "Tasks Logged", value: stats.total_tasks, suffix: "" },
    { label: "Time Saved", value: stats.total_time_saved, suffix: "min" },
    { label: "Unique Tools", value: stats.unique_tools, suffix: "" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-6 py-12">

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight">AI Usage Log</h1>
          <p className="text-muted-foreground mt-1">How is the world using AI? Add your entry.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          {statCards.map((s) => (
            <Card key={s.label}>
              <CardHeader className="pb-1">
                <CardTitle className="text-sm font-medium text-muted-foreground">{s.label}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{s.value.toLocaleString()}<span className="text-sm font-normal text-muted-foreground ml-1">{s.suffix}</span></p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Form */}
        <Card className="mb-10">
          <CardHeader>
            <CardTitle className="text-base">Log Your AI Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="tool">Tool name</Label>
                <Input
                  id="tool"
                  placeholder="e.g. ChatGPT, Claude, Copilot"
                  value={form.tool}
                  onChange={(e) => setForm({ ...form, tool: e.target.value })}
                  maxLength={50}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="task">What did you use it for?</Label>
                <Input
                  id="task"
                  placeholder="e.g. Wrote a unit test, summarized a doc"
                  value={form.task}
                  onChange={(e) => setForm({ ...form, task: e.target.value })}
                  maxLength={120}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="time">Time saved (minutes)</Label>
                <Input
                  id="time"
                  type="number"
                  placeholder="e.g. 30"
                  value={form.timeSaved}
                  onChange={(e) => setForm({ ...form, timeSaved: e.target.value })}
                  min={1}
                  max={600}
                  required
                />
              </div>
              <Button type="submit" disabled={submitting} className="w-full">
                {submitting ? "Submitting…" : "Submit"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Log Table */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Recent Entries</h2>
          <div className="space-y-2">
            {logs.map((row, i) => (
              <div key={i} className="flex items-start justify-between rounded-lg border px-4 py-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{row.tool}</Badge>
                    <span className="text-sm text-muted-foreground">{row.date}</span>
                  </div>
                  <p className="text-sm">{row.task}</p>
                </div>
                <span className="text-sm font-medium whitespace-nowrap ml-4">{row.time_saved}m saved</span>
              </div>
            ))}
            {logs.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">No entries yet. Be the first!</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
