import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchBadges, fetchUserBadges, checkAndAwardBadges } from '@/services/api';

/**
 * Hook to fetch all available badges
 */
export function useBadges() {
  return useQuery({
    queryKey: ['badges'],
    queryFn: fetchBadges,
  });
}

/**
 * Hook to fetch user's earned badges
 */
export function useUserBadges(userId: string | undefined) {
  return useQuery({
    queryKey: ['userBadges', userId],
    queryFn: () => fetchUserBadges(userId!),
    enabled: !!userId,
  });
}

/**
 * Hook to check and award badges
 * Call this after completing a session
 */
export function useCheckBadges() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => checkAndAwardBadges(userId),
    onSuccess: (newBadges, userId) => {
      // Invalidate queries to refresh badge data
      queryClient.invalidateQueries({ queryKey: ['userBadges', userId] });

      return newBadges;
    },
  });
}
