import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/supabase";
import { useAuth } from "@/lib/AuthContext";
import { createPageUrl } from "@/lib/utils";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { ArrowLeft, Save, FileText, Loader2, Sparkles } from "lucide-react";
import MoodSelector from "../components/journal/MoodSelector";
import TagInput from "../components/journal/TagInput";
import CharacterProgressBar from "../components/journal/CharacterProgressBar";
import { GoogleGenAI } from "@google/genai";

const DRAFT_KEY = "mindvault_draft";

export default function JournalEditor() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [mood, setMood] = useState("");
  const [tags, setTags] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);
  const autoSaveTimer = useRef(null);

  const handleAnalyzeMood = async () => {
    if (!content.trim()) {
      toast.error("Write something first to analyze your mood");
      return;
    }

    setIsAnalyzing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
      const prompt = `Analyze the mood of the following journal entry. Return ONLY one of these words: great, good, neutral, low, bad.
      
      Entry: "${content}"`;

      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      });
      
      const moodResult = response.text?.trim().toLowerCase();
      const validMoods = ["great", "good", "neutral", "low", "bad"];
      
      if (moodResult && validMoods.includes(moodResult)) {
        setMood(moodResult);
        toast.success(`AI suggests your mood is: ${moodResult}`);
      } else {
        toast.error("AI couldn't determine a clear mood");
      }
    } catch (error) {
      toast.error("Failed to analyze mood");
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
        setMood(parsed.mood || "");
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
      toast.error("Please write something");
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('journal_entries')
        .insert({
          title: title.trim(),
          content: content.trim(),
          mood: mood || "neutral",
          tags,
          is_draft: false,
          word_count: wordCount,
          author_id: user.id,
        });

      if (error) throw error;

      localStorage.removeItem(DRAFT_KEY);
      toast.success("Story saved!");
      navigate(createPageUrl("Journal"));
    } catch (error: any) {
      toast.error(error.message || "Failed to save entry");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <button
          onClick={() => navigate(createPageUrl("Dashboard"))}
          className="flex items-center gap-2 text-slate-400 hover:text-teal-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back</span>
        </button>

        <div className="flex items-center gap-3">
          {draftSaved && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-xs text-teal-500/60 flex items-center gap-1"
            >
              <FileText className="w-3 h-3" /> Draft saved
            </motion.span>
          )}
          <button
            onClick={handleSubmit}
            disabled={isSaving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-teal-600 text-white text-sm font-medium hover:from-teal-400 hover:to-teal-500 transition-all shadow-lg shadow-teal-500/10 disabled:opacity-50"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save
          </button>
        </div>
      </motion.div>

      {/* Editor */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-6"
      >
        {/* Title */}
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Give your story a title..."
          className="w-full bg-transparent text-2xl sm:text-3xl font-bold text-white placeholder-slate-600 focus:outline-none border-none"
        />

        {/* Mood */}
        <div className="glass rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider block">
              How are you feeling?
            </label>
            <button
              onClick={handleAnalyzeMood}
              disabled={isAnalyzing || !content.trim()}
              className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-teal-400 hover:text-teal-300 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {isAnalyzing ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Sparkles className="w-3 h-3" />
              )}
              Analyze with AI
            </button>
          </div>
          <MoodSelector value={mood} onChange={setMood} />
        </div>

        {/* Content */}
        <div className="space-y-3">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Start writing your thoughts..."
            rows={14}
            className="w-full bg-white/[0.03] border border-white/5 rounded-2xl px-5 py-4 text-slate-200 placeholder-slate-600 text-base leading-relaxed focus:outline-none focus:border-teal-500/20 resize-none transition-colors"
          />

          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <span className="text-xs text-slate-500">
                {wordCount} {wordCount === 1 ? "word" : "words"}
              </span>
            </div>
            <div className="w-48">
              <CharacterProgressBar charCount={content.length} />
            </div>
          </div>
        </div>

        {/* Tags */}
        <div className="glass rounded-xl p-4">
          <label className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3 block">
            Tags
          </label>
          <TagInput tags={tags} onChange={setTags} />
        </div>
      </motion.div>
    </div>
  );
}
