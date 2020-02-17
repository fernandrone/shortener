export const handler = async (event: any = {}): Promise<any> => {
  console.log(event);
  const response = {
    statusCode: 302,
    headers: {
      Location: "https://fernandrone.com"
    }
  };
  console.log(JSON.stringify(response));
  return response;
};
