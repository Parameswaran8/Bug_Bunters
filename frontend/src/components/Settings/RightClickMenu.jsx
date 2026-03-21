import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Edit2, Trash2, Archive, CheckSquare, Settings } from "lucide-react";

export default function TableContextMenu({
  children,
  item,
  onSaveAll,
  onEdit,
  onEditSelected,
  onDelete,
  onDeleteSelected,
  onCancelAll,
}) {
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent className="w-56">
        <ContextMenuItem onClick={() => onEdit(item)}>
          <Edit2 className="w-4 h-4 mr-2" />
          Edit
        </ContextMenuItem>

        <ContextMenuItem className="text-red-600 focus:text-red-600 focus:bg-red-50" onClick={() => onDelete(item)}>
          <Trash2 className="w-4 h-4 mr-2" />
          Delete
        </ContextMenuItem>

        <ContextMenuSeparator />

        <div className="px-2 py-1.5 text-xs font-semibold text-gray-500">
          Bulk Actions
        </div>

        <ContextMenuItem onClick={() => onEditSelected()}>
          <CheckSquare className="w-4 h-4 mr-2" />
          Edit Selected
        </ContextMenuItem>

        <ContextMenuItem className="text-red-600 focus:text-red-600 focus:bg-red-50" onClick={() => onDeleteSelected()}>
          <Trash2 className="w-4 h-4 mr-2" />
          Delete Selected
        </ContextMenuItem>

        <ContextMenuSeparator />

        <ContextMenuItem onClick={() => onSaveAll(item)} className="text-green-600 focus:text-green-600 focus:bg-green-50">
          <Settings className="w-4 h-4 mr-2" />
          Save All Changes
        </ContextMenuItem>

        <ContextMenuItem onClick={() => onCancelAll()}>
          <Archive className="w-4 h-4 mr-2" />
          Discard Changes
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
