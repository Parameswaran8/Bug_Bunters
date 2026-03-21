import { Copy, Edit2, Archive, Trash2, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

function BugTableRowMenu({ item, onEdit, onDelete, onArchive }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => navigator.clipboard.writeText(item.bugId)}>
          <Copy className="h-4 w-4 mr-2" />
          Copy Bug ID
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onEdit}>
          <Edit2 className="h-4 w-4 mr-2" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {onArchive && (
          <DropdownMenuItem onClick={onArchive}>
            <Archive className="h-4 w-4 mr-2" />
            Archive
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={onDelete} className="text-red-500 hover:text-red-600 focus:text-red-600 focus:bg-red-50">
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default BugTableRowMenu;
