import { StudentHomePageConfig } from "@/types";

export const studentHomePageConfig: StudentHomePageConfig = {
    mainNav: [
        {
            title: "Home",
            href: "/",
        },
        {
            title: "About",
            href: "/about",
        },
        {
            title: "Contact",
            href: "/contact",
        },
    ],
    sidebarNav: [
        {
            title: "Article Records",
            href: "/student/home",
            icon: "record",
        },
        {
            title: "Dashboard",
            href: "/dashboard",
            icon: "dashboard",
        },
        {
            title: "Next Quiz",
            href: "/quiz",
            icon: "book",
        },
    ],
};
