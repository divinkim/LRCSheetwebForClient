"use client";
import { providers } from "@/index";

import { useEffect, useState } from "react";
import Swal from "sweetalert2";
export default function useAuth() {
    const [showPassword, setShowPassword] = useState(false);
    const [showSpinner, setShowSpinner] = useState(false);
    const [loadingPage, setLoadingPage] = useState(true);
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

        const response = await providers.API.post(providers.APIUrl, "login", null, {
            email, password
        });

        if (!response.status) {
            alertMessage(response.message)
            return;
        }

        const data = {
            token: response.user.token,
            UserId: response.user.UserId,
        }
        for (const [key, value] of Object.entries(data)) {
            localStorage.setItem(key, String(value));
        }

        return window.location.href = "/home";
    }

    return { showPassword, setShowPassword, showSpinner, authFunction, message, inputs, setInputs, loadingPage }
}