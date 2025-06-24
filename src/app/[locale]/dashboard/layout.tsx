import { AppSidebar } from "@/components/ui/dashboard/app-sidebar"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/dashboard/breadcrumb"
import { Separator } from "@/components/ui/dashboard/separator"
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/dashboard/sidebar"
import { auth } from "@/auth";
import {ReactNode} from "react";

export default async function DashboardLayout({children}: {children: ReactNode}) {
    const session = await auth();

    const userData = {
        name: session?.user.name || "User",
        email: session?.user.email || "",
        avatar: session?.user.image || "/default-avatar.png"
    };

    return (
        <SidebarProvider>
            <AppSidebar user={userData} />
            <SidebarInset>
                <div className="w-full p-4">
                    <div className="bg-blue-200 rounded-lg py-3 px-4">
                        <p className="text-sm">Impersonujesz użytkownika: jansadownik@gmail.com</p>
                    </div>
                </div>
                <header
                    className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
                    <div className="flex items-center gap-2 px-4">
                        <SidebarTrigger className="-ml-1"/>
                        <Separator
                            orientation="vertical"
                            className="mr-2 data-[orientation=vertical]:h-4"
                        />
                        <Breadcrumb>
                            <BreadcrumbList>
                                <BreadcrumbItem className="hidden md:block">
                                    <BreadcrumbLink href="#">
                                        Funkcje
                                    </BreadcrumbLink>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator className="hidden md:block"/>
                                <BreadcrumbItem>
                                    <BreadcrumbPage>
                                        {session?.user.emailVerified ? 'Zweryfikowany' : 'Niezweryfikowany'}
                                    </BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                </header>
                {children}
            </SidebarInset>
        </SidebarProvider>
    );
}