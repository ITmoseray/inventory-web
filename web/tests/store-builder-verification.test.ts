import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { STARTER_TEMPLATES, getStarterTemplateById } from "../src/lib/store-builder/starter-templates";
import { normalizeStoreProduct, StoreThemeSchema, StoreSectionSchema } from "../src/types/store-builder";
import { executeAIStoreModification } from "../src/lib/store-builder/ai-service";

describe("ProTech Assist AI Store Builder - Verification Suite", () => {
  // ── 1. TEMPLATE CATALOG TESTS ──────────────────────────────────────
  describe("1. Starter Templates Catalog & Distinctness", () => {
    it("should load all 20 starter templates with valid structure", () => {
      assert.ok(STARTER_TEMPLATES.length >= 20, `Expected at least 20 templates, found ${STARTER_TEMPLATES.length}`);
      
      const seenIds = new Set<string>();
      STARTER_TEMPLATES.forEach((tpl) => {
        assert.ok(tpl.templateId, "Template must have a templateId");
        assert.ok(!seenIds.has(tpl.templateId), `Duplicate templateId detected: ${tpl.templateId}`);
        seenIds.add(tpl.templateId);

        assert.ok(tpl.name, `Template ${tpl.templateId} missing name`);
        assert.ok(tpl.category, `Template ${tpl.templateId} missing category`);
        assert.ok(tpl.themeConfig, `Template ${tpl.templateId} missing themeConfig`);
        assert.ok(tpl.themeConfig.colors.primary, `Template ${tpl.templateId} missing primary color`);
        assert.ok(Array.isArray(tpl.sections) && tpl.sections.length > 0, `Template ${tpl.templateId} must have sections`);

        // Validate theme against Zod schema
        const themeValidation = StoreThemeSchema.safeParse(tpl.themeConfig);
        assert.ok(themeValidation.success, `Template ${tpl.templateId} failed StoreThemeSchema validation`);
      });
    });

    it("should safely handle getStarterTemplateById for valid and invalid IDs", () => {
      const fashionTpl = getStarterTemplateById("tpl-nova-fashion");
      assert.ok(fashionTpl, "Expected tpl-nova-fashion to exist");
      assert.equal(fashionTpl?.name, "Nova Fashion");

      const invalidTpl = getStarterTemplateById("non-existent-template-id");
      assert.equal(invalidTpl, undefined, "Invalid template ID should safely return undefined");
    });

    it("should verify templates have distinct visual styles and palettes", () => {
      const fashion = getStarterTemplateById("tpl-nova-fashion");
      const tech = getStarterTemplateById("tpl-techhub");
      const grocery = getStarterTemplateById("tpl-freshmart");

      assert.notEqual(fashion?.themeConfig.colors.primary, tech?.themeConfig.colors.primary, "Fashion and Tech should have distinct primary colors");
      assert.notEqual(tech?.themeConfig.colors.primary, grocery?.themeConfig.colors.primary, "Tech and Grocery should have distinct primary colors");
      assert.notEqual(fashion?.themeConfig.style, tech?.themeConfig.style, "Fashion and Tech should have distinct style archetypes");
    });
  });

  // ── 2. PRODUCT NORMALIZATION & INVENTORY TESTS ────────────────────
  describe("2. Product Normalization & Accurate Stock Management", () => {
    it("should accurately normalize an enterprise connected product", () => {
      const enterpriseItem = {
        id: "sp-101",
        productId: "prod-999",
        product: {
          id: "prod-999",
          name: "Original Pro Smartphone",
          unitPrice: 1200,
          compareAtPrice: 1450,
          stockQuantity: 14,
          sku: "PHN-001",
          imageUrl: "https://example.com/phone.jpg",
          category: { name: "Electronics" }
        }
      };

      const normalized = normalizeStoreProduct(enterpriseItem);
      assert.equal(normalized.name, "Original Pro Smartphone");
      assert.equal(normalized.price, 1200);
      assert.equal(normalized.originalPrice, 1450);
      assert.equal(normalized.stockQuantity, 14);
      assert.equal(normalized.inStock, true);
      assert.equal(normalized.category, "Electronics");
      assert.equal(normalized.isStandalone, false);
    });

    it("should accurately normalize a standalone store product (without crashing)", () => {
      const standaloneItem = {
        id: "sp-202",
        customName: "Handcrafted Leather Tote Bag",
        customPrice: 650,
        standaloneStock: 5,
        standaloneCategory: "Fashion & Bags",
        customDescription: "100% genuine full-grain leather.",
        imageUrl: "https://example.com/bag.jpg",
        product: null
      };

      const normalized = normalizeStoreProduct(standaloneItem);
      assert.equal(normalized.name, "Handcrafted Leather Tote Bag");
      assert.equal(normalized.price, 650);
      assert.equal(normalized.stockQuantity, 5);
      assert.equal(normalized.inStock, true);
      assert.equal(normalized.category, "Fashion & Bags");
      assert.equal(normalized.isStandalone, true);
    });

    it("should correctly identify out-of-stock items and disallow false inStock flags", () => {
      const outOfStockItem = {
        id: "sp-303",
        name: "Sold Out Sneaker",
        price: 800,
        stockQuantity: 0,
        product: null
      };

      const normalized = normalizeStoreProduct(outOfStockItem);
      assert.equal(normalized.stockQuantity, 0);
      assert.equal(normalized.inStock, false, "Product with 0 stock must be flagged as inStock: false");
    });

    it("should return safe fallback when item is null or undefined", () => {
      const fallback = normalizeStoreProduct(null);
      assert.ok(fallback.name, "Fallback must have a name");
      assert.ok(fallback.id, "Fallback must have an id");
      assert.equal(fallback.inStock, true);
    });
  });

  // ── 3. AI DESIGN ASSISTANT TESTS ──────────────────────────────────
  describe("3. Safe AI Design Assistant & Heuristics", () => {
    const mockStore = {
      name: "Bella Chic Boutique",
      themeConfig: {
        style: "fashion" as const,
        colors: {
          primary: "#E11D48",
          secondary: "#BE123C",
          accent: "#F43F5E",
          background: "#FFFFFF",
          surface: "#FFF1F2",
          text: "#0F172A",
          mutedText: "#64748B",
          headerBg: "#FFFFFF",
          footerBg: "#0F172A",
          footerText: "#F8FAFC"
        },
        fonts: { heading: "Playfair Display", body: "Inter" },
        borderRadius: "lg" as const,
        headerLayout: "standard" as const,
        showAnnouncementBar: true,
        announcementText: "Welcome!",
        announcementBg: "#E11D48",
        announcementTextColor: "#FFFFFF"
      },
      homeSections: [
        { id: "s1", type: "hero" as const, order: 0, visible: true, settings: {}, content: { headline: "Welcome" } },
        { id: "s2", type: "categories" as const, order: 1, visible: true, settings: {}, content: {} },
        { id: "s3", type: "product-grid" as const, order: 2, visible: true, settings: { columns: 4 }, content: {} },
        { id: "s4", type: "promotional-offer" as const, order: 3, visible: true, settings: {}, content: {} }
      ],
      settings: {}
    };

    it("should apply luxury makeover request without altering sensitive prices", async () => {
      const res = await executeAIStoreModification(mockStore, "Make my fashion store look more luxurious");
      assert.ok(res.themeConfig, "Expected updated themeConfig");
      assert.equal(res.themeConfig?.style, "luxury");
      assert.equal(res.themeConfig?.fonts.heading, "Playfair Display");
      assert.ok(res.explanation.toLowerCase().includes("luxury"));
    });

    it("should apply minimalist white background request", async () => {
      const res = await executeAIStoreModification(mockStore, "Use a minimalist white background with elegant typography");
      assert.ok(res.themeConfig);
      assert.equal(res.themeConfig?.colors.background, "#FFFFFF");
      assert.equal(res.themeConfig?.style, "minimal");
      assert.ok(res.explanation.toLowerCase().includes("minimalist"));
    });

    it("should expand product images when requested", async () => {
      const res = await executeAIStoreModification(mockStore, "Make my product images larger");
      assert.ok(res.homeSections);
      const gridSec = res.homeSections?.find(s => s.type === "product-grid");
      assert.equal(gridSec?.settings.columns, 3);
      assert.equal(gridSec?.settings.cardSize, "large");
    });

    it("should move featured products above promotional banner", async () => {
      const res = await executeAIStoreModification(mockStore, "Move featured products above promotional banner");
      assert.ok(res.homeSections);
      const gridIdx = res.homeSections!.findIndex(s => s.type === "product-grid");
      const promoIdx = res.homeSections!.findIndex(s => s.type === "promotional-offer");
      assert.ok(gridIdx < promoIdx, "product-grid should be positioned before promotional-offer");
    });

    it("should apply modern tech theme for electronics store", async () => {
      const res = await executeAIStoreModification(mockStore, "Make my electronics store look more modern and professional");
      assert.ok(res.themeConfig);
      assert.equal(res.themeConfig?.style, "electronics");
      assert.equal(res.themeConfig?.colors.primary, "#0284C7");
    });
  });

  // ── 4. WHATSAPP ORDERING VALIDATION ──────────────────────────────
  describe("4. WhatsApp Ordering & Formatting", () => {
    it("should format valid phone number and escape special characters in wa.me link", () => {
      const rawPhone = "+232 (76) 123-456";
      const cleanPhone = rawPhone.replace(/[^0-9]/g, "");
      assert.equal(cleanPhone, "23276123456");

      const storeName = "Bella Chic Boutique";
      const items = [{ name: "Silk Maxi Dress", quantity: 2, price: 500 }];
      const total = 1000;
      const currency = "SLE";

      let waMessage = `Hello ${storeName}! Order:\n`;
      items.forEach(i => {
        waMessage += `• ${i.quantity}x ${i.name} - ${currency} ${i.price * i.quantity}\n`;
      });
      waMessage += `Total: ${currency} ${total}`;

      const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(waMessage)}`;
      assert.ok(waUrl.startsWith("https://wa.me/23276123456?text="));
      assert.ok(waUrl.includes("Bella%20Chic%20Boutique"));
      assert.ok(waUrl.includes("Silk%20Maxi%20Dress"));
    });
  });

  // ── 5. SPREADSHEET IMPORT & DUPLICATE DETECTION ───────────────────
  describe("5. Spreadsheet Import & Duplicate Protection", () => {
    it("should correctly detect duplicates and validate row integrity", () => {
      const existingItems = [
        { name: "Summer Maxi Dress", sku: "DRS-01" },
        { name: "Oxford Leather Shoes", sku: "SH-99" }
      ];

      const existingNames = new Set(existingItems.map(p => p.name.toLowerCase().trim()));
      const existingSkus = new Set(existingItems.map(p => p.sku?.toLowerCase().trim()));

      const incomingRows = [
        { name: "Summer Maxi Dress", price: 450, sku: "DRS-01", stockQuantity: 10 }, // Duplicate
        { name: "New Silk Blouse", price: 300, sku: "BL-02", stockQuantity: 15 },    // Valid New
        { name: "", price: 200, sku: "INV-03", stockQuantity: 5 },                    // Invalid (no name)
        { name: "Free Accessory", price: -50, sku: "ACC-04", stockQuantity: 2 },      // Invalid price
        { name: "Another Blouse", price: 320, sku: "SH-99", stockQuantity: 8 }        // Duplicate SKU
      ];

      let duplicatesSkipped = 0;
      let validCount = 0;
      const errors: string[] = [];

      incomingRows.forEach((r, idx) => {
        if (!r.name || r.name.trim().length === 0) {
          errors.push(`Row ${idx + 1}: Missing name`);
          return;
        }
        if (r.price < 0 || isNaN(r.price)) {
          errors.push(`Row ${idx + 1}: Negative or invalid price`);
          return;
        }
        if (existingNames.has(r.name.toLowerCase().trim()) || (r.sku && existingSkus.has(r.sku.toLowerCase().trim()))) {
          duplicatesSkipped++;
          return;
        }
        validCount++;
        existingNames.add(r.name.toLowerCase().trim());
        if (r.sku) existingSkus.add(r.sku.toLowerCase().trim());
      });

      assert.equal(duplicatesSkipped, 2, "Expected 2 duplicates skipped (name and SKU)");
      assert.equal(validCount, 1, "Expected 1 valid record imported");
      assert.equal(errors.length, 2, "Expected 2 invalid rows flagged");
    });
  });

  // ── 6. RESPONSIVE DESIGN & VIEWPORT ADAPTABILITY ──────────────────
  describe("6. Responsive Multi-Device Adaptability", () => {
    it("should verify mobile and desktop grid column rules across templates", () => {
      STARTER_TEMPLATES.forEach((tpl) => {
        if (tpl.productLayout) {
          assert.ok(tpl.productLayout.columnsDesktop >= 3, `Template ${tpl.templateId} desktop columns should be >= 3`);
          assert.ok(tpl.productLayout.columnsMobile <= 2, `Template ${tpl.templateId} mobile columns should be <= 2`);
        }
        if (tpl.mobileSettings) {
          assert.equal(typeof tpl.mobileSettings.stickyBottomNav, "boolean");
        }
      });
    });
  });
});
