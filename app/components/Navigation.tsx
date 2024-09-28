"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import Link from "next/link";
import { GitHubLogoIcon, LinkedInLogoIcon } from "@radix-ui/react-icons";
import Image from "next/image";

export function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > window.innerHeight / 2);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <>
      <div className="hidden md:block absolute top-6 right-6 z-50">
        <Link href="https://github.com/zbloss" className="px-2" target="_blank">
          <Button
            className="
            bg-white
            text-black
            hover:bg-black
            hover:text-white
            hover:border-white
            border-2
            transition-colors
            "
          >
            <GitHubLogoIcon className="h-6 w-6" />
          </Button>
        </Link>
        <Link
          href="https://www.linkedin.com/in/zachary-bloss/"
          className="px-2"
          target="_blank"
        >
          <Button
            className="
            bg-white
            text-black
            hover:bg-black
            hover:text-white
            hover:border-white
            border-2
            transition-colors
            "
          >
            <LinkedInLogoIcon className="h-6 w-6" />
          </Button>
        </Link>
        <Link
          href="https://itswhatwassaid.com/"
          className="px-2"
          target="_blank"
        >
          <Button
            className="
            bg-white
            text-black
            hover:bg-black
            hover:text-white
            hover:border-white
            border-2
            transition-colors
            "
          >
            <Image
              alt="Its What Was Said, LLC. Logo"
              src="/images/its-what-was-said.png"
              width={24}
              height={24}
            />
          </Button>
        </Link>
      </div>

      {/* Mobile Menu Button */}
      <div className="md:hidden absolute top-6 right-6 z-50 text-purple-400">
        <Button variant="ghost" size="icon" onClick={toggleMenu}>
          <Menu className="h-6 w-6" />
        </Button>
      </div>

      {/* Navigation */}
      <AnimatePresence>
        {(isMenuOpen || !isMobile) && (
          <motion.nav
            initial={{ opacity: 0, x: isMobile ? 300 : -300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: isMobile ? 300 : -300 }}
            transition={{ duration: 0.3 }}
            className={`${
              isMobile
                ? "fixed inset-y-0 right-0 w-64 bg-black bg-opacity-90 p-6 z-50"
                : `fixed bottom-6 left-6 flex flex-col items-start transition-all duration-300 z-50 ${
                    isScrolled ? "bg-black bg-opacity-70 bottom-1/2" : ""
                  }`
            }`}
          >
            {isMobile && (
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleMenu}
                className="mb-6 text-purple-400"
              >
                <X className="h-6 w-6" />
              </Button>
            )}
            <ul className={`space-y-4 ${isMobile ? "" : "text-xl"}`}>
              <li>
                <Link
                  href="/"
                  className="hover:text-purple-400 transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="#about"
                  className="hover:text-purple-400 transition-colors"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  href="#projects"
                  className="hover:text-purple-400 transition-colors"
                >
                  Projects
                </Link>
              </li>
              <li>
                <Link
                  href="#certifications"
                  className="hover:text-lime-400 transition-colors"
                >
                  Certifications
                </Link>
              </li>
            </ul>
          </motion.nav>
        )}
      </AnimatePresence>
    </>
  );
}
