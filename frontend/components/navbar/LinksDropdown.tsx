import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { LuAlignLeft } from "react-icons/lu";
import Link from "next/link";
import { Button } from "../ui/button";
import { links } from "@/app/utils/links";
import { linkSession } from "@/app/utils/links";
import UserIcon from "./UserIcon";
import { auth } from "@/app/utils/Api/Actions/Security";
import ButtonLogout from "../Auth/LogoutButton";

async function LinksDropdown() {
  const { userId } = await auth(); // Retrieve the current user's ID
  console.log("from LinksDropdown", userId);
  const isAdmin = userId === process.env.ADMIN_USER_ID; // Check if the user is an admin

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex gap-4 max-w-[100px]">
          <LuAlignLeft className="w-6 h-6" />
          <UserIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-48" align="start" sideOffset={10}>
        {/* Render links for logged-out users */}
        {!userId && (
          <>
            {linkSession.map((link) => (
              <DropdownMenuItem key={link.href}>
                <Link href={link.href} className="capitalize w-full">
                  {link.label}
                </Link>
              </DropdownMenuItem>
            ))}
          </>
        )}

        {/* Render links for logged-in users */}
        {userId && (
          <>
            {links.map((link) => {
              // Only show the dashboard link for admin users
              if (link.label === "dashboard" && !isAdmin) return null;
              return (
                <DropdownMenuItem key={link.href}>
                  <Link href={link.href} className="capitalize w-full">
                    {link.label}
                  </Link>
                </DropdownMenuItem>
              );
            })}
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <ButtonLogout />
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default LinksDropdown;
