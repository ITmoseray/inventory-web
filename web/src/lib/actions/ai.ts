"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
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

export async function getWelcomeUpdate() {
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
      User Name: ${session.user.name || "Commander"}
      
      Operational Stats:
      - Total Revenue: Le ${stats.revenue.toLocaleString()}
      - Today's Orders: ${stats.orders}
      - Managed Catalog: ${stats.skuCount} SKUs
      - Stock Alerts: ${stats.lowStock} items below threshold
      
      Critical Stock Issues (Top 3):
      ${lowStockItems.slice(0, 3).map(p => `- ${p.name}: ${p.stockQuantity} remaining`).join("\n")}
      
      Task: Write a short, engaging 2-sentence welcome message for the business owner. 
      Instructions:
      1. Greet them by name.
      2. Provide a quick, high-level update or insight about their business based on the stats above.
      3. Maintain a professional, futuristic, and slightly "cybernetic" tone.
      4. Keep it very concise.
    `;

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
      return result.candidates?.[0]?.content?.parts?.[0]?.text || "Welcome back to the neural link.";
    }

    // Fallback to local Ollama
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
      throw new Error("Ollama connection failed.");
    }

    const result = await response.json();
    return result.response;
  } catch (error: any) {
    console.error("Neural Welcome Error:", error);
    return "Welcome back. Neural link synchronization complete.";
  }
}

export async function generateAIEmployeeProfile() {
  try {
    const session = await auth();
    if (!session?.user?.businessId) throw new Error("Unauthorized");

    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      const prompt = `
        You are an AI assistant in a premium ERP / Inventory Management OS.
        Generate one realistic employee profile for a business operating in Sierra Leone, West Africa.
        Return ONLY a JSON object with the following fields:
        - name: A realistic West African full name (first and last name)
        - email: A professional email address matching the generated name
        - password: A secure, random 8-character password consisting of letters and numbers

        Do not include any markdown format (no \`\`\`json blocks), just the raw JSON object string.
      `;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        }),
        cache: "no-store"
      });

      if (response.ok) {
        const result = await response.json();
        const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          const cleanText = text.replace(/```json/g, "").replace(/```/g, "").trim();
          const data = JSON.parse(cleanText);
          return { success: true, data };
        }
      }
    }
  } catch (error) {
    console.error("AI Employee generation failed, falling back to local simulation:", error);
  }

  // Fallback to local West African profile simulation
  const firstNames = ["Ibrahim", "Mariama", "Alusine", "Fatmata", "Abu", "Isatu", "Mohamed", "Sia", "Kofi", "Aminata"];
  const lastNames = ["Kamara", "Bah", "Kargbo", "Sillah", "Jalloh", "Kallon", "Conteh", "Moseray", "Bangura", "Turay"];
  
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  const fullName = `${firstName} ${lastName}`;
  const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@protech-client.com`;
  const password = Math.random().toString(36).slice(-8);

  return {
    success: true,
    data: {
      name: fullName,
      email: email,
      password: password
    }
  };
}

export async function getPredictiveReplenishment() {
  try {
    const session = await auth();
    if (!session?.user?.businessId) throw new Error("Unauthorized");

    const businessId = session.user.businessId;
    const tenantPrisma = prisma;

    // 1. Fetch sales items from the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const saleItems = await tenantPrisma.saleItem.findMany({
      where: {
        businessId,
        sale: {
          createdAt: { gte: thirtyDaysAgo },
          status: "COMPLETED"
        }
      },
      select: {
        productId: true,
        quantity: true,
      }
    });

    // 2. Compute sales velocity (qty sold per day)
    const velocityMap: Record<string, number> = {};
    for (const item of saleItems) {
      if (item.productId) {
        velocityMap[item.productId] = (velocityMap[item.productId] || 0) + item.quantity;
      }
    }

    // 3. Fetch products
    const products = await tenantPrisma.product.findMany({
      where: { businessId, deletedAt: null },
      select: {
        id: true,
        name: true,
        sku: true,
        stockQuantity: true,
        minStockLevel: true,
        unitPrice: true,
      }
    });

    const predictions = products.map(p => {
      const totalSold = velocityMap[p.id] || 0;
      const dailyVelocity = totalSold / 30;
      const stock = p.stockQuantity ? Number(p.stockQuantity.toString()) : 0;
      
      let daysRemaining = 999;
      if (dailyVelocity > 0) {
        daysRemaining = Math.round((stock / dailyVelocity) * 10) / 10;
      }

      let recommendationStatus = "OK";
      let recommendedOrderQty = 0;
      
      if (daysRemaining <= 7) {
        recommendationStatus = "CRITICAL";
        recommendedOrderQty = Math.ceil(dailyVelocity * 30 - stock + p.minStockLevel);
      } else if (daysRemaining <= 15) {
        recommendationStatus = "WARNING";
        recommendedOrderQty = Math.ceil(dailyVelocity * 15);
      }

      // Safeguard: order at least minStockLevel if predicted running low
      if (recommendationStatus !== "OK" && recommendedOrderQty < p.minStockLevel) {
        recommendedOrderQty = p.minStockLevel;
      }

      return {
        id: p.id,
        name: p.name,
        sku: p.sku || "N/A",
        stockQuantity: stock,
        dailyVelocity: Math.round(dailyVelocity * 100) / 100,
        daysRemaining,
        status: recommendationStatus,
        recommendedOrderQty,
        estimatedCost: recommendedOrderQty * (p.unitPrice ? Number(p.unitPrice.toString()) : 0),
      };
    });

    // Sort: Critical first, then Warning, then OK, then sorted by daysRemaining ascending
    predictions.sort((a, b) => {
      const scoreMap: Record<string, number> = { CRITICAL: 0, WARNING: 1, OK: 2 };
      if (scoreMap[a.status] !== scoreMap[b.status]) {
        return scoreMap[a.status] - scoreMap[b.status];
      }
      return a.daysRemaining - b.daysRemaining;
    });

    // 4. Generate AI advisory summary if API key is present
    let aiAdvice = "Restock metrics computed. Database is running stable.";
    const apiKey = process.env.GEMINI_API_KEY;
    const criticalItems = predictions.filter(p => p.status === "CRITICAL");

    if (apiKey && criticalItems.length > 0) {
      try {
        const prompt = `
          Perform a Stock Replenishment Diagnostic:
          We have ${criticalItems.length} critical inventory nodes that will run out of stock in less than 7 days.
          Critical Items List:
          ${criticalItems.slice(0, 5).map(i => `- ${i.name} (SKU: ${i.sku}): Stock=${i.stockQuantity}, Sold/day=${i.dailyVelocity}, Runs out in ${i.daysRemaining} days. Suggested Replenish=${i.recommendedOrderQty}`).join("\n")}
          
          Provide a 3-sentence executive alert summarizing the most urgent stockouts and the expected capital investment required. Maintain a highly cybernetic, mission-critical tone.
        `;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
          }),
          cache: "no-store"
        });

        if (response.ok) {
          const result = await response.json();
          aiAdvice = result.candidates?.[0]?.content?.parts?.[0]?.text || aiAdvice;
        }
      } catch (e) {
        console.error("Failed to generate AI replenishment advisory:", e);
      }
    }

    return {
      success: true,
      predictions,
      aiAdvice
    };
  } catch (error: any) {
    console.error("Predictive replenishment failed:", error);
    throw new Error(error.message || "Failed to compute inventory prediction matrix.");
  }
}
