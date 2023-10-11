import { StudentHomePageConfig } from "@/types";

export const studentHomePageConfig: StudentHomePageConfig = {
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
            title: "articleRecords",
            href: '/student/home',
            icon: "record",
        },
        {
            title: "nextQuiz",
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
