// SearchableToolDropdown.jsx
import React, { useState, useEffect } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

// Mock API
const fetchTools = async (page = 1, limit = 50) => {
  await new Promise((resolve) => setTimeout(resolve, 250));

  const items = [];
  for (let i = 1; i <= 200; i++) {
    items.push({
      value: `tool_${i}`,
      label: `Tool ${i}`,
      sublabel: `Category ${(i % 5) + 1}`,
    });
  }

  return { data: items, hasMore: false };
};

function SearchableToolDropdown({
  value,
  onChange,
  placeholder = "Select Tool",
}) {
  const [open, setOpen] = useState(false);
  const [tools, setTools] = useState([]);
  const [filteredTools, setFilteredTools] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (open && tools.length === 0) loadTools();
  }, [open]);

  const loadTools = async () => {
    setIsLoading(true);
    try {
      const res = await fetchTools();
      setTools(res.data);
      setFilteredTools(res.data);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (search) => {
    setSearchQuery(search);
    if (!search) {
      setFilteredTools(tools);
    } else {
      const lower = search.toLowerCase();
      setFilteredTools(
        tools.filter(
          (t) =>
            t.label.toLowerCase().includes(lower) ||
            t.sublabel.toLowerCase().includes(lower)
        )
      );
    }
  };

  const selectedLabel = () => {
    const found = tools.find((i) => i.value === value);
    return found ? `${found.label} (${found.sublabel})` : placeholder;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between border-2 h-10"
        >
          {selectedLabel()}
          <ChevronsUpDown className="opacity-50 h-4 w-4" />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        sideOffset={5}
        className="p-0 w-[var(--radix-popover-trigger-width)]"
      >
        <Command>
          <CommandInput
            placeholder="Search tools..."
            className="h-9"
            onValueChange={handleSearch}
          />

          <div
            className="max-h-[300px] overflow-x-auto"
            onWheel={(e) => {
              e.currentTarget.scrollTop += e.deltaY;
            }}
          >
            <CommandEmpty>No tool found.</CommandEmpty>

            {filteredTools.map((item) => (
              <CommandItem
                key={item.value}
                value={item.label}
                onSelect={() => {
                  onChange(item.value);
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === item.value ? "opacity-100" : "opacity-0"
                  )}
                />

                <div className="flex flex-col">
                  <span className="text-sm font-medium">{item.label}</span>
                  <span className="text-xs text-muted-foreground">
                    {item.sublabel}
                  </span>
                </div>
              </CommandItem>
            ))}

            {isLoading && (
              <div className="py-3 text-center text-sm text-muted-foreground">
                Loading...
              </div>
            )}
          </div>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export default SearchableToolDropdown;
