terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.16"
    }
  }
  required_version = ">= 1.2.0"
}

# Configure the AWS Provider
provider "aws" {
  region  = "us-east-1"
}

# Configure the Terraform State backend
terraform {
  backend "s3" {
    bucket = "terraform-state-backend-20251"
    key    = "state/terraform.tfstate"
    region = "us-east-1"
    encrypt = true
  }
}