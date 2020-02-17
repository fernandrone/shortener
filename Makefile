.PHONY: all bootstrap deploy env synth

all:
	$(MAKE) synth
	$(MAKE) deploy

# displays the aws environment
env:
	@echo -e aws://$$(aws sts get-caller-identity | jq -r .Account)/$$(aws configure get region)

# deploys the CDK toolkit stack into an AWS environment
bootstrap:
	cdk bootstrap aws://$$(aws sts get-caller-identity | jq -r .Account)/$$(aws configure get region)

# deploys the stack into your AWS account
deploy:
	cdk deploy

# builds the application and then synthesizes and prints the CloudFormation template for this stack
synth:
	npm run build
	cdk synth
