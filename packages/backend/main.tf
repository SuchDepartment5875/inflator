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

data "terraform_remote_state" "api_gateway" {
  backend = "s3"

  config = {
    key    = "terraform.state"
    region = "eu-west-1"
    bucket = var.CORE_BUCKET
  }
}
