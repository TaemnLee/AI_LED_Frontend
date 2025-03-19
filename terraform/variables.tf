variable "bucket_name" {
  type        = string
  description = "S3 bucket name"
}

variable "common_tags" {
  description = "The common tags to apply to all resources"
  type        = map(string)
}

variable "region" {
  type        = string
  description = "AWS region"
  default     = "us-east-1"
}