import { DynamoDB } from 'aws-sdk';

const ddb = new DynamoDB.DocumentClient();
const key = 'id';
const attr = 'url';
const fallback = 'https://fernandrone.com';
const table = process.env.DYNAMODB_TABLE;

if (!table) throw `'table' needed (set 'process.env.DYNAMODB_TABLE')`;

export const handler = async (event: any = {}): Promise<any> => {
  console.info(`Event: ${JSON.stringify(event)}`);

  // remove first and final '/' from url to sanitize string
  const value = event.path.replace(/\/$/, '').replace(/^\//, '') as string;

  console.info(`Received 'value' '${value}' (lenght: '${value.length}')`);

  // this quick check will block all '.php' and '.favico' requests
  if (value.includes('.')) {
    return abort();
  }

  if (value.length < 2) {
    return redirect(fallback);
  }

  console.info(`Will fetch data '${key}':'${value}' on table '${table}'`);

  const params = {
    Key: {
      [key]: value,
    },
    TableName: table,
    AttributesToGet: [attr],
    ConsistentRead: false,
  } as DynamoDB.GetItemInput;

  let data: DynamoDB.GetItemOutput;

  try {
    // use blocking (await) promises to wait for DynamoDB response
    data = await ddb.get(params).promise();
  } catch (err) {
    console.error(`Error fetching data '${key}':'${value}' on table '${table}'`, err);
    return redirect(fallback);
  }

  console.info(
    `Fetched ${JSON.stringify(data.Item)} for '${key}':'${value}' on table '${table}'`,
  );

  if (data.Item === undefined) {
    console.error(`The data '${key}':'${value}' on table '${table}' is 'undefined'`);
    return redirect(fallback);
  }

  console.info(`Retrieved Item: ${JSON.stringify(data.Item)}`);
  return redirect(data.Item[attr] as string);
};

function abort(): any {
  return response({
    statusCode: 404,
  });
}

function redirect(url: string): any {
  return response({
    statusCode: 302,
    headers: {
      Location: url,
    },
  });
}

function response(resp: any): any {
  console.info(`Response: ${JSON.stringify(resp)}`);
  return resp;
}
