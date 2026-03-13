import { useLocation } from "react-router-dom";

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export function NavProjects({ projects, label }) {
  const { pathname } = useLocation();

  return (
    <SidebarGroup>
      {label && (
        <SidebarGroupLabel className="text-[10px] font-bold tracking-widest uppercase px-3 mb-1"
          style={{ color: "rgba(180,230,240,0.45)", letterSpacing: "0.12em" }}>
          {label}
        </SidebarGroupLabel>
      )}
      <SidebarMenu>
        {projects.map((item) => {
          const isActive = pathname === item.url;
          return (
            <SidebarMenuItem key={item.name}>
              <SidebarMenuButton asChild>
                <a
                  href={item.url}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? "!bg-cyan-500/20 !text-cyan-300 font-semibold"
                      : "hover:!bg-white/5 !text-sidebar-foreground/80 hover:!text-white"
                  }`}
                >
                  <span className={`flex-shrink-0 ${isActive ? "text-cyan-400" : "opacity-70"}`}>
                    <item.icon size={16} />
                  </span>
                  <span>{item.name}</span>
                  {isActive && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-400 flex-shrink-0" />
                  )}
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
