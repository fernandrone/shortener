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

This personal project uses my `fdr.one` domain, and requires an existing public Route53 domain. Eventually I might update the code to make it more generic and accept configurable domains for others to use.

> ⚠️ There is also a technical limitation behind this. I use the `certmgr.DnsValidatedCertificate` function to validate the custom Certificate (required for HTTPS). However, this also requires an existing Route53 domain. So this project can't really be fully run from scratch _and_ still support custom domains: it is necessary for the custom domain to have been provisioned before the rest of the stack.
