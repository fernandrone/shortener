import { DynamoDB } from 'aws-sdk';

const ddb = new DynamoDB.DocumentClient();
const fallback = 'https://fernandrone.com';

export const handler = async (event: any = {}): Promise<any> => {
  console.log(event);

  if (!('path' in event) || event.path.length < 2) {
    return redirect(fallback);
  }

  const params = {
    TableName: process.env.DYNAMODB_TABLE!,
    Key: event.path,
  };

  ddb.get(params, function(err, data) {
    if (err) {
      console.log(err);
      return redirect(fallback);
    }

    if (data.Item === undefined) {
      return redirect(fallback);
    }

    return redirect(data.Item['id']);
  });
};

function redirect(url: string) {
  return {
    statusCode: 302,
    headers: {
      Location: url,
    },
  };
}
