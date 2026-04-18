"use client";
import { useEffect, useState } from "react"
import useHome from "@/app/home/hook";
import Swal from "sweetalert2";
import { providers } from "@/index";
export default function useAddAttendance() {
    const [location, setLocation] = useState({
        latitude: "",
        longitude: "",
    });
    const [attendance, setAttendance] = useState({
        arrivalTime: "",
        breakStartTime: "",
        resumeTime: "",
        departureTime: "",
    });
    const [showModal, setShowModal] = useState(true);
    const [btnStatus, setBtnStatus] = useState(false);
    const [btnType, setBtnType] = useState("");
    useEffect(() => {
        navigator.geolocation.getCurrentPosition((location) => {
            setLocation({
                latitude: String(location.coords.latitude).slice(0, 5),
                longitude: String(location.coords.longitude).slice(0, 5),
            })
        }, (error) => {
            console.log(error)
        })
    }, []);

    useEffect(() => {
        (async () => {
            if (typeof (window) === "undefined") return;



            const UserId = localStorage.getItem("UserId");
            const getAttendanceOfToday = await providers.API.getOne(providers.APIUrl, "getAttendancesOfToday", Number(UserId));
            setAttendance({
                arrivalTime: getAttendanceOfToday.arrivalTime ? getAttendanceOfToday.arrivalTime : "",
                breakStartTime: getAttendanceOfToday.breakStartTime ? getAttendanceOfToday.breakStartTime : "",
                resumeTime: getAttendanceOfToday.resumeTime ? getAttendanceOfToday.resumeTime : "",
                departureTime: getAttendanceOfToday.departureTime ? getAttendanceOfToday.departureTime : ""
            })
        })()
    }, [location])

    const handleSubmit = async (column: string) => {
        if (typeof (window) === "undefined") return;

        const UserId = localStorage.getItem("UserId");
        const SalaryId = localStorage.getItem("SalaryId");
        const EnterpriseId = localStorage.getItem("EnterpriseId");
        const PlanningId = localStorage.getItem("PlanningId");
        const hour = new Date().toLocaleTimeString("fr-FR", { minute: "2-digit", hour: "2-digit" });
        const latOfEnterprise = localStorage.getItem("latitudeOfEnterprise");
        const lngOfEnterprise = localStorage.getItem("longitudeOfEnterprise");

        if (latOfEnterprise !== location.latitude || lngOfEnterprise !== location.longitude) {
            return Swal.fire({
                icon: "warning",
                title: "Attention!",
                text: "Vous devrez être dans le périmètre de votre entreprise, afin d'enregistrer vos horaires"
            })
        } else {
            if (hour > "12:00" && column === "arrivalTime") {
                return Swal.fire({
                    icon: "warning",
                    title: "Attention!",
                    text: "Vous ne pouvez plus enregistrer votre heure d'arrivée part rapport à votre planning horaire."
                })
            }
            else if (column === "arrivalTime" && attendance.arrivalTime) {
                return Swal.fire({
                    icon: "warning",
                    title: "Attention!",
                    text: "Horraire d'arrivée déjà enregistrée"
                })
            }
            else if ((hour < "12:00" || hour > "14:00") && column === "breakStartTime") {
                return Swal.fire({
                    icon: "warning",
                    title: "Attention!",
                    text: "Vous ne pouvez pas enregistrer votre heure de pause part rapport à votre planning horaire."
                })
            }
            else if (column === "breakStartTime" && attendance.breakStartTime) {
                return Swal.fire({
                    icon: "warning",
                    title: "Attention!",
                    text: "Horraire d'arrivée déjà enregistrée"
                })
            }
            else if ((hour < "13:30" || hour > "16:00") && column === "resumeTime") {
                return Swal.fire({
                    icon: "warning",
                    title: "Attention!",
                    text: "Vous ne pouvez pas enregistrer votre heure de pause part rapport à votre planning horaire."
                })
            }
            else if (column === "resumeTime" && attendance.resumeTime) {
                return Swal.fire({
                    icon: "warning",
                    title: "Attention!",
                    text: "Horraire d'arrivée déjà enregistrée"
                })
            }
            else if ((hour < "12:30") && column === "departureTime") {
                return Swal.fire({
                    icon: "warning",
                    title: "Attention!",
                    text: "Vous ne pouvez pas enregistrer votre heure de départ part rapport à votre planning horaire."
                })
            }
            else if (column === "departureTime" && attendance.departureTime) {
                return Swal.fire({
                    icon: "warning",
                    title: "Attention!",
                    text: "Horraire d'arrivée déjà enregistrée"
                })
            }
            else {
                setBtnStatus(true);
                setBtnType(column);

                const response = await providers.API.post(providers.APIUrl, "postAttendances", null, {
                    UserId: Number(UserId),
                    EnterpriseId: Number(EnterpriseId),
                    SalaryId: Number(SalaryId),
                    PlanningId: Number(PlanningId),
                    column
                });

                setBtnStatus(false);

                if (response.status) {
                    setAttendance({
                        ...attendance,
                        [column]: hour
                    });
                }

                return Swal.fire({
                    icon: response.status ? "success" : "error",
                    title: response.title,
                    text: response.message,
                })
            }
        }

    }

    console.log(location)
    console.log(btnStatus)
    return {
        location, handleSubmit, setShowModal, showModal, attendance, btnStatus, btnType, setBtnType
    }
}