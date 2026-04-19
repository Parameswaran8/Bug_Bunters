import { SquarePen } from "lucide-react";
import { Button } from "@/components/ui/button";

function BugTableRowMenu({ onEdit }) {
  return (
    <Button 
      size="icon" 
      variant="ghost" 
      className="h-7 w-7 text-slate-500 hover:text-cyan-600 hover:bg-cyan-50"
      onClick={onEdit}
    >
      <SquarePen className="h-4 w-4" />
    </Button>
  );
}

export default BugTableRowMenu;
