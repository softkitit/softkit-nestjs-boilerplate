data "aws_organizations_organization" "org" {
}

module "ecr" {
  source                  = "cloudposse/ecr/aws"
  version                 = "v0.41.0"
  context                 = module.this.context
  enable_lifecycle_policy = true
  max_image_count         = 3
  image_names = [
    "${var.repository_name}-${var.project_name}",
  ]
  principals_full_access = [
    "*"
  ]
  protected_tags = [
    "release",
  ]
  organizations_full_access = [
    data.aws_organizations_organization.org.id
  ]
}
