import React from "react";
import { db } from "@/firebase";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { useAuth } from "@/lib/AuthContext";
import { apiFetch } from "@/lib/api";
import GreetingHero from "../components/dashboard/GreetingHero";
import StatsGrid from "../components/dashboard/StatsGrid";
import RecentEntries from "../components/dashboard/RecentEntries";
import EmptyState from "../components/dashboard/EmptyState";
import MoodChart from "../components/dashboard/MoodChart";
import { Loader2, Server, CheckCircle2, XCircle } from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();
  const [entries, setEntries] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [backendStatus, setBackendStatus] = React.useState<'loading' | 'online' | 'offline'>('loading');

  React.useEffect(() => {
    // Check backend health - try both common patterns
    const checkHealth = async () => {
      try {
        // Try /api/health first (standard for Express)
        await apiFetch('api/health');
        setBackendStatus('online');
      } catch (err) {
        try {
          // Try /health
          await apiFetch('health');
          setBackendStatus('online');
        } catch (err2) {
          try {
            // Try root /
            await apiFetch('');
            setBackendStatus('online');
          } catch (err3) {
            setBackendStatus('offline');
          }
        }
      }
    };

    checkHealth();

    if (!user) return;

    const q = query(
      collection(db, "journal_entries"),
      where("authorId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setEntries(data);
      setIsLoading(false);
    }, (error) => {
      console.error("Dashboard fetch error", error);
      setIsLoading(false);
    });

    return unsubscribe;
  }, [user]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-6 h-6 text-teal-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6 sm:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <GreetingHero userName={user?.displayName} />
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium ${
          backendStatus === 'online' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
          backendStatus === 'offline' ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' :
          'bg-zinc-500/10 border-zinc-500/20 text-zinc-400'
        }`}>
          <Server className="w-3.5 h-3.5" />
          <span>Backend: {backendStatus.charAt(0).toUpperCase() + backendStatus.slice(1)}</span>
          {backendStatus === 'online' ? <CheckCircle2 className="w-3 h-3" /> : 
           backendStatus === 'offline' ? <XCircle className="w-3 h-3" /> : 
           <Loader2 className="w-3 h-3 animate-spin" />}
        </div>
      </div>
      <StatsGrid entries={entries} />

      {entries.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="lg:col-span-2">
            <RecentEntries entries={entries} />
          </div>
          <div>
            <MoodChart entries={entries} />
          </div>
        </div>
      )}
    </div>
  );
}
