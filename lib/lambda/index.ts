export const handler = async (event: any = {}): Promise<any> => {
  const response = {
    statusCode: 302,
    headers: {
      Location: "https://fernandrone.com"
    }
  };
  return response;
};
