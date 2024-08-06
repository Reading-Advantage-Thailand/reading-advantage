import { SystemPageConfig } from "@/types";

export const systemPageConfig: SystemPageConfig = {
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
        {
            title: "authors",
            href: "/authors"
        }
    ],
    systemSidebarNav: [
        {
            title: "system dashboard",
            href: '/system/dashboard',
            icon: "dashboard",
        },
        {
            title: "handle passages",
            href: '/system/handle-passages',
            icon: "book",
        },
        {
            title: "license",
            href: '/system/license',
            icon: "scrollText",
        },

    ],
};
