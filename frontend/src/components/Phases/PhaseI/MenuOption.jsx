"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
export default function ButtonGroupDemo({ onClick, title, icon }) {
  return (
    <Button variant="outline" onClick={onClick} className="gap-2">
      {icon}
      {title}
    </Button>
  );
}
