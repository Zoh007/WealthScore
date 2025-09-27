import {
  FaceSmileIcon,
  ChartBarSquareIcon,
  CursorArrowRaysIcon,
  AdjustmentsHorizontalIcon,
  BanknotesIcon,
  CalculatorIcon,
  ClockIcon,
  ExclamationTriangleIcon
} from "@heroicons/react/24/solid";

import benefitOneImg from "../public/img/benefit-one.png";
import benefitTwoImg from "../public/img/benefit-two.png";

const benefitOne = {
  title: "Build Better Money Habits",
  desc: "Understand your money like never before. WealthScore turns complex financial data into a simple score, helping you stay on top of your habits and goals.",
  image: benefitOneImg,
  bullets: [
    {
      title: "Clear & Simple",
      desc: "One easy-to-understand score shows your financial health at a glance.",
      icon: <FaceSmileIcon />,
    },
    {
      title: "Trackable Progress",
      desc: "Watch your score trend upward as you build better habits.",
      icon: <ChartBarSquareIcon />,
    },
    {
      title: "Actionable Insights",
      desc: "Personalized breakdowns highlight exactly where to improve.",
      icon: <CursorArrowRaysIcon />,
    },
  ],
};

const benefitTwo = {
  title: "What Makes Up Your WealthScore",
  desc: "Your financial wellness score is built from five key components that reflect your spending, saving, and money management habits. Each factor contributes to your overall score, giving you a clear picture of where you shine and where you can improve.",
  image: benefitTwoImg,
  bullets: [
    {
      title: "Spending Balance",
      desc: "Tracks how much of your income goes toward expenses.",
      icon: <BanknotesIcon />,
    },
    {
      title: "Savings Ratio",
      desc: "Measures how consistently you’re setting aside money for the future.",
      icon: <AdjustmentsHorizontalIcon />,
    },
    {
      title: "Bill Timeliness",
      desc: "Rewards on-time payments and penalizes missed or late bills.",
      icon: <ClockIcon />,
    },
    {
      title: "Emergency Cushion (Liquidity)",
      desc: "Reflects how much buffer you have for unexpected expenses.",
      icon: <ExclamationTriangleIcon />,
    },
    {
      title: "Debt/ Risk Management",
      desc: "Evaluates how much of your income goes toward debt and recurring obligations.",
      icon: <CalculatorIcon />,
    },
  ],
};


export {benefitOne, benefitTwo};
