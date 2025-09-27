"use client";
import Link from "next/link";
import Image from "next/image"

export const Navbar = () => {

  return (
    <div className="w-full">
      <nav className="container relative flex flex-wrap items-center justify-between p-8 mx-auto lg:justify-between xl:px-1">
        {/* Logo  */}
        <Link href="/">
            <Image
              src="/img/logo.png"
              width="1032"
              alt="N"
              height="32"
              className="w-80"
            />
        </Link>
        <div className="gap-3 nav__item mr-2 lg:flex ml-auto lg:ml-0 lg:order-2">
            <div className="flex flex-wrap items-center mr-4">
              <Link href="/about" className="text-l">
                About
              </Link>
              <Link href="/team" className="ml-8 text-l">
                Team
              </Link>
            </div>
            <div className="hidden mr-3 lg:flex nav__item">
              <Link href="/dashboard" className="px-6 py-2 text-white bg-indigo-600 rounded-md md:ml-5">
                Get Started
              </Link>
            </div>
        </div>

      </nav>
    </div>
  );
}

