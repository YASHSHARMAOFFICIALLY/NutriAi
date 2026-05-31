"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, Camera, CheckCircle, Crown, ImageSquare, ListChecks, Lock, PencilSimple, Sparkle, Trash, X } from "@phosphor-icons/react/dist/ssr";
import { analyzeFood } from "@/lib/api/food";
import { ApiError } from "@/lib/api/client";
import { createMeal, inferMealType } from "@/lib/api/meals";
import { usePlan } from "@/lib/hooks/swr";
import { uploadFoodImage } from "@/lib/api/uploads";
import type { AnalyzeFoodResponse, MealType } from "@/lib/api/types";
import { EmptyState, PageHeader, Panel } from "../_components/ui";
import { useToast } from "@/lib/toast";

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
  const { toast } = useToast();
  const [text, setText] = useState("");
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [status, setStatus] = useState<"ready" | "uploading" | "analyzing" | "saving" | "saved" | "error">("ready");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [assetId, setAssetId] = useState<string | null>(null);
  const [inputMode, setInputMode] = useState<"photo" | "text">("photo");
  const [errorMessage, setErrorMessage] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const { data: plan } = usePlan();
  const planLoaded = plan !== undefined;
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const previewUrlRef = useRef("");

  const isPro = plan?.tier === "PRO" && (plan.status === "ACTIVE" || plan.status === "PAST_DUE");
  const photoLocked = planLoaded && !isPro;

  const sourceSteps = useMemo(() => [
    { label: assetId ? "Photo ready" : selectedFile ? "Photo selected" : "Prompt ready", icon: ImageSquare },
    { label: "Nutrition estimated", icon: ListChecks },
    { label: "Review before saving", icon: Sparkle },
  ], [assetId, selectedFile]);

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    };
  }, []);

  function handleFileChange(file: File | null) {
    if (photoLocked && file) {
      setUpgradeModalOpen(true);
      return;
    }
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    const nextPreviewUrl = file ? URL.createObjectURL(file) : "";
    previewUrlRef.current = nextPreviewUrl;
    setPreviewUrl(nextPreviewUrl);
    setSelectedFile(file);
    setAssetId(null);
    setCandidate(null);
    setStatus("ready");
  }

  async function handleAnalyze() {
    if (!text.trim() && !selectedFile && !assetId) return;
    if ((selectedFile || assetId) && photoLocked) {
      setUpgradeModalOpen(true);
      return;
    }
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
      if (error instanceof ApiError && error.status === 403) {
        setUpgradeModalOpen(true);
        setStatus("ready");
        return;
      }
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
      toast("success", "Meal saved to your diary.");
    } catch {
      setErrorMessage("Could not save this meal right now.");
      toast("error", "Could not save this meal.");
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

  function updateTitle(value: string) {
    setCandidate((current) => current ? { ...current, title: value } : current);
  }

  function removeItem(index: number) {
    setCandidate((current) => {
      if (!current || current.items.length <= 1) return current;
      const items = current.items.filter((_, itemIndex) => itemIndex !== index);
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

  function updateMealType(value: MealType) {
    setCandidate((current) => current ? { ...current, mealType: value } : current);
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-10 lg:py-10"
    >
      <PageHeader
        eyebrow="Snap"
        title="Meal scanner"
        description="Upload a photo or type a quick description, then review the editable nutrition estimate before saving it to your diary."
      />

      <section className="grid gap-6 xl:grid-cols-[400px_1fr] xl:gap-8">
        <div className="space-y-6">
          <Panel className="p-4 sm:p-6">
            <div className="mb-6 grid grid-cols-2 rounded-lg border border-border bg-surface-alt p-1" role="tablist" aria-label="Meal input mode">
              <button 
                onClick={() => setInputMode("photo")}
                aria-pressed={inputMode === "photo"}
                className={`flex min-h-11 items-center justify-center gap-2 rounded-md py-2.5 text-[13px] font-bold transition-colors ${
                  inputMode === "photo" ? "bg-forest text-white" : "text-muted hover:text-forest"
                }`}
              >
                <Camera size={16} weight={inputMode === "photo" ? "fill" : "bold"} />
                Photo
              </button>
              <button 
                onClick={() => setInputMode("text")}
                aria-pressed={inputMode === "text"}
                className={`flex min-h-11 items-center justify-center gap-2 rounded-md py-2.5 text-[13px] font-bold transition-colors ${
                  inputMode === "text" ? "bg-forest text-white" : "text-muted hover:text-forest"
                }`}
              >
                <PencilSimple size={16} weight="bold" />
                Text Description
              </button>
            </div>

            <AnimatePresence mode="wait">
              {inputMode === "photo" ? (
                <motion.div
                  key="photo"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  onClick={() => {
                    if (photoLocked) setUpgradeModalOpen(true);
                  }}
                  className={`group relative flex h-[260px] flex-col items-center justify-center rounded-lg border border-dashed p-5 text-center transition-colors sm:h-[340px] sm:p-8 ${
                    photoLocked
                      ? "cursor-pointer border-[#d7ff68]/50 bg-[#173c2b] text-white shadow-[0_22px_60px_rgba(23,60,43,0.16)]"
                      : "cursor-pointer border-border bg-surface-alt/60 hover:border-teal/50 hover:bg-surface-alt"
                  }`}
                >
                  <span className={`relative grid h-16 w-16 place-items-center overflow-hidden rounded-lg shadow-sm ${photoLocked ? "bg-white/12 text-[#d7ff68]" : "bg-white text-forest"}`}>
                    {previewUrl ? (
                      <Image src={previewUrl} alt="Selected meal" fill className="rounded-lg object-cover" unoptimized />
                    ) : photoLocked ? (
                      <Lock size={30} weight="duotone" />
                    ) : (
                      <ImageSquare size={32} weight="duotone" />
                    )}
                  </span>
                  <p className={`mt-6 text-[18px] font-bold ${photoLocked ? "text-white" : "text-forest"}`}>
                    {photoLocked ? "Photo scans are Pro" : selectedFile ? "Change photo" : "Drop food photo"}
                  </p>
                  <p className={`mt-2 max-w-[260px] text-[13px] leading-relaxed ${photoLocked ? "text-white/72" : "text-muted"}`}>
                    {photoLocked ? "Upgrade to analyze meals from images. You can still type meals for free." : selectedFile ? `${selectedFile.name} ready` : "Upload a photo to estimate nutrition"}
                  </p>
                  {!photoLocked && (
                    <label className="absolute inset-0 cursor-pointer" aria-label="Upload food photo">
                      <input
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={(event) => handleFileChange(event.target.files?.[0] ?? null)}
                      />
                    </label>
                  )}
                  {photoLocked && (
                    <span className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#d7ff68] px-4 py-2 text-[12px] font-bold text-forest">
                      <Crown size={14} weight="fill" />
                      Unlock photo scan
                    </span>
                  )}
                  {selectedFile ? (
                    <button
                      type="button"
                      onClick={(event) => {
                        event.preventDefault();
                        handleFileChange(null);
                      }}
                      className="absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-lg bg-white text-[20px] font-bold leading-none text-forest shadow-sm transition-colors hover:bg-surface-alt sm:h-9 sm:w-9"
                      aria-label="Remove selected photo"
                    >
                      &times;
                    </button>
                  ) : null}
                </motion.div>
              ) : (
                <motion.div 
                  key="text"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="rounded-lg border border-border bg-surface-alt/60 p-4 sm:p-6"
                >
                  <p className="text-[12px] font-bold uppercase tracking-wider text-muted mb-3">What are you eating?</p>
                  <textarea
                    className="h-40 w-full resize-none rounded-lg border border-border bg-white p-4 text-[15px] font-medium text-forest outline-none transition-colors focus:border-teal"
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
              className="mt-6 w-full rounded-lg bg-forest py-4 text-[15px] font-bold text-white transition-colors hover:bg-forest-soft disabled:cursor-not-allowed disabled:opacity-50"
            >
              {status === "uploading" ? "Uploading photo..." : status === "analyzing" ? "Estimating nutrition..." : "Estimate nutrition"}
            </button>
            
            {status === "error" && (
              <p className="mt-4 rounded-lg border border-amber-100 bg-amber-50 p-3 text-center text-[12px] font-bold text-amber-700">
                {errorMessage || "Could not analyze this meal. Check your connection and try again."}
              </p>
            )}
          </Panel>

          <Panel className="relative overflow-hidden border-none bg-forest p-6 text-white">
             <div className="relative z-10">
               <h3 className="text-[13px] font-bold uppercase tracking-[0.2em] text-lime mb-2">Tip</h3>
               <p className="text-[14px] leading-relaxed text-white/80">
                 Multiple items? List them all or snap a single photo. NutriAI separates complex meals into editable items.
               </p>
             </div>
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
                <Panel className="flex min-h-[360px] h-full items-center justify-center p-6 sm:min-h-[500px] sm:p-12">
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
                <Panel className="p-5 sm:p-8">
                  <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                      <div className="mb-4 flex flex-wrap gap-2">
                        <span className="rounded-full bg-lime/20 px-3 py-1 text-[11px] font-bold text-forest">
                          {Math.round(candidate.confidence * 100)}% Match
                        </span>
                      </div>
                      <h2 className="text-[36px] font-bold tracking-tight text-forest leading-tight">
                        <input
                          value={candidate.title}
                          onChange={(event) => updateTitle(event.target.value)}
                          className="w-full rounded-lg border border-transparent bg-transparent px-0 py-1 text-[26px] font-bold leading-tight tracking-tight text-forest outline-none transition-colors focus:border-teal/30 focus:bg-surface-alt focus:px-3 sm:text-[32px] md:text-[36px]"
                          aria-label="Meal title"
                        />
                      </h2>
                      <label className="mt-4 flex w-full items-center justify-between gap-3 rounded-xl border border-border bg-surface-alt px-4 py-3 text-[13px] font-bold text-forest sm:inline-flex sm:w-auto">
                        Meal type
                        <select
                          value={candidate.mealType}
                          onChange={(event) => updateMealType(event.target.value as MealType)}
                          className="bg-transparent text-[13px] font-bold outline-none"
                        >
                          {(["BREAKFAST", "LUNCH", "DINNER", "SNACK"] as const).map((type) => (
                            <option key={type} value={type}>{type.toLowerCase()}</option>
                          ))}
                        </select>
                      </label>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                      {[
                        { val: candidate.totals.calories, unit: "kcal", label: "Energy" },
                        { val: `${candidate.totals.protein}g`, unit: "", label: "Protein" },
                        { val: `${candidate.totals.carbs}g`, unit: "", label: "Carbs" },
                        { val: `${candidate.totals.fat}g`, unit: "", label: "Fat" },
                      ].map((macro) => (
                        <div key={macro.label} className="rounded-lg border border-border bg-surface-alt p-4 text-center">
                          <p className="text-[20px] font-bold text-forest leading-none">{macro.val}</p>
                          <p className="mt-2 text-[10px] font-bold uppercase tracking-wider text-muted opacity-70">{macro.label}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-8 grid gap-3 md:grid-cols-3 md:gap-4">
                    {sourceSteps.map((step, i) => (
                      <div key={i} className="flex items-center gap-4 rounded-lg border border-border bg-surface-alt/30 p-4">
                        <span className="grid h-10 w-10 place-items-center rounded-lg bg-white text-forest shadow-sm">
                          <step.icon size={18} weight="bold" />
                        </span>
                        <p className="text-[13px] font-bold text-forest/80">{step.label}</p>
                      </div>
                    ))}
                  </div>
                </Panel>

                <Panel className="overflow-hidden">
                  <div className="flex flex-col gap-3 border-b border-border bg-surface-alt p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                    <h2 className="text-[20px] font-bold text-forest tracking-tight">Verified Line Items</h2>
                    <button onClick={addItem} className="flex min-h-11 items-center justify-center gap-2 rounded-lg border border-border bg-white px-4 py-2 text-[13px] font-bold text-forest transition-colors hover:bg-surface-alt">
                      <PencilSimple size={16} weight="bold" />
                      Add row
                    </button>
                  </div>
                  
                  <div className="hidden overflow-x-auto md:block">
                    <table className="w-full min-w-[980px] text-left text-[14px]">
                      <thead className="bg-surface-alt/50 text-muted">
                        <tr>
                          <th className="px-6 py-4 font-bold uppercase tracking-wider text-[11px]">Food Item</th>
                          <th className="px-6 py-4 font-bold uppercase tracking-wider text-[11px]">Amount</th>
                          <th className="px-6 py-4 text-right font-bold uppercase tracking-wider text-[11px]">Calories</th>
                          <th className="px-6 py-4 text-right font-bold uppercase tracking-wider text-[11px]">Protein</th>
                          <th className="px-6 py-4 text-right font-bold uppercase tracking-wider text-[11px]">Carbs</th>
                          <th className="px-6 py-4 text-right font-bold uppercase tracking-wider text-[11px]">Fat</th>
                          <th className="px-6 py-4 text-right font-bold uppercase tracking-wider text-[11px]">Certainty</th>
                          <th className="px-6 py-4 text-right font-bold uppercase tracking-wider text-[11px]">Remove</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border bg-white">
                        {candidate.items.map((item, index) => (
                          <tr key={index} className="group hover:bg-surface-alt/20 transition-colors">
                            <td className="px-6 py-4">
                              <input 
                                className="w-full rounded-md border border-transparent bg-transparent px-2 py-1 font-bold text-forest outline-none transition-colors group-focus-within:border-teal/30 group-focus-within:bg-white group-focus-within:text-teal" 
                                value={item.name} 
                                onChange={(event) => updateItem(index, "name", event.target.value)} 
                                aria-label={`Food item ${index + 1} name`}
                              />
                            </td>
                            <td className="px-6 py-4">
                              <input 
                                className="w-full rounded-md border border-transparent bg-transparent px-2 py-1 text-muted outline-none transition-colors focus:border-teal/30 focus:bg-white" 
                                value={item.quantity || ""} 
                                onChange={(event) => updateItem(index, "quantity", event.target.value)} 
                                aria-label={`Food item ${index + 1} amount`}
                              />
                            </td>
                            <td className="px-6 py-4 text-right">
                              <input 
                                className="w-20 rounded-md border border-transparent bg-transparent px-2 py-1 text-right font-bold text-forest outline-none transition-colors focus:border-teal/30 focus:bg-white" 
                                value={item.calories} 
                                onChange={(event) => updateItem(index, "calories", event.target.value)} 
                                aria-label={`Food item ${index + 1} calories`}
                              />
                            </td>
                            <td className="px-6 py-4 text-right">
                              <input
                                className="w-16 rounded-md border border-transparent bg-transparent px-2 py-1 text-right font-bold text-teal outline-none transition-colors focus:border-teal/30 focus:bg-white"
                                value={item.protein}
                                onChange={(event) => updateItem(index, "protein", event.target.value)}
                                aria-label={`Food item ${index + 1} protein`}
                              />
                            </td>
                            <td className="px-6 py-4 text-right">
                              <input
                                className="w-16 rounded-md border border-transparent bg-transparent px-2 py-1 text-right font-bold text-sage outline-none transition-colors focus:border-teal/30 focus:bg-white"
                                value={item.carbs}
                                onChange={(event) => updateItem(index, "carbs", event.target.value)}
                                aria-label={`Food item ${index + 1} carbs`}
                              />
                            </td>
                            <td className="px-6 py-4 text-right">
                              <input
                                className="w-16 rounded-md border border-transparent bg-transparent px-2 py-1 text-right font-bold text-[#b7791f] outline-none transition-colors focus:border-teal/30 focus:bg-white"
                                value={item.fat}
                                onChange={(event) => updateItem(index, "fat", event.target.value)}
                                aria-label={`Food item ${index + 1} fat`}
                              />
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <div className="h-1.5 w-12 rounded-full bg-surface-alt overflow-hidden">
                                  <div className="h-full bg-teal" style={{ width: `${item.confidence * 100}%` }} />
                                </div>
                                <span className="text-[11px] font-bold text-muted">{Math.round(item.confidence * 100)}%</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button
                                onClick={() => removeItem(index)}
                                disabled={candidate.items.length <= 1}
                                className="inline-grid h-8 w-8 place-items-center rounded-md border border-border bg-white text-muted transition-colors hover:border-[#b7791f]/30 hover:text-[#b7791f] disabled:opacity-40"
                                aria-label={`Remove food item ${index + 1}`}
                              >
                                <Trash size={15} weight="bold" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="grid gap-3 bg-white p-3 md:hidden">
                    {candidate.items.map((item, index) => (
                      <div key={index} className="rounded-lg border border-border bg-surface-alt p-4">
                        <div className="grid gap-3">
                          <label className="text-[11px] font-bold uppercase tracking-wider text-muted">
                            Food item
                            <input
                              className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-[14px] font-bold text-forest outline-none focus:border-teal"
                              value={item.name}
                              onChange={(event) => updateItem(index, "name", event.target.value)}
                            />
                          </label>
                          <label className="text-[11px] font-bold uppercase tracking-wider text-muted">
                            Amount
                            <input
                              className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-[14px] text-foreground outline-none focus:border-teal"
                              value={item.quantity || ""}
                              onChange={(event) => updateItem(index, "quantity", event.target.value)}
                            />
                          </label>
                          <div className="grid grid-cols-2 gap-2">
                            <label className="text-[11px] font-bold uppercase tracking-wider text-muted">
                              kcal
                              <input
                                className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-[14px] font-bold text-forest outline-none focus:border-teal"
                                value={item.calories}
                                onChange={(event) => updateItem(index, "calories", event.target.value)}
                              />
                            </label>
                            <div className="rounded-lg bg-white p-3">
                              <p className="text-[11px] font-bold uppercase tracking-wider text-muted">Protein</p>
                              <input
                                className="mt-1 w-full rounded-md border border-transparent bg-transparent text-[14px] font-bold text-teal outline-none focus:border-teal/30 focus:bg-surface-alt"
                                value={item.protein}
                                onChange={(event) => updateItem(index, "protein", event.target.value)}
                                aria-label={`Food item ${index + 1} protein`}
                              />
                            </div>
                            <div className="rounded-lg bg-white p-3">
                              <p className="text-[11px] font-bold uppercase tracking-wider text-muted">Certainty</p>
                              <p className="mt-1 text-[14px] font-bold text-forest">{Math.round(item.confidence * 100)}%</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <label className="text-[11px] font-bold uppercase tracking-wider text-muted">
                              carbs
                              <input
                                className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-[14px] font-bold text-sage outline-none focus:border-teal"
                                value={item.carbs}
                                onChange={(event) => updateItem(index, "carbs", event.target.value)}
                              />
                            </label>
                            <label className="text-[11px] font-bold uppercase tracking-wider text-muted">
                              fat
                              <input
                                className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-[14px] font-bold text-[#b7791f] outline-none focus:border-teal"
                                value={item.fat}
                                onChange={(event) => updateItem(index, "fat", event.target.value)}
                              />
                            </label>
                            <button
                              onClick={() => removeItem(index)}
                              disabled={candidate.items.length <= 1}
                              className="col-span-2 flex min-h-11 items-center justify-center gap-2 rounded-lg border border-border bg-white px-3 py-2 text-[12px] font-bold text-muted transition-colors hover:border-[#b7791f]/30 hover:text-[#b7791f] disabled:opacity-40"
                            >
                              <Trash size={14} weight="bold" />
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="sticky bottom-[calc(5.25rem+env(safe-area-inset-bottom))] z-20 flex flex-col gap-4 border-t border-border bg-surface-alt p-4 shadow-[0_-12px_32px_rgba(16,21,16,0.08)] lg:static lg:flex-row lg:items-center lg:justify-between lg:p-8 lg:shadow-none">
                    <div>
                      <p className="text-[14px] font-medium text-muted leading-relaxed">
                        Saving this meal adds the reviewed totals to your diary and updates today&apos;s dashboard.
                      </p>
                    </div>
                    <button
                      onClick={handleSave}
                      disabled={status === "saving"}
                      className="flex h-14 w-full items-center justify-center gap-3 rounded-lg bg-lime px-6 text-[16px] font-bold text-forest transition-colors hover:bg-white disabled:opacity-50 lg:w-auto lg:px-10"
                    >
                      <CheckCircle size={20} weight="fill" />
                      {status === "saving" ? "Saving meal..." : status === "saved" ? "Meal saved" : "Confirm and save"}
                    </button>
                  </div>
                </Panel>
              </motion.div>
            ) : (
              <Panel className="flex min-h-[360px] items-center justify-center p-5 sm:min-h-[500px] sm:p-8">
                <EmptyState
                  icon={ImageSquare}
                  title="No analysis yet"
                  description="Add a meal photo or description from the left panel. Results appear here for review before anything is saved."
                />
              </Panel>
            )}
          </AnimatePresence>
        </div>
      </section>

      <AnimatePresence>
        {upgradeModalOpen && (
          <motion.div
            className="fixed inset-0 z-[90] grid place-items-center bg-[#101510]/58 px-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="photo-upgrade-title"
            onClick={() => setUpgradeModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 18, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 260, damping: 24 }}
              className="relative w-full max-w-[460px] overflow-hidden rounded-xl border border-white/12 bg-white p-6 text-forest shadow-[0_34px_100px_rgba(16,21,16,0.34)] sm:p-7"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="absolute inset-x-0 top-0 h-1 bg-[#d7ff68]" />
              <button
                type="button"
                onClick={() => setUpgradeModalOpen(false)}
                className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-lg border border-border bg-surface-alt text-forest transition-colors hover:bg-white"
                aria-label="Close upgrade popup"
              >
                <X size={16} weight="bold" />
              </button>
              <div className="grid h-14 w-14 place-items-center rounded-lg bg-[#173c2b] text-[#d7ff68] shadow-[0_16px_34px_rgba(23,60,43,0.18)]">
                <Crown size={28} weight="fill" />
              </div>
              <p className="mt-6 text-[12px] font-bold uppercase tracking-[0.16em] text-teal">Pro feature</p>
              <h2 id="photo-upgrade-title" className="mt-2 text-[28px] font-bold tracking-tight text-forest">
                Photo meal scans are for Pro.
              </h2>
              <p className="mt-3 text-[14px] leading-6 text-muted">
                Upgrade to scan food images, get editable nutrition estimates, and keep every meal synced with your dashboard.
              </p>
              <div className="mt-5 grid gap-2">
                {["Image-based meal analysis", "Editable calories and macros", "Unlimited Pro workflow"].map((item) => (
                  <div key={item} className="flex items-center gap-3 rounded-lg border border-border bg-surface-alt px-3 py-2.5 text-[13px] font-bold text-forest">
                    <CheckCircle size={16} weight="fill" className="text-teal" />
                    {item}
                  </div>
                ))}
              </div>
              <div className="mt-6 grid gap-3 sm:grid-cols-[1fr_auto]">
                <Link
                  href="/pricing"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-forest px-5 text-[14px] font-bold text-white transition-colors hover:bg-forest-soft"
                >
                  View Pro Plans
                  <ArrowRight size={15} weight="bold" />
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setUpgradeModalOpen(false);
                    setInputMode("text");
                  }}
                  className="inline-flex min-h-12 items-center justify-center rounded-lg border border-border bg-white px-5 text-[14px] font-bold text-forest transition-colors hover:bg-surface-alt"
                >
                  Type meal instead
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
