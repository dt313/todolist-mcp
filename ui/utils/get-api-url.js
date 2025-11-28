export const getApiUrl = () => {
  const port = process.env.NEXT_PUBLIC_API_PORT || "3000";
  const localhost = process.env.NEXT_PUBLIC_API_LOCALHOST || "localhost";
  return `http://${localhost}:${port}`;
};
