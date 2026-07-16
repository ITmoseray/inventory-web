"use client";

import { useEffect, useState } from "react";
import { Tag, Plus, Trash2, RefreshCw } from "lucide-react";
import { ModuleHeader } from "@/components/layout/ModuleHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getTags, createTag, deleteTag } from "@/lib/actions/tags";
import { toast } from "sonner";

const PRESET_COLORS = [
  "#4F46E5", // Indigo
  "#7C3AED", // Violet
  "#DB2777", // Pink
  "#DC2626", // Red
  "#D97706", // Amber
  "#16A34A", // Green
  "#0891B2", // Cyan
  "#1D4ED8", // Blue
  "#9333EA", // Purple
  "#475569", // Slate
];

export default function TransactionTagsPage() {
  const [tags, setTags] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  // New tag form
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState(PRESET_COLORS[0]);

  useEffect(() => {
    loadTags();
  }, []);

  async function loadTags() {
    setLoading(true);
    const res = await getTags();
    if (res.success) {
      setTags(res.tags);
    } else {
      toast.error(res.error || "Failed to load tags");
    }
    setLoading(false);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return toast.error("Tag name is required.");
    setCreating(true);
    const res = await createTag({ name: newName, color: newColor });
    if (res.success) {
      toast.success(`Tag "${newName}" created!`);
      setTags(prev => [...prev, res.tag].sort((a, b) => a.name.localeCompare(b.name)));
      setNewName("");
    } else {
      toast.error(res.error || "Failed to create tag");
    }
    setCreating(false);
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete the tag "${name}"? It will be removed from all linked transactions.`)) return;
    const res = await deleteTag(id);
    if (res.success) {
      toast.success("Tag deleted");
      setTags(prev => prev.filter(t => t.id !== id));
    } else {
      toast.error(res.error || "Failed to delete tag");
    }
  }

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Transaction Tags"
        description="Create color-coded labels to categorize and filter your expenses and sales."
        icon={Tag}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Create Tag Panel */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 h-fit">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">
            Create New Tag
          </h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tag-name">Tag Name</Label>
              <Input
                id="tag-name"
                placeholder="e.g. Marketing, Utilities..."
                value={newName}
                onChange={e => setNewName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex flex-wrap gap-2">
                {PRESET_COLORS.map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setNewColor(color)}
                    className="w-7 h-7 rounded-full transition-all border-2"
                    style={{
                      backgroundColor: color,
                      borderColor: newColor === color ? "#1e293b" : "transparent",
                      transform: newColor === color ? "scale(1.2)" : "scale(1)",
                    }}
                    title={color}
                  />
                ))}
              </div>
              <div className="flex items-center gap-3 mt-2">
                <div
                  className="w-6 h-6 rounded-full border border-slate-200 dark:border-slate-700 shrink-0"
                  style={{ backgroundColor: newColor }}
                />
                <span className="text-xs text-slate-500 font-mono">{newColor}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <div
                className="flex items-center gap-1.5 px-3 py-1 rounded-full text-white text-sm font-semibold"
                style={{ backgroundColor: newColor }}
              >
                <span>#</span>
                <span>{newName || "Preview"}</span>
              </div>
            </div>

            <Button
              type="submit"
              disabled={creating}
              className="w-full h-10 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
            >
              {creating ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Tag
                </>
              )}
            </Button>
          </form>
        </div>

        {/* Tags List */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">
            Your Tags ({tags.length})
          </h2>

          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-slate-50 dark:bg-slate-800 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : tags.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-slate-400">
              <Tag className="h-10 w-10 mb-2 opacity-30" />
              <p className="text-sm">No tags yet. Create your first tag.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {tags.map(tag => (
                <div
                  key={tag.id}
                  className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl group"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full shrink-0"
                      style={{ backgroundColor: tag.color }}
                    />
                    <span
                      className="text-sm font-semibold px-3 py-1 rounded-full text-white"
                      style={{ backgroundColor: tag.color }}
                    >
                      {tag.name}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">{tag.color}</span>
                  </div>
                  <button
                    onClick={() => handleDelete(tag.id, tag.name)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-rose-500 hover:text-rose-700 p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30"
                    title="Delete tag"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 rounded-2xl p-5">
        <h3 className="font-semibold text-indigo-800 dark:text-indigo-300 mb-1">How to use Tags</h3>
        <p className="text-sm text-indigo-700 dark:text-indigo-400">
          After creating tags here, they will appear as a tagging option when you record a new expense or view an expense detail. 
          You can then filter your expense reports and cashflow statements by tag.
        </p>
      </div>
    </div>
  );
}
