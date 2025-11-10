import { useQuery, useMutation } from '@tanstack/react-query';
import { generateFeedback, fetchSessionFeedback, fetchUserProgress } from '@/services/api';
import { queryClient } from '@/config/react-query';
import type { GenerateFeedbackRequest } from '@/types';

export function useFeedback(sessionId: string | null) {
  // Query to fetch existing feedback
  const feedbackQuery = useQuery({
    queryKey: ['feedback', sessionId],
    queryFn: () => fetchSessionFeedback(sessionId!),
    enabled: !!sessionId,
  });

  // Mutation to generate new feedback
  const generateMutation = useMutation({
    mutationFn: (request: GenerateFeedbackRequest) => generateFeedback(request),
    onSuccess: (data) => {
      // Invalidate and refetch feedback
      queryClient.invalidateQueries({ queryKey: ['feedback', data.session_id] });
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      queryClient.invalidateQueries({ queryKey: ['progress'] });
    },
  });

  return {
    feedback: feedbackQuery.data,
    isLoading: feedbackQuery.isLoading || generateMutation.isPending,
    error: feedbackQuery.error || generateMutation.error,
    generateFeedback: generateMutation.mutateAsync,
  };
}

export function useUserProgress(userId: string | undefined) {
  return useQuery({
    queryKey: ['progress', userId],
    queryFn: () => fetchUserProgress(userId!),
    enabled: !!userId,
  });
}
