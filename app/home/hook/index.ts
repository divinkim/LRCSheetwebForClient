"use client";
import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBuilding,
  faCity,
  faDollar,
  faDollarSign,
  faFileLines,
  faGlobe,
  faHandHoldingDollar,
  faIdBadge,
  faShieldAlt,
  faUserGroup,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";
import { providers } from "@/index";

type getAllPresencesOfUser = {
  arrivalTime: string,
  breakStartTime: string,
  resumeTime: string,
  departureTime: string,
  UserId: number,
  mounth: number,
  status: string,
  createdAt: string
}

type getAllRepportsOfUser = {
  title: string,
  content: string,
  monthIndice: number,
  UserId: number,
  files: string
}

type User = {
  firstname: string,
  lastname: string,
  Salary: {
    dailySalary: string,
    netSalary: string
  },
  Enterprise: {
    latitude: "",
    longitude: ""
  }
}

export default function useHome() {
  const [isLoading, setIsLoading] = useState(true);
  const [getAllPresencesOfUser, setAllPresencesOfUser] = useState<getAllPresencesOfUser[]>([]);
  const [getAllRepportsOfUser, setAllRepportsOfUser] = useState<getAllRepportsOfUser[]>([]);
  const [UserId, setUserId] = useState<string | null>(null);
  const [presencesCount, setPresencesCount] = useState(0);
  const [repportsCount, setRepportsCount] = useState(0);
  const [user, setUser] = useState<User>({
    firstname: "",
    lastname: "",
    Salary: {
      netSalary: "",
      dailySalary: ""
    },
    Enterprise: {
      latitude: "",
      longitude: ""
    }

  })

  function getPresencesCountOfUserByCurrentMonth(UserId: number) {
    const currentMonth = new Date().getMonth();
    const getPresencesByCurrentMonth = getAllPresencesOfUser?.filter(item => item.UserId === Number(UserId) && item.mounth === currentMonth && (item.status === "A temps" || item.status === "En retard"));
    return getPresencesByCurrentMonth?.length || 0;
  }

  function getRepportsCountOfUserByCurrentMonth(UserId: number) {
    const currentMonth = new Date().getMonth();
    const getRepportsByCurrentMonth = getAllRepportsOfUser?.filter(item => item.UserId === Number(UserId) && item.monthIndice === currentMonth);
    return getRepportsByCurrentMonth?.length || 0;
  }


  useEffect(() => {
    (async () => {
      if (typeof (window) === "undefined") return;
      const token = localStorage.getItem('token');
      const UserId = localStorage.getItem("UserId");

      const fcmToken = localStorage.getItem("fcmToken");

      if (!token || !fcmToken) return window.location.href = "/";
      setIsLoading(false);

      const getAllPresencesOfUser = await providers.API.getAll(providers.APIUrl, "getAttendances", Number(UserId));

      const getAllRepports = await providers.API.getAll(providers.APIUrl, "getAllRepports", null);
      const getAllRepportsOfUser = getAllRepports.filter((repport: { UserId: number }) => repport.UserId === Number(UserId));

      const getUser = await providers.API.getOne(providers.APIUrl, "getUser", Number(UserId));

      const fcmTokenResponse = await providers.API.post(providers.APIUrl, "sendFcmToken", null, {
        id: Number(UserId),
        UserEnterpriseId: Number(getUser.EnterpriseId),
        fcmToken
      });

      console.log(fcmTokenResponse)
      
      setAllPresencesOfUser(getAllPresencesOfUser);
      setAllRepportsOfUser(getAllRepportsOfUser);
      setUserId(UserId);

      setUser({
        firstname: getUser.firstname,
        lastname: getUser.lastname,
        Salary: {
          dailySalary: getUser?.Salary?.dailySalary ?? "0",
          netSalary: getUser?.Salary?.netSalary ?? "0",
        },
        Enterprise: {
          latitude: getUser?.Enterprise?.latitude,
          longitude: getUser?.Enterprise?.longitude
        }
      })
      const storedData = {
        EnterpriseId: getUser.EnterpriseId,
        SalaryId: getUser.SalaryId,
        PlanningId: getUser.PlanningId,
        lastname: getUser.lastname,
        firstname: getUser.firstname,
        photo: getUser.photo,
        email: getUser.email
      }
      for (const [key, value] of Object.entries(storedData)) {
        localStorage.setItem(key, String(value))
      }
    })();
  }, []);

  useEffect(() => {
    (() => {
      const presencesCount = getPresencesCountOfUserByCurrentMonth(Number(UserId))
      setPresencesCount(presencesCount)
    })()
  }, [getAllPresencesOfUser]);

  useEffect(() => {
    (() => {
      const repportsCount = getRepportsCountOfUserByCurrentMonth(Number(UserId));
      setRepportsCount(repportsCount)
    })()
  }, [getAllRepportsOfUser])

  const cardComponentArray = [
    {
      title: "Présence au poste du mois",
      icon: faIdBadge,
      backgroundInconColor: "#3b82f6",
      iconStyle: "bg-[#3b82f6] px-3 py-3.5 rounded-full",
      count: presencesCount,
      countStyle: "font-bold text-2xl  text-blue-500",
      href: "/dashboard/presencesList"
    },
    {
      title: "Rapports du mois courant",
      icon: faFileLines,
      backgroundInconColor: "bg-yellow-500",
      iconStyle: "bg-yellow-500 px-3 py-3.5 rounded-full",
      count: repportsCount,
      countStyle: "font-bold text-2xl  text-yellow-500",
      href: "/dashboard/getRepports",
    },
    {
      title: "Permissions du mois courant",
      icon: faShieldAlt,
      backgroundInconColor: "bg-green-500",
      iconStyle: "bg-green-500 px-3 py-3.5 rounded-full",
      count: 0,
      countStyle: "font-bold text-2xl  text-green-500",
      href: "/home",
    }
  ]

  console.log("les présences", getAllPresencesOfUser)

  return {
    getPresencesCountOfUserByCurrentMonth,
    UserId,
    cardComponentArray,
    isLoading,
    FontAwesomeIcon,
    user,
    getAllPresencesOfUser
  }
}
