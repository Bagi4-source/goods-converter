export const urlQueryEncode = (inputUrl: string): string => {
  try {
    const url = new URL(inputUrl);
    url.search = encodeURIComponent(url.search.replace("?", ""));
    return url.toString();
  } catch (error) {
    console.error("Invalid URL:", error);
    return "";
  }
};
