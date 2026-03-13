import * as React from "react";
import {
  Bug,
  BugPlay,
  CircleCheckBig,
  CloudCheck,
  LayoutDashboard,
  Microscope,
  Rocket,
  Settings,
  Star,
  GalleryVerticalEnd,
} from "lucide-react";

import { NavProjects } from "@/components/nav-projects";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarSeparator,
  SidebarRail,
} from "@/components/ui/sidebar";

const data = {
  teams: [
    {
      name: "CEOITBOX",
      logo: GalleryVerticalEnd,
      plan: "Bug Bunters",
    },
  ],

  systemMenu: [
    { name: "Dashboard", url: "/",     icon: LayoutDashboard },
    { name: "Starred",   url: "/star", icon: Star },
  ],

  bugPhase: [
    { name: "New Bug",          url: "/create-bug",       icon: Bug },
    { name: "Bug Testing",      url: "/bug-testing",      icon: BugPlay },
    { name: "Analyze Bug",      url: "/analyze-bug",      icon: Microscope },
    { name: "Ready To Testing", url: "/ready-to-testing", icon: CloudCheck },
    { name: "Ready To Deploy",  url: "/ready-to-deploy",  icon: Rocket },
    { name: "Deployed",         url: "/deployed",         icon: CircleCheckBig },
  ],

  adminSetting: [
    { name: "Settings", url: "/settings", icon: Settings },
  ],
};

export function AppSidebar({ ...props }) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>

      <SidebarContent>
        <NavProjects projects={data.systemMenu} label="Overview" />
        <SidebarSeparator className="opacity-20" />
        <NavProjects projects={data.bugPhase}   label="Bug Phases" />
        <SidebarSeparator className="opacity-20" />
        <NavProjects projects={data.adminSetting} label="Admin" />
      </SidebarContent>

      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
