// SearchableToolDropdown.jsx
import React, { useState, useEffect } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

function SearchableToolDropdown({
  value,
  onChange,
  placeholder = "Select Tool",
  items = [], // Accept items as prop
  isLoading = false, // Accept loading state as prop
  classAdd,
}) {
  const [open, setOpen] = useState(false);
  const [filteredTools, setFilteredTools] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Update filtered tools when items change
  useEffect(() => {
    setFilteredTools(items);
  }, [items]);

  const handleSearch = (search) => {
    setSearchQuery(search);
    if (!search) {
      setFilteredTools(items);
    } else {
      const lower = search.toLowerCase();
      setFilteredTools(
        items.filter(
          (t) =>
            t.label.toLowerCase().includes(lower) ||
            (t.sublabel && t.sublabel.toLowerCase().includes(lower))
        )
      );
    }
  };

  const selectedLabel = () => {
    const found = items.find((i) => i.value === value);
    return found
      ? `${found.label}${found.sublabel ? ` (${found.sublabel})` : ""}`
      : placeholder;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild className={classAdd}>
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
            placeholder="Search..."
            className="h-9"
            onValueChange={handleSearch}
          />

          <div
            className="max-h-[300px] overflow-y-auto"
            onWheel={(e) => {
              e.currentTarget.scrollTop += e.deltaY;
            }}
          >
            <CommandEmpty>No item found.</CommandEmpty>

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
                  {item.sublabel && (
                    <span className="text-xs text-muted-foreground">
                      {item.sublabel}
                    </span>
                  )}
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
