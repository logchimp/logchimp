import { useRoute } from "vue-router";

export function useLoginRedirectUrl() {
  const route = useRoute();

  const searchParam = new URLSearchParams();
  searchParam.set("redirect", route.fullPath);
  return `/login?${searchParam.toString()}`;
}
