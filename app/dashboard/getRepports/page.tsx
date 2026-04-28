"use client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faChevronDown, faChevronLeft, faChevronRight, faChevronUp, faSearch } from "@fortawesome/free-solid-svg-icons";
import { providers } from "@/index";
import { useRepportsList } from "./hook";
import { ClipLoader } from "react-spinners";

export default function Repports() {
    const { itemIndex, setItemIndex, isVisible, setIsVisible, itemIndexOnWriting, setItemIndexOnWriting, setAdminResponse, setMonthIndice, monthIndice, repportsArrayCloned, EnterpriseId, filterRepportsByUsersNames, navigateBetweenMonths, adminResponse, monthsOfYear, RepportsArray, sendAdminResponse, isLoading, setIsLoading, loadingData, ComponentModal } = useRepportsList();

    return (
        <div className="bg-white dark:bg-transparent">
            <div className="flex">
                <div className="mx-4 dark:text-gray-300 text-gray-700 mt-6 mb-4 w-full">
                    <div className="flex justify-between font-semibold mb-4 items-center">
                        <h1 className='font-bold text-[20px]'>{ComponentModal?.[0]?.Repport?.titlePage}</h1>
                        {/* <p className="text-blue-600">{ComponentModal[0].Repport?.path}</p> */}
                    </div>
                    <hr className='' />
                    <div className="flex justify-between mt-5 items-center  flex-row lg:space-y-0">
                        <button type="button" onClick={() => {
                            const decrementMonthIndex = monthIndice - 1;
                            setMonthIndice(decrementMonthIndex);
                            navigateBetweenMonths(RepportsArray, decrementMonthIndex, parseInt(EnterpriseId ?? ""))
                        }} className="bg-orange-500/90 font-semibold hover:scale-105 ease duration-500 px-2 lg:px-6 rounded-md py-3 text-white"><span className="relative top-[1px]"><FontAwesomeIcon icon={faChevronLeft} /></span>Précédent</button>
                        <div>
                            <h1 className="text-[20px] dark:text-gray-300 font-bold">{monthsOfYear[monthIndice]} {new Date().getFullYear()}</h1>
                        </div>

                        <button type="button" onClick={() => {
                            const incrementedMonthIndex = monthIndice + 1;
                            setMonthIndice(incrementedMonthIndex)
                            navigateBetweenMonths(RepportsArray, incrementedMonthIndex, parseInt(EnterpriseId ?? ""))
                        }} className="bg-blue-600 px-2 lg:px-6 py-3 rounded-md hover:bg-blue-700 ease duration-500 font-semibold hover:scale-105 text-white">Suivant<span className="relative top-[1px]"><FontAwesomeIcon icon={faChevronRight} /></span></button>

                    </div>
                    <div className="mx-auto mt-8 w-full">
                        {
                            repportsArrayCloned.length > 0 && !loadingData ?
                                repportsArrayCloned.filter(repport => repport.monthIndice === monthIndice).slice().reverse().map((repport, index) => (
                                    <div key={index} className="w-full h-auto bg-white border border-gray-300 shadow-xl mb-6 dark:shadow-none dark:border dark:border-gray-800 p-4 rounded-xl dark:bg-transparent">
                                        <div className="flex justify-start items-center lg:justify-between flex-col lg:flex-row space-y-5 lg:space-y-0">
                                            <div className="flex items-center space-x-4">
                                                {
                                                    repport.User?.photo ? <img src={`${providers.APIUrl}/images/${repport.User.photo}`} alt="" className="rounded-full w-[50px] h-[50px] object-cover" /> : <p className="text-[40px]">
                                                        🧑‍💼
                                                    </p>
                                                }

                                                <h1 className="font-bold">{repport.User?.lastname} {repport.User?.firstname}</h1>
                                            </div>
                                            <div onClick={() => {
                                                setItemIndex(index);
                                                setIsVisible(!isVisible)
                                            }} className="cursor-pointer bg-blue-600 hover:bg-blue-600 text-white ease duration-500 rounded-full px-4 py-2">
                                                <p>{itemIndex === index && isVisible ? "Voir moins" : "Voir plus"} <span className=""><FontAwesomeIcon className="" icon={itemIndex === index && isVisible ? faChevronUp : faChevronDown} />
                                                </span>
                                                </p>
                                            </div>
                                        </div>
                                        <div className="my-6 flex flex-col space-y-2 font-bold">
                                            <h1> Objet: {repport.title}</h1>
                                            <h1>Date: {new Date(repport.createdAt).toLocaleDateString('fr-Fr', {
                                                day: "2-digit",
                                                month: "long",
                                                year: "numeric",
                                                weekday: "short"
                                            })}</h1>
                                            <hr className='bg-gray-400 border-0 h-[1px]' />
                                            <div className="flex flex-col space-y-5 pt-4">
                                                <p className="font-normal leading-loose  dark:text-gray-300  whitespace-pre-wrap">{itemIndex === index && isVisible ? repport.content : repport.content?.length > 255 ? repport.content.slice(0, 254) + "..." : repport.content}
                                                </p>

                                                <div className={itemIndex === index && isVisible ? "relative -top-2" : "hidden"}>
                                                    <p className={repport.adminResponse ? "rounded-md border border-gray-400 p-4" : "hidden"}>
                                                        Commentaire de l'administrateur: <span className="font-normal">{repport?.adminResponse}</span>
                                                    </p>
                                                    {/* <textarea value={itemIndexOnWriting === index ? adminResponse : ""} onChange={(e) => {
                                                    setAdminResponse(e.target.value);
                                                    setItemIndexOnWriting(index)
                                                }} name="" id="" placeholder="Laissez un commentaire!" className="w-full bg-transparent  border border-gray-400 my-4 rounded-md dark:text-gray-300 placeholder-gray-600 dark:placeholder-gray-300  h-[100px] p-4 outline-none">
                                                </textarea>
                                                <button onClick={() => {
                                                    sendAdminResponse(adminResponse, "Repport", repport.id, repport.User.email, repport.UserId, repport.User.lastname, repport.User.firstname)
                                                }} type="button" className="text-white bg-blue-600 rounded-md hover:bg-blue-600 w-[100px] py-2">
                                                    {isLoading ? <ClipLoader size={16} color="#fff" /> : "Envoyer"}
                                                </button> */}
                                                </div>
                                                <div className={repport.files !== null ? "block" : "hidden"}>
                                                    <a href={`${providers.APIUrl}/images/${repport.files}`} target="_blank">
                                                        <img src="/images/fileIcone.png" className="w-[50px] h-[50px] object-contain" />
                                                        <p className="mb-1 text-blue-700  underline">Fichier joint!</p>
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))

                                :

                                <div className="h-[500px] relative   flex items-center justify-center">
                                    {
                                        loadingData ? <ClipLoader size={30} color="#1d4ed8" /> : <div>
                                            <img className="w-[200px] h-[200px] mx-auto" src="/images/svg/notfoundsvg.webp" />
                                            <p className="text-gray-600 font-bold text-center">Aucune donnée trouvée pour cette page</p>
                                        </div>
                                    }

                                </div>

                        }
                    </div>
                </div>
            </div>

        </div>
    )
}