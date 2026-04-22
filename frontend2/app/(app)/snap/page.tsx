"use client";

import { useMemo, useState } from "react";
import { Camera, CheckCircle, Database, ImageSquare, PencilSimple, Sparkle, TextT } from "@phosphor-icons/react/dist/ssr";
import { analyzeFood } from "@/lib/api/food";
import { createMeal, inferMealType } from "@/lib/api/meals";
import { uploadFoodImage } from "@/lib/api/uploads";
import type { AnalyzeFoodResponse, MealType } from "@/lib/api/types";
import { analysisCandidate, remaining } from "../_components/mock-data";
import { PageHeader, Panel, SourceBadge } from "../_components/ui";

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

const fallbackCandidate: Candidate = {
  queryId: analysisCandidate.queryId,
  provider: analysisCandidate.provider,
  model: analysisCandidate.model,
  cached: analysisCandidate.cached,
  latencyMs: analysisCandidate.latencyMs,
  confidence: analysisCandidate.confidence,
  title: analysisCandidate.title,
  mealType: analysisCandidate.mealType,
  items: analysisCandidate.items,
  totals: analysisCandidate.totals,
};

export default function SnapPage() {
  const [text, setText] = useState("Paneer rice bowl with mixed vegetables");
  const [candidate, setCandidate] = useState<Candidate>(fallbackCandidate);
  const [status, setStatus] = useState<"ready" | "uploading" | "analyzing" | "saving" | "saved" | "error">("ready");
  const [source, setSource] = useState<"live" | "fallback">("fallback");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [assetId, setAssetId] = useState<string | null>(null);

  const sourceSteps = useMemo(() => [
    { label: assetId ? "Private upload confirmed" : selectedFile ? "Photo selected" : text.trim() ? "Text prompt prepared" : "Photo upload pending" },
    { label: candidate.cached ? "Cache hit returned" : "Backend analysis returned" },
    { label: candidate.provider === "openai" || candidate.provider === "gemini" ? "AI estimate normalized" : "Nutrition rows normalized" },
  ], [assetId, candidate, selectedFile, text]);

  async function handleAnalyze() {
    if (!text.trim() && !selectedFile && !assetId) return;
    try {
      let confirmedAssetId = assetId;
      if (selectedFile && !confirmedAssetId) {
        setStatus("uploading");
        const upload = await uploadFoodImage(selectedFile);
        confirmedAssetId = upload.id;
        setAssetId(upload.id);
      }
      setStatus("analyzing");
      const result = await analyzeFood(confirmedAssetId ? { assetId: confirmedAssetId, text: text.trim() || undefined } : { text: text.trim() });
      setCandidate(candidateFromApi(result));
      setSource("live");
      setStatus("ready");
    } catch {
      setSource("fallback");
      setStatus("error");
    }
  }

  async function handleSave() {
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
      setSource("live");
    } catch {
      setStatus("error");
    }
  }

  function updateItem(index: number, field: keyof Candidate["items"][number], value: string) {
    setCandidate((current) => {
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
    setCandidate((current) => ({
      ...current,
      items: [
        ...current.items,
        { name: "New item", quantity: "1 serving", calories: 0, protein: 0, carbs: 0, fat: 0, confidence: 0.5 },
      ],
    }));
  }

  return (
    <div className="mx-auto max-w-7xl px-5 py-8 lg:px-8">
      <PageHeader eyebrow="Analyze food" title="Scan, verify, save" />

      <section className="grid gap-5 xl:grid-cols-[360px_1fr]">
        <Panel className="p-5">
          <div className="mb-4 grid grid-cols-2 rounded-md border border-black/10 bg-[#f8f8f3] p-1">
            <button className="flex items-center justify-center gap-2 rounded-md bg-[#173c2b] px-3 py-2 text-[13px] font-bold text-white">
              <Camera size={15} weight="fill" />
              Photo
            </button>
            <button className="flex items-center justify-center gap-2 rounded-md px-3 py-2 text-[13px] font-bold text-[#5f675f]">
              <TextT size={15} />
              Text
            </button>
          </div>

          <label className="flex h-[320px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-black/14 bg-[#eef5f2] p-6 text-center">
            <span className="grid h-14 w-14 place-items-center rounded-lg bg-white text-[#173c2b]">
              <ImageSquare size={28} weight="duotone" />
            </span>
            <p className="mt-5 text-[20px] font-semibold">Upload food image</p>
            <p className="mt-2 text-[13px] leading-6 text-[#5f675f]">
              {selectedFile ? `${selectedFile.name} · ${(selectedFile.size / 1024 / 1024).toFixed(1)} MB` : "Private upload, then analysis by confirmed asset ID."}
            </p>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
              className="sr-only"
              onChange={(event) => {
                const file = event.target.files?.[0] ?? null;
                setSelectedFile(file);
                setAssetId(null);
              }}
            />
          </label>

          <div className="mt-4 rounded-lg border border-black/8 bg-white p-4">
            <p className="text-[12px] font-semibold text-[#5f675f]">Or describe the meal</p>
            <textarea
              className="mt-2 h-24 w-full resize-none rounded-md border border-black/10 bg-[#f8f8f3] p-3 text-[14px] outline-none"
              value={text}
              onChange={(event) => setText(event.target.value)}
            />
          </div>

          <button
            onClick={handleAnalyze}
            disabled={status === "analyzing" || status === "uploading" || (!text.trim() && !selectedFile && !assetId)}
            className="mt-4 w-full rounded-md bg-[#173c2b] py-3.5 text-[14px] font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {status === "uploading" ? "Uploading..." : status === "analyzing" ? "Analyzing..." : "Analyze"}
          </button>
          {status === "error" ? <p className="mt-3 text-[12px] font-semibold text-[#b7791f]">Backend call failed, showing demo nutrition so the page still works.</p> : null}
        </Panel>

        <div className="space-y-5">
          <Panel className="p-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <div className="mb-3 flex flex-wrap gap-2">
                  <SourceBadge label={source} />
                  <SourceBadge label={candidate.provider} />
                  <SourceBadge label={candidate.cached ? "cached" : "not cached"} />
                  <SourceBadge label={`${candidate.latencyMs}ms`} />
                  <SourceBadge label={`${Math.round(candidate.confidence * 100)}% confidence`} />
                </div>
                <h2 className="text-[30px] font-semibold">{candidate.title}</h2>
                <p className="mt-2 text-[13px] text-[#5f675f]">Food query {candidate.queryId} · save as {candidate.mealType.toLowerCase()}</p>
              </div>
              <div className="grid grid-cols-4 gap-2 text-center">
                {[
                  [candidate.totals.calories, "kcal"],
                  [`${candidate.totals.protein}g`, "protein"],
                  [`${candidate.totals.carbs}g`, "carbs"],
                  [`${candidate.totals.fat}g`, "fat"],
                ].map(([value, label]) => (
                  <div key={label} className="rounded-md bg-[#f8f8f3] px-3 py-2">
                    <p className="text-[17px] font-semibold">{value}</p>
                    <p className="text-[10px] text-[#5f675f]">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-3">
              {sourceSteps.map((step, index) => (
                <div key={step.label} className="flex items-center gap-3 rounded-md border border-black/8 bg-[#f8f8f3] p-3">
                  <span className="grid h-7 w-7 place-items-center rounded-md bg-[#d7ff68] text-[#101510]">
                    {index === 0 ? <ImageSquare size={14} weight="bold" /> : index === 1 ? <Database size={14} weight="bold" /> : <Sparkle size={14} weight="bold" />}
                  </span>
                  <p className="text-[12px] font-semibold">{step.label}</p>
                </div>
              ))}
            </div>
          </Panel>

          <Panel className="overflow-hidden">
            <div className="flex items-center justify-between border-b border-black/10 p-5">
              <h2 className="text-[22px] font-semibold">Editable nutrition rows</h2>
              <button onClick={addItem} className="flex items-center gap-2 rounded-md border border-black/10 px-3 py-2 text-[12px] font-bold">
                <PencilSimple size={14} />
                Add item
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px] text-left text-[13px]">
                <thead className="bg-[#eef5f2] text-[#5f675f]">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Food</th>
                    <th className="px-5 py-3 font-semibold">Quantity</th>
                    <th className="px-5 py-3 text-right font-semibold">Calories</th>
                    <th className="px-5 py-3 text-right font-semibold">Protein</th>
                    <th className="px-5 py-3 text-right font-semibold">Carbs</th>
                    <th className="px-5 py-3 text-right font-semibold">Fat</th>
                    <th className="px-5 py-3 text-right font-semibold">Confidence</th>
                  </tr>
                </thead>
                <tbody>
                  {candidate.items.map((item, index) => (
                    <tr key={`${item.name}-${item.quantity}`} className="border-t border-black/8">
                      <td className="px-5 py-4 font-semibold">
                        <input className="w-full rounded-md border border-black/10 bg-white px-2 py-1 outline-none" value={item.name} onChange={(event) => updateItem(index, "name", event.target.value)} />
                      </td>
                      <td className="px-5 py-4 text-[#5f675f]">
                        <input className="w-full rounded-md border border-black/10 bg-white px-2 py-1 outline-none" value={item.quantity || ""} onChange={(event) => updateItem(index, "quantity", event.target.value)} />
                      </td>
                      <td className="px-5 py-4 text-right"><input className="w-20 rounded-md border border-black/10 bg-white px-2 py-1 text-right outline-none" value={item.calories} onChange={(event) => updateItem(index, "calories", event.target.value)} /></td>
                      <td className="px-5 py-4 text-right"><input className="w-20 rounded-md border border-black/10 bg-white px-2 py-1 text-right outline-none" value={item.protein} onChange={(event) => updateItem(index, "protein", event.target.value)} /></td>
                      <td className="px-5 py-4 text-right"><input className="w-20 rounded-md border border-black/10 bg-white px-2 py-1 text-right outline-none" value={item.carbs} onChange={(event) => updateItem(index, "carbs", event.target.value)} /></td>
                      <td className="px-5 py-4 text-right"><input className="w-20 rounded-md border border-black/10 bg-white px-2 py-1 text-right outline-none" value={item.fat} onChange={(event) => updateItem(index, "fat", event.target.value)} /></td>
                      <td className="px-5 py-4 text-right">{Math.round(item.confidence * 100)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex flex-col gap-3 border-t border-black/10 p-5 md:flex-row md:items-center md:justify-between">
              <p className="text-[13px] text-[#5f675f]">
                After save: {Math.max(0, remaining.calories - candidate.totals.calories)} kcal left, {Math.max(0, remaining.protein - candidate.totals.protein)}g protein gap.
              </p>
              <button
                onClick={handleSave}
                disabled={status === "saving"}
                className="flex items-center justify-center gap-2 rounded-md bg-[#d7ff68] px-5 py-3 text-[14px] font-bold text-[#101510] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <CheckCircle size={17} weight="fill" />
                {status === "saving" ? "Saving..." : status === "saved" ? "Saved" : `Save as ${candidate.mealType.toLowerCase()}`}
              </button>
            </div>
          </Panel>
        </div>
      </section>
    </div>
  );
}
