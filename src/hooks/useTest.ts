import { useQuery } from "@tanstack/react-query";
import API from "@/router/api";

const fetchTest = async (): Promise<string> => {
    const response = await fetch(API.TEST);
    if (!response.ok) {
        throw new Error(`Error fetching API: ${response.statusText}`);
    }
    return response.json();
}

export const useTest = () => {
    const {
        data: msg,
        error,
        isLoading
    } = useQuery({
        queryKey: ['test'],
        queryFn: fetchTest
    });

    return {
        msg,
        error,
        isLoading
    };
}