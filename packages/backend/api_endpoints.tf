locals {
  lambdas = [
    { 
      "lambdaName": "calculate", 
      "buildDirSuffix": "calculate",
      "handler": "calculate.calculateLambda",
      "timeout": "10",
      "memorySize": "1024",
      "permissions": ["s3-readonly"]
    },
    { 
      "lambdaName": "getDateOptions",
      "buildDirSuffix": "get-date-options",
      "handler": "get-date-options.getDateOptions",
      "timeout": "10",
      "memorySize": "1024",
      "permissions": ["s3-readonly"]
    },
    { 
      "lambdaName": "getDateOptionsJson",
      "buildDirSuffix": "get-date-options-json",
      "handler": "get-date-options-json.getDateOptionsJson",
      "timeout": "10",
      "memorySize": "1024",
      "permissions": ["s3-readonly"]
    },
    { 
      "lambdaName": "importOnsData",
      "buildDirSuffix": "import-ons-data",
      "handler": "handler.importONSData",
      "timeout": "90",
      "memorySize": "1024",
      "permissions": ["s3-write"]
    },
  ]
  policies = [
    { "policyName": "s3-readonly",
      "policy": {
        Version = "2012-10-17"
        Statement = [
          {
            Effect   = "Allow"
            Action = [
              "s3:Get*",
            ]
            Resource = "arn:aws:s3:::${var.BACKEND_DATA_BUCKET_NAME}/*"
          }
        ]
      }
    },
    { "policyName": "s3-write",
      "policy": {
        Version = "2012-10-17"
        Statement = [
          {
            Effect   = "Allow"
            Action = [
              "s3:*",
            ]
            Resource = "arn:aws:s3:::${var.BACKEND_DATA_BUCKET_NAME}/*"
          }
        ]
      }
    }
  ]
  endpoints = [
    { "path": "calculate", "method": "GET", "lambdaNameToInvoke": "calculate" },
    { "path": "get-date-options", "method": "GET", "lambdaNameToInvoke": "getDateOptions" },
    { "path": "get-date-options-json", "method": "GET", "lambdaNameToInvoke": "getDateOptionsJson" },
  ]
  lambda-permissions = distinct(flatten([
    for lambda in local.lambdas : [
      for permission in lambda.permissions : {
        key = "${lambda.lambdaName}-${permission}"
        lambdaName = lambda.lambdaName
        permission = permission
      }
    ]
  ]))
}

resource "aws_apigatewayv2_api" "main" {
  name          = "${var.DOMAIN_NAME}-api-gateway"
  protocol_type = "HTTP"
  cors_configuration {
    allow_origins = ["https://www.${var.DOMAIN_NAME}"]
    allow_methods = ["GET", "OPTIONS"]
    max_age = 300
  }
}

resource "aws_apigatewayv2_stage" "stage" {
  name        = "$default"
  api_id      = aws_apigatewayv2_api.main.id
  auto_deploy = true

  default_route_settings {
    detailed_metrics_enabled = true
    throttling_burst_limit = 1000
    throttling_rate_limit = 1000
  }
}

resource "aws_acm_certificate" "api" {
  domain_name       = "api.${var.DOMAIN_NAME}"
  validation_method = "DNS"
}

resource "aws_route53_record" "api_validation" {
  for_each = {
    for dvo in aws_acm_certificate.api.domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
  }

  allow_overwrite = true
  name            = each.value.name
  records         = [each.value.record]
  ttl             = 60
  type            = each.value.type
  zone_id         = data.terraform_remote_state.api_gateway.outputs.route_53_primary_zone_id
}

resource "aws_acm_certificate_validation" "api" {
  certificate_arn         = aws_acm_certificate.api.arn
  validation_record_fqdns = [for record in aws_route53_record.api_validation : record.fqdn]
}

resource "aws_apigatewayv2_domain_name" "api" {
  domain_name = "api.${var.DOMAIN_NAME}"

  domain_name_configuration {
    certificate_arn = aws_acm_certificate.api.arn
    endpoint_type   = "REGIONAL"
    security_policy = "TLS_1_2"
  }
depends_on = [aws_acm_certificate_validation.api]
}

resource "aws_route53_record" "api" {
  name    = aws_apigatewayv2_domain_name.api.domain_name
  type    = "A"
  zone_id = data.terraform_remote_state.api_gateway.outputs.route_53_primary_zone_id

  alias {
    name                   = aws_apigatewayv2_domain_name.api.domain_name_configuration[0].target_domain_name
    zone_id                = aws_apigatewayv2_domain_name.api.domain_name_configuration[0].hosted_zone_id
    evaluate_target_health = false
  }
}

resource "aws_apigatewayv2_api_mapping" "example" {
  api_id      = aws_apigatewayv2_api.main.id
  stage  = aws_apigatewayv2_stage.stage.id
  domain_name = aws_apigatewayv2_domain_name.api.domain_name
}

data "archive_file" "calculate_zip" {
    for_each = { for lambda in local.lambdas : lambda.lambdaName => lambda } // set key as lambda, value as lambda

    type          = "zip"
    source_dir   = "../backend/esdist/${each.value.buildDirSuffix}/"
    output_path   = "${each.value.lambdaName}.zip"
}

resource "aws_iam_role" "iam_for_lambda_tf" {
  for_each = { for lambda in local.lambdas : lambda.lambdaName => lambda } // set key as lambda, value as lambda // each lambda has own role

  name = "${each.value.lambdaName}_iam_for_lambda_tf"
  assume_role_policy = jsonencode({
    "Version": "2012-10-17",
    "Statement": [
      {
        "Action": "sts:AssumeRole",
        "Principal": {
          "Service": "lambda.amazonaws.com"
        },
        "Effect": "Allow",
        "Sid": ""
      }
    ]
  })
}

resource "aws_iam_policy" "policy" {
  for_each = { for policy in local.policies : policy.policyName => policy } // set key as lambda, value as lambda // each lambda has own role

  name = each.value.policyName
  policy = jsonencode(each.value.policy)
}

resource "aws_iam_policy" "common_logging_policy" {
  name = "common-logging-policy"
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
              "logs:CreateLogGroup",
              "logs:CreateLogStream",
              "logs:PutLogEvents"
        ],
        Resource = [
              "arn:aws:logs:eu-west-1:251593413831:log-group:/aws/lambda/*:*:*"
        ],
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "logging" {
  for_each = { for lambda in local.lambdas : lambda.lambdaName => lambda } // set key as lambda, value as lambda // each lambda has own role

  role       = "${aws_iam_role.iam_for_lambda_tf[each.value.lambdaName].name}"
  policy_arn = "${aws_iam_policy.common_logging_policy.arn}"
}

resource "aws_iam_role_policy_attachment" "test-attach" {
  // set key as lambda, value as lambda
  for_each = { for lambda-permission in local.lambda-permissions : lambda-permission.key => lambda-permission } 
  
  role       = "${aws_iam_role.iam_for_lambda_tf[each.value.lambdaName].name}"
  policy_arn = "${aws_iam_policy.policy[each.value.permission].arn}"
}

resource "aws_lambda_function" "calculate_lambda" {
  for_each = { for lambda in local.lambdas : lambda.lambdaName => lambda } // set key as lambda, value as lambda

  filename         = "${each.value.lambdaName}.zip"
  function_name    = each.value.lambdaName
  role             = "${aws_iam_role.iam_for_lambda_tf[each.value.lambdaName].arn}" // make this dynamic....
  handler          = each.value.handler
  source_code_hash = "${data.archive_file.calculate_zip[each.value.lambdaName].output_base64sha256}"
  runtime          = "nodejs14.x"
  timeout = each.value.timeout  != null ? each.value.timeout  : "10"
  memory_size = each.value.memorySize

  environment {
    variables = {
      S3_BUCKET_NAME = var.BACKEND_DATA_BUCKET_NAME
    }
  }
}

resource "aws_lambda_permission" "api_gw" {
  for_each = { for lambda in local.lambdas : lambda.lambdaName => lambda if lambda.lambdaName != "importOnsData"} // set key as lambda.lambdaName, value as lambda
  
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.calculate_lambda[each.value.lambdaName].function_name
  principal     = "apigateway.amazonaws.com"
  source_arn = "${aws_apigatewayv2_api.main.execution_arn}/*"
}

resource "aws_apigatewayv2_integration" "get_calculate" {
  for_each = { for lambda in local.lambdas : lambda.lambdaName => lambda } // set key as lambda.lambdaName, value as lambda
 
  api_id = aws_apigatewayv2_api.main.id
  integration_uri    = aws_lambda_function.calculate_lambda[each.value.lambdaName].arn
  integration_type   = "AWS_PROXY"
  integration_method = "GET"
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "get_hello" {
  for_each = { for endpoint in local.endpoints : endpoint.path => endpoint } // set key as endpoint.path, value as endpoint

  api_id = aws_apigatewayv2_api.main.id
  route_key = "${each.value.method} /${each.value.path}"
  target    = "integrations/${aws_apigatewayv2_integration.get_calculate[each.value.lambdaNameToInvoke].id}"
}

resource "null_resource" "import_initial_data" {
    provisioner "local-exec" {
        command = "aws lambda invoke --function-name importOnsData logs.txt"
    }

    depends_on = [
      aws_lambda_function.calculate_lambda["importOnsData"]
    ]

    triggers = { 
        build_number = timestamp() // re-import the latest ONS data on every deployment
    }   
}

resource "aws_cloudwatch_event_rule" "schedule_import" {
    name = "schedule_import"
    description = "Schedule for import ONS function"
    schedule_expression = "rate(30 minutes)"
}

resource "aws_cloudwatch_event_target" "schedule__import" {
    rule = aws_cloudwatch_event_rule.schedule_import.name
    target_id = "processing_lambda"
    arn = aws_lambda_function.calculate_lambda["importOnsData"].arn
}


resource "aws_lambda_permission" "allow_events_bridge_to_run_lambda" {
    statement_id = "AllowExecutionFromCloudWatch"
    action = "lambda:InvokeFunction"
    source_arn = aws_cloudwatch_event_rule.schedule_import.arn
    function_name = aws_lambda_function.calculate_lambda["importOnsData"].function_name
    principal = "events.amazonaws.com"
}

// dynamic appId? 
// map over paths/methods?
// move to BE
resource "aws_cloudwatch_dashboard" "main" {
  dashboard_name = "inflator-api-dashboard"
  dashboard_body = <<EOF
{
    "widgets": [
        {
            "type": "metric",
            "x": 0,
            "y": 0,
            "width": 12,
            "height": 6,
            "properties": {
                "view": "timeSeries",
                "stacked": false,
                "region": "eu-west-1",
                "start": "-PT336H",
                "end": "P0D",
                "metrics": [
                    [ "AWS/ApiGateway", "Latency", "Resource", "/get-date-options", "Stage", "$default", "Method", "GET", "ApiId", "${aws_apigatewayv2_api.main.id}" ],
                    [ "AWS/ApiGateway", "Latency", "Resource", "/calculate", ".", ".", ".", ".", ".", "." ]
                ],
                "yAxis": {
                    "left": {
                        "min": 0
                    },
                    "right": {
                        "min": 0
                    }
                },
                "title": "Latency"
            }
        },
        {
            "type": "metric",
            "x": 12,
            "y": 0,
            "width": 12,
            "height": 6,
            "properties": {
                "view": "timeSeries",
                "stacked": false,
                "region": "eu-west-1",
                "start": "-PT336H",
                "end": "P0D",
                "yAxis": {
                    "left": {
                        "min": 0
                    },
                    "right": {
                        "min": 0
                    }
                },
                "stat": "Average",
                "period": 300,
                "metrics": [
                    [ "AWS/ApiGateway", "Count", "Resource", "/get-date-options", "Stage", "$default", "Method", "GET", "ApiId", "${aws_apigatewayv2_api.main.id}" ],
                    [ "...", "/calculate", ".", ".", ".", ".", ".", "." ]
                ],
                "title": "Count"
            }
        },
        {
            "type": "metric",
            "x": 0,
            "y": 6,
            "width": 24,
            "height": 6,
            "properties": {
                "view": "timeSeries",
                "stacked": false,
                "region": "eu-west-1",
                "start": "-PT336H",
                "end": "P0D",
                "yAxis": {
                    "left": {
                        "min": 0
                    },
                    "right": {
                        "min": 0
                    }
                },
                "stat": "Average",
                "period": 300,
                "metrics": [
                    [ "AWS/ApiGateway", "4xx", "Resource", "/calculate", "Stage", "$default", "Method", "GET", "ApiId", "${aws_apigatewayv2_api.main.id}" ],
                    [ ".", "5xx", ".", ".", ".", ".", ".", ".", ".", "." ],
                    [ ".", "4xx", ".", "/get-date-options", ".", ".", ".", ".", ".", "." ],
                    [ ".", "5xx", ".", ".", ".", ".", ".", ".", ".", "." ]
                ],
                "title": "4xx, 5xx errors"
            }
        }
    ]
}
EOF
}