import { useMutation, useQueryClient } from '@tanstack/react-query';
import API from '@/router/api';

type SaveScorePayload = {
    email: string;
    score: number;
};

type SaveScoreError = {
    message: string;
};

export const useSaveScore = () => {
    const queryClient = useQueryClient();

    const mutation = useMutation<unknown, SaveScoreError, SaveScorePayload>({
        mutationFn: async (payload) => {
            const response = await fetch(API.POST_SCORE, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (!response.ok) {
                throw data as SaveScoreError;
            }

            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['all-scores'] });
            queryClient.invalidateQueries({ queryKey: ['top-scores'] });
        },
    });

    return mutation;
};
