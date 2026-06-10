"use server";

import { auth } from "@/lib/auth";
import { getDashboardStats } from "./dashboard";
import { getProducts } from "./product";

export async function checkOllamaStatus() {
  try {
    const response = await fetch("http://localhost:11434/api/version", {
      method: "GET",
      cache: "no-store"
    });
    if (response.ok) {
      const data = await response.json();
      return { active: true, version: data.version };
    }
    return { active: false, version: null };
  } catch (error) {
    return { active: false, version: null };
  }
}

export async function getNeuralAnalysis() {
  try {
    const session = await auth();
    if (!session?.user?.businessId) throw new Error("Unauthorized");

    const [stats, products] = await Promise.all([
      getDashboardStats(),
      getProducts()
    ]);

    const lowStockItems = products.filter(p => p.status === "LOW" || p.status === "CRITICAL");
    const businessType = session.user.businessType || "Retail";

    const prompt = `
      System Context: African Trade Intelligence Node (Protech Inventory OS)
      Industry: ${businessType}
      
      Operational Stats:
      - Total Revenue: Le ${stats.revenue.toLocaleString()}
      - Active Transactions: ${stats.activeTransactions}
      - Today's Orders: ${stats.orders}
      - Managed Catalog: ${stats.skuCount} SKUs
      - Stock Alerts: ${stats.lowStock} items below threshold
      
      Critical Stock Issues:
      ${lowStockItems.slice(0, 5).map(p => `- ${p.name}: ${p.stockQuantity} remaining (Threshold: ${p.minStockLevel})`).join("\n")}
      
      Task: Perform a Neural Diagnostics Audit.
      Instructions:
      1. Analyze the current stock-to-revenue velocity.
      2. Identify high-risk zones (e.g. out of stock high-value items).
      3. Provide 3 tactical growth simulations for the next 7 days.
      4. Maintain a futuristic, professional, and slightly "cybernetic" tone.
      5. Keep the response concise (max 250 words).
      
      Format the output with clear headers and bullet points.
    `;

    const response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama3", // Defaulting to llama3
        prompt: prompt,
        stream: false
      }),
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error("Ollama connection failed. Ensure Ollama is running and 'llama3' model is pulled.");
    }

    const result = await response.json();
    return result.response;
  } catch (error: any) {
    console.error("Neural Analysis Error:", error);
    throw new Error(error.message || "Establishing neural link failed.");
  }
}
