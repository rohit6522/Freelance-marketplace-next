export const DASHBOARD_NAV = {
  client: [
    { label: "Overview", href: "/dashboard", icon: "space_dashboard", exact: true },
    { label: "My Orders", href: "/orders", icon: "receipt_long" },
    { label: "Saved Gigs", href: "/dashboard/saved", icon: "favorite" },
    { label: "Messages", href: "/messages", icon: "chat", badge: "messages" },
    { label: "Reviews", href: "/dashboard/reviews", icon: "rate_review" },
    { label: "Account Settings", href: "/dashboard/settings", icon: "settings" },
  ],
  freelancer: [
    { label: "Overview", href: "/dashboard", icon: "space_dashboard", exact: true },
    { label: "My Gigs", href: "/dashboard/gigs", icon: "inventory_2", soon: true },
    { label: "Create Gig", href: "/dashboard/gigs/new", icon: "add_box", soon: true },
    { label: "Manage Orders", href: "/orders", icon: "receipt_long" },
    { label: "Earnings & Payouts", href: "/dashboard/earnings", icon: "payments", soon: true },
    { label: "Reviews", href: "/dashboard/reviews", icon: "rate_review" },
    { label: "Messages", href: "/messages", icon: "chat", badge: "messages" },
    { label: "Portfolio", href: "/dashboard/portfolio", icon: "folder_special", soon: true },
    { label: "Profile", href: "/dashboard/profile", icon: "badge", soon: true },
    { label: "Account Settings", href: "/dashboard/settings", icon: "settings" },
  ],
};

export const getDashboardNav = (role) => DASHBOARD_NAV[role] ?? DASHBOARD_NAV.client;