variable "bucket_name" {
  description = "The name of the S3 bucket"
  type        = string
}

variable "common_tags" {
  description = "The common tags to apply to all resources"
  type        = map(string)
}