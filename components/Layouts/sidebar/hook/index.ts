import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faChevronDown, faChevronUp, faUser, faUserGroup, faBell, faPaperPlane, faList, faFileAlt, faShieldAlt,
    faUserClock, faUsers, faUserPlus, faClipboardList,
    faClipboardCheck, faCalendarCheck, faUserShield, faFileLines, faCheckCircle, faFileContract, faSuitcaseRolling,
    faCalendarDay, faUmbrellaBeach, faFileSignature, faIdBadge, faBuilding, faChartLine, faCreditCard,
    faMoneyBill1Wave,
    faFileInvoiceDollar,
    faBuildingCircleCheck,
    faBuildingColumns,
    faFileInvoice,
    faFileCircleCheck,
    faMoneyCheckDollar,
    faReceipt,
    faBalanceScale,
    faCalendarPlus,
    faGlobe,
    faCity,
    faHouseChimney,

    // ➜ AJOUTS
    faClock,
    faUserCheck,
    faPenToSquare,
    faListCheck,
    faCalendarDays,
    faMessage

} from "@fortawesome/free-solid-svg-icons";
import { getFirebaseMessaging } from "@/firebase/firebaseConfig";
import { onMessage } from "firebase/messaging";
import Swal from "sweetalert2";
import { useSidebarContext } from "../sidebar-context";
type notificationProps = {
    path: string,
    adminSectionIndex: string,
    adminPageIndex: string,
    title: string,
    content: string,
}


export default function SidebarHook() {
    const [storedNotificationsArray, setStoredNotificationsArray] = useState<any[]>([]);
    const [count, setCount] = useState(0);
    const messaging = getFirebaseMessaging()
    const DB_NAME = "NotificationDB";
    const DB_VERSION = 2;
    const STORE_NAME = "notifications";
    const {isMobile} = useSidebarContext()
    function openDB(): Promise<IDBDatabase> {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onupgradeneeded = (e: any) => {
                const db = e.target.result;
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    db.createObjectStore(STORE_NAME, { autoIncrement: true });
                }
            };

            request.onsuccess = (e: any) => resolve(e.target.result);
            request.onerror = (e) => reject(e);
        });
    }

    async function getAndClearNotifications() {
        const db = await openDB();

        return new Promise<any[]>((resolve) => {
            const tx = db.transaction(STORE_NAME, "readwrite");
            const store = tx.objectStore(STORE_NAME);
            const req = store.getAll();

            req.onsuccess = () => {
                const data = req.result || [];
                store.clear();
                resolve(data);
            };
        });
    }

    //Réception des notifs entrantes
    useEffect(() => {
        (async () => {
            const local = localStorage.getItem("storedNotificationsArray");
            const current = local ? JSON.parse(local) : [];
            setStoredNotificationsArray(current);

            //Récupération de IndexedDB (site fermé)
            const backgroundNotifs = await getAndClearNotifications();

            if (backgroundNotifs.length > 0) {
                const merged = [...current, ...backgroundNotifs];
                setStoredNotificationsArray(merged);
                setCount(prevCount => prevCount + 1);
            }
        })();

        //Notifications live
        if (messaging) {
            const unsubscribe = onMessage(messaging, (remoteMessage) => {
                console.log(remoteMessage)
                const EnterpriseId = localStorage.getItem("EnterpriseId");

                if (Number(remoteMessage.data?.EnterpriseId) === Number(EnterpriseId)) {

                    const notif = {
                        path: remoteMessage.data?.path,
                        adminSectionIndex: remoteMessage.data?.adminSectionIndex,
                        adminPageIndex: remoteMessage.data?.adminPageIndex,
                        senderId: remoteMessage.data?.senderId,
                    };

                    setStoredNotificationsArray((prev) => [...prev, notif]);
                    setCount(prevCount => prevCount + 1);

                    Swal.fire({
                        icon: "info",
                        title: "Notification entrante",
                        text: "Vous avez une nouvelle notification",
                        showCancelButton: true,
                        cancelButtonText: "Plus tard",
                        confirmButtonText: "Voir",
                    }).then((res) => {
                        if (res.isConfirmed) {
                            window.location.href = `${notif.path}`;
                        }
                    });
                }
            });

            return () => unsubscribe();
        }

    }, []);

    useEffect(() => {
        (() => {
            console.log("les notifs en question", storedNotificationsArray);
            if (storedNotificationsArray.length > 0) localStorage.setItem("storedNotificationsArray", JSON.stringify(storedNotificationsArray));
        })();
    }, [count]);

    const ItemAside = [
        // Onglet notifications
        {
            index: 0,
            title: "💬 Messagerie",
            ItemLists: [
                {
                    index: 0,
                    title: "Chat",
                    href: "/dashboard/NOTIF/chat",
                    icon: faMessage
                },
            ]
        },

        // Onglet Ressources humaines
        {
            index: 2,
            title: "📅 Gestion de présence",
            ItemLists: [
                {
                    index: 1,
                    title: "Présences au poste",
                    href: "/dashboard/presencesList",
                    icon: faUserCheck
                },
            ]
        },

        // Onglet Administration
        {
            index: 3,
            title: "📝 Gestion de rapports",
            ItemLists: [
                {
                    index: 0,
                    title: "Rediger un rapport",
                    href: "/dashboard/sendRepport",
                    icon: faPenToSquare
                },
                {
                    index: 1,
                    title: "Liste des rapport",
                    href: "/dashboard/getRepports",
                    icon: faFileLines
                },
            ]
        },

        // {
        //     index: 4,
        //     title: "🛂 Gestion de permission",
        //     ItemLists: [
        //         {
        //             index: 0,
        //             title: "Demander une permission",
        //             href: "/home",
        //             icon: faPaperPlane
        //         },
        //         {
        //             index: 1,
        //             title: "Liste des permissions",
        //             href: "/home",
        //             icon: faListCheck
        //         },
        //     ]
        // },

        // {
        //     index: 5,
        //     title: "🏖️ Gestion de congé",
        //     ItemLists: [
        //         {
        //             index: 0,
        //             title: "Calendrier de congé",
        //             href: "/home",
        //             icon: faCalendarDays
        //         },
        //     ]
        // },

        // Onglet Comptabilité
        {
            index: 6,
            title: "🧑‍💼Compte",
            ItemLists: [
                {
                    index: 0,
                    title: "Profil",
                    href: "/home",
                    icon: faUser
                },
            ]
        },


        // Onglet Statistiques
        {
            index: 12,
            title: "📊 Statistiques",
            ItemLists: [
                {
                    index: 0,
                    title: "Bilan générale",
                    href: "/home",
                    icon: faChartLine
                },
            ]
        },
    ];

    function getSectionNotificationsCount(sectionIndex: number) {
        const notificationArray = storedNotificationsArray.filter(notification => Number(notification.adminSectionIndex) === sectionIndex);
        return notificationArray.length;
    };

    function getPageNotificationsCount(pageIndex: number) {
        const notificationArray = storedNotificationsArray.filter(notification => Number(notification.adminPageIndex) === pageIndex);

        return notificationArray.length;
    }

    const getUserNotificationsCount = (UserId: string) => {
        const getNotificationsCount = storedNotificationsArray.filter((item: { senderId: string }) => item.senderId === UserId);
        return getNotificationsCount.length;
    }

    return { ItemAside, storedNotificationsArray, setStoredNotificationsArray, getSectionNotificationsCount, getPageNotificationsCount, getUserNotificationsCount, isMobile };
}