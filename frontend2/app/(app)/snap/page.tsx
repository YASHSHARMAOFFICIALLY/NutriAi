"use client";

import { useMemo, useState } from "react";
import { Camera, CheckCircle, Database, ImageSquare, PencilSimple, Sparkle, TextT } from "@phosphor-icons/react/dist/ssr";
import { analyzeFood } from "@/lib/api/food";
import { ApiError } from "@/lib/api/client";
import { createMeal, inferMealType } from "@/lib/api/meals";
import { uploadFoodImage } from "@/lib/api/uploads";
import type { AnalyzeFoodResponse, MealType } from "@/lib/api/types";
import { PageHeader, Panel } from "../_components/ui";

type Candidate = {
  queryId: string;
  provider: string;
  model: string;
  cached: boolean;
  latencyMs: number;
  confidence: number;
  title: string;
  mealType: MealType;
  items: Array<{
    name: string;
    quantity: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    confidence: number;
  }>;
  totals: { calories: number; protein: number; carbs: number; fat: number };
};

function candidateFromApi(result: AnalyzeFoodResponse): Candidate {
  return {
    queryId: result.queryId,
    provider: result.meta.provider,
    model: result.meta.model,
    cached: result.meta.cached,
    latencyMs: result.meta.latencyMs,
    confidence: result.confidence,
    title: result.items.map((item) => item.name).slice(0, 2).join(", ") || "Analyzed meal",
    mealType: inferMealType(),
    items: result.items.map((item) => ({
      name: item.name,
      quantity: item.quantity ?? "",
      calories: Math.round(item.calories),
      protein: Math.round(item.protein),
      carbs: Math.round(item.carbs),
      fat: Math.round(item.fat),
      confidence: item.confidence ?? result.confidence,
    })),
    totals: {
      calories: Math.round(result.totals.calories),
      protein: Math.round(result.totals.protein),
      carbs: Math.round(result.totals.carbs),
      fat: Math.round(result.totals.fat),
    },
  };
}

import { motion, AnimatePresence } from "framer-motion";
import { AnalyzingState } from "./_components/AnalyzingState";

// ... (helper functions and types remain same)

export default function SnapPage() {
  const [text, setText] = useState("");
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [status, setStatus] = useState<"ready" | "uploading" | "analyzing" | "saving" | "saved" | "error">("ready");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [assetId, setAssetId] = useState<string | null>(null);
  const [inputMode, setInputMode] = useState<"photo" | "text">("photo");
  const [errorMessage, setErrorMessage] = useState("");

  const sourceSteps = useMemo(() => [
    { label: assetId ? "Photo ready" : selectedFile ? "Photo selected" : "Prompt ready", icon: ImageSquare },
    { label: "Nutrition estimated", icon: Database },
    { label: "Review before saving", icon: Sparkle },
  ], [assetId, selectedFile]);

  async function handleAnalyze() {
    if (!text.trim() && !selectedFile && !assetId) return;
    try {
      setErrorMessage("");
      let confirmedAssetId = assetId;
      if (selectedFile && !confirmedAssetId) {
        setStatus("uploading");
        const upload = await uploadFoodImage(selectedFile);
        confirmedAssetId = upload.id;
        setAssetId(upload.id);
      }
      setStatus("analyzing");
      const result = await analyzeFood(
        confirmedAssetId ? { assetId: confirmedAssetId, text: text.trim() || undefined } : { text: text.trim() },
      );
      setCandidate(candidateFromApi(result));
      setStatus("ready");
    } catch (error) {
      setErrorMessage(
        error instanceof ApiError
          ? error.message
          : "Could not analyze this meal. Check your connection and try again.",
      );
      setStatus("error");
    }
  }

  async function handleSave() {
    if (!candidate) return;
    setStatus("saving");
    try {
      await createMeal({
        mealType: candidate.mealType,
        notes: candidate.title,
        foodQueryId: candidate.queryId,
        items: candidate.items.map((item) => ({
          name: item.name,
          quantity: item.quantity,
          calories: item.calories,
          protein: item.protein,
          carbs: item.carbs,
          fat: item.fat,
        })),
      });
      setStatus("saved");
    } catch {
      setErrorMessage("Could not save this meal right now.");
      setStatus("error");
    }
  }

  function updateItem(index: number, field: keyof Candidate["items"][number], value: string) {
    setCandidate((current) => {
      if (!current) return current;
      const items = current.items.map((item, itemIndex) => {
        if (itemIndex !== index) return item;
        if (field === "quantity" || field === "name") return { ...item, [field]: value };
        const numeric = Number(value);
        return { ...item, [field]: Number.isFinite(numeric) ? numeric : 0 };
      });
      const totals = items.reduce(
        (acc, item) => ({
          calories: acc.calories + item.calories,
          protein: acc.protein + item.protein,
          carbs: acc.carbs + item.carbs,
          fat: acc.fat + item.fat,
        }),
        { calories: 0, protein: 0, carbs: 0, fat: 0 },
      );
      return { ...current, items, totals };
    });
  }

  function addItem() {
    setCandidate((current) => current ? ({
      ...current,
      items: [
        ...current.items,
        { name: "New item", quantity: "1 serving", calories: 0, protein: 0, carbs: 0, fat: 0, confidence: 0.5 },
      ],
    }) : current);
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-7xl px-6 py-10 lg:px-10"
    >
      <PageHeader eyebrow="Experience" title="Intelligent Food Analysis" />

      <section className="grid gap-8 xl:grid-cols-[400px_1fr]">
        <div className="space-y-6">
          <Panel className="p-6">
            <div className="mb-6 grid grid-cols-2 rounded-xl bg-surface-alt p-1.5 border border-border">
              <button 
                onClick={() => setInputMode("photo")}
                className={`flex items-center justify-center gap-2 rounded-lg py-2.5 text-[13px] font-bold transition-all ${
                  inputMode === "photo" ? "bg-forest text-white shadow-premium" : "text-muted hover:text-forest"
                }`}
              >
                <Camera size={16} weight={inputMode === "photo" ? "fill" : "bold"} />
                Photo
              </button>
              <button 
                onClick={() => setInputMode("text")}
                className={`flex items-center justify-center gap-2 rounded-lg py-2.5 text-[13px] font-bold transition-all ${
                  inputMode === "text" ? "bg-forest text-white shadow-premium" : "text-muted hover:text-forest"
                }`}
              >
                <TextT size={16} weight={inputMode === "text" ? "bold" : "bold"} />
                Text Description
              </button>
            </div>

            <AnimatePresence mode="wait">
              {inputMode === "photo" ? (
                <motion.label 
                  key="photo"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="group relative flex h-[340px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-surface-alt/50 p-8 text-center transition-all hover:bg-surface-alt hover:border-teal/50"
                >
                  <span className="grid h-16 w-16 place-items-center rounded-2xl bg-white text-forest shadow-md transition-transform group-hover:scale-110 group-hover:rotate-3">
                    <ImageSquare size={32} weight="duotone" />
                  </span>
                  <p className="mt-6 text-[18px] font-bold text-forest">
                    {selectedFile ? "Change photo" : "Drop food photo"}
                  </p>
                  <p className="mt-2 text-[13px] leading-relaxed text-muted">
                    {selectedFile ? `${selectedFile.name} ready` : "Upload a photo for instant nutrition analysis"}
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={(event) => {
                      const file = event.target.files?.[0] ?? null;
                      setSelectedFile(file);
                      setAssetId(null);
                    }}
                  />
                  {selectedFile && (
                    <div className="absolute inset-0 z-0 p-4 opacity-10 blur-sm pointer-events-none">
                       {/* This would show a preview if we had an object URL */}
                    </div>
                  )}
                </motion.label>
              ) : (
                <motion.div 
                  key="text"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="rounded-2xl border border-border bg-surface-alt/50 p-6"
                >
                  <p className="text-[12px] font-bold uppercase tracking-wider text-muted mb-3">What are you eating?</p>
                  <textarea
                    className="h-40 w-full resize-none rounded-xl border border-border bg-white p-4 text-[15px] font-medium text-forest outline-none transition-all focus:ring-2 focus:ring-teal/20 focus:border-teal"
                    placeholder="e.g., Two scrambled eggs with avocado toast and a side of blueberries..."
                    value={text}
                    onChange={(event) => setText(event.target.value)}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <button
              onClick={handleAnalyze}
              disabled={status === "analyzing" || status === "uploading" || (!text.trim() && !selectedFile && !assetId)}
              className="mt-6 w-full rounded-xl bg-forest py-4 text-[15px] font-bold text-white shadow-premium transition-all hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {status === "uploading" ? "Confirming Asset..." : status === "analyzing" ? "Running Intelligence..." : "Start Analysis"}
            </button>
            
            {status === "error" && (
              <p className="mt-4 rounded-lg bg-amber-50 p-3 text-center text-[12px] font-bold text-amber-700 border border-amber-100">
                {errorMessage || "Could not analyze this meal. Check your connection and try again."}
              </p>
            )}
          </Panel>

          <Panel className="p-6 bg-forest text-white border-none shadow-premium overflow-hidden relative">
             <div className="relative z-10">
               <h3 className="text-[13px] font-bold uppercase tracking-[0.2em] text-lime mb-2">Pro Tip</h3>
               <p className="text-[14px] leading-relaxed text-white/80">
                 Multiple items? List them all or snap a single photo. NutriAI separates complex meals into editable items.
               </p>
             </div>
             <div className="absolute -right-10 -bottom-10 h-32 w-32 rounded-full bg-lime/10 blur-2xl" />
          </Panel>
        </div>

        <div className="space-y-8">
          <AnimatePresence mode="wait">
            {status === "analyzing" || status === "uploading" ? (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
              >
                <Panel className="h-full flex items-center justify-center p-12 min-h-[500px]">
                  <AnalyzingState />
                </Panel>
              </motion.div>
            ) : candidate ? (
              <motion.div 
                key="result"
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                <Panel className="p-8">
                  <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <div className="mb-4 flex flex-wrap gap-2">
                        <span className="rounded-full bg-lime/20 px-3 py-1 text-[11px] font-bold text-forest">
                          {Math.round(candidate.confidence * 100)}% Match
                        </span>
                      </div>
                      <h2 className="text-[36px] font-bold tracking-tight text-forest leading-tight">
                        {candidate.title}
                      </h2>
                      <p className="mt-3 text-[14px] font-medium text-muted">
                        Analysis complete · Tagged as <span className="text-forest font-bold">{candidate.mealType.toLowerCase()}</span>
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                      {[
                        { val: candidate.totals.calories, unit: "kcal", label: "Energy" },
                        { val: `${candidate.totals.protein}g`, unit: "", label: "Protein" },
                        { val: `${candidate.totals.carbs}g`, unit: "", label: "Carbs" },
                        { val: `${candidate.totals.fat}g`, unit: "", label: "Fat" },
                      ].map((macro) => (
                        <div key={macro.label} className="rounded-2xl bg-surface-alt p-4 border border-border text-center">
                          <p className="text-[20px] font-bold text-forest leading-none">{macro.val}</p>
                          <p className="mt-2 text-[10px] font-bold uppercase tracking-wider text-muted opacity-70">{macro.label}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-8 grid gap-4 md:grid-cols-3">
                    {sourceSteps.map((step, i) => (
                      <div key={i} className="flex items-center gap-4 rounded-xl border border-border bg-surface-alt/30 p-4">
                        <span className="grid h-10 w-10 place-items-center rounded-lg bg-white text-forest shadow-sm">
                          <step.icon size={18} weight="bold" />
                        </span>
                        <p className="text-[13px] font-bold text-forest/80">{step.label}</p>
                      </div>
                    ))}
                  </div>
                </Panel>

                <Panel className="overflow-hidden border-none shadow-premium">
                  <div className="flex items-center justify-between bg-surface-alt p-6 border-b border-border">
                    <h2 className="text-[20px] font-bold text-forest tracking-tight">Verified Line Items</h2>
                    <button onClick={addItem} className="flex items-center gap-2 rounded-xl bg-white border border-border px-4 py-2 text-[13px] font-bold text-forest shadow-sm hover:shadow-md transition-shadow">
                      <PencilSimple size={16} weight="bold" />
                      Add row
                    </button>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[700px] text-left text-[14px]">
                      <thead className="bg-surface-alt/50 text-muted">
                        <tr>
                          <th className="px-6 py-4 font-bold uppercase tracking-wider text-[11px]">Food Item</th>
                          <th className="px-6 py-4 font-bold uppercase tracking-wider text-[11px]">Amount</th>
                          <th className="px-6 py-4 text-right font-bold uppercase tracking-wider text-[11px]">Calories</th>
                          <th className="px-6 py-4 text-right font-bold uppercase tracking-wider text-[11px]">Macros (P/C/F)</th>
                          <th className="px-6 py-4 text-right font-bold uppercase tracking-wider text-[11px]">Certainty</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border bg-white">
                        {candidate.items.map((item, index) => (
                          <tr key={index} className="group hover:bg-surface-alt/20 transition-colors">
                            <td className="px-6 py-4">
                              <input 
                                className="w-full bg-transparent font-bold text-forest outline-none group-focus-within:text-teal" 
                                value={item.name} 
                                onChange={(event) => updateItem(index, "name", event.target.value)} 
                              />
                            </td>
                            <td className="px-6 py-4">
                              <input 
                                className="w-full bg-transparent text-muted outline-none" 
                                value={item.quantity || ""} 
                                onChange={(event) => updateItem(index, "quantity", event.target.value)} 
                              />
                            </td>
                            <td className="px-6 py-4 text-right">
                              <input 
                                className="w-20 bg-transparent text-right font-bold text-forest outline-none" 
                                value={item.calories} 
                                onChange={(event) => updateItem(index, "calories", event.target.value)} 
                              />
                            </td>
                            <td className="px-6 py-4 text-right">
                               <div className="flex justify-end gap-1.5 text-[12px] font-medium text-muted">
                                 <span className="text-teal font-bold">{item.protein}g</span>
                                 <span>/</span>
                                 <span className="text-sage font-bold">{item.carbs}g</span>
                                 <span>/</span>
                                 <span className="text-amber-600 font-bold">{item.fat}g</span>
                               </div>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <div className="h-1.5 w-12 rounded-full bg-surface-alt overflow-hidden">
                                  <div className="h-full bg-teal" style={{ width: `${item.confidence * 100}%` }} />
                                </div>
                                <span className="text-[11px] font-bold text-muted">{Math.round(item.confidence * 100)}%</span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex flex-col gap-6 bg-surface-alt p-8 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <p className="text-[14px] font-medium text-muted leading-relaxed">
                        Saving this meal will add these analyzed totals to your live meal diary.
                      </p>
                    </div>
                    <button
                      onClick={handleSave}
                      disabled={status === "saving"}
                      className="flex h-14 items-center justify-center gap-3 rounded-2xl bg-lime px-10 text-[16px] font-bold text-forest shadow-premium transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                    >
                      <CheckCircle size={20} weight="fill" />
                      {status === "saving" ? "Commiting Data..." : status === "saved" ? "Meal Saved!" : `Confirm & Save`}
                    </button>
                  </div>
                </Panel>
              </motion.div>
            ) : (
              <Panel className="flex min-h-[500px] items-center justify-center p-12 text-center">
                <div>
                  <p className="text-[22px] font-bold text-forest">No analysis yet</p>
                  <p className="mt-2 text-[13px] text-muted">Enter a meal description or upload a photo to estimate nutrition.</p>
                </div>
              </Panel>
            )}
          </AnimatePresence>
        </div>
      </section>
    </motion.div>
  );
}
