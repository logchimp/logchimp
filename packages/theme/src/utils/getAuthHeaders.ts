export const getAuthHeaders = (
  authToken?: string,
): { Authorization: string } | undefined => {
  return authToken ? { Authorization: `Bearer ${authToken}` } : undefined;
};

export default getAuthHeaders;
