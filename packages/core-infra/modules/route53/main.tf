terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = ">= 2.7.0"
      configuration_aliases = [ aws.acm ]
    }
  }

  required_version = ">= 1.2.0"
}

resource "aws_route53_zone" "primary" {
  name = var.DOMAIN_NAME
}

output "primary_zone_id" {
  value = aws_route53_zone.primary.zone_id
}