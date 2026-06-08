import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface Column<T> {
  header: string;
  accessor: (item: T) => React.ReactNode;
  mobileKey?: boolean; // Use this field as the main title on mobile cards
}

interface ResponsiveTableProps<T> {
  data: T[];
  columns: Column<T>[];
  className?: string;
}

export function ResponsiveTable<T extends { id: string | number }>({ data, columns, className }: ResponsiveTableProps<T>) {
  return (
    <div className={cn("w-full", className)}>
      {/* Desktop Table View */}
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col, i) => <TableHead key={i}>{col.header}</TableHead>)}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item) => (
              <TableRow key={item.id}>
                {columns.map((col, i) => <TableCell key={i}>{col.accessor(item)}</TableCell>)}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {data.map((item) => (
          <Card key={item.id} className="p-4 space-y-2 border border-slate-200">
            {columns.map((col, i) => (
              <div key={i} className="flex justify-between items-center text-sm">
                <span className="font-bold text-slate-500">{col.header}</span>
                <span>{col.accessor(item)}</span>
              </div>
            ))}
          </Card>
        ))}
      </div>
    </div>
  );
}
