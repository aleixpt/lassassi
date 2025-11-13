"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function useNotifications() {
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data } = await supabase.auth.getSession();
      const uid = data?.session?.user?.id;
      if (!uid) return;

      // load existing notifications (join via players -> player_id)
      const { data: nots } = await supabase
        .from("notifications")
        .select("*")
        .eq("player_id", uid)
        .order("created_at", { ascending: false })
        .limit(50);

      if (mounted) setNotifications(nots || []);

      // subscribe realtime
      const channel = supabase
        .channel(`notifications-player-${uid}`)
        .on("postgres_changes", { event: "*", schema: "public", table: "notifications", filter: `player_id=eq.${uid}` }, (payload) => {
          setNotifications(prev => [payload.new, ...prev]);
        })
        .subscribe();

      return () => {
        mounted = false;
        supabase.removeChannel(channel);
      };
    })();
  }, []);

  return { notifications, setNotifications };
}
