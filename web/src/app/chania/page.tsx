"use client";

import { motion } from "framer-motion";
import { ArrowLeft, MapPin, Compass, Ship, Utensils, Info, Globe, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function ChaniaPage() {
  const [activeTab, setActiveTab] = useState("The City");

  const menuItems = [
    { name: "The Flight", icon: Compass, description: "Travel connections and airlines flying to Chania International Airport." },
    { name: "The City", icon: MapPin, description: "Explore the historic old town, Venetian harbor, and modern city center." },
    { name: "The Island", icon: Globe, description: "Discover the beautiful island of Crete, its beaches, gorges, and villages." },
    { name: "The Food", icon: Utensils, description: "Savor the world-renowned Cretan diet, local olive oil, cheese, and wine." }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans selection:bg-purple-500/15 selection:text-purple-600">
      {/* Decorative Ornaments */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-purple-500/10 to-indigo-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-gradient-to-tr from-teal-500/5 to-purple-500/5 blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation / Header bar */}
        <div className="flex justify-between items-center mb-8">
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Home
          </Link>
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-purple-600 dark:text-purple-400 bg-purple-100/60 dark:bg-purple-950/30 px-3 py-1 rounded-full">
            Responsive Grid Demo
          </span>
        </div>

        {/* CSS GRID CONTAINER */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-6 items-stretch">
          
          {/* HEADER */}
          <div className="col-span-1 md:col-span-6 rounded-[2rem] bg-gradient-to-r from-purple-700 to-indigo-700 text-white p-8 md:p-12 shadow-xl relative overflow-hidden flex flex-col justify-end min-h-[220px]">
            {/* Visual elements */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl pointer-events-none" />
            <div className="absolute inset-0 bg-black/10 mix-blend-overlay" />
            
            <div className="relative z-10 space-y-2">
              <span className="text-[11px] font-black uppercase tracking-[0.45em] text-purple-200/80">Crete, Greece</span>
              <h1 className="text-4xl md:text-6xl font-[1000] tracking-tight">Chania</h1>
              <p className="text-purple-100 max-w-xl text-sm md:text-base font-medium">
                A captivating destination where Venetian architecture meets Mediterranean charm on the northwest coast of Crete.
              </p>
            </div>
          </div>

          {/* MENU (Sits left on desktop) */}
          <div className="col-span-1 md:col-span-1 flex flex-col gap-3">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-2">Navigation</h3>
            <div className="flex flex-col gap-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.name;
                return (
                  <button
                    key={item.name}
                    onClick={() => setActiveTab(item.name)}
                    className={`w-full text-left p-4 rounded-2xl flex items-center gap-3 transition-all ${
                      isActive 
                        ? "bg-purple-600 text-white shadow-lg shadow-purple-200 dark:shadow-none" 
                        : "bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                    }`}
                  >
                    <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-white" : "text-purple-600 dark:text-purple-400"}`} />
                    <span className="font-bold text-sm tracking-tight">{item.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* CONTENT (Sits middle on desktop) */}
          <div className="col-span-1 md:col-span-4 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-8 rounded-[2rem] shadow-sm flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-purple-600" />
                <span className="text-[10px] font-black uppercase tracking-widest text-purple-600 dark:text-purple-400">Discover</span>
              </div>
              
              <div className="space-y-4">
                <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{activeTab}</h2>
                
                {activeTab === "The Flight" && (
                  <div className="space-y-4 text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                    <p>
                      Chania International Airport, "Ioannis Daskalogiannis" (CHQ), is located on the Akrotiri peninsula, about 14 km (8.7 mi) from Chania city.
                    </p>
                    <p>
                      During the tourist season (April to October), direct charter flights operate frequently from major European airports. Throughout the year, Aegean Airlines and Sky Express provide daily domestic connection flights to and from Athens.
                    </p>
                    <p>
                      Public buses and taxi service connect the airport to the city center, taking approximately 20–30 minutes.
                    </p>
                  </div>
                )}

                {activeTab === "The City" && (
                  <div className="space-y-4 text-slate-605 dark:text-slate-400 text-sm leading-relaxed">
                    <p>Chania is the capital of the Chania region on the island of Crete.</p>
                    <p>
                      The city can be divided into two parts: the old town and the modern city. The old town is situated next to the old Venetian harbour and is the matrix around which the whole urban area was developed.
                    </p>
                    <p>
                      Chania lies along the northwest coast of the island of Crete, framed by the beautiful Aegean Sea and the majestic White Mountains (Lefka Ori).
                    </p>
                  </div>
                )}

                {activeTab === "The Island" && (
                  <div className="space-y-4 text-slate-606 dark:text-slate-400 text-sm leading-relaxed">
                    <p>
                      Crete is the largest and most populous of the Greek islands, and the fifth-largest island in the Mediterranean Sea.
                    </p>
                    <p>
                      It separates the Aegean from the Libyan Sea. The island features a mountainous terrain from west to east, including Samaria Gorge—one of Europe's longest canyons—and beautiful beaches like Elafonisi and Balos.
                    </p>
                    <p>
                      Steeped in mythology, Crete is believed to be the birthplace of Zeus and the heart of the ancient Minoan civilization.
                    </p>
                  </div>
                )}

                {activeTab === "The Food" && (
                  <div className="space-y-4 text-slate-607 dark:text-slate-400 text-sm leading-relaxed">
                    <p>
                      The Cretan diet is renowned worldwide as one of the healthiest and most flavorful Mediterranean cuisines.
                    </p>
                    <p>
                      Traditional dishes focus on fresh local ingredients: abundant olive oil (the "green gold"), wild mountain greens (horta), Cretan dakos, fresh fish, and goat cheese.
                    </p>
                    <p>
                      Meals are typically accompanied by local wines or Tsikoudia (Raki), a traditional grape-based pomace brandy offered as a sign of Cretan hospitality.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-4 items-center justify-between">
              <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500">
                <Info className="h-4 w-4" />
                <span className="text-[11px] font-bold uppercase tracking-wider">Dynamic Layout Node</span>
              </div>
              <button 
                onClick={() => alert(`Exploring ${activeTab}...`)} 
                className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 transition-colors"
              >
                Learn More <ExternalLink className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* FACTS (Sits right on desktop) */}
          <div className="col-span-1 md:col-span-6 lg:col-span-1 bg-amber-50/50 dark:bg-amber-950/10 border border-amber-200/50 dark:border-amber-900/30 p-6 rounded-[2rem] flex flex-col gap-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-amber-700 dark:text-amber-500 flex items-center gap-2">
              <Ship className="h-4 w-4" /> Quick Facts
            </h3>
            <ul className="space-y-3">
              {[
                "Chania is a city on the island of Crete.",
                "Crete is a Greek island in the Mediterranean Sea.",
                "The Venetian Lighthouse is the city's signature landmark.",
                "Chania's harbor was built in the 14th century."
              ].map((fact, idx) => (
                <li key={idx} className="flex gap-2.5 items-start text-xs font-medium text-slate-600 dark:text-slate-400 leading-normal">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                  <span>{fact}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* FOOTER */}
          <div className="col-span-1 md:col-span-6 bg-slate-900 text-slate-400 p-6 rounded-[2rem] shadow-inner text-center text-xs font-medium border border-slate-800">
            <p>Resize the browser window to see the responsive effect.</p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-600 mt-1">
              &copy; {new Date().getFullYear()} Protech Assist. Responsive CSS Grid Demonstration.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
