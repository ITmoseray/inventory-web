"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calculator as CalculatorIcon, Delete } from "lucide-react";

export function ProfessionalCalculator() {
  const [display, setDisplay] = useState('0');
  const [equation, setEquation] = useState('');
  const [memory, setMemory] = useState<number>(0);
  const [newNumber, setNewNumber] = useState(true);
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operator, setOperator] = useState<string | null>(null);

  const handleNum = (num: string) => {
    if (newNumber) {
      setDisplay(num);
      setNewNumber(false);
    } else {
      setDisplay(display === '0' ? num : display + num);
    }
  };

  const calculate = (a: number, b: number, op: string) => {
    switch(op) {
      case '+': return a + b;
      case '-': return a - b;
      case '*': return a * b;
      case '/': return b !== 0 ? a / b : 0;
      default: return b;
    }
  };

  const handleOp = (op: string) => {
    const current = parseFloat(display);
    if (previousValue === null) {
      setPreviousValue(current);
    } else if (operator && !newNumber) {
      const result = calculate(previousValue, current, operator);
      setDisplay(String(result));
      setPreviousValue(result);
    }
    setOperator(op);
    setNewNumber(true);
    setEquation(`${previousValue !== null && !newNumber ? calculate(previousValue, current, operator!) : current} ${op}`);
  };

  const handleEqual = () => {
    const current = parseFloat(display);
    if (operator && previousValue !== null) {
      const result = calculate(previousValue, current, operator);
      setDisplay(String(result));
      setPreviousValue(null);
      setOperator(null);
      setNewNumber(true);
      setEquation('');
    }
  };

  const handleClear = () => {
    setDisplay('0');
    setEquation('');
    setPreviousValue(null);
    setOperator(null);
    setNewNumber(true);
  };

  const handleDelete = () => {
    if (!newNumber) {
      setDisplay(display.length > 1 ? display.slice(0, -1) : '0');
    }
  };

  const handleTaxAdd = () => {
    const current = parseFloat(display);
    const result = current * 1.15; // 15% GST assumption
    setDisplay(result.toFixed(2));
    setNewNumber(true);
  };
  
  const handleTaxSub = () => {
    const current = parseFloat(display);
    const result = current / 1.15; 
    setDisplay(result.toFixed(2));
    setNewNumber(true);
  };

  const handleMemory = (type: 'MC' | 'MR' | 'M+' | 'M-') => {
    const current = parseFloat(display);
    if (type === 'MC') setMemory(0);
    if (type === 'MR') { setDisplay(String(memory)); setNewNumber(true); }
    if (type === 'M+') { setMemory(memory + current); setNewNumber(true); }
    if (type === 'M-') { setMemory(memory - current); setNewNumber(true); }
  };

  return (
    <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl shadow-sm flex flex-col">
      <CardHeader className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-row items-center justify-between">
         <div>
            <CardTitle className="text-sm font-semibold text-slate-800 dark:text-slate-200 uppercase tracking-wide flex items-center gap-2">
              <CalculatorIcon className="h-4 w-4" /> Financial Calculator
            </CardTitle>
         </div>
         {memory !== 0 && <div className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">M</div>}
      </CardHeader>
      <CardContent className="p-3 sm:p-4 md:p-6 flex-1 flex flex-col justify-end">
        <div className="bg-slate-50 dark:bg-slate-950 p-3 sm:p-4 rounded-xl border border-slate-200 dark:border-slate-800 mb-4 sm:mb-6 text-right space-y-1">
          <div className="text-[10px] sm:text-xs text-slate-500 h-4 font-mono">{equation}</div>
          <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 dark:text-white tracking-tight overflow-hidden text-ellipsis font-mono">
            {display}
          </div>
        </div>
        
        <div className="grid grid-cols-4 gap-1.5 sm:gap-2 md:gap-3">
          <Button variant="outline" size="sm" onClick={() => handleMemory('MC')} className="text-[10px] sm:text-xs font-semibold h-8 sm:h-10 border-slate-200 dark:border-slate-800">MC</Button>
          <Button variant="outline" size="sm" onClick={() => handleMemory('MR')} className="text-[10px] sm:text-xs font-semibold h-8 sm:h-10 border-slate-200 dark:border-slate-800">MR</Button>
          <Button variant="outline" size="sm" onClick={() => handleMemory('M-')} className="text-[10px] sm:text-xs font-semibold h-8 sm:h-10 border-slate-200 dark:border-slate-800">M-</Button>
          <Button variant="outline" size="sm" onClick={() => handleMemory('M+')} className="text-[10px] sm:text-xs font-semibold h-8 sm:h-10 border-slate-200 dark:border-slate-800">M+</Button>

          <Button variant="outline" size="sm" onClick={handleTaxAdd} className="text-[10px] sm:text-xs font-semibold h-8 sm:h-10 border-slate-200 dark:border-slate-800 text-indigo-600">TAX+</Button>
          <Button variant="outline" size="sm" onClick={handleTaxSub} className="text-[10px] sm:text-xs font-semibold h-8 sm:h-10 border-slate-200 dark:border-slate-800 text-indigo-600">TAX-</Button>
          <Button variant="outline" size="sm" onClick={handleClear} className="text-[10px] sm:text-xs font-semibold h-8 sm:h-10 border-slate-200 dark:border-slate-800 text-rose-500">C</Button>
          <Button variant="outline" size="sm" onClick={handleDelete} className="text-[10px] sm:text-xs font-semibold h-8 sm:h-10 border-slate-200 dark:border-slate-800"><Delete className="h-3 w-3 sm:h-4 sm:w-4" /></Button>

          <Button variant="secondary" onClick={() => handleNum('7')} className="h-10 sm:h-12 text-base sm:text-lg font-semibold bg-slate-100 dark:bg-slate-800">7</Button>
          <Button variant="secondary" onClick={() => handleNum('8')} className="h-10 sm:h-12 text-base sm:text-lg font-semibold bg-slate-100 dark:bg-slate-800">8</Button>
          <Button variant="secondary" onClick={() => handleNum('9')} className="h-10 sm:h-12 text-base sm:text-lg font-semibold bg-slate-100 dark:bg-slate-800">9</Button>
          <Button variant="default" onClick={() => handleOp('/')} className="h-10 sm:h-12 text-base sm:text-lg font-semibold bg-indigo-600 hover:bg-indigo-700">÷</Button>

          <Button variant="secondary" onClick={() => handleNum('4')} className="h-10 sm:h-12 text-base sm:text-lg font-semibold bg-slate-100 dark:bg-slate-800">4</Button>
          <Button variant="secondary" onClick={() => handleNum('5')} className="h-10 sm:h-12 text-base sm:text-lg font-semibold bg-slate-100 dark:bg-slate-800">5</Button>
          <Button variant="secondary" onClick={() => handleNum('6')} className="h-10 sm:h-12 text-base sm:text-lg font-semibold bg-slate-100 dark:bg-slate-800">6</Button>
          <Button variant="default" onClick={() => handleOp('*')} className="h-10 sm:h-12 text-base sm:text-lg font-semibold bg-indigo-600 hover:bg-indigo-700">×</Button>

          <Button variant="secondary" onClick={() => handleNum('1')} className="h-10 sm:h-12 text-base sm:text-lg font-semibold bg-slate-100 dark:bg-slate-800">1</Button>
          <Button variant="secondary" onClick={() => handleNum('2')} className="h-10 sm:h-12 text-base sm:text-lg font-semibold bg-slate-100 dark:bg-slate-800">2</Button>
          <Button variant="secondary" onClick={() => handleNum('3')} className="h-10 sm:h-12 text-base sm:text-lg font-semibold bg-slate-100 dark:bg-slate-800">3</Button>
          <Button variant="default" onClick={() => handleOp('-')} className="h-10 sm:h-12 text-base sm:text-lg font-semibold bg-indigo-600 hover:bg-indigo-700">-</Button>

          <Button variant="secondary" onClick={() => handleNum('0')} className="h-10 sm:h-12 text-base sm:text-lg font-semibold bg-slate-100 dark:bg-slate-800 col-span-2">0</Button>
          <Button variant="secondary" onClick={() => handleNum('.')} className="h-10 sm:h-12 text-base sm:text-lg font-semibold bg-slate-100 dark:bg-slate-800">.</Button>
          <Button variant="default" onClick={() => handleOp('+')} className="h-10 sm:h-12 text-base sm:text-lg font-semibold bg-indigo-600 hover:bg-indigo-700">+</Button>
          
          <Button variant="default" onClick={handleEqual} className="h-10 sm:h-12 text-base sm:text-lg font-semibold bg-emerald-600 hover:bg-emerald-700 col-span-4 mt-1 sm:mt-2">=</Button>
        </div>
      </CardContent>
    </Card>
  );
}
