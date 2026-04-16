"use client";
import { providers } from "@/index";
import { FormEvent, useEffect, useState } from "react";
import useHome from "@/app/home/hook";

type PresencesDatas = {
    arrivalTime: string | null,
    departureTime: string | null,
    breakStartTime: string | null,
    resumeTime: string | null,
    UserId: number,
    mounth: number | null,
    day: string | null,
    createdAt: string | null
    updatedAt: string | null,
    status: string | null
    EnterpriseId: number,
    SalaryId: number,
    PlanningId: number,
    User: {
        firstname: string | null,
        lastname: string | null,
        photo: string | null,
    },
    Planning: {
        startTime: string | null,
        breakingStartTime: string | null,
        resumeEndTime: string | null,
        endTime: string | null,
    },
    Enterprise: {
        name: string | null,
        logo: string | null,
    }
}

export function PresencesListHookModal() {
    const [presencesList, setPresencesList] = useState<PresencesDatas[]>([]);
    const [presencesListCloned, setPresencesListCloned] = useState<PresencesDatas[]>([]);
    const { user } = useHome()
    const [createdAt, setCreatedAt] = useState<string | null>(null);
    const [adminRole, setAdminRole] = useState<string>("");
    const [monthIndice, setMonthIndice] = useState(new Date().getMonth());
    const [yearIndice, setYearIndice] = useState(new Date().getFullYear());
    const [totalSalary, setTotalSalary] = useState("");

    async function getAllAttendancesOfUser() {
        setIsLoadingData(true)
        const UserId = localStorage.getItem("UserId");
        const presencesList = await providers.API.getAll(providers.APIUrl, "getAttendances", Number(UserId));
        setPresencesList(presencesList);
        setIsLoadingData(false)
    }

    const [loadingData, setIsLoadingData] = useState(false);

    useEffect(() => {
        (async () => {
            if (typeof (window) === "undefined") return;

            const EnterpriseId = localStorage.getItem("EnterpriseId");
            const fcmToken = localStorage.getItem("fcmToken");
            const UserId = localStorage.getItem("UserId");

            if (!fcmToken) return window.location.href = "/";
            if (!EnterpriseId) return window.location.href = "/dashboard/home";

            const fcmTokenResponse = await providers.API.post(providers.APIUrl, "sendFcmToken", null, {
                id: Number(UserId),
                UserEnterpriseId: Number(EnterpriseId),
                fcmToken
            });

            console.log(fcmTokenResponse)
        })()
        getAllAttendancesOfUser()
    }, []);

    useEffect(() => {
        if (typeof (window) === "undefined") return;
        getPresencesByMonthAndYearIndice(monthIndice, yearIndice);
    }, [presencesList])

    function onSearch(value: string, page: string) {
        const usersFiltered = presencesList.filter(user => user?.User?.firstname?.toString()?.toLowerCase()?.includes(value.toLowerCase()) || user?.User?.lastname?.toString()?.toLowerCase()?.includes(value.toLowerCase()));

        if (page === "addPresenceModal" || page === "updatePresenceModal") {
            return setPresencesListCloned([usersFiltered[0]])
        }

        setPresencesListCloned(usersFiltered);
    }
    //Mise à jour de l'utilisateur recherché

    const onSelectAllUser = () => {
        const allIds = presencesList.filter(user => user.UserId && user?.EnterpriseId && user?.SalaryId);
        const getEnterprisesIds = allIds.map(item => item.EnterpriseId);
        const getUsersIds = allIds.map(item => item.UserId);
        const getSalariesIds = allIds.map(item => item.SalaryId);

        return { allIds, getEnterprisesIds, getUsersIds, getSalariesIds }
    }

    const monthsArray = ["Jan", "Fev", "Mar", "Avr", "Mai", "Juin", "Jui", "Août", "Sept", "Oct", "Nov", "Dec"]

    function getPresencesByMonthAndYearIndice(monthIndice: number, yearIndice: number) {
        const getPresencesArray = presencesList.filter(presence => presence.mounth === monthIndice && new Date(String(presence.createdAt)).getFullYear() === yearIndice);
        setPresencesListCloned(getPresencesArray);
    }

    function getTotalSalary(attendances: any[], monthIndex: number, dailySalary: any) {
        let totalAmount: number = 0;
        let totalLates: number = 0;
        let totalePresences: number = 0;

        const filterAttendance = attendances.filter((attendance: { mounth: number, createdAt: string }) => attendance.mounth === monthIndex)

        for (const attendance of filterAttendance) {
            const status = attendance.status;
            const minutes = parseInt(attendance.arrivalTime.split(":")?.pop() ?? "");
            const finalMinutes = Number(minutes);
            const finalDailySalary = Number(dailySalary);
            let deductionAmount = 0;

            if (status === "En retard" && finalMinutes <= 15) {
                deductionAmount = Math.round(0.1 * finalDailySalary);
                totalLates += finalDailySalary - deductionAmount;
            } else if (status === "En retard" && finalMinutes > 15 && finalMinutes <= 30) {
                deductionAmount = Math.round(0.15 * finalDailySalary);
                totalLates += finalDailySalary - deductionAmount;
            } else if (status === "En retard" && finalMinutes > 30) {
                deductionAmount = Math.round(0.5 * finalDailySalary);
                totalAmount += finalDailySalary - deductionAmount;
            } else if (status === "A temps") {
                totalePresences += finalDailySalary;
            }
        }

        return totalAmount = totalLates + totalePresences;
    }

    function getDailySalaryAmount(status: string, dailySalary: number, arrivalTime: string) {
        if (status === "Absent") return 0 + " XAF";

        const finalArrivalTime = Number(arrivalTime.slice(0, 5).split(":"));
        let amount = 0;

        if (status === "En retard" && finalArrivalTime <= 15) {
            amount = 0.1 * dailySalary;
        } else if (status === "En retard" && finalArrivalTime > 15) {
            amount = 0.15 * dailySalary
        } else if (status === "En retard" && finalArrivalTime > 30) {
            amount = 0.5 * dailySalary;
        } else if (status === "A temps") {
            amount = dailySalary;
        }
        return amount;
    }

    function getAttendancesStats(attendances: any[], monthIndex: number) {
        return {
            presencesCount: attendances.filter(a => a.mounth === monthIndex && a.status === "A temps").length,
            latesCount: attendances.filter(a => a.mounth === monthIndex && a.status === "En retard").length,
            absencesCount: attendances.filter(a => a.mounth === monthIndex && a.status === "Absent").length,
        };
    }

    return { presencesListCloned, adminRole, onSearch, onSelectAllUser, setCreatedAt, monthIndice, setMonthIndice, yearIndice, setYearIndice, monthsArray, getPresencesByMonthAndYearIndice, user, getTotalSalary, getDailySalaryAmount, getAttendancesStats, loadingData, getAllAttendancesOfUser }
}