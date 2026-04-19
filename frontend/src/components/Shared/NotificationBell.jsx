import React, { useState, useEffect } from "react";
import { Bell, BellDot, CheckCircle, Clock, Info, X, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getNotifications, markAsRead, markAllAsRead, deleteNotification } from "@/API_Call/Notification";
import { formatDistanceToNow } from "date-fns";
import toast from "react-hot-toast";

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async () => {
    setLoading(true);
    const data = await getNotifications();
    if (data && data.notifications) {
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount || 0);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchNotifications();
    
    // Refresh every 5 minutes (300,000ms)
    const interval = setInterval(() => {
      // Only fetch if the tab is active to save resources
      if (document.visibilityState === 'visible') {
        fetchNotifications();
      }
    }, 600000);
    
    return () => clearInterval(interval);
  }, []);

  const handleMarkAsRead = async (id, e) => {
    e.stopPropagation();
    const res = await markAsRead(id);
    if (res) {
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  const handleMarkAllRead = async () => {
    const res = await markAllAsRead();
    if (res) {
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast.success("All caught up!");
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    const res = await deleteNotification(id);
    if (res) {
      setNotifications(prev => prev.filter(n => n._id !== id));
      const wasUnread = !notifications.find(n => n._id === id)?.isRead;
      if (wasUnread) setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "assignment": return <Clock className="w-4 h-4 text-cyan-500" />;
      case "status_change": return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      case "comment": return <Info className="w-4 h-4 text-blue-500" />;
      default: return <Info className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-10 w-10 rounded-xl hover:bg-slate-100 transition-colors group">
          {unreadCount > 0 ? (
            <BellDot className="h-5 w-5 text-cyan-600 group-hover:scale-110 transition-transform" />
          ) : (
            <Bell className="h-5 w-5 text-gray-500 group-hover:scale-110 transition-transform" />
          )}
          {unreadCount > 0 && (
            <Badge className="absolute -top-0.5 -right-0.5 h-4 min-w-[16px] px-1 bg-red-500 text-white text-[10px] font-black flex items-center justify-center border-2 border-white shadow-sm">
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0 overflow-hidden rounded-2xl shadow-2xl border-gray-100 animate-in zoom-in-95 duration-200">
        <div className="p-4 bg-slate-50 border-b border-gray-100 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-sm font-black text-slate-900 tracking-tight">Notifications</span>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{unreadCount} Unread Messages</span>
          </div>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-[10px] font-bold text-cyan-600 hover:text-cyan-700 hover:bg-cyan-50 h-7 px-2"
              onClick={handleMarkAllRead}
            >
              Mark all as read
            </Button>
          )}
        </div>

        <div className="max-h-[380px] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[300px] text-slate-400 p-6">
              <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-4">
                <Bell className="w-8 h-8 opacity-20" />
              </div>
              <span className="text-sm font-medium">All clear!</span>
              <span className="text-xs text-center mt-1">You're all caught up with your assignments.</span>
            </div>
          ) : (
            <div className="flex flex-col">
              {notifications.map((n) => (
                <div 
                  key={n._id}
                  className={`flex flex-col p-4 border-b border-slate-50 hover:bg-slate-50/50 transition-colors cursor-pointer group ${!n.isRead ? 'bg-cyan-50/20' : ''}`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`mt-1 p-2 rounded-lg ${!n.isRead ? 'bg-white shadow-sm ring-1 ring-cyan-100' : 'bg-slate-100'}`}>
                      {getTypeIcon(n.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className={`text-xs font-black truncate ${!n.isRead ? 'text-slate-900' : 'text-slate-500'}`}>
                          {n.title}
                        </span>
                        <span className="text-[9px] text-slate-400 font-bold whitespace-nowrap uppercase">
                          {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                      <p className={`text-[11px] leading-relaxed mt-0.5 ${!n.isRead ? 'text-slate-600 font-semibold' : 'text-slate-400 font-medium'}`}>
                        {n.message}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-end gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {!n.isRead && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-6 text-[9px] font-bold text-emerald-600 hover:bg-emerald-50"
                        onClick={(e) => handleMarkAsRead(n._id, e)}
                      >
                        Read
                      </Button>
                    )}
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 text-[9px] font-bold text-red-500 hover:bg-red-50"
                      onClick={(e) => handleDelete(n._id, e)}
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      Clear
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {notifications.length > 0 && (
          <div className="p-3 bg-slate-50/50 border-t border-gray-100 flex justify-center">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">Stay on top of your bugs</span>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
