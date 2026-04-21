"use client"
import { useEffect, useState } from "react";
import { providers } from "@/index";
import Swal from "sweetalert2";

type User = {
    lastname: string,
    firstname: string,
    photo: string | null,
    email: string,
    id: number
}

export default function useSendRepport() {
    const [isLoading, setIsLoading] = useState(false)
    const [inputs, setInputs] = useState({
        title: "",
        content: "",
        EnterpriseId: "",
        UserId: "",
        usersIds: [40],
        emails: ["murphykimbatsa@gmail.com", "contact@lrcgroup-app.com"]
    });
    const [files, setFiles] = useState<any>(null)
    const [showModal, setShowModal] = useState(false);
    const [users, setUsers] = useState<User[]>([]);
    const [usersCloned, setUsersCloned] = useState<User[]>([]);
    const [UserId, setUserId] = useState<number | null>(null);
    const [email, setEmail] = useState<string | null>(null);
    const [EnterpriseId, setEnterpriseId] = useState<number | null>(null);

    useEffect(() => {
        (async () => {
            if (typeof (window) === "undefined") return;

            const EnterpriseId = localStorage.getItem("EnterpriseId");
            const UserId = localStorage.getItem("UserId");
            const email = localStorage.getItem("email");

            const getUsers = await providers.API.getAll(providers.APIUrl, "getUsers", null);
            const filtersUsersById = getUsers.filter((user: { EnterpriseId: number, status: boolean }) => user.EnterpriseId === Number(EnterpriseId) && user.status);

            setUsers(filtersUsersById);
            setUsersCloned(filtersUsersById);
            setUserId(Number(UserId));
            setEnterpriseId(Number(EnterpriseId));
            setEmail(email);
        })()
    }, [])

    async function handleSubmit() {
        if (typeof (window) === "undefined") return;
        setIsLoading(true);

        const UserId = localStorage.getItem("UserId");
        const EnterpriseId = localStorage.getItem("EnterpriseId");

        if (!inputs.title || !inputs.content) {
            setTimeout(() => {
                setIsLoading(false);
                Swal.fire({
                    icon: "warning",
                    title: "Champs invalide",
                    text: "Veuillez sélectionner un titre et saisir un contenu"
                })
            }, 1000);
            return;
        }

        const data = {
            title: inputs.title,
            content: inputs.content,
            EnterpriseId: Number(EnterpriseId),
            UserId: Number(UserId),
            files,
        };

        console.log("les inputs", inputs)

        //Mail en copie au niveau de la direction
        await providers.API.post(providers.APIUrl, "sendMail", null, {
            subject: inputs.title,
            content: inputs.content,
            emails: ["contact@lrcgroup-app.com"],
            senderEmail: email,
        });

        //Mail en copie aux intéressés
        await providers.API.post(providers.APIUrl, "sendMail", null, {
            subject: "Notification non lue",
            content: "Vous avez une notification non lue sur votre espace LRCSheet Web.",
            emails: inputs.emails.filter(item => item !== "contact@lrcgroup-app.com"),
            senderEmail: "grcinfos@gmail.com",
        });

        for (const receiverId of inputs.usersIds) {
            const notification = await providers.API.post(providers.APIUrl, "sendNotificationToAdmin", null, {
                path: "/dashboard/NOTIF/chat",
                EnterpriseId: String(EnterpriseId),
                adminSectionIndex: 0,
                adminPageIndex: 0,
                senderId: UserId,
                receiverId
            })
            console.log(notification)
            const chat = await providers.API.post(providers.APIUrl, "createChatMessage", null, {
                content: data.content,
                receiverId,
                senderId: Number(UserId),
                EnterpriseId: Number(EnterpriseId),
                file: data.files,
                role: "client",
                title: data.title
            });
            console.log(chat)
        }

        const response = await providers.API.post(providers.APIUrl, "sendRepport", null, data);

        const status = response.status;
        const message = response.message;
        const title = response.title
        const iconType = status ? "success" : "error";

        if (status) {
            setIsLoading(false);
            setInputs({
                title: "",
                content: "",
                EnterpriseId: "",
                UserId: "",
                usersIds: [],
                emails: [""]
            });
            setFiles(null);
        }

        return Swal.fire({
            icon: status ? "success" : "error",
            title: title,
            text: message,
        })
    }

    const onCheck = (email: string, UserId: number) => {
        const checkEmailInEmailsArray = inputs.emails.includes(email) ?
            inputs.emails.filter(item => item !== email)
            :
            [...inputs.emails, email];

        const checkIdInUsersIdsArray = inputs.usersIds.includes(UserId) ? inputs.usersIds.filter(item => item !== UserId) : [...inputs.usersIds, UserId];

        setInputs({
            ...inputs,
            emails: checkEmailInEmailsArray,
            usersIds: checkIdInUsersIdsArray,
        });
    }

    console.log(inputs)

    function filterUsersByFullName(value: string) {
        const users = usersCloned.filter(user => user.firstname.toLowerCase()?.includes(value.toLowerCase()) || user.lastname.toLowerCase()?.includes(value.toLowerCase()));
        setUsers(users);
    }


    return {
        isLoading, setIsLoading, inputs, handleSubmit, setInputs, showModal, setShowModal, users, onCheck, filterUsersByFullName, files, setFiles
    }
}