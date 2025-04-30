import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api";

export const useCurrentUser = () => {
  const {isLoading,
     isError,
      data: user
    } = useQuery({
    queryKey: ["currentUser"],
    queryFn:async () => {
        try {
            const response = await api.get("/auth/current-user");
            console.log(response.data);
            return response.data;
        } catch (error) {
            console.error(error);
            return null;
        }
    },
  });
  return {isLoading, isError, user};
};