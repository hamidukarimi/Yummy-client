import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  searchPostsService,
  searchPagesService,
} from "@/features/search/services/search.service";
import type {
  PageSearchFilters,
  PostSearchFilters,
} from "@/features/search/types/search.types";

const hasPostCriteria = (query: string, filters: PostSearchFilters) =>
  query.trim().length >= 1 ||
  !!filters.type ||
  !!filters.category ||
  !!filters.tag?.trim() ||
  filters.minPrice !== undefined ||
  filters.maxPrice !== undefined;

const hasPageCriteria = (query: string, filters: PageSearchFilters) =>
  query.trim().length >= 1 ||
  !!filters.category ||
  !!filters.tag?.trim();

const useSearch = (
  query: string,
  tab: "pages" | "posts",
  postFilters: PostSearchFilters,
  pageFilters: PageSearchFilters,
) => {
  const [debouncedQuery, setDebouncedQuery] = useState(query);
  const [debouncedPostFilters, setDebouncedPostFilters] =
    useState(postFilters);
  const [debouncedPageFilters, setDebouncedPageFilters] =
    useState(pageFilters);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
      setDebouncedPostFilters(postFilters);
      setDebouncedPageFilters(pageFilters);
    }, 500);
    return () => clearTimeout(timer);
  }, [
    query,
    postFilters.type,
    postFilters.category,
    postFilters.tag,
    postFilters.minPrice,
    postFilters.maxPrice,
    pageFilters.category,
    pageFilters.tag,
  ]);

  const postsEnabled =
    tab === "posts" &&
    hasPostCriteria(debouncedQuery, debouncedPostFilters);

  const pagesEnabled =
    tab === "pages" &&
    hasPageCriteria(debouncedQuery, debouncedPageFilters);

  const { data: postsData, isLoading: postsLoading } = useQuery({
    queryKey: [
      "search",
      "posts",
      debouncedQuery,
      debouncedPostFilters,
    ],
    queryFn: () =>
      searchPostsService(debouncedQuery, debouncedPostFilters),
    enabled: postsEnabled,
    staleTime: 1000 * 30,
  });

  const { data: pagesData, isLoading: pagesLoading } = useQuery({
    queryKey: [
      "search",
      "pages",
      debouncedQuery,
      debouncedPageFilters,
    ],
    queryFn: () =>
      searchPagesService(debouncedQuery, debouncedPageFilters),
    enabled: pagesEnabled,
    staleTime: 1000 * 30,
  });

  const hasActiveCriteria =
    tab === "posts"
      ? hasPostCriteria(debouncedQuery, debouncedPostFilters)
      : hasPageCriteria(debouncedQuery, debouncedPageFilters);

  return {
    posts: postsData?.posts ?? [],
    pages: pagesData?.pages ?? [],
    postsLoading,
    pagesLoading,
    debouncedQuery,
    hasActiveCriteria,
  };
};

export default useSearch;
