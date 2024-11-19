export const urlQueryEncode = (inputUrl: string): string => {
  try {
    const url = new URL(inputUrl);
    url.search = url.search.replace(/^\?/, "").replace(/,/g, "%2C");
    return url.toString();
  } catch (error) {
    console.error("Invalid URL:", error);
    return "";
  }
};
