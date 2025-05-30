import React from "react";
import Link from "next/link";
import X from "../icons/x";
import Github from "../icons/github";
import { Button } from "../ui/button";
import { siteConfig } from "@/config/site.config";

// Chnage this with your own data
const defaultNavigationLinks = [
  { href: "/about", label: "About Us" },
  { href: "/services", label: "Services" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
];

const defaultSocialLinks = [
  {
    href: "https://x.com",
    icon: <X />,
  },

  {
    href: "https://github.com/",
    icon: <Github />,
  },
];

const Footer = ({
  brandName = "CommandOSS",
  navigationLinks = defaultNavigationLinks,
  socialLinks = defaultSocialLinks,
}) => {
  return (
    <footer className="bg-background border-t border-dashed">
      <div className="px-4 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-center space-y-6 sm:space-y-0">
          {/* Logo */}
          <div className="text-xl font-bold">
            <Link href="/">{brandName}</Link>
          </div>
          {/* Navigation Links */}
          <div className="flex flex-wrap justify-center space-x-6 text-sm">
            {navigationLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                {link.label}
              </Link>
            ))}
          </div>
          {/* Social Icons */}
          <div className="flex flex-wrap justify-center space-x-4">
            {Object.entries(siteConfig.socials).map(([key, value]) => {
              const Icon = value.icon;
              return (
                <Button
                  key={key}
                  variant="outline"
                  asChild
                  className="relative border-dashed"
                >
                  <Link
                    href={value.href}
                    target="_blank"
                    className="gap-2 group"
                  >
                    <div className="w-full h-[1px] bg-linear-to-r from-primary/0 via-primary to-primary/0 absolute top-0 -left-1/2 translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                    <Icon className="size-4" />
                  </Link>
                </Button>
              );
            })}
          </div>
        </div>
      </div>
      <div className="border-t border-dashed">
        <div className="mt-5 text-center text-sm">
          <p>
            &copy; {new Date().getFullYear()} {brandName}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
