import React, { useState } from "react";
import { 
  Settings, Globe, Phone, Mail, Truck, DollarSign, Save, 
  ExternalLink, AlertTriangle, ShieldCheck, Trash2, AlertOctagon, RefreshCw, X
} from "lucide-react";
import { updateStoreConfig, deleteStore } from "@/lib/actions/store-builder";
import { toast } from "sonner";

interface Props {
  store: any;
  onStoreDeleted?: () => void;
}

export function StoreSettingsManager({ store, onStoreDeleted }: Props) {
  const [name, setName] = useState(store.name || "");
  const [slug, setSlug] = useState(store.slug || "");
  const [description, setDescription] = useState(store.description || "");
  const [currency, setCurrency] = useState(store.currency || "SLE");
  const [whatsappPhone, setWhatsappPhone] = useState(store.whatsappPhone || "");
  const [contactPhone, setContactPhone] = useState(store.contactPhone || "");
  const [contactEmail, setContactEmail] = useState(store.contactEmail || "");

  const existingSettings = (store.settings as any) || {};
  const [deliveryFee, setDeliveryFee] = useState(String(existingSettings.deliveryFee ?? 20));
  const [freeDeliveryThreshold, setFreeDeliveryThreshold] = useState(String(existingSettings.freeDeliveryThreshold ?? 250));
  const [minOrder, setMinOrder] = useState(String(existingSettings.minOrder ?? 0));
  const [allowCashOnDelivery, setAllowCashOnDelivery] = useState(existingSettings.allowCashOnDelivery !== false);
  const [announcementText, setAnnouncementText] = useState(existingSettings.announcementText || "Special online discounts available this week!");
  const [announcementEnabled, setAnnouncementEnabled] = useState(existingSettings.announcementEnabled !== false);

  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateStoreConfig({
        name,
        slug: slug.trim().toLowerCase(),
        description,
        currency,
        whatsappPhone,
        contactPhone,
        contactEmail,
        settings: {
          deliveryFee: parseFloat(deliveryFee) || 0,
          freeDeliveryThreshold: parseFloat(freeDeliveryThreshold) || 0,
          minOrder: parseFloat(minOrder) || 0,
          allowCashOnDelivery,
          allowOnlinePayment: true,
          announcementText,
          announcementEnabled
        }
      });
      toast.success("Store settings updated successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteStore = async () => {
    if (deleteConfirmText.trim().toLowerCase() !== "delete") {
      toast.error("Please type DELETE to confirm");
      return;
    }
    setIsDeleting(true);
    try {
      await deleteStore();
      toast.success("Online storefront deleted successfully. Dashboard reset.");
      setShowDeleteModal(false);
      onStoreDeleted?.();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete store");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <form onSubmit={handleSave} className="space-y-6">
        {/* Identity */}
        <div className="bg-card border rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-base text-foreground flex items-center gap-2 border-b pb-3">
            <Globe className="w-4 h-4 text-primary" />
            Store Identity & Public Web Address
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Store Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-background border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Store URL Slug (web address)
              </label>
              <div className="flex items-center">
                <span className="px-3 py-2 bg-muted border border-r-0 rounded-l-xl text-xs text-muted-foreground font-mono">
                  /store/
                </span>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                  className="w-full px-3 py-2 bg-background border rounded-r-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">Letters, numbers, and hyphens only.</p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">Store Tagline & Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-background border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="Briefly describe what your store sells..."
            />
          </div>
        </div>

        {/* Customer Contact & WhatsApp Ordering */}
        <div className="bg-card border rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-base text-foreground flex items-center gap-2 border-b pb-3">
            <Phone className="w-4 h-4 text-emerald-500" />
            WhatsApp Checkout & Contact Channels
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                WhatsApp Order Receiver Phone
              </label>
              <input
                type="text"
                placeholder="+232 7X XXX XXX"
                value={whatsappPhone}
                onChange={(e) => setWhatsappPhone(e.target.value)}
                className="w-full px-3 py-2 bg-background border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <p className="text-[11px] text-muted-foreground mt-1">Customer orders will be forwarded to this WhatsApp number.</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Contact Phone</label>
              <input
                type="text"
                placeholder="e.g. +232 88 123456"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className="w-full px-3 py-2 bg-background border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Contact Email</label>
              <input
                type="email"
                placeholder="store@example.com"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="w-full px-3 py-2 bg-background border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>
        </div>

        {/* Delivery & Checkout Logistics */}
        <div className="bg-card border rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-base text-foreground flex items-center gap-2 border-b pb-3">
            <Truck className="w-4 h-4 text-primary" />
            Delivery & Checkout Rules
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Standard Delivery Fee ({currency})</label>
              <input
                type="number"
                value={deliveryFee}
                onChange={(e) => setDeliveryFee(e.target.value)}
                className="w-full px-3 py-2 bg-background border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Free Delivery Threshold ({currency})</label>
              <input
                type="number"
                value={freeDeliveryThreshold}
                onChange={(e) => setFreeDeliveryThreshold(e.target.value)}
                className="w-full px-3 py-2 bg-background border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <p className="text-[11px] text-muted-foreground mt-1">Orders above this amount receive free delivery.</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Store Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3 py-2 bg-background border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="SLE">Sierra Leone Leone (SLE)</option>
                <option value="USD">US Dollar ($)</option>
                <option value="EUR">Euro (€)</option>
                <option value="GBP">British Pound (£)</option>
              </select>
            </div>
          </div>

          <div className="pt-2 border-t flex items-center gap-3">
            <input
              type="checkbox"
              id="codToggle"
              checked={allowCashOnDelivery}
              onChange={(e) => setAllowCashOnDelivery(e.target.checked)}
              className="w-4 h-4 rounded text-primary"
            />
            <label htmlFor="codToggle" className="text-xs font-semibold text-foreground cursor-pointer">
              Allow Cash on Delivery (COD) payments during checkout
            </label>
          </div>
        </div>

        {/* Announcement Bar */}
        <div className="bg-card border rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-base text-foreground flex items-center justify-between border-b pb-3">
            <span>Top Announcement Banner</span>
            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium">
              <input
                type="checkbox"
                checked={announcementEnabled}
                onChange={(e) => setAnnouncementEnabled(e.target.checked)}
                className="w-4 h-4 rounded text-primary"
              />
              Display on storefront
            </label>
          </h3>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">Banner Announcement Text</label>
            <input
              type="text"
              value={announcementText}
              onChange={(e) => setAnnouncementText(e.target.value)}
              disabled={!announcementEnabled}
              placeholder="e.g. Free Delivery across Freetown on all orders over Le 250!"
              className="w-full px-3 py-2 bg-background border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
            />
          </div>
        </div>

        {/* Save Action */}
        <div className="flex items-center justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition-opacity shadow-md"
          >
            <Save className="w-4 h-4" />
            {isSaving ? "Saving..." : "Save Store Settings"}
          </button>
        </div>
      </form>

      {/* ── DANGER ZONE: DELETE STOREFRONT ────────────────── */}
      <div className="border border-red-500/30 dark:border-red-500/20 bg-red-500/[0.03] rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2.5 text-red-600 dark:text-red-400">
          <AlertOctagon className="w-5 h-5 flex-shrink-0" />
          <h3 className="font-extrabold text-base tracking-tight">Danger Zone: Delete Online Storefront</h3>
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed">
          Need to start completely fresh or retire this storefront? Deleting your store will remove the public web storefront 
          (<span className="font-mono text-foreground font-semibold">/store/{store.slug}</span>), its visual sections, pages, 
          and AI theme configurations. 
        </p>

        <div className="p-3.5 rounded-xl bg-background/80 border border-border/80 flex items-start gap-3 text-xs text-muted-foreground">
          <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
          <span>
            <strong className="text-foreground">ERP Data Protection:</strong> Your internal product catalog, inventory stock levels, POS sales receipts, physical orders, and customer accounts are 100% safe and will NOT be deleted.
          </span>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={() => {
              setDeleteConfirmText("");
              setShowDeleteModal(true);
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Trash2 className="w-4 h-4" />
            Delete Online Storefront
          </button>
        </div>
      </div>

      {/* ── CONFIRM DELETE MODAL ─────────────────────────── */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-card border border-border rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between gap-4">
              <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center flex-shrink-0">
                <Trash2 className="w-6 h-6" />
              </div>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-black tracking-tight text-foreground">
                Delete &quot;{store.name}&quot;?
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                This action is irreversible. The web storefront at <span className="font-mono text-primary font-bold">/store/{store.slug}</span> will be taken offline immediately, and the workspace will return to the AI Store Builder Wizard so you can generate a new one anytime.
              </p>
            </div>

            <div className="space-y-2 pt-1">
              <label className="block text-xs font-bold text-foreground">
                Type <span className="font-mono text-red-600 font-black">DELETE</span> to confirm:
              </label>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="DELETE"
                className="w-full px-4 py-2.5 bg-background border rounded-xl text-sm font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-xs font-semibold rounded-xl border hover:bg-muted text-foreground transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteStore}
                disabled={deleteConfirmText.trim().toLowerCase() !== "delete" || isDeleting}
                className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold uppercase tracking-wider rounded-xl bg-red-600 hover:bg-red-700 text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-red-600/20"
              >
                {isDeleting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    Confirm Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
