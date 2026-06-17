'use client';

import { Menu, X } from 'lucide-react';
import { useState } from 'react';

const NAV_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Pricing', href: '#pricing' },
];

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-white/85 backdrop-blur-md border-b border-black/10">
      <div className="max-w-[1200px] mx-auto px-6 flex items-center justify-between h-16">
        {/* Logo */}
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="flex items-center gap-2.5 no-underline"
        >
          <svg
            width="28"
            height="28"
            viewBox="0 0 28 28"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect width="28" height="28" rx="6" fill="#053B84" />
            <path
              d="M8 20L14 8L20 20"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path d="M11 15.5H17" stroke="white" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <span className="font-display text-lg font-semibold text-[#0A0A0A]">VantageUI</span>
        </a>

        {/* Desktop nav */}
        <div className="flex items-center gap-8">
          <div className="hidden md:flex gap-7">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="font-body text-[15px] font-medium text-[rgba(10,10,10,0.65)] no-underline transition-colors duration-150 hover:text-[#053B84]"
              >
                {link.label}
              </a>
            ))}
          </div>
          <a
            href="#waitlist"
            className="hidden md:inline-block font-display font-semibold text-[15px] text-white bg-[#053B84] px-5 py-2.5 rounded-lg no-underline shadow-cta transition-all duration-150 hover:bg-[#042D66] hover:-translate-y-0.5"
          >
            Get Started Free
          </a>
          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setOpen(!open)}
            className="flex md:hidden bg-none border-none cursor-pointer p-2 text-[#0A0A0A]"
            aria-label={open ? 'Close menu' : 'Open menu'}
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-black/10 bg-white px-6 py-4 flex flex-col gap-3">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="font-body text-base font-medium text-[rgba(10,10,10,0.65)] no-underline py-2"
            >
              {link.label}
            </a>
          ))}
          <a
            href="#waitlist"
            onClick={() => setOpen(false)}
            className="font-display font-semibold text-[15px] text-white bg-[#053B84] py-3 px-5 rounded-lg no-underline text-center"
          >
            Get Started Free
          </a>
        </div>
      )}
    </nav>
  );
}
