export type SiteConfig = {
    name: string;
    description: string;
    url: string;
    ogImage: string;
    link: {
        github: string;
    },
}
export type MainNavItem = NavItem

export type NavItem = {
    title: string;
    href: string;
    disabled?: boolean;
}

export type IndexPageConfig = {
    mainNav: MainNavItem[];
}

export type StudentHomePageConfig = {
    mainNav: MainNavItem[];
    sidebarNav: sidebarNav[];
}

export type SidebarNavItem = {
    title: string
    disabled?: boolean
    external?: boolean
    icon?: keyof typeof Icons
} & (
        | {
            href: string
            items?: never
        }
        | {
            href?: string
            items: NavLink[]
        }
    )

export type User = {
    id: string;
    name: string;
    email: string;
    picture?: string;
    createAt: Date;
    lastLogin: Date;
    level: number;
}