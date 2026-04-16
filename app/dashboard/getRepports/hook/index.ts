"use client";
import { providers } from "@/index";
import HookComponentModal from "@/components/ComponentModal";
import { isValidElement, useEffect, useState } from "react";
type RepportsValue = {
    id: number,
    title: string,
    content: string,
    files: string,
    UserId: number,
    EnterpriseId: number,
    monthIndice: number,
    createdAt: string,
    adminResponse: string,
    User: {
        firstname: string,
        lastname: string,
        email: string,
        photo: string,
    }
}

export function useRepportsList() {
    const ComponentModal = HookComponentModal();
    const [itemIndex, setItemIndex] = useState<number | null>(null);
    const [itemIndexOnWriting, setItemIndexOnWriting] = useState<number | null>(null);
    const [isVisible, setIsVisible] = useState(false);
    const [adminResponse, setAdminResponse] = useState("");
    const [monthIndice, setMonthIndice] = useState(new Date().getMonth());
    const [RepportsArray, setRepportsArray] = useState<RepportsValue[]>([]);
    const [repportsArrayCloned, setRepportsArrayCloned] = useState<RepportsValue[]>([]);
    const [EnterpriseId, setEnterpriseId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [UserId, setUserId] = useState(0);
    const [loadingData, setloadingData] = useState(true)

    useEffect(() => {
        (() => {
            if (typeof (window) === "undefined") return;
            let EnterpriseId = localStorage.getItem("EnterpriseId");
            let UserId = localStorage.getItem("UserId");
            if(ComponentModal)
            setRepportsArray(ComponentModal.at(0)?.Repport?.repportsArray ?? []);
            setEnterpriseId(EnterpriseId);
            setUserId(Number(UserId))
        })()
    }, [
        ComponentModal?.at(0)?.Repport?.repportsArray
    ]);

    useEffect(() => {
        (() => {
            try {
                if (typeof (window) === "undefined") return;
                setloadingData(true);
                const UserId = localStorage.getItem("UserId")
                const getRepportsByUserId = RepportsArray.filter(repport => repport.UserId === Number(UserId));
                setRepportsArrayCloned(getRepportsByUserId);
            } catch (error) {

            } finally {
                setloadingData(false);
            }
        })()
    }, [RepportsArray])

    const monthsOfYear = [
        "Janvier",
        "Février",
        "Mars",
        "Avril",
        "Mai",
        "Juin",
        "Juillet",
        "Août",
        "Septembre",
        "Octobre",
        "Novembre",
        "Décembre"
    ];

    function navigateBetweenMonths(repportArray: RepportsValue[], monthIndice: number, EnterpriseId: number) {
        const newRepportsArray = repportArray.filter(repport => repport.EnterpriseId === EnterpriseId && repport.monthIndice === monthIndice && repport.UserId === UserId);
        return setRepportsArrayCloned(newRepportsArray)
    }

    function filterRepportsByUsersNames(value: string, monthIndice: number) {
        const repports = RepportsArray.filter(repport => (repport.User?.firstname.toLocaleLowerCase()?.includes(value.toLocaleLowerCase()) || repport.User?.lastname.toLocaleLowerCase()?.includes(value.toLocaleLowerCase())) && repport.monthIndice === monthIndice);
        setRepportsArrayCloned(repports)
    }

    async function sendAdminResponse(adminResponse: string, tableName: string, id: number, email: string, UserId: number, lastname: string, firstname: string) {
        setIsLoading(true);

        if (adminResponse === "") {
            return setTimeout(() => {
                providers.alertMessage(false, "Champs invalides", "Veuillez saisir un commentaire", null);
                setIsLoading(false)
            }, 1500);
        }

        const response = await providers.API.update(providers.APIUrl, "sendResponseAdmin", null, { adminResponse, tableName, UserId, email, lastname, firstname }, id);

        providers.alertMessage(response.status, response.title, response.message, response.status ? "/dashboard/ADMIN/repportsList" : null);
        setIsLoading(false);
    }

    return { itemIndex, setItemIndex, isVisible, setIsVisible, itemIndexOnWriting, setItemIndexOnWriting, setAdminResponse, setMonthIndice, monthIndice, repportsArrayCloned, EnterpriseId, filterRepportsByUsersNames, navigateBetweenMonths, adminResponse, monthsOfYear, RepportsArray, sendAdminResponse, isLoading, setIsLoading, loadingData, ComponentModal }
}