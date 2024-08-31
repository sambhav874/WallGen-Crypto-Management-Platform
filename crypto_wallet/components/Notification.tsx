'use client';
import useNotificationStore from "@/stores/useNotificationStore";
import { useEffect } from "react";
import React from 'react';
import { useConnection } from "@solana/wallet-adapter-react";
import { useNetworkConfiguration } from "@/contexts/NetworkConfigurationProvider";

const NotificationsList = () => {
    const { notifications, set: setNotificationStore } = useNotificationStore((s) => s);
    
    const reversedNotifications = [...notifications].reverse();

    return (
        <div className="notifications pointer-events-none fixed inset-0 items-end flex flex-col-reverse z-20 px-4 py-6 sm:p-6">
            <div className="flex flex-col gap-4 w-full max-w-lg mx-auto">
                {reversedNotifications.map((n, idx) => (
                    <Notification
                        key={`${n.message}${idx}`}
                        type={n.type}
                        message={n.message}
                        description={n.description}
                        txid={n.txid}
                        onHide={() => {
                            setNotificationStore((state) => {
                                const reverseIndex = reversedNotifications.length - 1 - idx;
                                state.notifications = [
                                    ...notifications.slice(0, reverseIndex),
                                    ...notifications.slice(reverseIndex + 1)
                                ];
                            });
                        }}
                    />
                ))}
            </div>
        </div>
    );
};

const Notification = ({ type, message, description, txid, onHide }) => {
    const { networkConfiguration } = useNetworkConfiguration();

    useEffect(() => {
        const id = setTimeout(() => {
            onHide();
        }, 8000);

        return () => {
            clearTimeout(id);
        };
    }, [onHide]);

    // Define type-specific classes for black and white backgrounds
    const typeClasses = {
        success: "bg-black text-white border-white",
        info: "bg-white text-black border-black",
        error: "bg-black text-white border-white"
    };

    return (
        <div
            className={`pointer-events-auto z-50 w-full max-w-sm mx-auto p-4 rounded-md border shadow-lg transition-transform transform duration-300 hover:scale-105 ${typeClasses[type]}`}
        >
            <div className="flex items-start">
                <div className="flex-shrink-0">
                    {type === "success" && (
                        <div className="mr-2 h-8 w-8 flex items-center justify-center rounded-full border-2 border-white">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                    )}
                    {type === "info" && (
                        <div className="mr-2 h-8 w-8 flex items-center justify-center rounded-full border-2 border-black">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-black" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12.08A9.967 9.967 0 0012 3a9.967 9.967 0 00-9 9.08M12 12l-4 4m0 0l4 4m0-4l4 4" />
                            </svg>
                        </div>
                    )}
                    {type === "error" && (
                        <div className="mr-2 h-8 w-8 flex items-center justify-center rounded-full border-2 border-white">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 6L6 18M6 6l12 12" />
                            </svg>
                        </div>
                    )}
                </div>
                <div className="ml-3 flex-1">
                    <div className="font-semibold text-lg">{message}</div>
                    {description && <p className="mt-1 text-sm">{description}</p>}
                    {txid && (
                        <a
                            href={`https://explorer.solana.com/tx/${txid}?cluster=${networkConfiguration}`}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-2 text-indigo-300 hover:text-indigo-400"
                        >
                            {txid.slice(0, 8)}...{txid.slice(txid.length - 8)}
                        </a>
                    )}
                </div>
                <div className="ml-3 flex-shrink-0 self-start">
                    <button
                        onClick={() => onHide()}
                        className="text-gray-300 hover:text-gray-500 focus:outline-none"
                    >
                        <span className="sr-only">Close</span>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NotificationsList;