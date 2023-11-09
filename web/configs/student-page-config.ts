import { StudentPageConfig } from "@/types";

export const studentPageConfig: StudentPageConfig = {
    mainNav: [
        {
            title: "home",
            href: "/",
        },
        {
            title: "about",
            href: "/about",
        },
        {
            title: "contact",
            href: "/contact",
        },
    ],
    sidebarNav: [
        {
            title: "read",
            href: '/student/read',
            icon: "book",
        },
        {
            title: "history",
            href: '/student/history',
            icon: "record",
        },
        {
            title: "practice",
            href: '/student/practice',
            icon: "flashcard",
        },
        {
            title: "reports",
            href: '/student/reports',
            icon: "dashboard",
        }
    ],
};
