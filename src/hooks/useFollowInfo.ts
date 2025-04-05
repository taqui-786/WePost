import kyInstance from "@/lib/ky";
import { FollowersInfo } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";

export default function useFollowInfo(
  userId: string | undefined,
  initialState: FollowersInfo,
) {
  const query = useQuery({
    queryKey: ["follower-info", userId],
    queryFn: () =>
      kyInstance.get(`/api/users/${userId}/follower`).json<FollowersInfo>(),
    initialData: initialState,
    staleTime: Infinity,
  });
  return query;
}
