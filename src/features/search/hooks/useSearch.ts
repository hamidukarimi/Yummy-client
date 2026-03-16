import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { searchPostsService, searchPagesService } from "@/features/search/services/search.service";

const useSearch = (query: string, tab: "pages" | "posts") => {
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  // Debounce — wait 500ms before searching
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 500);
    return () => clearTimeout(timer);
  }, [query]);

  const enabled = debouncedQuery.trim().length >= 1;

  const {
    data:      postsData,
    isLoading: postsLoading,
  } = useQuery({
    queryKey: ["search", "posts", debouncedQuery],
    queryFn:  () => searchPostsService(debouncedQuery),
    enabled:  enabled && tab === "posts",
    staleTime: 1000 * 30,
  });

  const {
    data:      pagesData,
    isLoading: pagesLoading,
  } = useQuery({
    queryKey: ["search", "pages", debouncedQuery],
    queryFn:  () => searchPagesService(debouncedQuery),
    enabled:  enabled && tab === "pages",
    staleTime: 1000 * 30,
  });

  return {
    posts:        postsData?.posts ?? [],
    pages:        pagesData?.pages ?? [],
    postsLoading,
    pagesLoading,
    debouncedQuery,
  };
};

export default useSearch;