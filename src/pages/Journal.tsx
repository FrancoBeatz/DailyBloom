import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/supabase";
import { useAuth } from "@/lib/AuthContext";
import { createPageUrl } from "@/lib/utils";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { PenLine, Search, Loader2, Sparkles, AlertCircle } from "lucide-react";
import JournalCard from "../components/journal/JournalCard";
import DeleteConfirmModal from "../components/journal/DeleteConfirmModal";

export default function Journal() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchEntries = async () => {
    if (!user) {
      const local = localStorage.getItem("creamflow_journals");
      setEntries(local ? JSON.parse(local) : []);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("journal_entries")
        .select("*")
        .eq("author_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        // Fallback to local
        const local = localStorage.getItem("creamflow_journals");
        setEntries(local ? JSON.parse(local) : []);
      } else if (data && data.length > 0) {
        setEntries(data);
      } else {
        const local = localStorage.getItem("creamflow_journals");
        setEntries(local ? JSON.parse(local) : []);
      }
    } catch (e) {
      const local = localStorage.getItem("creamflow_journals");
      setEntries(local ? JSON.parse(local) : []);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();

    if (!user) return;
    const subscription = supabase
      .channel("journal_entries_list")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "journal_entries",
          filter: `author_id=eq.${user.id}`,
        },
        () => {
          fetchEntries();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    
    try {
      // 1. Delete from local storage
      const local = localStorage.getItem("creamflow_journals");
      if (local) {
        const parsed = JSON.parse(local);
        const filtered = parsed.filter((e: any) => e.id !== deleteTarget.id);
        localStorage.setItem("creamflow_journals", JSON.stringify(filtered));
        setEntries(filtered);
      }

      // 2. Try delete from Supabase
      if (user) {
        await supabase
          .from("journal_entries")
          .delete()
          .eq("id", deleteTarget.id);
      }

      toast.success("Entry successfully archived!");
      setDeleteTarget(null);
    } catch (error: any) {
      console.warn("Supabase delete failed, local persisted instead", error);
      setDeleteTarget(null);
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
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-[#6F4E37] animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8 font-sans text-[#2E2E2E]">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-[#6F4E37]/10 p-6 rounded-3xl shadow-sm">
        <div>
          <span className="text-[10px] bg-[#6F4E37]/5 px-2.5 py-1 rounded-md text-[#6F4E37] font-mono tracking-widest font-black uppercase">
            CreamFlow Retrospective Log
          </span>
          <h1 className="text-3xl sm:text-4xl font-serif font-black text-[#6F4E37] tracking-tight mt-2">
            Mind Vault Journal <span className="font-sans text-xs italic text-[#7A6F62] ml-1">Retrospectives</span>
          </h1>
          <p className="text-xs text-[#7A6F62] mt-1 font-medium leading-relaxed">
            Record deep thoughts, daily insights, performance retrospectives and cognitive milestones under lock.
          </p>
        </div>

        <Link
          to={createPageUrl("JournalEditor")}
          className="inline-flex items-center gap-1.5 px-5 py-3 rounded-2xl bg-[#6F4E37] text-white text-xs font-serif font-black hover:bg-[#5a3e2b] transition-all shadow-md cursor-pointer"
        >
          <PenLine className="w-3.5 h-3.5" />
          <span>Spill Thoughts 🖋️</span>
        </Link>
      </div>

      {/* Info Tip block */}
      <div className="p-4 bg-[#FFF8E7] rounded-2xl border border-[#D4A017]/20 flex gap-2.5">
        <AlertCircle className="w-4.5 h-4.5 text-[#D4A017] flex-shrink-0 mt-0.5" />
        <p className="text-[11px] text-[#7A6F62] leading-relaxed">
          💡 <strong>Deep thought patterns:</strong> Journaling captures daily technical blockades, lesson highlights, and mood snapshots. Maintain continuous logs to reflect on career milestones during performance evaluations.
        </p>
      </div>

      {/* Search Input bar */}
      {entries.length > 0 && (
        <div className="max-w-md">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7A6F62]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search retrospective logs, tags..."
              className="w-full bg-white border border-[#6F4E37]/15 rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#2E2E2E] placeholder-[#7A6F62]/50 focus:outline-none focus:border-[#6F4E37]"
            />
          </div>
        </div>
      )}

      {/* Grid displays */}
      {entries.length === 0 ? (
        <div className="text-center py-16 bg-white/50 border border-dashed border-[#6F4E37]/15 rounded-3xl space-y-3">
          <p className="text-xs text-[#7A6F62]">Mind Vault is currently empty. Begin storing insights now.</p>
          <Link
            to={createPageUrl("JournalEditor")}
            className="inline-flex items-center gap-1 bg-[#6F4E37] text-white px-4 py-2 rounded-xl text-xs font-bold"
          >
            Create First Retrospective
          </Link>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-[#7A6F62] text-xs">
          No retrospective entries match your query parameters.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((entry, i) => (
            <JournalCard
              key={entry.id}
              entry={entry}
              index={i}
              onDelete={setDeleteTarget}
            />
          ))}
        </div>
      )}

      {/* Delete confirmation popup modal */}
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
