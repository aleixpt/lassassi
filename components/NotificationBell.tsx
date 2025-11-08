// components/NotificationBell.tsx
"use client";
import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import useSWR from "swr";

function fetcher(url: string) {
  return fetch(url).then((r) => r.json());
}

export default function NotificationBell({ playerId }: { playerId: string }) {
  const { data, mutate } = useSWR(`/api/get-notifications?playerId=${playerId}`, fetcher);
  const [count, setCount] = useState<number>(0);

  useEffect(() => {
    if (data?.notifications) {
      setCount(data.notifications.filter((n: any) => !n.is_read).length);
    }
  }, [data]);

  useEffect(() => {
    // subscribe to notifications on this player id
    const channel = supabase
      .channel(`notifications:player:${playerId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications", filter: `player_id=eq.${playerId}` },
        (payload) => {
          mutate(); // re-fetch notifications
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [playerId, mutate]);

  if (!data) return <div>...</div>;

  return (
    <div className="relative">
      <button className="p-2 rounded-full border">
        🔔
        {count > 0 && <span className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full px-1 text-xs">{count}</span>}
      </button>
      {/* Podeixes afegir dropdown per veure la llista (data.notifications) */}
    </div>
  );
}
