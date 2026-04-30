"use client";
import { providers } from "@/index";

import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { getFirebaseMessaging } from "@/firebase/firebaseConfig";
import { getToken } from "firebase/messaging";

export default function useAuth() {
    const [showPassword, setShowPassword] = useState(false);
    const [showSpinner, setShowSpinner] = useState(false);
    const [loadingPage, setLoadingPage] = useState(true);
    const messaging = getFirebaseMessaging();

    const [inputs, setInputs] = useState({
        email: "",
        password: ""
    })
    const [message, setMessage] = useState("");

    useEffect(() => {
        (() => {
            setTimeout(() => {
                setLoadingPage(false);
            }, 500)
        })()
    }, [])

    const alertMessage = (message: string) => {
        setShowSpinner(false);
        setMessage(message)
        setTimeout(() => {
            setMessage("")
        }, 3000);
        return;
    }
    useEffect(() => {
        (async () => {
            try {
                await Notification.requestPermission().then(async (permission) => {
                    if (permission === "granted") {
                        if (!messaging) return
                        console.log("permission accordée")
                        const adminFcmToken = await getToken(messaging, {
                            vapidKey: "BM91689dVSwzQt0EWC0MmE0UBLvdkXzahkR0-UFppnWI3rOP8OTakisMCaxco0lXPZzx6jmxbtsbzWECTN6K6lg",
                        });
                        console.log("le token", adminFcmToken)
                        if (adminFcmToken) localStorage.setItem("fcmToken", adminFcmToken);
                    } else {
                        console.log("permissions non accordées")
                    }
                })
            } catch (error) {
                console.error(error)
            }
        })();
    }, [])

    const authFunction = async () => {
        setShowSpinner(true);

        const email = inputs.email;
        const password = inputs.password;
        const emailRegex = /^[a-z0-9]+@[a-z]+\.[a-z]{2,}$/;

        if (!email || !password) {
            alertMessage("Veuillez saisir tous les champs.")
        } else if (!emailRegex.test(email)) {
            alertMessage("Veuillez saisir une adresse mail valide.")
            return;
        }

        const response = await providers.API.post("https://vps118934.serveur-vps.net:4001", "login", null, {
            email, password
        });

        if (!response.status) {
            providers.alertMessage(response.status,
                response.title,
                response.message,
                null
            );
            return;
        }

        const data = {
            token: response.user.token,
            UserId: response.user.UserId,
            latitudeOfEnterprise: response.user.latitude,
            longitudeOfEnterprise: response.user.longitude,
        }

        for (const [key, value] of Object.entries(data)) {
            localStorage.setItem(key, String(value));
        }

        return window.location.href = "/home";
    }

    return { showPassword, setShowPassword, showSpinner, authFunction, message, inputs, setInputs, loadingPage }
}