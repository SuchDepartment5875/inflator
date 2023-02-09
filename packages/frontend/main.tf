terraform {
  backend "s3" {
    key    = "terraform.state.backend"
    region = "eu-west-1"
  }

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.16"
    }
  }

  required_version = ">= 1.2.0"
}

provider "aws" {
  region = "eu-west-1"
}

provider "aws" {
  alias = "acm"
  region = "us-east-1"
}

data "terraform_remote_state" "core_infra" {
  backend = "s3"

  config = {
    key    = "terraform.state"
    region = "eu-west-1"
    bucket = var.CORE_BUCKET
  }
}

module "cloudfront" {
  source = "./modules/web-distributions"

  providers = {
    aws.acm = aws.acm
  }

  DOMAIN_NAME = var.DOMAIN_NAME
  PRIMARY_ZONE_ID = data.terraform_remote_state.core_infra.outputs.route_53_primary_zone_id
}

resource "aws_cognito_identity_pool" "main" {
  identity_pool_name               = "rum-cognito-identity-pool"
  allow_unauthenticated_identities = true
  allow_classic_flow = true
}

 resource "aws_iam_role" "unauth_iam_role" {
      name = "unauth_iam_role"
      assume_role_policy = <<EOF
 {
      "Version": "2012-10-17",
      "Statement": [
           {
                "Effect": "Allow",
                "Principal": {
                     "Federated": "cognito-identity.amazonaws.com"
                },
                "Action": "sts:AssumeRoleWithWebIdentity",
                "Condition": {
                  "StringEquals": {
                    "cognito-identity.amazonaws.com:aud": "${aws_cognito_identity_pool.main.id}"
                  },
                  "ForAnyValue:StringLike": {
                    "cognito-identity.amazonaws.com:amr": "unauthenticated"
                  }
                }
           }
      ]
 }
 EOF
 }

 resource "aws_iam_policy" "rum_policy" {
  name = "rum-unauth-policy"
  policy = <<EOF
{
      "Version": "2012-10-17",
      "Statement": [
          {
              "Effect": "Allow",
              "Action": "rum:PutRumEvents",
              "Resource": "${aws_rum_app_monitor.test.arn}"
          }
      ]
}
EOF
}

 resource "aws_iam_role_policy_attachment" "logging" {

  role       = aws_iam_role.unauth_iam_role.name
  policy_arn = "${aws_iam_policy.rum_policy.arn}"
}


resource "aws_cognito_identity_pool_roles_attachment" "main" {
  identity_pool_id = aws_cognito_identity_pool.main.id

  roles = {
    unauthenticated = aws_iam_role.unauth_iam_role.arn
  }
}

resource "aws_rum_app_monitor" "test" {
  name   = "${var.DOMAIN_NAME}-rum-dashboard"
  domain = "*.${var.DOMAIN_NAME}"

  app_monitor_configuration {
    identity_pool_id    = aws_cognito_identity_pool.main.id
    session_sample_rate = 1
    telemetries = [ "errors", "http", "performance" ]
  }
}

resource "aws_ssm_parameter" "app_monitor_id" {
  name  = "/${var.DOMAIN_NAME}/rum/app_monitor_id"
  type  = "String"
  value = aws_rum_app_monitor.test.app_monitor_id
}

resource "aws_ssm_parameter" "app_monitor_id1" {
  name  = "/${var.DOMAIN_NAME}/rum/guest_role_arn"
  type  = "String"
  value = aws_iam_role.unauth_iam_role.arn
}

resource "aws_ssm_parameter" "app_monitor_id2" {
  name  = "/${var.DOMAIN_NAME}/rum/identity_pool_id"
  type  = "String"
  value = aws_rum_app_monitor.test.app_monitor_configuration[0].identity_pool_id
}

output "guest_role_arn" {
  value = aws_iam_role.unauth_iam_role.arn
}
