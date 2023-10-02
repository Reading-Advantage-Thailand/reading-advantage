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
            title: "article-records",
            href: '/student/home',
            icon: "record",
        },
        {
            title: "dashboard",
            href: '/student/dashboard',
            icon: "dashboard",
            disabled: true,
        },
        {
            title: "next-quiz",
            href: '/student/next-quiz',
            icon: "book",
        },
    ],
};
