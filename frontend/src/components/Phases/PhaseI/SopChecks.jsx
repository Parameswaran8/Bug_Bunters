"use client";

import { useEffect, useState } from "react";
import AnimatedCheckbox from "./Checkbox";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Asterisk } from "lucide-react";

export default function SOPChecklist({
  checks,
  setChecks,
  sopError,
  sopList,
  parentChecked,
  setParentChecked,
}) {
  const [parentIndeterminate, setParentIndeterminate] = useState(false);
  const [isOpen, setIsOpen] = useState(false); // ← Track accordion open/close

  const handleParentChange = (val) => {
    setParentChecked(val);
    setParentIndeterminate(false);
    setChecks(checks.map(() => val));
  };

  const handleChildChange = (index, val) => {
    const updated = [...checks];
    updated[index] = val;
    setChecks(updated);

    const allChecked = updated.every(Boolean);
    const noneChecked = updated.every((v) => !v);

    if (allChecked) {
      setParentChecked(true);
      setParentIndeterminate(false);
    } else if (noneChecked) {
      setParentChecked(false);
      setParentIndeterminate(false);
    } else {
      setParentChecked(false);
      setParentIndeterminate(true);
    }
  };

  return (
    <Accordion
      type="single"
      collapsible
      onValueChange={(val) => setIsOpen(val === "item-1")} // Track open/close
    >
      <AccordionItem value="item-1">
        <div className="flex justify-between items-center py-2">
          <label className="flex text-sm font-medium gap-3 items-center">
            <div className="flex items-center">
              <Asterisk size={12} />
              SOP Followed checkpoints
            </div>
            <AnimatedCheckbox
              textSize="text-xs"
              checkedVal={parentChecked}
              indeterminate={parentIndeterminate}
              setCheckedVal={handleParentChange}
            />
          </label>

          {/* Toggle Text Here */}
          <AccordionTrigger className="flex gap-2">
            {isOpen ? "Collapse" : "Expand"}
          </AccordionTrigger>
        </div>

        {sopError && (
          <p className="text-red-400 text-xs !mt-[-10px] pb-4">{sopError}</p>
        )}

        <AccordionContent>
          <div className="grid grid-cols gap-4">
            <div className="grid grid-cols gap-[11px]">
              {sopList.map((text, index) => (
                <AnimatedCheckbox
                  key={index}
                  title={text}
                  textSize="text-xs"
                  checkedVal={checks[index]}
                  setCheckedVal={(val) => handleChildChange(index, val)}
                />
              ))}
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
