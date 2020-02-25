import { DynamoDB } from 'aws-sdk';

const ddb = new DynamoDB.DocumentClient();
const fallback = 'https://fernandrone.com';

export const handler = async (event: any = {}): Promise<any> => {
  console.log(event);

  if (event.path.length < 2) {
    return redirect(fallback);
  }

  const params = {
    TableName: process.env.DYNAMODB_TABLE!,
    Key: {
      id: event.path,
    },
  };

  ddb.get(params, function(err, data) {
    if (err) {
      console.log(err);
      return redirect(fallback);
    }

    if (data.Item === undefined) {
      return redirect(fallback);
    }

    console.log(data.Item);

    return redirect(data.Item['url']);
  });
};

function redirect(url: string) {
  const response = {
    statusCode: 302,
    headers: {
      Location: url,
    },
  };
  console.log(response);
  return response;
}
