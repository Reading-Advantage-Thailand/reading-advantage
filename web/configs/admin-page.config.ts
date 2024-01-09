import { StudentPageConfig } from "@/types";

export const adminPageConfig: StudentPageConfig = {
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
            title: "Assistant",
            href: '/admin/assistant',
            icon: "book",
        },
    ],
};
