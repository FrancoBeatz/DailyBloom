import React from "react";
import { supabase } from "@/supabase";
import { useAuth } from "@/lib/AuthContext";
import GreetingHero from "../components/dashboard/GreetingHero";
import StatsGrid from "../components/dashboard/StatsGrid";
import RecentEntries from "../components/dashboard/RecentEntries";
import EmptyState from "../components/dashboard/EmptyState";
import MoodChart from "../components/dashboard/MoodChart";
import { Loader2, Sparkles } from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();
  const [entries, setEntries] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    if (!user) return;

    const fetchEntries = async () => {
      const { data, error } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('author_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Dashboard fetch error", error);
      } else {
        setEntries(data || []);
      }
      setIsLoading(false);
    };

    fetchEntries();

    // Subscribe to changes
    const subscription = supabase
      .channel('journal_entries_changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'journal_entries',
        filter: `author_id=eq.${user.id}`
      }, () => {
        fetchEntries();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
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
        <GreetingHero userName={user?.user_metadata?.full_name || user?.email?.split('@')[0]} />
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-teal-500/20 bg-teal-500/10 text-teal-400 text-xs font-medium">
          <Sparkles className="w-3.5 h-3.5" />
          <span>AI Powered Diary</span>
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
