locals {
  apex_bucket_name = "apex-${var.DOMAIN_NAME}"
  www_bucket_name = "www.${var.DOMAIN_NAME}"
  buckets = [
    { "bucketName": local.apex_bucket_name, "domainName": var.DOMAIN_NAME },
    { "bucketName": local.www_bucket_name, "domainName": "www.${var.DOMAIN_NAME}" },
  ]
}

resource "aws_s3_bucket" "loops" {
  for_each = { for bucket in local.buckets : bucket.bucketName => bucket } // set key as bucketName, value as bucket

  bucket = each.value.bucketName
}

resource "aws_s3_bucket_public_access_block" "loops" {
  for_each = { for bucket in local.buckets : bucket.bucketName => bucket } // set key as bucketName, value as bucket

  bucket = aws_s3_bucket.loops[each.value.bucketName].id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_acm_certificate" "loops" {
  for_each = { for bucket in local.buckets : bucket.bucketName => bucket } // set key as bucketName, value as bucket
  
  provider = aws.acm
  domain_name = each.value.domainName
  subject_alternative_names = [each.value.domainName]
  validation_method = "DNS"
  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_route53_record" "loops_cloudfront_certs" {
  for_each = {
    for dvo in setunion(
      aws_acm_certificate.loops[local.apex_bucket_name].domain_validation_options,
      aws_acm_certificate.loops[local.www_bucket_name].domain_validation_options
    ) : dvo.domain_name => dvo
  }

  allow_overwrite = true
  name            = each.value.resource_record_name
  records         = [each.value.resource_record_value]
  ttl             = 60
  type            = each.value.resource_record_type
  zone_id         = var.PRIMARY_ZONE_ID
}

resource "aws_cloudfront_origin_access_control" "loops" {
  for_each = { for bucket in local.buckets : bucket.bucketName => bucket } // set key as bucketName, value as bucket

  name                              = "${each.value.bucketName}-origin-access-control"
  description                       = "Example Policy"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

resource "aws_cloudfront_distribution" "www" {
  origin {
    domain_name = aws_s3_bucket.loops[local.www_bucket_name].bucket_regional_domain_name
    origin_access_control_id = aws_cloudfront_origin_access_control.loops[local.www_bucket_name].id
    origin_id = "${local.www_bucket_name}-origin-access-control"
  }

  aliases = [local.www_bucket_name]
  enabled = true
  default_root_object = "index.html"

  default_cache_behavior {
    viewer_protocol_policy = "redirect-to-https"
    compress = true
    allowed_methods = ["GET", "HEAD"]
    cached_methods = ["GET", "HEAD"]
    target_origin_id = "${local.www_bucket_name}-origin-access-control"

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }

    function_association {
      event_type   = "viewer-request"
      function_arn = aws_cloudfront_function.rewrite_all_routes_to_spa.arn
    }
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    acm_certificate_arn = aws_acm_certificate.loops[local.www_bucket_name].arn
    ssl_support_method = "sni-only"
    minimum_protocol_version = "TLSv1"
  }
}

resource "aws_cloudfront_distribution" "apex" {
  origin {
    domain_name = aws_s3_bucket.loops[local.apex_bucket_name].bucket_regional_domain_name
    # domain_name = aws_s3_bucket.loops[local.apex_bucket_name].b
    origin_access_control_id = aws_cloudfront_origin_access_control.loops[local.apex_bucket_name].id
    origin_id = "${local.apex_bucket_name}-origin-access-control"
  }

  aliases = [var.DOMAIN_NAME]
  enabled = true
  default_root_object = "index.html"

  default_cache_behavior {
    viewer_protocol_policy = "redirect-to-https"
    compress = true
    allowed_methods = ["GET", "HEAD"]
    cached_methods = ["GET", "HEAD"]
    target_origin_id = "${local.apex_bucket_name}-origin-access-control"

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }

    function_association {
      event_type   = "viewer-request"
      function_arn = aws_cloudfront_function.test.arn
    }
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    acm_certificate_arn = aws_acm_certificate.loops[local.apex_bucket_name].arn
    ssl_support_method = "sni-only"
    minimum_protocol_version = "TLSv1"
  }
}

resource "aws_route53_record" "apex" {
  zone_id = var.PRIMARY_ZONE_ID
  name    = var.DOMAIN_NAME
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.apex.domain_name
    zone_id                = aws_cloudfront_distribution.apex.hosted_zone_id
    evaluate_target_health = false
  }
}

resource "aws_route53_record" "www" {
  zone_id = var.PRIMARY_ZONE_ID
  name    = "www.${var.DOMAIN_NAME}"
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.www.domain_name
    zone_id                = aws_cloudfront_distribution.www.hosted_zone_id
    evaluate_target_health = false
  }
}

# data source to generate bucket policy to let OAC get objects:
data "aws_iam_policy_document" "loops" {
  for_each = { for bucket in local.buckets : bucket.bucketName => bucket } // set key as bucketName, value as bucket
  version = "2008-10-17"
  policy_id = "PolicyForCloudFrontPrivateContent"
  
  statement {
    sid = "AllowCloudFrontServicePrincipal"

    actions = ["s3:GetObject"]

    resources = ["${aws_s3_bucket.loops[each.value.bucketName].arn}/*"]

    principals {
      type = "Service"
      identifiers = ["cloudfront.amazonaws.com"]
    }
    
    condition {
      test     = "StringEquals"
      variable = "AWS:SourceArn"
      values = [
        each.key == local.apex_bucket_name ? aws_cloudfront_distribution.apex.arn : aws_cloudfront_distribution.www.arn
      ]
    }
  }
}

resource "aws_s3_bucket_policy" "redirect_to_www_bucket_policy" {
  for_each = { for bucket in local.buckets : bucket.bucketName => bucket } // set key as bucketName, value as bucket
  
  bucket = aws_s3_bucket.loops[each.value.bucketName].id
  policy = data.aws_iam_policy_document.loops[each.value.bucketName].json
}

resource "aws_cloudfront_function" "test" {
  name    = "test"
  runtime = "cloudfront-js-1.0"
  comment = "my function"
  publish = true
  code    = <<EOT
      function handler(event) {
        return {
            statusCode: 301,
            statusDescription: 'Moved Permanently',
            headers: { "location": { "value": 'https://www.${var.DOMAIN_NAME}' } }
        }
      }
      EOT 
}

resource "aws_cloudfront_function" "rewrite_all_routes_to_spa" {
  name    = "rewrite_all_routes_to_spa"
  runtime = "cloudfront-js-1.0"
  comment = "my function"
  publish = true
  code    = <<EOT
        function handler(event) {
            var request = event.request;
            var uri = request.uri;
            
            if (uri.endsWith(".html")) {
                request.uri = "/index.html";
                return request;
            }
            
            if (uri.includes(".")) {
                return request;
            }
            
            request.uri = "/index.html";
            return request;
        }
      EOT 
}