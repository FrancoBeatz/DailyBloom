import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  great: { emoji: "🌟", label: "Peak Flow State" },
  good: { emoji: "☕", label: "Focused & Active" },
  neutral: { emoji: "🍃", label: "Balanced Flow" },
  low: { emoji: "💨", label: "Rest & Reflect" },
  bad: { emoji: "🌋", label: "High Cognitive Load" },
};

export default function JournalView() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const entryId = urlParams.get("id");
  const [entry, setEntry] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDelete, setShowDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [summary, setSummary] = useState("");
  const [isSummarizing, setIsSummarizing] = useState(false);

  const handleSummarize = async () => {
    if (!entry?.content) return;
    setIsSummarizing(true);
    try {
      const apiKey = process.env.GEMINI_API_KEY || "";
      if (!apiKey) {
        // Fallback offline poetic summary generator
        const sentences = entry.content.split(/[.!?]/);
        const choice = sentences[0]?.trim() || "A beautiful retrospective moment recorded in CreamFlow.";
        setSummary(`${choice}.`);
        toast.info("Offline summary extracted.");
        return;
      }

      const ai = new GoogleGenAI({ apiKey });
      const prompt = `Summarize the following journal entry in one short, poetic sentence.
      
      Entry: "${entry.content}"`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });
      
      const summaryResult = response.text?.trim();
      if (summaryResult) {
        setSummary(summaryResult);
        toast.success("AI Summary logged!");
      }
    } catch (error) {
      toast.error("Failed to summarize entry");
      console.error(error);
    } finally {
      setIsSummarizing(false);
    }
  };

  useEffect(() => {
    if (!entryId) return;

    const findEntry = async () => {
      try {
        // 1. Try Supabase
        if (user) {
          const { data, error } = await supabase
            .from("journal_entries")
            .select("*")
            .eq("id", entryId)
            .single();

          if (!error && data) {
            setEntry(data);
            setIsLoading(false);
            return;
          }
        }

        // 2. Try Local Storage fallback
        const local = localStorage.getItem("creamflow_journals");
        if (local) {
          const list = JSON.parse(local);
          const found = list.find((e: any) => e.id === entryId);
          if (found) {
            setEntry(found);
            setIsLoading(false);
            return;
          }
        }

        toast.error("Story not found");
        navigate(createPageUrl("Journal"));
      } catch (e) {
        navigate(createPageUrl("Journal"));
      } finally {
        setIsLoading(false);
      }
    };

    findEntry();
  }, [entryId, user, navigate]);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      // 1. Delete locally
      const local = localStorage.getItem("creamflow_journals");
      if (local) {
        const list = JSON.parse(local);
        const filtered = list.filter((e: any) => e.id !== entryId);
        localStorage.setItem("creamflow_journals", JSON.stringify(filtered));
      }

      // 2. Try Supabase
      if (user) {
        await supabase
          .from("journal_entries")
          .delete()
          .eq("id", entryId);
      }
      
      toast.success("Retrospective entry deleted");
      navigate(createPageUrl("Journal"));
    } catch (error: any) {
      console.warn("Deleted locally but Supabase deletion might have failed", error);
      navigate(createPageUrl("Journal"));
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-[#6F4E37] animate-spin" />
      </div>
    );
  }

  if (!entry) return null;

  const moodData = moodLabels[entry.mood] || moodLabels.neutral;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8 font-sans text-[#2E2E2E]">
      
      {/* Header controls */}
      <div className="flex items-center justify-between bg-white border border-[#6F4E37]/10 p-4 rounded-3xl shadow-sm">
        <button
          onClick={() => navigate(createPageUrl("Journal"))}
          className="flex items-center gap-1.5 text-xs font-bold text-[#7A6F62] hover:text-[#6F4E37] transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Journal</span>
        </button>

        <button
          onClick={() => setShowDelete(true)}
          className="flex items-center gap-1 bg-[#FFF8E7] text-red-500 hover:bg-red-50 px-4 py-2 rounded-2xl text-xs font-bold cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Archive Entry</span>
        </button>
      </div>

      <article className="space-y-6 bg-white p-6 sm:p-8 rounded-3xl border border-[#6F4E37]/10 shadow-sm relative overflow-hidden">
        
        {/* Meta info */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-[#7A6F62] font-semibold">
          <Clock className="w-4 h-4 text-[#D3A017]" />
          <span>{format(new Date(entry.created_at), "EEEE, MMMM d, yyyy 'at' h:mm a")}</span>
          {entry.word_count > 0 && (
            <span className="font-mono text-[#D4A017] font-bold">· {entry.word_count} words</span>
          )}
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl font-serif font-black text-[#6F4E37] tracking-tight leading-tight">
          {entry.title}
        </h1>

        {/* Mood select label and generator */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
          <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#FFF8E7] border border-[#6F4E37]/10">
            <span className="text-xl">{moodData.emoji}</span>
            <span className="text-xs font-bold text-[#6F4E37]">{moodData.label}</span>
          </div>

          {!summary && (
            <button
              onClick={handleSummarize}
              disabled={isSummarizing}
              className="flex items-center gap-1 px-4 py-1.5 bg-[#6F4E37]/5 hover:bg-[#6F4E37]/10 text-xs font-bold text-[#6F4E37] rounded-xl cursor-pointer"
            >
              {isSummarizing ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5 text-[#D4A017]" />
              )}
              <span>Summarize Dynamic Review ☕</span>
            </button>
          )}
        </div>

        {/* Summary Block */}
        {summary && (
          <div className="relative p-5 rounded-2xl bg-[#FFF8E7] border border-[#D4A017]/20">
            <Sparkles className="absolute -top-1.5 -right-1.5 w-5 h-5 text-[#D4A017]" />
            <p className="text-xs italic text-[#7A6F62] leading-relaxed font-semibold">
              "{summary}"
            </p>
          </div>
        )}

        {/* Rendered content */}
        <div className="bg-[#FFF8E7]/20 p-5 sm:p-7 rounded-2xl border border-[#6F4E37]/10">
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-[#2E2E2E] font-semibold">
            {entry.content}
          </p>
        </div>

        {/* Tags list */}
        {entry.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {entry.tags.map((tag: string) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#FFF8E7] border border-[#6F4E37]/10 text-[#6F4E37] text-xs font-bold"
              >
                <Hash className="w-3.5 h-3.5 text-[#D4A017]" />
                {tag}
              </span>
            ))}
          </div>
        )}

      </article>

      {/* Delete confirm dialog popup */}
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
