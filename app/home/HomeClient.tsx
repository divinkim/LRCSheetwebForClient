"use client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import Chart from "react-apexcharts";

interface Presence {
    userId: string;
    status: "present" | "late" | "absent";
    createdAt: string;
}

interface Props {
    presences: Presence[];
}

import { faArrowAltCircleUp, faEye, faIdBadge, faUserCheck, faUserGraduate, faUserGroup } from "@fortawesome/free-solid-svg-icons";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
// import Loader from "@/components/loader/loader";
import useHome from "./hook";

import useAddAttendance from "../dashboard/attendance/hook";
import { ClipLoader } from "react-spinners";

export default function HomeClient() {
    const { isLoading, cardComponentArray, FontAwesomeIcon, getAllPresencesOfUser } = useHome();

    const presences = getAllPresencesOfUser;

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Filtrer les présences du mois
    const monthlyPresences = presences.filter(p => {
        const date = new Date(p.createdAt);
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    });

    console.log("toutes les pésences", monthlyPresences)

    // Compter chaque type
    const stats = { present: 0, late: 0, absent: 0 };
    monthlyPresences.forEach(p => {
        if (p.status === "A temps") stats.present++;
        if (p.status === "En retard") stats.late++;
        if (p.status === "Absent") stats.absent++;
    });

    const total = monthlyPresences.length || 1; // éviter division par zéro
    const donutSeries = [
        (stats.present / total) * 100,
        (stats.late / total) * 100,
        (stats.absent / total) * 100,
    ];

    const donutOptions: ApexCharts.ApexOptions = {
        labels: ["À l’heure", "En retard", "Absent"],
        colors: ["#22c55e", "#facc15", "#f87171"], // vert, jaune, rouge
        legend: { position: "bottom" },
        dataLabels: { formatter: (val: number) => `${val.toFixed(1)}%` },
    };

    // ✅ CORRECTION : regrouper uniquement les jours existants
    const groupedByDay: any = {};

    monthlyPresences.forEach(p => {
        const date = new Date(p.createdAt);
        const day = date.getDate();

        if (!groupedByDay[day]) {
            groupedByDay[day] = { day, present: 0, late: 0, absent: 0 };
        }

        if (p.status === "A temps") groupedByDay[day].present++;
        if (p.status === "En retard") groupedByDay[day].late++;
        if (p.status === "Absent") groupedByDay[day].absent++;
    });

    const dailyStats = Object.values(groupedByDay).sort((a: any, b: any) => a.day - b.day);

    const lineOptions: ApexCharts.ApexOptions = {
        chart: { id: "daily-presences", toolbar: { show: true } },
        xaxis: { categories: dailyStats.map((d: any) => d.day) },
        colors: ["#22c55e", "#facc15", "#f87171"],
        stroke: { curve: "smooth" },
        markers: { size: 4 },
        legend: { position: "top" },
    };

    const lineSeries = [
        { name: "À l’heure", data: dailyStats.map((d: any) => d.present) },
        { name: "En retard", data: dailyStats.map((d: any) => d.late) },
        { name: "Absent", data: dailyStats.map((d: any) => d.absent) },
    ];

    return (
        <div>
            {/* <Loader isLoading={isLoading} /> */}
            {
                !isLoading ? <div className="flex">
                    <div className="mx-auto w-full h-auto p-4">

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 grid-cols-1 ">
                            {
                                cardComponentArray.map((item, index) => (
                                    <Link key={index} href={item.href} onClick={() => {
                                    }} className="rounded-md dark:bg-gray-900 dark:border-gray-800 ease duration-500 hover:scale-105  bg-white shadow-xl border border-gray-200 cursor-pointer flex flex-col space-y-5 p-4">
                                        <div className="flex justify-between">
                                            <div>
                                                <h1 className="font-extrabold text-xl text-gray-700 dark:text-gray-300">{item.title}</h1>
                                            </div>
                                        </div>
                                        <div>
                                            <h2 className={item.countStyle}>{item.count}</h2>
                                        </div>
                                        <div className="flex justify-end">
                                            <div style={{ backgroundColor: item.backgroundInconColor }} className={item.iconStyle}>
                                                <FontAwesomeIcon icon={item.icon} className="text-2xl text-white" />
                                            </div>
                                        </div>
                                    </Link>
                                ))
                            }
                        </div>

                        <div className="flex sm:flex-col pt-10 lg:flex-row gap-5 w-full">
                            <div className="w-full flex-col space-y-4 flex lg:space-x-4 lg:flex-row">
                                <div className="w-full dark:bg-gray-900 h-[470px] lg:h-auto lg:w-1/2 border border-gray-300 dark:border-gray-800 p-5 rounded-lg shadow-xl bg-white">
                                    <h2 className="text-xl font-bold mb-4 text-gray-700 dark:text-gray-300">
                                        Présences du mois
                                    </h2>
                                    <Chart options={donutOptions} series={donutSeries} type="donut" height={350} />
                                </div>

                                <div className="w-full  border border-gray-300 dark:border-gray-800 p-5 rounded-lg shadow-xl  bg-white dark:bg-gray-800">
                                    <h2 className="text-xl font-bold mb-4 text-gray-700 dark:text-gray-300">
                                        Présences par jour
                                    </h2>
                                    <Chart options={lineOptions} series={lineSeries} type="line" height={350} />
                                </div>
                            </div>
                        </div>

                    </div>
                </div> : <div className="w-full h-[600px] flex items-center justify-center">
                    <ClipLoader color="#1d4ed8" size={30} />
                </div>
            }


        </div>
    );
}