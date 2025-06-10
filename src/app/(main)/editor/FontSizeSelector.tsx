"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Type } from "lucide-react";

interface FontSizeSelectorProps {
  fontSize?: string;
  onChange: (fontSize: string) => void;
}

export default function FontSizeSelector({
  fontSize = "12",
  onChange,
}: FontSizeSelectorProps) {
  const fontSizeOptions = Array.from({ length: 12 }, (_, i) => (i + 9).toString());

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" title="Font Size">
          <Type className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="max-h-60 overflow-y-auto">
        {fontSizeOptions.map((size) => (
          <DropdownMenuItem
            key={size}
            onClick={() => onChange(size)}
            className={fontSize === size ? "bg-accent" : ""}
          >
            <span 
              className="mr-2 font-bold"
              style={{ fontSize: `${size}px` }}
            >
              A
            </span>
            {size}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 