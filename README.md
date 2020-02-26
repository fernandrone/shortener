# URL Shortener

> The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Useful commands

To bootstrap an environment (needs to run only once):

```console
make bootstrap
```

> Note: will use AWS default account and region as configure on yout credentials file. Run `make env` to print your account and region.

To build the application and then synthesize it (run it before every update):

```console
make synth
```

To deploy the changes:

```console
make deploy
```

Simply running `make` or `make all` will run both `make synth` and `make deploy` in order. See the `Makefile` for more details.

## Custom Domain

This personal project uses my `fdr.one` domain, and requires an existing public domain.

## Free Tier

The idea behind this project is to host personal URL shortener, relying only on AWS and Cloudflare Free Tier (unfortunately I still have to pay for the domain `fdr.one`, which costs me about 9 USD/year).

To view AWS Free Tier usage [click here](https://console.aws.amazon.com/billing/home?region=us-east-1#/freetier).
