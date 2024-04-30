variable "aws_region" {
  type        = string
  description = "AWS Region where to perform a setup"
}

variable "environment" {
  type        = string
  description = "Environment name (global, prod, dev, etc...). Global means that it belongs to all envs"
}

variable "org_name" {
  type        = string
  description = "Organisation name for labels and other generalized metadata and naming"
}

variable "repository_name" {
  type        = string
  description = "For monorepo choose the appropriate name for project (usually a folder where project is located) for poly repo use repository name)"
}

variable "project_name" {
  type        = string
  description = "For monorepo choose the appropriate name for project (usually a folder where project is located) for poly repo use repository name)"
}

variable "tf_state_file_name" {
  type        = string
  description = "Terraform file state name on a remote"
  default     = "terraform.tfstate"
}

variable "dynamo_db_table_name" {
  type        = string
  description = "DynamoDB table to manage a tf lock"
}

variable "s3_bucket_name" {
  type        = string
  description = "S3 bucket name to manage a tf state"
}

variable "force_destroy" {
  type        = bool
  description = "Force destroy state"
  default     = false
}

