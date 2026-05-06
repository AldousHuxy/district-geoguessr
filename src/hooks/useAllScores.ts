import { useQuery } from "@tanstack/react-query";
import API from "@/router/api";

export const useAllScores = () => {
    const {
        data: allScores,
        isLoading,
        error,
    } = useQuery({
        queryKey: ['all-scores'],
        queryFn: async () => {
            const response = await fetch(API.ALL_SCORES);
            if (!response.ok) throw new Error('Failed to fetch all scores');
            return response.json();
        }
    })

    return {
        allScores,
        isLoading,
        error,
    };
};