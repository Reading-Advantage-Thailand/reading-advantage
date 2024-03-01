import { TeacherPageConfig } from "@/types";

export const teacherPageConfig: TeacherPageConfig = {
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
    teacherSidebarNav: [
        {
            title: "My classes",
            href: '/teacher/my-classes',
            icon: "class",
        },
        {
            title: "My students",
            href: '/teacher/my-students',
            icon: "student",
        },
        {
            title: "Class roster",
            href: '/teacher/class-roster',
            icon: "roster",
        },
        {
            title: "Reports",
            href: '/teacher/reports',
            icon: "report",
        }
    ],
};
