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
            title: "next-quiz",
            href: '/student/next-quiz',
            icon: "book",
        },
        {
            title: "flashcard",
            href: '/student/flashcard',
            icon: "flashcard",
        },
    ],
};
