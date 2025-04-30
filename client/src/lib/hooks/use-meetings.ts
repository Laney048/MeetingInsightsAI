import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { type MeetingAnalytics } from "@shared/schema";

export function useMeetings() {
  const {
    data: analytics,
    isLoading,
    isError,
    error,
  } = useQuery<MeetingAnalytics>({
    queryKey: ["/api/analytics"],
  });

  const uploadMutation = useMutation({
    mutationFn: async ({ file, clearExisting }: { file: File; clearExisting: boolean }) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("clearExisting", clearExisting.toString());

      const response = await fetch("/api/meetings/upload", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to upload file");
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/analytics"] });
      queryClient.invalidateQueries({ queryKey: ["/api/meetings"] });
    },
  });

  return {
    analytics,
    isLoading,
    isError,
    error,
    uploadMeetings: uploadMutation.mutate,
    isUploading: uploadMutation.isPending,
    uploadError: uploadMutation.error,
  };
}
