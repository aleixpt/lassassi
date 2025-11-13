"use client";

import { useState } from "react";
import useNotifications from "../app/hooks/useNotifications";

export default function NotificationBell() {
  const { notifications } = useNotifications();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="p-2 rounded-full bg-muted/20">
        🔔
        {notifications.length > 0 && <span className="ml-2 text-sm">({notifications.filter(n=>!n.is_read).length})</span>}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-card/90 rounded shadow-lg z-50 p-3">
          <h4 className="font-semibold mb-2">Notificacions</h4>
          <div className="space-y-2 max-h-72 overflow-y-auto">
            {notifications.length === 0 && <div className="text-sm text-muted-foreground">No hi ha notificacions</div>}
            {notifications.map((n:any) => (
              <div key={n.id} className="p-2 border-b border-white/5 text-sm">
                <div className="font-medium">{n.message}</div>
                <div className="text-xs text-muted-foreground">{new Date(n.created_at).toLocaleTimeString()}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
