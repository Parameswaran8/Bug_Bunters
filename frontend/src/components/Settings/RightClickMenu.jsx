// components/TableContextMenu.jsx
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";

const TableContextMenu = ({
  children,
  item,
  onSaveAll,
  onEdit,
  onEditSelected,
  onDelete,
  onDeleteSelected,
  onCancelAll,
}) => {
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>

      <ContextMenuContent className="w-44">
        <ContextMenuItem onClick={() => onSaveAll(item)}>
          Save All
        </ContextMenuItem>
        <ContextMenuItem onClick={() => onEdit(item)}>Edit</ContextMenuItem>

        <ContextMenuItem onClick={() => onEditSelected()}>
          Edit Selected
        </ContextMenuItem>

        <ContextMenuItem onClick={() => onDelete(item)}>Delete</ContextMenuItem>
        <ContextMenuItem onClick={() => onDeleteSelected()}>
          Delete Selected
        </ContextMenuItem>
        <ContextMenuItem onClick={() => onCancelAll()}>
          Cancel All
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};

export default TableContextMenu;
