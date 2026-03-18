import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/supabase";
import { useAuth } from "@/lib/AuthContext";
import { createPageUrl } from "@/lib/utils";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { PenLine, Search, Loader2 } from "lucide-react";
import JournalCard from "../components/journal/JournalCard";
import DeleteConfirmModal from "../components/journal/DeleteConfirmModal";
import EmptyState from "../components/dashboard/EmptyState";

export default function Journal() {
  const { user } = useAuth();
  const [entries, setEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!user) return;

    const fetchEntries = async () => {
      const { data, error } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('author_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        toast.error("Failed to load journal entries");
        console.error("Journal fetch error", error);
      } else {
        setEntries(data || []);
      }
      setIsLoading(false);
    };

    fetchEntries();

    // Subscribe to changes
    const subscription = supabase
      .channel('journal_entries_list')
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

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('journal_entries')
        .delete()
        .eq('id', deleteTarget.id);

      if (error) throw error;
      
      toast.success("Entry deleted");
      setDeleteTarget(null);
    } catch (error: any) {
      toast.error(error.message || "Failed to delete entry");
    } finally {
      setIsDeleting(false);
    }
  };

  const filtered = entries.filter((e: any) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      e.title?.toLowerCase().includes(q) ||
      e.content?.toLowerCase().includes(q) ||
      e.tags?.some((t: string) => t.toLowerCase().includes(q))
    );
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-6 h-6 text-teal-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">My Diary</h1>
          <p className="text-sm text-slate-400 mt-1">{entries.length} stories in your diary</p>
        </div>
        <Link
          to={createPageUrl("JournalEditor")}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-teal-600 text-white text-sm font-medium hover:from-teal-400 hover:to-teal-500 transition-all shadow-lg shadow-teal-500/10"
        >
          <PenLine className="w-4 h-4" />
          New Story
        </Link>
      </motion.div>

      {/* Search */}
      {entries.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search stories, tags..."
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500/30 transition-colors"
            />
          </div>
        </motion.div>
      )}

      {/* Grid */}
      {entries.length === 0 ? (
        <EmptyState />
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <p>No stories found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((entry: any, i) => {
            return (
              <JournalCard
                key={entry.id}
                entry={entry}
                index={i}
                onDelete={setDeleteTarget}
              />
            );
          })}
        </div>
      )}

      {/* Delete modal */}
      <DeleteConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
        title={deleteTarget?.title}
      />
    </div>
  );
}
