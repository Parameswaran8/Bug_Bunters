import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Edit2, Trash2, Archive, CheckSquare, Settings } from "lucide-react";

export default function BugRightClickMenu({
  children,
  item,
  onEdit,
  onDelete,
  onSaveAll,
  onEditSelected,
  onDeleteSelected,
  onCancelAll,
}) {
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent className="w-56">
        <ContextMenuItem onClick={onEdit}>
          <Edit2 className="w-4 h-4 mr-2" />
          Edit Bug
        </ContextMenuItem>

        <ContextMenuItem className="text-red-600" onClick={onDelete}>
          <Trash2 className="w-4 h-4 mr-2" />
          Delete Bug
        </ContextMenuItem>

        <ContextMenuSeparator />

        <div className="px-2 py-1.5 text-xs font-semibold text-gray-500">
          Bulk Actions
        </div>

        <ContextMenuItem onClick={onEditSelected}>
          <CheckSquare className="w-4 h-4 mr-2" />
          Edit Selected
        </ContextMenuItem>

        <ContextMenuItem className="text-red-600" onClick={onDeleteSelected}>
          <Trash2 className="w-4 h-4 mr-2" />
          Delete Selected
        </ContextMenuItem>

        <ContextMenuSeparator />

        <ContextMenuItem onClick={onSaveAll} className="text-green-600">
          <Settings className="w-4 h-4 mr-2" />
          Save All Changes
        </ContextMenuItem>

        <ContextMenuItem onClick={onCancelAll}>
          <Archive className="w-4 h-4 mr-2" />
          Discard Chages
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
