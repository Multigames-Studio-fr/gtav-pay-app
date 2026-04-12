"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import {
  Avatar,
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@heroui/react";

export function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-14 border-b border-white/10 bg-black/40 backdrop-blur-xl flex items-center px-4 gap-4">
      <Link
        href="/dashboard"
        className="font-bold text-lg text-white flex items-center gap-2"
      >
        <span className="text-indigo-400">⬡</span>
        GTA V Pay
      </Link>

      <div className="flex-1" />

      {session?.user && (
        <Dropdown placement="bottom-end">
          <DropdownTrigger>
            <button className="flex items-center gap-2 rounded-lg px-2 py-1 hover:bg-white/10 transition-colors">
              <Avatar
                src={session.user.image ?? undefined}
                name={session.user.name ?? "?"}
                size="sm"
                className="cursor-pointer"
              />
              <span className="text-sm text-white/80 hidden sm:block">
                {session.user.name}
              </span>
            </button>
          </DropdownTrigger>
          <DropdownMenu aria-label="User menu" className="bg-zinc-900 text-white">
            <DropdownItem key="dashboard" href="/dashboard">
              Dashboard
            </DropdownItem>
            {session.user.isWebmaster ? (
              <DropdownItem key="admin" href="/admin">
                Administration
              </DropdownItem>
            ) : null}
            <DropdownItem
              key="logout"
              className="text-red-400"
              onPress={() => signOut({ callbackUrl: "/" })}
            >
              Se déconnecter
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      )}
    </nav>
  );
}
