"use client";
import React from "react";
import WalletConnect from "./ui/WalletConnect";
import { Button } from "./ui/button";
import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

export default function Header() {
  const [open, setOpen] = React.useState(false);
  const [isScrolled, setIsScrolled] = React.useState(false);
  const pathname = usePathname();

  function openMenu() {
    setOpen((prev) => !prev);
  }

  React.useEffect(() => {
    if (pathname === "/") {
      const handleScroll = () => {
        setIsScrolled(window.scrollY > 75);
      };

      window.addEventListener("scroll", handleScroll);
      return () => {
        window.removeEventListener("scroll", handleScroll);
      };
    }
  }, [pathname]);

  return (
    <main>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className={`border border-gray-200 shadow-sm bg-white rounded-md p-3 m-5 flex justify-between items-center mx-3 xl:mx-40 2xl:mx-80 duration-300 ease-in-out
            ${
              isScrolled
                ? "bg-white p-5 fixed top-0 left-0 right-0 z-50 animate-in slide-in-from-top shadow-md"
                : ""
            }`}
      >
        <nav className="ml-3">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/images/Logo/zkpull-logo.png"
              alt="zkPull"
              width={32}
              height={32}
              className="w-8 h-8 rounded-full"
            />
            <span className="text-xl font-medium text-black">zkPull</span>
          </Link>
        </nav>

        <nav>
          <ul className="hidden md:flex gap-3 items-center font-medium text-sm text-gray-700">
            <li>
              <Link
                href="/create-bounty"
                className={`relative rounded-lg px-4 py-2 transition-all duration-200 cursor-pointer ${
                  pathname === "/create-bounty"
                    ? "bg-[#ffefc5] text-black font-light border border-[#ffefc5]"
                    : "bg-white border border-gray-300 hover:bg-gray-50"
                }`}
              >
                <span
                  className={`absolute top-0 left-0 w-3 h-3 rounded-tl-md ${
                    pathname === "/create-bounty"
                      ? "border-white"
                      : "border-gray-400"
                  }`}
                ></span>
                <span
                  className={`absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 rounded-tr-md ${
                    pathname === "/create-bounty"
                      ? "border-white"
                      : "border-gray-400"
                  }`}
                ></span>
                <span
                  className={`absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 rounded-bl-md ${
                    pathname === "/create-bounty"
                      ? "border-white"
                      : "border-gray-400"
                  }`}
                ></span>
                <span
                  className={`absolute bottom-0 right-0 w-3 h-3 rounded-br-md ${
                    pathname === "/create-bounty"
                      ? "border-white"
                      : "border-gray-400"
                  }`}
                ></span>
                Create Bounty
              </Link>
            </li>
            <li>
              <Link
                href="/issues"
                className={`relative rounded-lg px-4 py-2 transition-all duration-200 cursor-pointer ${
                  pathname === "/issues"
                    ? "bg-[#ffefc5] text-black font-light border border-[#ffefc5]"
                    : "bg-white border border-gray-300 hover:bg-gray-50"
                }`}
              >
                <span
                  className={`absolute top-0 left-0 w-3 h-3 rounded-tl-md ${
                    pathname === "/issues" ? "border-white" : "border-gray-400"
                  }`}
                ></span>
                <span
                  className={`absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 rounded-tr-md ${
                    pathname === "/issues" ? "border-white" : "border-gray-400"
                  }`}
                ></span>
                <span
                  className={`absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 rounded-bl-md ${
                    pathname === "/issues" ? "border-white" : "border-gray-400"
                  }`}
                ></span>
                <span
                  className={`absolute bottom-0 right-0 w-3 h-3 rounded-br-md ${
                    pathname === "/issues" ? "border-white" : "border-gray-400"
                  }`}
                ></span>
                Explore Bounty
              </Link>
            </li>
            <li>
              <Link
                href="/profile"
                className={`relative rounded-lg px-4 py-2 transition-all duration-200 cursor-pointer ${
                  pathname === "/profile"
                    ? "bg-[#ffefc5] text-black font-light border border-[#ffefc5]"
                    : "bg-white border border-gray-300 hover:bg-gray-50"
                }`}
              >
                <span
                  className={`absolute top-0 left-0 w-3 h-3 rounded-tl-md ${
                    pathname === "/profile"
                      ? "border-white"
                      : "border-gray-400"
                  }`}
                ></span>
                <span
                  className={`absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 rounded-tr-md ${
                    pathname === "/profile"
                      ? "border-white"
                      : "border-gray-400"
                  }`}
                ></span>
                <span
                  className={`absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 rounded-bl-md ${
                    pathname === "/profile"
                      ? "border-white"
                      : "border-gray-400"
                  }`}
                ></span>
                <span
                  className={`absolute bottom-0 right-0 w-3 h-3 rounded-br-md ${
                    pathname === "/profile"
                      ? "border-white"
                      : "border-gray-400"
                  }`}
                ></span>
                Profile
              </Link>
            </li>
            <li>
              <Link
                href="/faucet"
                className={`relative rounded-lg px-4 py-2 transition-all duration-200 cursor-pointer ${
                  pathname === "/faucet"
                    ? "bg-[#ffefc5] text-black font-light border border-[#ffefc5]"
                    : "bg-white border border-gray-300 hover:bg-gray-50"
                }`}
              >
                <span
                  className={`absolute top-0 left-0 w-3 h-3 rounded-tl-md ${
                    pathname === "/faucet"
                      ? "border-white"
                      : "border-gray-400"
                  }`}
                ></span>
                <span
                  className={`absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 rounded-tr-md ${
                    pathname === "/faucet"
                      ? "border-white"
                      : "border-gray-400"
                  }`}
                ></span>
                <span
                  className={`absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 rounded-bl-md ${
                    pathname === "/faucet"
                      ? "border-white"
                      : "border-gray-400"
                  }`}
                ></span>
                <span
                  className={`absolute bottom-0 right-0 w-3 h-3 rounded-br-md ${
                    pathname === "/faucet"
                      ? "border-white"
                      : "border-gray-400"
                  }`}
                ></span>
                Faucet
              </Link>
            </li>
            <li>
              <WalletConnect />
            </li>
          </ul>
        </nav>

        <nav className="flex md:hidden gap-3">
          <WalletConnect />
          <Button asChild size="icon" className="p-1" onClick={openMenu}>
            <Menu />
          </Button>
        </nav>

        {open && (
          <nav className="font-medium fixed w-full h-full top-0 left-0 flex flex-col gap-5 items-center justify-center bg-white text-[#ffefc5] z-50 animate-in slide-in-from-right duration-500">
            <ul className="flex flex-col gap-5">
              <li>
                <Link href="/create-bounty">Create Bounty</Link>
              </li>
              <li>
                <Link href="/issues">Explore Bounty</Link>
              </li>
              <li>
                <Link href="/profile">Profile</Link>
              </li>
              <li>
                <Link href="/faucet">Faucet</Link>
              </li>
            </ul>
            <X
              onClick={openMenu}
              className="absolute top-5 right-5 cursor-pointer text-[#ffefc5]"
            />
          </nav>
        )}
      </motion.header>
    </main>
  );
}
