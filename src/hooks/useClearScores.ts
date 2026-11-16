import { useMutation, useQueryClient } from '@tanstack/react-query';
import API from '@/router/api';

type ClearScoresResult = {
  deletedCount: number;
};

type ClearScoresError = {
  message: string;
};

export const useClearScores = () => {
  const queryClient = useQueryClient();

  return useMutation<ClearScoresResult, ClearScoresError, string>({
    mutationFn: async (resetToken) => {
      const response = await fetch(API.CLEAR_SCORES, {
        method: 'DELETE',
        headers: { 'x-score-reset-token': resetToken },
      });

      const data = await response.json();

      if (!response.ok) {
        throw data as ClearScoresError;
      }

      return data as ClearScoresResult;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-scores'] });
      queryClient.invalidateQueries({ queryKey: ['top-scores'] });
    },
  });
};
