resource "aws_s3_bucket" "backend_data_bucket" {
  bucket = var.BACKEND_DATA_BUCKET_NAME

  tags = {
    Name        = "My bucket"
    Environment = "Dev"
  }
}

resource "aws_s3_bucket_acl" "backend_data_bucket_acl" {
  bucket = aws_s3_bucket.backend_data_bucket.id
  acl    = "private"
}