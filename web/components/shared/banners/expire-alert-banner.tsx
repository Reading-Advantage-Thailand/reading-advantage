"use client";
import { Icons } from "@/components/icons";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { Badge } from "../../ui/badge";
import { timeLeft } from "@/lib/utils";

interface Props {
  expireDate: string;
  expired: boolean;
}

export default function ExpireAlertBanner({ expireDate, expired }: Props) {
  const [isShow, setIsShow] = useState(false);

  useEffect(() => {
    const lastShown = localStorage.getItem("expireAlertBannerLastShown");
    const now = new Date().getTime();

    const timeLeftInMs = new Date(expireDate).getTime() - now;
    const daysLeft = Math.floor(timeLeftInMs / (1000 * 60 * 60 * 24));

    // Show the banner if the expiration is within 5 days or already expired
    if (daysLeft <= 5 || expired) {
      if (
        !lastShown ||
        now - parseInt(lastShown) > 24 * 60 * 60 * 1000 ||
        expireDate === ""
      ) {
        setIsShow(true);
        localStorage.setItem("expireAlertBannerLastShown", now.toString());
      }
    }
  }, [expireDate, expired]);

  const time = timeLeft(expireDate);

  const handleClose = () => {
    setIsShow(false);
  };

  return isShow ? (
    <div className="bg-gradient-to-r from-pink-500 to-rose-500 p-4 text-white">
      <div className="text-lg font-bold flex justify-between">
        <h3>
          Warning your license is about to expire!{" "}
          <Badge className="md:ml-2 bg-blue-500 text-white hover:bg-blue-600">
            {expireDate === "" ? "Expired" : time}
          </Badge>
        </h3>
        <button onClick={handleClose}>
          <Icons.close />
        </button>
      </div>
      <p>
        Please renew your license to continue using the app in the settings page
        or{" "}
        <Link href="/expired" className="text-blue-200 underline">
          click here
        </Link>
        . If you have any questions, please contact support.
      </p>
    </div>
  ) : null;
}
