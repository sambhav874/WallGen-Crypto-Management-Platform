import { useState, useEffect } from "react";

function useLocalStorage<T>(key: string, initialValue: T) {
    // State to store the value
    const [storedValue, setStoredValue] = useState<T>(initialValue);

    useEffect(() => {
        // Only access localStorage if window is defined
        if (typeof window !== "undefined") {
            try {
                const item = window.localStorage.getItem(key);
                setStoredValue(item ? JSON.parse(item) : initialValue);
            } catch (error) {
                console.error("Error reading localStorage key", key, error);
                setStoredValue(initialValue);
            }
        }
    }, [key, initialValue]);

    const setValue = (value: T) => {
        try {
            const valueToStore = value instanceof Function ? value(storedValue) : value;
            setStoredValue(valueToStore);
            if (typeof window !== "undefined") {
                window.localStorage.setItem(key, JSON.stringify(valueToStore));
            }
        } catch (error) {
            console.error("Error setting localStorage key", key, error);
        }
    };

    return [storedValue, setValue] as const;
}

export default useLocalStorage;
