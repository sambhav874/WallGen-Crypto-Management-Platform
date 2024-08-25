'use client'
import useNotificationStore from "@/stores/useNotificationStore";
import { useEffect , useState } from "react"
import React  from 'react';
import { useConnection } from "@solana/wallet-adapter-react";
import { useNetworkConfiguration } from "@/contexts/NetworkConfigurationProvider";

const NotificationsList = () => {

    const {notifications , set: setNotificationStore} = useNotificationStore((s) => s);
    
    const reversedNotifications = [...notifications].reverse();
    return (
        <div className="notifications pointer-events-none fixed inset-0 items-end flex z-20 px-4 py-6 sm:p-6">
            <div className="flex w-full flex-col">
                {reversedNotifications.map((n , idx) => (
                    <Notification key={`${n.message}${idx}`} type={n.type} message={n.message} description={n.description} txid={n.txid} onHide={() => {
                        setNotificationStore((state : any) => {
                            const reverseIndex = reversedNotifications.length - 1 - idx;
                            state.notifications = [
                                ...notifications.slice(0 ,reverseIndex) ,
                                ...notifications.slice(reverseIndex + 1)
                            ]
                        }  )
                    }} />
                ))}
            </div>
        </div>
        )
}
const Notification = ({type , message , description , txid , onHide}) => {
    const {connection} = useConnection();
    const {networkConfiguration} = useNetworkConfiguration();

    useEffect(() => {
        const id = setTimeout(() => {
            onHide();
        } , 8000);

        return () => {
            clearInterval(id);
        }
    } ,[onHide]);

    return(
        <div className="pointer-events-auto z-50 mx-4 mt-2 mb-12 w-full max-w-sm overflow-hidden rounded-md bg-[#0a1023] p-2 shadow-lg right-1">
        <div className="p-4">
            <div className="flex items-center">
                <div className="flex-shrink-0">
                    {type === "success" ? (
                        <div className="mr-1 h-8 w-8">Success </div>
                    ) : null}
                    {type === "info" ? (
                        <div className="mr-1 h-8 w-8">Information </div>
                    ) : null}
                    {type === "error" ? (
                        <div className="mr-1 h-8 w-8">Error </div>
                    ) : null}
                </div>
                <div className="ml-4 w-0 flex-1">
                    <div className="font-bold">{message}</div>
                    {description ? (
                        <p className="mt-0.5 text-sm">{description}</p>
                    ) : null}
                    {txid ? (
                        <div className="flex flex-row">
                            <a href={`https://explorer.solana.com/tx/` + txid + `?cluster=${networkConfiguration}`} target="_blank" rel="noreferrer" className="link flex flex-row">
                            <div className="mx-4 flex">
                                {txid.slice(0,8)}....
                                {txid.slice(txid.length - 8)}
                                </div></a>
                        </div>
                    ) : null}

                </div>

                <div className="ml-4 flex flex-shrink-0 self-start">
                    <button onClick={() =>onHide()} className="bg-transparent hover:bg-gray-500 text-gray-300 inline-flex rounded-md focus:outline-none">
                        <span className="sr-only">Close</span>
                    </button>
                </div>

            </div>
        </div>
        </div>
    )
}



export default NotificationsList;