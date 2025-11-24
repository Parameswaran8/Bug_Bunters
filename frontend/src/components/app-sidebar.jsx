import * as React from "react";
import {
  AudioWaveform,
  BookOpen,
  Bot,
  Bug,
  BugPlay,
  CircleCheckBig,
  CloudCheck,
  Command,
  GalleryVerticalEnd,
  LayoutDashboard,
  Map,
  Microscope,
  PieChart,
  Rocket,
  Settings2,
  Star,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavProjects } from "@/components/nav-projects";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },

  teams: [
    {
      name: "CEOITBOX",
      logo: GalleryVerticalEnd,
      plan: "Bug Bunters",
    },
    // {
    //   name: "Acme Corp.",
    //   logo: AudioWaveform,
    //   plan: "Startup",
    // },
    // {
    //   name: "Evil Corp.",
    //   logo: Command,
    //   plan: "Free",
    // },
  ],
  navMain: [
    // {
    //   title: "Playground",
    //   url: "#",
    //   icon: SquareTerminal,
    //   isActive: true,
    //   items: [
    //     {
    //       title: "Dashboard",
    //       url: "#",
    //     },
    //     {
    //       title: "Starred",
    //       url: "#",
    //     },
    //     {
    //       title: "Settings",
    //       url: "#",
    //     },
    //   ],
    // },
    // {
    //   title: "Models",
    //   url: "#",
    //   icon: Bot,
    //   items: [
    //     {
    //       title: "Genesis",
    //       url: "#",
    //     },
    //     {
    //       title: "Explorer",
    //       url: "#",
    //     },
    //     {
    //       title: "Quantum",
    //       url: "#",
    //     },
    //   ],
    // },
    // {
    //   title: "Documentation",
    //   url: "#",
    //   icon: BookOpen,
    //   items: [
    //     {
    //       title: "Introduction",
    //       url: "#",
    //     },
    //     {
    //       title: "Get Started",
    //       url: "#",
    //     },
    //     {
    //       title: "Tutorials",
    //       url: "#",
    //     },
    //     {
    //       title: "Changelog",
    //       url: "#",
    //     },
    //   ],
    // },
    // {
    //   title: "Settings",
    //   url: "#",
    //   icon: Settings2,
    //   items: [
    //     {
    //       title: "General",
    //       url: "#",
    //     },
    //     {
    //       title: "Team",
    //       url: "#",
    //     },
    //     {
    //       title: "Billing",
    //       url: "#",
    //     },
    //     {
    //       title: "Limits",
    //       url: "#",
    //     },
    //   ],
    // },
  ],

  systemMenu: [
    {
      name: "Dashboard",
      url: "/",
      icon: LayoutDashboard,
      isActive: true,
    },

    {
      name: "Starred",
      url: "/star",
      icon: Star,
    },
  ],

  bugPhase: [
    {
      name: "New Bug",
      url: "/create-bug",
      icon: Bug,
    },
    {
      name: "Bug Testing",
      url: "/bug-testing",
      icon: BugPlay,
    },
    {
      name: "Analyze Bug",
      url: "/analyze-bug",
      icon: Microscope,
    },
    {
      name: "Ready To Testing",
      url: "/ready-to-testing",
      icon: CloudCheck,
    },
    {
      name: "Ready To Deploy",
      url: "/ready-to-deploy",
      icon: Rocket,
    },
    {
      name: "Deployed",
      url: "/deployed",
      icon: CircleCheckBig,
    },
  ],
};

export function AppSidebar({ ...props }) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.systemMenu} />
        <NavProjects projects={data.bugPhase} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
        {/* user={data.user} */}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
