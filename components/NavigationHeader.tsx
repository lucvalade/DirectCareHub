"use client";

import React from "react";
import Navbar from "./navigation/Navbar";

interface NavigationHeaderProps {
  userRole?: string;
  userName?: string;
  activeTab?: string;
  onSelectTab?: (tab: string) => void;
  onSignOut?: () => void;
  onRoleChange?: (role: "employer" | "attendant" | "bookkeeper") => void;
}

export default function NavigationHeader(props: NavigationHeaderProps) {
  return <Navbar {...props} />;
}
