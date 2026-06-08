"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface Unit {
  id: string;
  name: string;
  sellingPrice: any; // Decimal
  ratio: any; // Decimal
}

interface UnitSelectorModalProps {
  product: {
    id: string;
    name: string;
    units: Unit[];
    unitPrice: number;
    baseUnit: string;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (unit: any, quantity: number) => void;
}

export function UnitSelectorModal({ product, open, onOpenChange, onSelect }: UnitSelectorModalProps) {
  const units = [
    { id: "base", name: product.baseUnit, sellingPrice: product.unitPrice, ratio: 1 },
    ...product.units
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Select Unit for {product.name}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-2">
          {units.map((unit) => (
            <Button
              key={unit.id}
              variant="outline"
              className="flex justify-between h-14"
              onClick={() => {
                onSelect(unit, 1);
                onOpenChange(false);
              }}
            >
              <span>{unit.name}</span>
              <span className="font-bold">Le {Number(unit.sellingPrice).toLocaleString()}</span>
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
