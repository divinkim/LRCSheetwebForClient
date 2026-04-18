"use client";
import { ClipLoader } from "react-spinners";
import useAddAttendance from "./hook";
export default function AddAttendance() {
    const { handleSubmit, setShowModal, showModal, attendance, btnStatus } = useAddAttendance();
    return (
        <div className={showModal ? "fixed w-screen h-screen bg-black/70 z-40" : "hidden"}>
            <div className='flex items-center relative justify-center w-full h-full text-gray-700 dark:text-gray-300'>
                <div className="w-[95%] lg:h-[310px] relative  h-[340px] lg:w-[40%] 2xl:w-[35%] dark:bg-gray-800 rounded-md bg-white shadow-xl dark:shadow-none dark:border dark:border-gray-600">
                    <div className="mt-5">
                        <h1 className="text-gray-700 dark:text-gray-300 text-lg text-center font-semibold ">Ajouter une horaire</h1>
                        <hr className="mt-4 dark:border-gray-600" />
                        <div className="w-full h-full  mt-5 relative p-4 lg:p-0 flex items-center justify-center">
                            <div className="flex flex-row w-full h-full items-center justify-center space-x-5 lg:space-x-8">
                                <button   type="button" onClick={async () => {
                                    handleSubmit("arrivalTime")
                                }} className="flex flex-col space-y-3">
                                    <p className="font-semibold text-center">Arrivée</p>
                                    <div className='bg-gray-700 rounded-full p-2 hover:scale-105 ease duration-500'>
                                        {!btnStatus ? <img src="/images/attendance/play.png" className="w-12 h-12 " alt="" /> : <ClipLoader color="#ffffff" size={16} />}
                                    </div>
                                    <p className="font-semibold text-center">{attendance.arrivalTime ? attendance.arrivalTime.slice(0, 5) : "-- - --"}</p>
                                </button>
                                <button disabled={btnStatus} onClick={async () => {
                                    handleSubmit("breakStartTime")
                                }} className="flex flex-col space-y-3">
                                    <p className="font-semibold text-center">Pause</p>
                                    <div className='bg-gray-700 rounded-full p-2 hover:scale-105 ease duration-500'>
                                        <img src="/images/attendance/pause.png" className="w-12 h-12" alt="" />
                                    </div>
                                    <p className="font-semibold text-center">{attendance.breakStartTime ? attendance.breakStartTime.slice(0, 5) : "-- - --"}</p>
                                </button>
                                <button disabled={btnStatus} onClick={async () => {
                                    handleSubmit("resumeTime")
                                }} type="button" className="flex flex-col space-y-3">
                                    <p className="font-semibold text-center">Reprise</p>
                                    <div className='bg-gray-700 rounded-full p-2 hover:scale-105 ease duration-500'>
                                        <img src="/images/attendance/reprise.png" className="w-12 h-12" alt="" />
                                    </div>
                                    <p className="font-semibold text-center">{attendance.resumeTime ? attendance.resumeTime.slice(0, 5) : "-- - --"}</p>
                                </button>
                                <button disabled={btnStatus} onClick={async () => {
                                    handleSubmit("departureTime")
                                }} type="button" className="flex flex-col space-y-3">
                                    <p className="font-semibold text-center">Départ</p>
                                    <div className='bg-gray-700 rounded-full p-2 hover:scale-105 ease duration-500'>
                                        <img src="/images/attendance/stop.png" className="w-12 h-12" alt="" />
                                    </div>
                                    <p className="font-semibold text-center">{attendance.departureTime ? attendance.departureTime.slice(0, 5) : "-- - --"}</p>
                                </button>
                            </div>
                        </div>

                    </div>
                    <div onClick={() => {
                        setShowModal(false)
                    }} className="w-[100px] cursor-pointer top-4 ease duration-500 hover:scale-105 relative  bg-[#FFAB02] rounded-md mx-auto">
                        <p className="text-white text-center  py-3 font-semibold">OK</p>
                    </div>
                </div>
            </div>
        </div>
    );
}