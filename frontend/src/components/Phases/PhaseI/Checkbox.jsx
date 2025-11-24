"use client";

import { useId, useEffect, useRef } from "react";
import { motion, AnimatePresence, easeOut } from "motion/react";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

const particleAnimation = (index) => {
  const angle = Math.random() * Math.PI * 2;
  const distance = 30 + Math.random() * 20;

  return {
    initial: { x: "50%", y: "50%", scale: 0, opacity: 0 },
    animate: {
      x: `calc(50% + ${Math.cos(angle) * distance}px)`,
      y: `calc(50% + ${Math.sin(angle) * distance}px)`,
      scale: [0, 1, 0],
      opacity: [0, 1, 0],
    },
    transition: { duration: 0.4, delay: index * 0.05, ease: easeOut },
  };
};

const ConfettiPiece = ({ index }) => {
  const colors = [
    "#FF0000",
    "#00FF00",
    "#0000FF",
    "#FFFF00",
    "#FF00FF",
    "#00FFFF",
  ];
  const color = colors[index % colors.length];

  return (
    <motion.div
      className="absolute size-1 rounded-full"
      style={{ backgroundColor: color }}
      {...particleAnimation(index)}
    />
  );
};

const AnimatedCheckbox = ({
  checkedVal,
  setCheckedVal,
  indeterminate = false,
  title,
  textSize,
  errors,
}) => {
  const id = useId();
  const checkboxRef = useRef(null);

  // Apply indeterminate state to checkbox DOM
  useEffect(() => {
    if (checkboxRef.current) {
      checkboxRef.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);

  return (
    <div className="relative flex items-center gap-2">
      <Checkbox
        ref={checkboxRef}
        id={id}
        checked={checkedVal}
        onCheckedChange={(v) => setCheckedVal(!!v)}
      />

      <Label htmlFor={id} className={textSize}>
        {title}
      </Label>

      <AnimatePresence>
        {checkedVal && (
          <div className="pointer-events-none absolute inset-0">
            {[...Array(12)].map((_, i) => (
              <ConfettiPiece key={i} index={i} />
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AnimatedCheckbox;
