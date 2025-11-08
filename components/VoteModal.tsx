// components/VoteModal.tsx
"use client";
import React, { useEffect, useState } from "react";

type Props = { roundId: number; voterPlayerId: string; players: { id: string; name: string }[]; onClose: () => void };

export default function VoteModal({ roundId, voterPlayerId, players, onClose }: Props) {
  const [timeLeft, setTimeLeft] = useState(60);
  const [most, setMost] = useState<string | null>(null);
  const [least, setLeast] = useState<string | null>(null);

  useEffect(() => {
    const t = setInterval(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (timeLeft <= 0) {
      submitVote();
    }
  }, [timeLeft]);

  const submitVote = async () => {
    try {
      await fetch("/api/record-vote", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ roundId, voterPlayerId, trustMostPlayerId: most, trustLeastPlayerId: least }),
      });
      onClose();
    } catch (err) {
      console.error(err);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50">
      <div className="bg-white p-4 rounded-md w-11/12 max-w-md">
        <h3 className="text-lg font-bold mb-2">Votació — Temps restant: {timeLeft}s</h3>
        <div className="grid grid-cols-1 gap-2 max-h-64 overflow-auto">
          {players.map((p) => (
            <div key={p.id} className="flex items-center justify-between p-2 border rounded">
              <span>{p.name}</span>
              <div className="flex gap-2">
                <button className={`px-2 py-1 border ${most === p.id ? "bg-green-100" : ""}`} onClick={() => setMost(p.id)}>
                  +Confiança
                </button>
                <button className={`px-2 py-1 border ${least === p.id ? "bg-red-100" : ""}`} onClick={() => setLeast(p.id)}>
                  -Confiança
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <button className="btn" onClick={submitVote}>Votar ara</button>
        </div>
      </div>
    </div>
  );
}
