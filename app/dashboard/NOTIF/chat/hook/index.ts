"use client";
import { providers } from "@/index";
import { useState, useEffect } from "react";
import SidebarHook from "@/components/Layouts/sidebar/hook";
import { useRef } from "react";
import { Ms_Madi } from "next/font/google";

type Users = {
    fcmToken: string,
    UserId: number,
    UserEnterpriseId: number,
    adminRole: string | null,
    role: string | null,
    User: {
        firstname: string,
        lastname: string,
        photo: string | null,
        email: string
    }
}

type ChatMessage = {
    role: string;
    receiverId: number;
    senderId: number;
    content: string;
    file: string;
    createdAt: string;
    title: string | null
};

export function useChat() {
    const [users, setUsers] = useState<Users[]>([]);
    const [usersCloned, setUsersCloned] = useState<Users[]>([]);
    const [UserId, setUserId] = useState<number | null>(null)
    const { storedNotificationsArray, setStoredNotificationsArray } = SidebarHook();
    const [userData, setUserData] = useState({
        fcmToken: "",
        UserId: 0,
        EnterpriseId: 0,
        lastname: "",
        firstname: "",
        photo: "",
        email: ""
    });
    const ref = useRef<HTMLDivElement | null>(null);

    const [data, setData] = useState({
        content: "",
        fcmToken: "",
        receiverId: 0,
        senderId: 0,
        EnterpriseId: 0,
        files: "",
    })

    function scrollDown() {
        if (ref.current) {
            ref.current.scrollIntoView({ behavior: "smooth" })
        }
    }

    const [chatMessage, setChatMessage] = useState<ChatMessage[]>([]);

    function removeNotificationCount(UserId: number) {
        const deleteItem = storedNotificationsArray.filter((item: { senderId: string, adminSectionIndex: string, adminPageIndex: string }) => Number(item.senderId) !== UserId && (Number(item.adminPageIndex) === 0 && Number(item.adminSectionIndex) === 0));
        console.log("le nouveau tableau de notif", deleteItem)
        setStoredNotificationsArray(deleteItem);
        localStorage.setItem("storedNotificationsArray", JSON.stringify(deleteItem))
    }

    function getNotificationCount(UserId: number) {
        const count = storedNotificationsArray.filter((item: { senderId: string }) => Number(item.senderId) === UserId);
        return count.length;
    }

    function sortUsersByFrequency(users: Users[], messages: ChatMessage[]) {
        const lastMessageMap = new Map<number, number>(); // userId -> timestamp

        messages.forEach((msg) => {
            const time = new Date(msg.createdAt).getTime();

            // sender
            if (msg.senderId) {
                const prev = lastMessageMap.get(msg.senderId) || 0;
                if (time > prev) {
                    lastMessageMap.set(msg.senderId, time);
                }
            }

            // receiver
            if (msg.receiverId) {
                const prev = lastMessageMap.get(msg.receiverId) || 0;
                if (time > prev) {
                    lastMessageMap.set(msg.receiverId, time);
                }
            }
        });

        return [...users].sort((a, b) => {
            const timeA = lastMessageMap.get(a.UserId) || 0;
            const timeB = lastMessageMap.get(b.UserId) || 0;
            return timeB - timeA;
        });

        // messages.forEach(msg => {
        //     const time = new Date(msg.createdAt).getTime();
        //     if (msg.senderId) {
        //         const getLastMessageTime = lastMessageMap.get(msg.senderId) || 0;
        //         if (time > getLastMessageTime) {
        //             lastMessageMap.set(msg.senderId, getLastMessageTime)
        //         }
        //     }
        //     if (msg.receiverId) {
        //         const getLastMessageTime = lastMessageMap.get(msg.receiverId) || 0;
        //         if (time > getLastMessageTime) {
        //             lastMessageMap.set(msg.receiverId, getLastMessageTime)
        //         }
        //     }

        // });

        // return [...users].sort((a, b) => {
        //     const timeA = lastMessageMap.get(a.UserId) || 0;
        //     const timeB = lastMessageMap.get(b.UserId) || 0;
        //     return timeB - timeA
        // })
    }

    useEffect(() => {
        (async () => {
            if (typeof (window) === "undefined") return;
            const EnterpriseId = localStorage.getItem("EnterpriseId");
            const UserId = localStorage.getItem("UserId");
            const usersFcmTokens = await providers.API.getAll(providers.APIUrl, "getFcmTokens", null);
            const usersFcmTokensByEnterpriseId = usersFcmTokens.filter((item: { UserEnterpriseId: number }) => item.UserEnterpriseId === Number(EnterpriseId));
            scrollDown()
            const chatMessage = await providers.API.getAll(providers.APIUrl, "getChatMessage", null);

            const newUsersArray = sortUsersByFrequency(usersFcmTokensByEnterpriseId, chatMessage);

            setUsers(newUsersArray);
            setUsersCloned(newUsersArray);
            setChatMessage(chatMessage);
            setUserId(Number(UserId));
            setData({
                ...data,
                senderId: Number(UserId)
            })
        })()
    }, []);

    useEffect(() => {
        (() => {
            scrollDown()
            const newUsersArray = sortUsersByFrequency(users, chatMessage);
            setUsersCloned(newUsersArray)
        })();
    }, [chatMessage])

    useEffect(() => {
       scrollDown()
    }, [userData.fcmToken])

    useEffect(() => {
        (async () => {
            const chatMessage = await providers.API.getAll(providers.APIUrl, "getChatMessage", null);
            setChatMessage(chatMessage);
        })()
    }, [storedNotificationsArray])

    async function sendChatMessage() {
        if (!data.content)
            return providers.alertMessage(false, "Champs incorrecte",
                "Veuillez saisir un contenu!",
                "/dashboard/NOTIF/chat"
            );
        setChatMessage(prevMessage => [
            ...prevMessage,
            {
                role: "client",
                receiverId: userData.UserId,
                senderId: Number(UserId),
                content: data.content,
                file: data.files,
                createdAt: new Date().toISOString(),
                title: ""
            }
        ]);

        const response = await providers.API.post(providers.APIUrl, "createChatMessage", null, {
            content: data.content,
            receiverId: userData.UserId,
            senderId: data.senderId,
            EnterpriseId: 1,
            file: data.files,
            role: "client",
        });

        setData({
            ...data,
            content: "",
            files: ""
        })

        if (response) {
            const notification = await providers.API.post("https://vps118934.serveur-vps.net:4000", "sendNotificationPush", null, {
                path: "/dashboard/NOTIF/chat",
                EnterpriseId: String(userData.EnterpriseId),
                adminSectionIndex: "0",
                adminPageIndex: "0",
                senderId: String(UserId),
                messagingType: "notification",//niveau app mobile
                receiverId: String(userData.UserId)
            });
            if (userData.UserId === 1) {
                const mail = await providers.API.post(providers.APIUrl, "sendMail", null, {
                    senderEmail: "lrcsheet@gmail.com",
                    subject: "Notification entrante!",
                    content: "Veuillez consulter votre messagerie au niveau de l'espace web LRCSheet.",
                    emails: ["grcinfos@gmail.com"]
                });
                console.log(mail);
                return;
            }
            const sendMail = await providers.API.post("https://vps118934.serveur-vps.net:4000", "sendMail", null, {
                senderEmail: "lrcsheet@gmail.com",
                subject: "Notification entrante!",
                content: "Veuillez consulter votre messagerie au niveau de l'espace web LRCSheet.",
                emails: [userData.email]
            })
            console.log(notification);
            console.log(sendMail)
        }
    }

    console.log("Les notifs", storedNotificationsArray);

    function onSearch(value: string) {
        const searchUsers = users.filter(item => item.User.firstname.toLowerCase().includes(value.toLowerCase()) || item.User.lastname.toLowerCase().includes(value.toLowerCase()));
        setUsersCloned(searchUsers);
    }

    console.log("le tableau", chatMessage)

    return { users, userData, setUserData, sendChatMessage, data, setData, chatMessage, setChatMessage, getNotificationCount, removeNotificationCount, ref, usersCloned, setUsersCloned, onSearch, UserId, storedNotificationsArray }
}