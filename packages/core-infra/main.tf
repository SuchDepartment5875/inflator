terraform {

  backend "s3" {
    key    = "terraform.state"
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

module "route53" {
  source = "./modules/route53"

  providers = {
    aws.acm = aws.acm
  }

  DOMAIN_NAME = var.DOMAIN_NAME
}

output "route_53_primary_zone_id" {
  value = module.route53.primary_zone_id
}
