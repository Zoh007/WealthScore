import Image from "next/image";
import { Container } from "@/components/Container";
import heroImg from "../public/img/hero.png";
import dashboardImg from "../public/img/dashboardScreenshot.png";

export const Hero = () => {
  return (
    <>
      <Container className="flex flex-wrap">
        <div className="flex items-center w-full lg:w-1/2">
          <div className="max-w-2xl mb-8">
            <h1 className="text-4xl font-bold leading-snug tracking-tight text-gray-800 lg:text-4xl lg:leading-tight xl:text-6xl xl:leading-tight dark:text-white">
              Your wallet’s wellness check.
            </h1>
            <p className="py-5 text-xl leading-normal text-gray-500 lg:text-xl xl:text-2xl dark:text-gray-300">
              WealthScore is a financial wellness dashboard that turns raw account data into a simple, actionable score.
            </p>
            <p className="text-xl leading-normal text-gray-500 lg:text-xl xl:text-2xl dark:text-gray-300">
            By analyzing spending habits, savings patterns, bill payments, and cash flow, 
              WealthScore helps users understand their overall financial health at a glance.
            </p>

            <div className="flex flex-col items-start space-y-3 sm:space-x-4 sm:space-y-0 sm:items-center sm:flex-row mt-10">
              <a
                href="/dashboard"
                className="px-8 py-4 text-lg font-medium text-center text-white bg-indigo-600 rounded-md ">
                Get Started
              </a>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end w-full lg:w-1/2">
            <Image
              src={heroImg}
              width="516"
              height="517"
              className={"object-cover"}
              alt="Hero Illustration"
              loading="eager"
              placeholder="blur"
            />
        </div>
      </Container>
    </>
  );
}

