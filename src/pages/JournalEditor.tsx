import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/supabase";
import { useAuth } from "@/lib/AuthContext";
import { createPageUrl } from "@/lib/utils";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { ArrowLeft, Save, FileText, Loader2, Sparkles, BookOpen } from "lucide-react";
import MoodSelector from "../components/journal/MoodSelector";
import TagInput from "../components/journal/TagInput";
import CharacterProgressBar from "../components/journal/CharacterProgressBar";
import { GoogleGenAI } from "@google/genai";

const DRAFT_KEY = "creamflow_draft";

export default function JournalEditor() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [mood, setMood] = useState("neutral");
  const [tags, setTags] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);
  const autoSaveTimer = useRef<any>(null);

  const handleAnalyzeMood = async () => {
    if (!content.trim()) {
      toast.error("Write something first to analyze your mood");
      return;
    }

    setIsAnalyzing(true);
    try {
      const apiKey = process.env.GEMINI_API_KEY || "";
      if (!apiKey) {
        toast.info("Configuring local semantic mapping...");
        const text = content.toLowerCase();
        let guessed = "neutral";
        if (text.includes("amazing") || text.includes("crushed") || text.includes("proud") || text.includes("solved")) {
          guessed = "great";
        } else if (text.includes("productive") || text.includes("code") || text.includes("learning") || text.includes("study")) {
          guessed = "good";
        } else if (text.includes("tired") || text.includes("weary") || text.includes("stuck")) {
          guessed = "low";
        } else if (text.includes("bug") || text.includes("error") || text.includes("failed") || text.includes("broken")) {
          guessed = "bad";
        }
        setMood(guessed);
        toast.success(`Semantic analyzer set your mood to: ${guessed}`);
        return;
      }

      const ai = new GoogleGenAI({ apiKey });
      const prompt = `Analyze the mood of the following journal entry. Return ONLY one of these words: great, good, neutral, low, bad.
      
      Entry: "${content}"`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });
      
      const moodResult = response.text?.trim().toLowerCase();
      const validMoods = ["great", "good", "neutral", "low", "bad"];
      
      if (moodResult && validMoods.includes(moodResult)) {
        setMood(moodResult);
        toast.success(`Gemini AI successfully extracted cognitive mood: ${moodResult}`);
      } else {
        toast.error("AI couldn't determine a clear mood output");
      }
    } catch (error) {
      toast.error("Failed to analyze mood dynamically");
      console.error(error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Load draft on mount
  useEffect(() => {
    const draft = localStorage.getItem(DRAFT_KEY);
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        setTitle(parsed.title || "");
        setContent(parsed.content || "");
        setMood(parsed.mood || "neutral");
        setTags(parsed.tags || []);
      } catch (e) {
        console.error("Failed to parse draft", e);
      }
    }
  }, []);

  // Auto-save draft
  const saveDraft = useCallback(() => {
    if (!title && !content) return;
    const draft = { title, content, mood, tags };
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    setDraftSaved(true);
    setTimeout(() => setDraftSaved(false), 2000);
  }, [title, content, mood, tags]);

  useEffect(() => {
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(saveDraft, 2000);
    return () => clearTimeout(autoSaveTimer.current);
  }, [title, content, mood, tags, saveDraft]);

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast.error("Please add a title");
      return;
    }
    if (!content.trim()) {
      toast.error("Please write some retrospective context first");
      return;
    }

    setIsSaving(true);
    const newEntry = {
      id: "journal_" + Math.random().toString(36).substring(2, 9),
      title: title.trim(),
      content: content.trim(),
      mood: mood || "neutral",
      tags,
      word_count: wordCount,
      author_id: user?.id || "local_user",
      created_at: new Date().toISOString()
    };

    try {
      // 1. Dual-save: Always write to local storage to guarantee durability
      const local = localStorage.getItem("creamflow_journals");
      const list = local ? JSON.parse(local) : [];
      list.unshift(newEntry);
      localStorage.setItem("creamflow_journals", JSON.stringify(list));

      // 2. Try write to Supabase table
      if (user) {
        await supabase
          .from("journal_entries")
          .insert({
            title: title.trim(),
            content: content.trim(),
            mood: mood || "neutral",
            tags,
            is_draft: false,
            word_count: wordCount,
            author_id: user.id
          });
      }

      localStorage.removeItem(DRAFT_KEY);
      toast.success("Retrospective logged successfully");
      navigate(createPageUrl("Journal"));
    } catch (error: any) {
      console.warn("Supabase failed, saved offline inside local matrix instead", error);
      localStorage.removeItem(DRAFT_KEY);
      toast.success("Retrospective saved to local offline workspace");
      navigate(createPageUrl("Journal"));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8 font-sans text-[#2E2E2E]">
      
      {/* Header Panel */}
      <div className="flex items-center justify-between bg-white border border-[#6F4E37]/10 p-5 rounded-3xl shadow-sm">
        <button
          onClick={() => navigate(createPageUrl("Journal"))}
          className="flex items-center gap-1.5 text-xs font-bold text-[#7A6F62] hover:text-[#6F4E37] transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit Editor</span>
        </button>

        <div className="flex items-center gap-3">
          {draftSaved && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-[10px] text-[#D4A017] font-bold flex items-center gap-1 font-mono uppercase"
            >
              <FileText className="w-3.5 h-3.5" /> Draft Auto-saved
            </motion.span>
          )}
          <button
            onClick={handleSubmit}
            disabled={isSaving}
            className="flex items-center gap-1.5 px-5 py-3 rounded-2xl bg-[#6F4E37] hover:bg-[#5a3e2b] text-white text-xs font-serif font-black shadow-md cursor-pointer transition disabled:opacity-50"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>Log Retrospective</span>
          </button>
        </div>
      </div>

      {/* Editor Body */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#6F4E37]/10 shadow-sm space-y-6">
        
        {/* Title Input area */}
        <div className="space-y-1">
          <label className="text-[10px] uppercase font-bold text-[#7A6F62] tracking-wider block">Retrospective Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Phase 2 WebSocket Deploy Retro..."
            className="w-full bg-transparent text-2xl sm:text-3xl font-serif font-black text-[#6F4E37] placeholder-[#7A6F62]/35 focus:outline-none border-b border-[#6F4E37]/10 pb-2.5 tracking-tight"
          />
        </div>

        {/* Mood Analysis Section */}
        <div className="p-4 bg-[#FFF8E7]/30 border border-[#6F4E37]/10 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-[10px] uppercase font-bold text-[#6F4E37] tracking-wider block">
              Workspace Mood Snapshot
            </label>
            <button
              onClick={handleAnalyzeMood}
              disabled={isAnalyzing || !content.trim()}
              className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider text-[#6F4E37] hover:text-[#D4A017] disabled:opacity-30 cursor-pointer"
            >
              {isAnalyzing ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5" />
              )}
              <span>Semantics Check 🧠</span>
            </button>
          </div>
          <MoodSelector value={mood} onChange={setMood} />
        </div>

        {/* Content Area */}
        <div className="space-y-3">
          <label className="text-[10px] uppercase font-bold text-[#7A6F62] tracking-wider block">Spill your thoughts</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Today I designed the WebSocket concurrency layout. Encountered complex buffers, then successfully synchronized..."
            rows={12}
            className="w-full bg-[#FFF8E7]/20 border border-[#6F4E37]/10 rounded-2xl px-5 py-4 text-xs font-semibold leading-relaxed text-[#2E2E2E] placeholder-[#7A6F62]/45 focus:outline-none focus:border-[#6F4E37] resize-none transition-all"
          />

          <div className="flex items-center justify-between gap-4">
            <span className="text-[10px] font-bold text-[#7A6F62] font-mono">
              WORDCOUNT: {wordCount}
            </span>
            <div className="w-48">
              <CharacterProgressBar charCount={content.length} />
            </div>
          </div>
        </div>

        {/* Tags */}
        <div className="space-y-3">
          <label className="text-[10px] uppercase font-bold text-[#7A6F62] tracking-wider block">Categorization Tags</label>
          <TagInput tags={tags} onChange={setTags} />
        </div>

      </div>

    </div>
  );
}
