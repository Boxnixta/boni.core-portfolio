"use client"; // must be in the very first line of the code

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

const links = [
    { href: "/", label: "HOME" },
    { href: "/projects", label: "PROJECTS" },
    { href: "/about", label: "ABOUT" },
    { href: "/contact", label: "CONTACT" },
];


const HeaderNav = () => {
    const [open, setOpen] = useState(false);
    const btnRef = useRef<HTMLButtonElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    // Close the Mobile-Menu when the user presses Escape
    useEffect(() => {
        // If the menu is closed, there is nothing to listen for.
        if (!open) return;

        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setOpen(false);
        };

        document.addEventListener('keydown', onKey);

        // The return value is a cleanup function.
        // React calls it before the next run, and when the component is removed.
        // Without cleanup, listeners pile up with every re-render.
        return () => document.removeEventListener('keydown', onKey);
    }, [open]); // [open] dependency array: re-run whenever 'open' changes.

    useEffect(() => {
        if (!open) return;

        const onClick = (e: MouseEvent) => {
            const target = e.target as Node;
            // If the click was inside the menu or on the toggle button, ignore it
            if (
                menuRef.current?.contains(target) ||
                btnRef.current?.contains(target)
            )
                return;
            setOpen(false);
        };

        document.addEventListener('click', onClick, { passive: true });
        return () => document.removeEventListener('click', onClick);
    }, [open]);

    return (
        <div className="flex items-center gap-4">
            {/* Desktop nav */}
            <nav className="main-nav" aria-label="Main navigation">
                {links.map(({ href, label }) => (
                    <Link key={href} href={href} className="main-nav-link">
                        {label}
                    </Link>
                ))}
            </nav>

            {/* Mobile toggle — only visible below md breakpoint */}
            {/* ↓ ADD block */}
            <div className="relative md:hidden">
                <button
                    ref={btnRef}
                    type="button"
                    onClick={() => setOpen((prev) => !prev)}
                    className="btn btn-mobile"
                    aria-haspopup="true"
                    aria-expanded={open}
                    aria-controls="main-menu"
                >
                    Menu
                    <svg
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                        className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`}
                    >
                        <path
                            fillRule="evenodd"
                            d="M5.23 7.21a.75.75 0 011.06.02L10 10.17l3.71-2.94a.75.75 0 111.06 1.06l-4.24 3.36a.75.75 0 01-.94 0L5.21 8.29a.75.75 0 01.02-1.08z"
                            clipRule="evenodd"
                        />
                    </svg>
                </button>
                {open && (
                    <div ref={menuRef} id="main-menu" className="menu-panel">
                        <nav aria-label="Mobile navigation">
                            <ul className="menu-panel-list">
                                {links.map(({ href, label }) => (
                                    <li key={href}>
                                        <Link
                                            href={href}
                                            className="menu-panel-link"
                                            onClick={() => setOpen(false)}
                                        >
                                            {label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </nav>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HeaderNav;
