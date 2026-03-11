import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { db } from "@/firebase";
import { collection, query, where, orderBy, onSnapshot, deleteDoc, doc } from "firebase/firestore";
import { useAuth } from "@/lib/AuthContext";
import { createPageUrl } from "@/lib/utils";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { PenLine, Search, Loader2 } from "lucide-react";
import JournalCard from "../components/journal/JournalCard";
import DeleteConfirmModal from "../components/journal/DeleteConfirmModal";
import EmptyState from "../components/dashboard/EmptyState";
import { handleFirestoreError, OperationType } from "@/lib/firestore-errors";

export default function Journal() {
  const { user } = useAuth();
  const [entries, setEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "journal_entries"),
      where("authorId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const path = "journal_entries";
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setEntries(data);
      setIsLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
      setIsLoading(false);
    });

    return unsubscribe;
  }, [user]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    const path = `journal_entries/${deleteTarget.id}`;
    try {
      await deleteDoc(doc(db, "journal_entries", deleteTarget.id));
      toast.success("Entry deleted");
      setDeleteTarget(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    } finally {
      setIsDeleting(false);
    }
  };

  const filtered = entries.filter((e) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      e.title?.toLowerCase().includes(q) ||
      e.content?.toLowerCase().includes(q) ||
      e.tags?.some((t) => t.includes(q))
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
            const Card = JournalCard as any;
            return (
              <Card
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
