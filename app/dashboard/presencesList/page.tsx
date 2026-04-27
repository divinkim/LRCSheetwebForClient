"use client";

import { useEffect, useState } from "react";
import { providers } from "@/index";
import { faChevronLeft, faChevronRight, faSearch, faTimes } from "@fortawesome/free-solid-svg-icons";
import { tablesModal } from "@/components/Tables/tablesModal";
import Link from "next/link";
import { ClipLoader } from "react-spinners";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { getOriginalStackFrames } from "next/dist/next-devtools/shared/stack-frame";
import Swal from "sweetalert2";
import { PresencesListHookModal } from "./hook";
import useAddAttendance from "../attendance/hook";

export default function PresencesList() {
    const { presencesListCloned, monthIndice, setMonthIndice, yearIndice, setYearIndice, monthsArray, getPresencesByMonthAndYearIndice, user, getTotalSalary, getDailySalaryAmount, getAllAttendancesOfUser, getAttendancesStats, loadingData } = PresencesListHookModal();
    const { location, handleSubmit, attendance, btnStatus, btnType, setBtnType } = useAddAttendance()
    const [showModal, setShowModal] = useState(false);
    const [page, setPage] = useState(0);             // page courante
    const limit = 5;                                 // items par page
    const [showAddPresenceModal, setShowAddPresenceModal] = useState(false);
    const [showUpdatePresenceModal, setShowUpdatePresenceModal] = useState(false);
    const [maxPage, setMaxPage] = useState(0);
    const requireAdminRoles = ['Super-Admin', 'Supervisor-Admin'];
    const [start, setStart] = useState(1);

    useEffect(() => {
        (() => {
            const maxPage = Math.ceil(presencesListCloned?.length / limit);

            setMaxPage(maxPage);
            setPage(maxPage);

        })()
    }, [presencesListCloned]);

    const btnsArray = [
        {
            title: "Arrivée",
            type: "arrivalTime",
            btnIcon: "/images/attendance/play.png",
            hour: `${attendance.arrivalTime ? attendance.arrivalTime.slice(0, 5) : "-- - --"}`
        },
        {
            title: "Pause",
            type: "breakStartTime",
            btnIcon: "/images/attendance/pause.png",
            hour: `${attendance.breakStartTime ? attendance.breakStartTime.slice(0, 5) : "-- - --"}`
        },
        {
            title: "Reprise",
            type: "resumeTime",
            btnIcon: "/images/attendance/reprise.png",
            hour: `${attendance.resumeTime ? attendance.resumeTime.slice(0, 5) : "-- - --"}`
        },
        {
            title: "Départ",
            type: "departureTime",
            btnIcon: "/images/attendance/stop.png",
            hour: `${attendance.departureTime ? attendance.departureTime.slice(0, 5) : "-- - --"}`
        }
    ]

    const startPage = (start - 1) * limit;
    return (
        <div className="bg-white">
            {/* <AddAttendance /> */}
            <div className={showModal ? "fixed w-screen h-screen bg-black/70 z-40" : "hidden"}>
                <div className='flex items-center  justify-center w-full h-full text-gray-700 dark:text-gray-300'>
                    <div className="w-[95%] relative -top-12 lg:right-36 lg:h-[310px] h-[340px] lg:w-[40%] 2xl:w-[35%] dark:bg-gray-800 rounded-md bg-white shadow-xl dark:shadow-none dark:border dark:border-gray-600">
                        <div className="mt-5">
                            <h1 className="text-gray-700 dark:text-gray-300 text-lg text-center font-semibold ">Ajouter une horaire</h1>
                            <hr className="mt-4 dark:border-gray-600" />
                            <div className="w-full h-full  mt-5 relative p-4 lg:p-0 flex items-center justify-center">
                                <div className="flex flex-row w-full h-full items-center justify-center space-x-5 lg:space-x-8">
                                    {
                                        btnsArray.map((item) => (
                                            <button disabled={btnStatus && item.type === btnType} type="button" onClick={async () => {
                                                handleSubmit(item.type);
                                                setBtnType(item.type);
                                            }} className="flex flex-col space-y-3">
                                                <p className="font-semibold text-center">{item.title}</p>
                                                <div className='bg-gray-700 rounded-full p-2 hover:scale-105 ease duration-500'>
                                                    {btnStatus && item.type === btnType ? <ClipLoader color="#ffffff" size={42} /> : <img src={item.btnIcon} className="w-12 h-12 " alt="" />
                                                    }
                                                </div>
                                                <p className="font-semibold text-center">{item.hour}</p>
                                            </button>
                                        ))
                                    }
                                </div>
                            </div>

                        </div>
                        <div onClick={() => {
                            setShowModal(false);
                            window.location.href = "/dashboard/presencesList"
                        }} className="w-[100px] cursor-pointer top-4 ease duration-500 hover:scale-105 relative  bg-[#FFAB02] rounded-md mx-auto">
                            <p className="text-white text-center  py-3 font-semibold">OK</p>
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex">
                <div className='  dark:bg-transparent w-full text-gray-700 dark:text-gray-300'>
                    <div className="hidden lg:block pt-5">
                        <div className="relative">
                            <div className={showAddPresenceModal || showUpdatePresenceModal ? "absolute z-20 right-10 top-10" : "hidden"}>
                                <FontAwesomeIcon onClick={() => {
                                    setShowAddPresenceModal(false);
                                    setShowUpdatePresenceModal(false);
                                }} icon={faTimes} className="text-[20px] cursor-pointer text-white" />
                            </div>
                        </div>
                        {
                            tablesModal.map((e) => (
                                <div className="flex font-semibold space-x-5 px-4 items-center">
                                    <h1 className="text-[20px] my-4 font-bold dark:text-gray-300">{e.presencesList.pageTitle}  </h1>
                                    <button type="button" onClick={() => {
                                        setShowModal(true)
                                    }} className='text-white bg-blue-700 rounded-md ease duration-500 hover:bg-blue-800 py-3 px-5 hidden xl:block'>+ Ajouter une horaire</button>
                                </div>
                            ))
                        }


                        <div className="px-4 mx-auto">
                            <hr className='mt-3' />
                            <div className="flex flex-row items-center mx-3 py-5 justify-between">
                                <button onClick={() => {
                                    const prevMonth = monthIndice - 1;
                                    getPresencesByMonthAndYearIndice(prevMonth, yearIndice);
                                    setMonthIndice(prevMonth)
                                }} className="bg-orange-500/90 hover:scale-105 ease duration-500 outline-none py-2.5 relative right-2 px-4 text-white font-semibold rounded-md"><span><FontAwesomeIcon icon={faChevronLeft} className="" /></span> Précédent</button>
                                <h1 className="text-center font-semibold text-gray-600 dark:text-white">{monthsArray[monthIndice]} {yearIndice}</h1>

                                <button onClick={() => {
                                    const nextMonth = monthIndice + 1;
                                    getPresencesByMonthAndYearIndice(nextMonth, yearIndice);
                                    setMonthIndice(nextMonth)
                                }} className="bg-green-500 py-2.5 relative left-2  hover:scale-105 ease duration-500 outline-none px-4 text-white font-semibold rounded-md">Suivant <span><FontAwesomeIcon icon={faChevronRight} className="" /></span></button>
                            </div>
                            <div className="flex flex-col space-y-4 xl:space-y-0  lg:flex-row items-center justify-between">
                                {/* <div className="relative z-10 w-[250px]">
                                    <input
                                        type="text"
                                        placeholder="Rechercher un profil..."
                                        className="border border-gray-400 outline-none dark:border-gray-300 dark:bg-transparent px-3 py-2.5 rounded-md my-6 w-full"

                                        onChange={(e) => {
                                            onSearch(e.target.value, "");
                                        }}
                                    />
                                    <FontAwesomeIcon icon={faSearch} className="absolute text-gray-400 right-3 top-[38px]" />
                                </div> */}
                                {/* <div className="flex flex-col lg:flex-row items-center space-y-4 lg:space-y-0 lg:space-x-4">
                                {
                                    tablesModal.map((e) => (
                                        e.presencesList.links.map((item) => (
                                            <Link href={item.href} onClick={() => {
                                                if (!requireAdminRoles.includes(adminRole ?? "")) {
                                                    Swal.fire({
                                                        icon: 'warning',
                                                        title: "Violation d'accès!",
                                                        text: "Vous n'avez aucun droit d'effectuer cette action. Contacter votre administrateur de gestion",
                                                        showConfirmButton: false,
                                                    });
                                                    return setTimeout(() => {
                                                        window.location.href = "/dashboard/RH/presencesList"
                                                    }, 1500)
                                                }
                                                if (item.href === "") {
                                                    item.modal === "addPresenceModal" ? setShowAddPresenceModal(!showAddPresenceModal) : setShowUpdatePresenceModal(!showUpdatePresenceModal)
                                                }
                                            }} className="bg-blue-800 hover:bg-blue-900 ease duration-500 py-3 px-4">
                                                <FontAwesomeIcon icon={item.icon} className="text-white" />
                                                <span className='text-white font-semibold  lg:text-normal'> {item.title}</span>
                                            </Link>
                                        ))

                                    ))
                                }
                            </div> */}
                            </div>
                            {/* 🧾 Tableau */}
                            <table className="border w-full mt-5 ">
                                <thead>
                                    <tr className="bg-gray-800 dark:bg-transparent">
                                        {
                                            tablesModal.map((item) => (
                                                item.presencesList.table.titles.map((e, index) => (
                                                    <th key={index} className="border py-2 xl:px-5 border-gray-400 dark:border-gray-300 text-gray-200  2xl:px-10 px-2 dark:text-gray-300">{e.title}</th>
                                                ))
                                            ))
                                        }
                                    </tr>
                                </thead>

                                <tbody className="w-full">
                                    {
                                        presencesListCloned.length > 0 ? presencesListCloned.slice(startPage, startPage + limit).map((u) => (
                                            <tr className="">
                                                <td className="border p-2 border-gray-400 dark:border-gray-300">
                                                    {u.User?.photo ? <img src={`${providers.APIUrl}/images/${u.User?.photo}`} className="w-[50px] mx-auto h-[50px] object-cover rounded-full" alt="" /> : <p className="text-center text-[40px]">
                                                        🧑‍💼
                                                    </p>}
                                                </td>
                                                <td className="border p-2 border-gray-400 dark:border-gray-300  text-center font-semibold dark:text-gray-300">{u.User?.lastname} {u.User?.firstname}</td>
                                                <td className="border p-2 border-gray-400 dark:border-gray-300 dark:text-gray-300 text-center font-semibold">{u.arrivalTime === "00:00:00" ? "--" : u.arrivalTime} - {u?.breakStartTime ?? "--"}</td>
                                                <td className="border p-2 border-gray-400 dark:border-gray-300 dark:text-gray-300 text-center font-semibold">{u?.resumeTime ?? "--"} - {u?.departureTime ?? "--"}</td>
                                                {/* <td className="border p-2 border-gray-400 dark:border-gray-300 dark:text-gray-300 text-center font-semibold">{u.Planning?.startTime ? u.Planning.startTime.slice(0, 5) : "--"} - {u.Planning?.endTime ? u.Planning.endTime.slice(0, 5) : "--"}</td> */}
                                                <td className="border w-[155px] p-2 border-gray-400 dark:border-gray-300 dark:text-gray-300 text-center font-semibold">{new Date(u.createdAt ?? "").toLocaleDateString('fr-Fr', {
                                                    day: "numeric",
                                                    weekday: "short",
                                                    month: "short",
                                                    year: "numeric",
                                                })}</td>
                                                <td className="p-2 border border-gray-400 dark:border-gray-300 dark:text-gray-300 text-center font-semibold">{u.Enterprise?.logo ? <img src={`${providers.APIUrl}/images/${u.Enterprise?.logo}`} className="w-[50px] mx-auto h-[50px] object-cover rounded-full" alt="" /> : u.Enterprise?.name}</td>

                                                <td className="p-2 border border-gray-400 dark:border-gray-300 dark:text-gray-300 text-center font-semibold">{u.status === "A temps" ? "✅ A temps" : u.status === "En retard" ? "⏳ En retard" : "❌ Absent"}</td>
                                                <td className="text-center py-5 font-semibold border-b border-r  space-x-3 flex justify-center h-auto p-2 border-gray-400 dark:border-gray-300">
                                                    <button type="button" onClick={() => {
                                                        window.location.href = `/dashboard/getAllPresencesOfUser/${u.UserId}`
                                                    }} className="bg-gray-300 hover:scale-105 ease duration-500 p-2 rounded-md">
                                                        <p className="text-center">👁️</p>
                                                    </button>
                                                </td>

                                            </tr>
                                        )) :
                                            <p className="text-center absolute left-1/2 right-1/2 w-[200px] mt-3">
                                                Aucune donnée trouvée
                                            </p>
                                    }

                                </tbody>
                            </table>
                            {/* 🔄 Pagination */}
                            <div className="flex items-center justify-center  gap-4 my-10">
                                <div className="flex flex-col">
                                    <p className="text-center">Page {page} / {maxPage}</p>
                                    <div className="flex flex-row mt-4 space-x-4">
                                        <button
                                            className="px-4 py-3  font-semibold text-white ease duration-500 hover:bg-red-600 bg-red-500 rounded disabled:opacity-40"
                                            onClick={() => {
                                                setPage(page - 1);
                                                setStart(start + 1)
                                            }}
                                            disabled={page === 1}
                                        >
                                            <span className="relative top-[1px]"><FontAwesomeIcon icon={faChevronLeft} /></span> précédent
                                        </button>
                                        <button
                                            className="px-4 py-3 bg-green-500 ease duration-500 hover:bg-green-600 text-white font-semibold rounded disabled:opacity-40"
                                            onClick={() => {
                                                setPage(nextPage => nextPage + 1);
                                                setStart(start - 1)
                                            }}

                                            disabled={page === maxPage}
                                        >
                                            Suivant<span className="relative top-[1px]"><FontAwesomeIcon icon={faChevronRight} /></span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="lg:hidden p-5">
                        <div className="flex flex-row items-center py-5 justify-between">
                            <button onClick={() => {
                                const prevMonth = monthIndice - 1;
                                getPresencesByMonthAndYearIndice(prevMonth, yearIndice);
                                setMonthIndice(prevMonth)
                            }} className="bg-orange-500/90 py-2.5 relative right-2 px-4 text-white font-semibold rounded-md"><span><FontAwesomeIcon icon={faChevronLeft} className="" /></span> Précédent</button>
                            <h1 className="text-center font-semibold text-gray-600">{monthsArray[monthIndice]} {yearIndice}</h1>

                            <button onClick={() => {
                                const nextMonth = monthIndice + 1;
                                getPresencesByMonthAndYearIndice(nextMonth, yearIndice);
                                setMonthIndice(nextMonth)
                            }} className="bg-green-500 py-2.5 relative left-2 px-4 text-white font-semibold rounded-md">Suivant <span><FontAwesomeIcon icon={faChevronRight} className="" /></span></button>
                        </div>
                        <button onClick={() => {
                            setShowModal(true)
                            console.log(showModal)
                        }} className="bg-blue-600 text-white mb-2 rounded-md relative right-2 font-semibold py-3 px-5">+ Ajouter une horaire</button>

                        <hr className="mt-4" />
                        <div className="mt-5 flex flex-col space-y-4 sm:flex-row justify-between">
                            <div className="flex flex-col space-y-3">
                                <p className="font-semibold">💰 Salaire journalier: <span className="font-bold text-gray-500">{user.Salary.dailySalary.replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " XAF"}</span></p>
                                <p className="font-semibold">💵 Salaire final: <span className="font-bold text-gray-500">{user.Salary.netSalary.replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " XAF"}</span></p>
                            </div>
                            <div>
                                <p className="font-semibold">💸 Salaire actuel: <span className="font-bold text-gray-500">{getTotalSalary(presencesListCloned, monthIndice, user?.Salary.dailySalary).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " XAF"}</span></p>
                            </div>
                        </div>
                        <div className="flex justify-center mt-5 space-x-5">
                            <p className="font-semibold text-green-500">✅A temps:{
                                getAttendancesStats(presencesListCloned, monthIndice).presencesCount ?? 0
                            } <span className="font-bold text-gray-500"></span></p>
                            <p className="font-semibold text-yellow-500">⏳En retard:{
                                getAttendancesStats(presencesListCloned, monthIndice).latesCount ?? 0
                            }  <span className="font-bold text-gray-500"></span></p>
                            <p className="font-semibold text-red-500">❌Absent:<span className="font-bold text-gray-500"></span> {
                                getAttendancesStats(presencesListCloned, monthIndice).absencesCount ?? 0
                            } </p>
                        </div>
                        <div className="overflow-auto mt-5 flex items-center justify-center w-full  flex-col space-y-5">
                            {
                                presencesListCloned.length > 0 && !loadingData ?
                                    presencesListCloned.map((item) => (
                                        <div className="bg-white dark:bg-gray-800 dark:border dark:border-gray-600 w-full shadow-lg flex flex-col space-y-4 p-4 rounded-md">
                                            <p className="font-semibold">Arrivée: {item.arrivalTime !== "00:00:00" ? item.arrivalTime?.slice(0, 5) : "-- --"}</p>
                                            <p className="font-semibold">Pause: {item.breakStartTime ? item.breakStartTime?.slice(0, 5) : "-- --"}</p>
                                            <p className="font-semibold">Reprise: {item.resumeTime ? item.resumeTime?.slice(0, 5) : "-- --"}</p>
                                            <p className="font-semibold">Départ: {item.departureTime ? item.departureTime?.slice(0, 5) : "-- --"}</p>
                                            <p className="font-semibold">Statut: {item.status === "A temps" ? "✅ A temps" : item.status === "En retard" ? "⏳ En retard" : "❌ Absent"}</p>
                                            <p className="font-semibold">pointage journalier: {getDailySalaryAmount(String(item.status), Number(user.Salary.dailySalary), String(item.arrivalTime)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " XAF"}</p>
                                            <p className="font-semibold">Date: {new Date(String(item.createdAt)).toLocaleDateString("fr-FR", {
                                                day: "2-digit",
                                                month: "short",
                                                year: "numeric"
                                            })}</p>
                                        </div>
                                    ))
                                    :
                                    presencesListCloned.length === 0 && loadingData ?
                                        <div className="h-[400px] relative -top-10  flex items-center justify-center">
                                            <ClipLoader color="#2563eb" />
                                        </div>
                                        : presencesListCloned.length === 0 && !loadingData ?
                                            <div className="h-[400px] relative -top-10  flex items-center justify-center">
                                                <div>
                                                    <img className="w-[200px] h-[200px] mx-auto" src="/images/svg/notfoundsvg.webp" />
                                                    <p className="text-gray-600 font-bold text-center">Aucune donnée trouvée pour cette page</p>
                                                </div>
                                            </div> :
                                            <div>
                                            </div>
                            }
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
