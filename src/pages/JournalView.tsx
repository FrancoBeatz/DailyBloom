import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/supabase";
import { useAuth } from "@/lib/AuthContext";
import { createPageUrl } from "@/lib/utils";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { toast } from "sonner";
import { ArrowLeft, Trash2, Clock, Hash, Loader2, Sparkles } from "lucide-react";
import DeleteConfirmModal from "../components/journal/DeleteConfirmModal";
import { GoogleGenAI } from "@google/genai";

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
  const [summary, setSummary] = useState("");
  const [isSummarizing, setIsSummarizing] = useState(false);

  const handleSummarize = async () => {
    if (!entry?.content) return;
    setIsSummarizing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
      const prompt = `Summarize the following journal entry in one short, poetic sentence.
      
      Entry: "${entry.content}"`;

      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      });
      
      const summaryResult = response.text?.trim();
      if (summaryResult) {
        setSummary(summaryResult);
      }
    } catch (error) {
      toast.error("Failed to summarize");
      console.error(error);
    } finally {
      setIsSummarizing(false);
    }
  };

  useEffect(() => {
    if (!entryId || !user) return;

    const fetchEntry = async () => {
      try {
        const { data, error } = await supabase
          .from('journal_entries')
          .select('*')
          .eq('id', entryId)
          .single();

        if (error) throw error;

        if (data.author_id !== user.id) {
          toast.error("You cannot see this");
          navigate(createPageUrl("Journal"));
          return;
        }
        setEntry(data);
      } catch (error: any) {
        toast.error(error.message || "Story not found");
        navigate(createPageUrl("Journal"));
      } finally {
        setIsLoading(false);
      }
    };

    fetchEntry();
  }, [entryId, user, navigate]);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('journal_entries')
        .delete()
        .eq('id', entryId);

      if (error) throw error;
      
      toast.success("Story deleted");
      navigate(createPageUrl("Journal"));
    } catch (error: any) {
      toast.error(error.message || "Failed to delete entry");
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
            {format(new Date(entry.created_at), "EEEE, MMMM d, yyyy 'at' h:mm a")}
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.03] border border-white/5">
            <span className="text-xl">{moodData.emoji}</span>
            <span className="text-sm text-slate-300">{moodData.label}</span>
          </div>

          {!summary && (
            <button
              onClick={handleSummarize}
              disabled={isSummarizing}
              className="flex items-center gap-2 text-xs font-semibold text-teal-400 hover:text-teal-300 transition-colors disabled:opacity-50"
            >
              {isSummarizing ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5" />
              )}
              Generate AI Summary
            </button>
          )}
        </div>

        {summary && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative p-5 rounded-2xl bg-gradient-to-br from-teal-500/10 to-emerald-500/10 border border-teal-500/20"
          >
            <Sparkles className="absolute -top-2 -right-2 w-5 h-5 text-teal-400" />
            <p className="text-sm italic text-teal-100/90 leading-relaxed">
              "{summary}"
            </p>
          </motion.div>
        )}

        {/* Content */}
        <div className="glass rounded-2xl p-6 sm:p-8">
          <div className="journal-content text-slate-300 leading-relaxed whitespace-pre-wrap text-base">
            {entry.content}
          </div>
        </div>

        {/* Tags */}
        {entry.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {entry.tags.map((tag: string) => (
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
