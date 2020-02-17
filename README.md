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
