import { useQuery } from "@tanstack/react-query";
import API from "@/router/api";

export const useTopScores = () => {
    const {
        data: topScores,
        isLoading,
        error,
    } = useQuery({
        queryKey: ['top-scores'],
        queryFn: async () => {
            const response = await fetch(API.TOP_SCORES);
            if (!response.ok) throw new Error('Failed to fetch top scores');
            return response.json();
        }
    })

    return {
        topScores,
        isLoading,
        error,
    };
};