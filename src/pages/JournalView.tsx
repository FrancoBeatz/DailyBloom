import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "@/firebase";
import { doc, getDoc, deleteDoc } from "firebase/firestore";
import { useAuth } from "@/lib/AuthContext";
import { createPageUrl } from "@/lib/utils";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { toast } from "sonner";
import { ArrowLeft, Trash2, Clock, Hash, Loader2 } from "lucide-react";
import DeleteConfirmModal from "../components/journal/DeleteConfirmModal";

const moodLabels = {
  great: { emoji: "😄", label: "Feeling Great" },
  good: { emoji: "🙂", label: "Feeling Good" },
  neutral: { emoji: "😐", label: "Feeling Okay" },
  low: { emoji: "😔", label: "Feeling Down" },
  bad: { emoji: "😢", label: "Feeling Bad" },
};

export default function JournalView() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const entryId = urlParams.get("id");
  const [entry, setEntry] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDelete, setShowDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!entryId || !user) return;

    const fetchEntry = async () => {
      try {
        const docRef = doc(db, "journal_entries", entryId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.authorId !== user.uid) {
            toast.error("You cannot see this");
            navigate(createPageUrl("Journal"));
            return;
          }
          setEntry({ id: docSnap.id, ...data });
        } else {
          toast.error("Story not found");
          navigate(createPageUrl("Journal"));
        }
      } catch (error) {
        console.error("Fetch entry error", error);
        toast.error("Failed to load entry");
      } finally {
        setIsLoading(false);
      }
    };

    fetchEntry();
  }, [entryId, user, navigate]);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteDoc(doc(db, "journal_entries", entryId));
      toast.success("Story deleted");
      navigate(createPageUrl("Journal"));
    } catch (error) {
      toast.error("Failed to delete entry");
      console.error(error);
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-6 h-6 text-teal-400 animate-spin" />
      </div>
    );
  }

  if (!entry) return null;

  const moodData = moodLabels[entry.mood] || moodLabels.neutral;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <button
          onClick={() => navigate(createPageUrl("Journal"))}
          className="flex items-center gap-2 text-slate-400 hover:text-teal-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back to Diary</span>
        </button>

        <button
          onClick={() => setShowDelete(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
        >
          <Trash2 className="w-4 h-4" />
          <span className="text-sm">Delete</span>
        </button>
      </motion.div>

      {/* Entry */}
      <motion.article
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-6"
      >
        {/* Meta */}
        <div className="flex flex-wrap items-center gap-3 text-sm text-slate-400">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            {format(new Date(entry.createdAt?.seconds * 1000), "EEEE, MMMM d, yyyy 'at' h:mm a")}
          </div>
          {entry.word_count > 0 && (
            <span>· {entry.word_count} words</span>
          )}
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl font-bold text-white leading-tight">
          {entry.title}
        </h1>

        {/* Mood */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.03] border border-white/5">
          <span className="text-xl">{moodData.emoji}</span>
          <span className="text-sm text-slate-300">{moodData.label}</span>
        </div>

        {/* Content */}
        <div className="glass rounded-2xl p-6 sm:p-8">
          <div className="journal-content text-slate-300 leading-relaxed whitespace-pre-wrap text-base">
            {entry.content}
          </div>
        </div>

        {/* Tags */}
        {entry.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {entry.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-teal-500/10 text-teal-400 text-xs font-medium"
              >
                <Hash className="w-3 h-3" />
                {tag}
              </span>
            ))}
          </div>
        )}
      </motion.article>

      {/* Delete modal */}
      <DeleteConfirmModal
        isOpen={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
        title={entry.title}
      />
    </div>
  );
}
