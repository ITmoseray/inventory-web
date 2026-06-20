"use server";

import { auth } from "@/lib/auth";
import { getDashboardStats } from "./dashboard";
import { getProducts } from "./product";
import { getRecentSales } from "./sale";
import { format } from "date-fns";

export async function checkOllamaStatus() {
  try {
    // If GEMINI_API_KEY is set, treat the AI node as active via Gemini
    if (process.env.GEMINI_API_KEY) {
      return { active: true, version: "Gemini 2.5 Flash (Cloud)" };
    }

    // Otherwise, check local Ollama status
    const response = await fetch("http://localhost:11434/api/version", {
      method: "GET",
      cache: "no-store"
    });
    if (response.ok) {
      const data = await response.json();
      return { active: true, version: `Ollama v${data.version} (Local)` };
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

    // 1. If Gemini API Key is configured, use Gemini
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        }),
        cache: "no-store"
      });

      if (!response.ok) {
        throw new Error(`Gemini API connection failed: ${response.statusText}`);
      }

      const result = await response.json();
      return result.candidates?.[0]?.content?.parts?.[0]?.text || "No analysis output returned from Gemini.";
    }

    // 2. Fallback to local Ollama
    const response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama3",
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

export async function chatWithAI(messages: { role: string; content: string }[]) {
  try {
    const session = await auth();
    if (!session?.user?.businessId) throw new Error("Unauthorized");

    const businessId = session.user.businessId;

    const [stats, products, recentSales] = await Promise.all([
      getDashboardStats(),
      getProducts(),
      getRecentSales()
    ]);

    const lowStockItems = products.filter(p => p.status === "LOW" || p.status === "CRITICAL");
    const businessType = session.user.businessType || "Retail";

    const systemContextPrompt = `
      You are the Protech Assist Neural Chat Node, Africa's smartest Business Intelligence Chatbot.
      You help the business owner analyze their business, inventory, sales, and operations.
      
      Here is the current live data from the business database:
      - Business Type: ${businessType}
      - Total Revenue: Le ${stats.revenue.toLocaleString()}
      - Active Transactions: ${stats.activeTransactions}
      - Today's Orders: ${stats.orders}
      - Managed Catalog: ${stats.skuCount} SKUs
      - Stock Alerts: ${stats.lowStock} items below threshold
      - Expiring Batches: ${stats.expiringItems}
      - Total Employees: ${stats.staffCount}
      
      Recent Sales Ledger:
      ${recentSales.slice(0, 5).map(s => `- Invoice ${s.invoiceNumber}: Le ${s.totalAmount} (${s.paymentStatus}, ${format(new Date(s.createdAt), "MMM dd")})`).join("\n")}
      
      Low Stock / Critical Products:
      ${lowStockItems.slice(0, 5).map(p => `- ${p.name}: ${p.stockQuantity} remaining (Threshold: ${p.minStockLevel})`).join("\n")}
      
      Guidelines:
      1. Answer the user's questions using the live business data provided above.
      2. If asked about recommendations, suggest tactical moves based on their stats (e.g. restock critical items, promote sales if revenue is low, etc.).
      3. Maintain a helpful, professional, futuristic, and slightly "cybernetic" tone.
      4. Keep answers concise, clear, and direct. Use bullet points for structured data.
    `;

    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      const contents = messages.map(msg => ({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }]
      }));

      const body = {
        contents: contents,
        systemInstruction: {
          parts: [{ text: systemContextPrompt }]
        }
      };

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        cache: "no-store"
      });

      if (!response.ok) {
        throw new Error(`Gemini Chat API connection failed: ${response.statusText}`);
      }

      const result = await response.json();
      return result.candidates?.[0]?.content?.parts?.[0]?.text || "No response received from Gemini.";
    }

    // Fallback to Ollama
    const response = await fetch("http://localhost:11434/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama3",
        messages: [
          { role: "system", content: systemContextPrompt },
          ...messages
        ],
        stream: false
      }),
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error("Ollama connection failed. Ensure Ollama is running and 'llama3' model is pulled.");
    }

    const result = await response.json();
    return result.message?.content || "No response received from Ollama.";
  } catch (error: any) {
    console.error("Neural Chat Error:", error);
    throw new Error(error.message || "Failed to route message through neural chat node.");
  }
}
