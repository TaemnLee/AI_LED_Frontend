# S3 for backend
resource "aws_s3_bucket" "terraform_state" {
  bucket = "terraform-state-backend-20251"
  tags = {
    Name = "terraform-state-backend-20251"
    Environment = "Dev"
  }
}

# S3 for static website hosting
resource "aws_s3_bucket" "terraform_static_website" {
    bucket = var.bucket_name
    tags = var.common_tags
}

resource "aws_s3_bucket_website_configuration" "terraform_static_website" {
    bucket = aws_s3_bucket.terraform_static_website.id
    index_document {
        suffix = "index.html"
    }
    error_document {
        key = "error.html"
    }
}

resource "aws_s3_bucket_public_access_block" "bucket_access_block"{
    bucket = aws_s3_bucket.terraform_static_website.id
    block_public_acls = false
    block_public_policy = false
}

resource "aws_s3_bucket_policy" "terraform_static_website" {
    bucket = aws_s3_bucket.terraform_static_website.id
    policy = jsonencode({
        Version = "2012-10-17",
        Statement = [
            {
                Sid = "PublicReadGetObject",
                Effect = "Allow",
                Principal = "*",
                Action = "s3:GetObject",
                Resource = "${aws_s3_bucket.terraform_static_website.arn}/*"
            }
        ]
    })
}