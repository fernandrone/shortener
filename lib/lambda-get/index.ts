import { DynamoDB } from 'aws-sdk';

const ddb = new DynamoDB.DocumentClient();
const domain = 'fdr.one';
const key = 'id';
const attr = 'url';
const fallback = 'https://fernandrone.com';
const table = process.env.DYNAMODB_TABLE;

if (!table) throw `'table' needed (set 'process.env.DYNAMODB_TABLE')`;

export const handler = async (event: any = {}): Promise<any> => {
  console.info(`Event: ${JSON.stringify(event)}`);

  if (!('requestContext' in event)) {
    return forbidden(`Malformed request`);
  }

  if (event.requestContext.domainName != domain) {
    return forbidden(`Invalid domain '${event.requestContext.domainName}'`);
  }

  // remove first and final '/' from url to sanitize string
  const resource = event.path.replace(/\/$/, '').replace(/^\//, '') as string;

  console.info(`Received 'value' '${resource}' (lenght: '${resource.length}')`);

  // this quick check will block all '.php' requests
  if (resource.includes('.')) {
    console.error(`Invalid path/resource`);
    return abort();
  }

  if (resource.length < 2) {
    return redirect(fallback);
  }

  console.info(`Will fetch data '${key}':'${resource}' on table '${table}'`);

  const params = {
    Key: {
      [key]: resource,
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
    console.error(
      `Error fetching data '${key}':'${resource}' on table '${table}'`,
      err,
    );
    return redirect(fallback);
  }

  console.info(
    `Fetched ${JSON.stringify(
      data.Item,
    )} for '${key}':'${resource}' on table '${table}'`,
  );

  if (data.Item === undefined) {
    console.error(`The data '${key}':'${resource}' on table '${table}' is 'undefined'`);
    return redirect(fallback);
  }

  console.info(`Retrieved Item: ${JSON.stringify(data.Item)}`);
  return redirect(data.Item[attr] as string);
};

function forbidden(err: string): any {
  return response({
    statusCode: 403,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      error: err,
    }),
  });
}

function abort(): any {
  return response({
    statusCode: 404,
  });
}

function redirect(url: string): any {
  return response({
    statusCode: 301,
    headers: {
      'Location': url,
      'Cache-Control': 'public, must-revalidate, max-age=86400',
    },
  });
}

function response(resp: any): any {
  console.info(`Response: ${JSON.stringify(resp)}`);
  return resp;
}
