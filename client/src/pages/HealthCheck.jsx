import { useEffect, useState } from "react";
import api from "../services/api";

export default function HealthCheck() {
  const [result, setResult] = useState("Checking backend...");
  const [error, setError] = useState(false);

  useEffect(() => {
    api.get("/api/health")
      .then(({ data }) => setResult(data.message))
      .catch(() => {
        setError(true);
        setResult("Cannot connect to the backend.");
      });
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 p-10 text-white">
      <h1 className="text-3xl font-bold">CareerLaunch</h1>
      <p className="mt-4">Backend connection test</p>
      <p className={`mt-3 ${error ? "text-red-400" : "text-emerald-400"}`}>
        {result}
      </p>
    </main>
  );
}