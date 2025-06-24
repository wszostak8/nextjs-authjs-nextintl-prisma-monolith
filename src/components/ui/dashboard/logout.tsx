"use client"

import { logoutAction } from "@/server/authorization/actions/auth"
import { LogOut } from "lucide-react"
import {useTransition} from "react";

export function LogoutButton() {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [isPending, startTransition] = useTransition()

    const handleLogout = () => {
        startTransition(async () => {
            await logoutAction()
        })
    }

    return (
        <form action={handleLogout}>
            <button
                type="submit"
                className="w-full text-left flex items-center gap-2 px-2 py-1.5 hover:bg-muted rounded-md"
            >
                <LogOut className="w-4 h-4" />
                Log out
            </button>
        </form>
    )
}