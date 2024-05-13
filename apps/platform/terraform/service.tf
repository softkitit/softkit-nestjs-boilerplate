module "db_credentials" {
  source         = "cloudposse/ssm-parameter-store/aws"
  version        = "0.13.0"
  parameter_read = ["/${var.environment}/default/database/creds"]
}

locals {
  db = jsondecode(module.db_credentials.values[0])
}

module "ecs-web-app" {
  source = "git::https://github.com/vsamofal/terraform-aws-ecs-web-app.git?ref=fix/add_alb_target_type_input_field"

  context      = module.this.context
  network_mode = null

  alb_ingress_target_type                         = "instance"
  vpc_id                                          = data.aws_vpc.default.id
  alb_ingress_unauthenticated_listener_arns       = [data.aws_lb_listener.default_public.arn]
  alb_ingress_unauthenticated_listener_arns_count = 1
  ecs_cluster_arn                                 = data.aws_ecs_cluster.default.arn
  ecs_cluster_name                                = data.aws_ecs_cluster.default.cluster_name
  ecs_security_group_ids                          = [data.aws_security_group.default.id]
  ecs_private_subnet_ids                          = data.aws_subnets.private_subnets.ids
  alb_ingress_healthcheck_path                    = local.health_check_path
  alb_ingress_unauthenticated_paths               = ["${local.public_app_path_route}/*"]
  codepipeline_enabled                            = false
  desired_count                                   = local.desired_count
  ecr_enabled                                     = false
  alb_security_group                              = data.aws_security_group.default.id
  use_alb_security_group                          = true

  alb_ingress_protocol_version                    = "HTTP1"

  container_cpu    = local.task_cpu
  container_memory = local.task_memory

  ignore_changes_task_definition = true
  launch_type                    = "EC2"
  enable_all_egress_rule         = true

  ecs_security_group_enabled         = false
  deployment_controller_type         = "ECS"
  circuit_breaker_deployment_enabled = true
  circuit_breaker_rollback_enabled   = true

  container_image = "nginx:latest"

  task_policy_arns = [
    #    module.task_policy.policy_arn
  ]

  alb_stickiness_enabled = true

  capacity_provider_strategies = [{
    capacity_provider = local.capacity_provider_name
    weight            = 1
    base              = 1
  }]

  container_port = local.app_port

  container_environment = [
    {
      name  = "NESTJS_PROFILES"
      value = "${var.environment},aws"
    },
    {
      name  = "DB_HOST",
      value = local.db.host
    },
    {
      name  = "DB_PORT",
      value = local.db.port
    },
    {
      name  = "DB_USERNAME",
      value = local.db.username
    },
    {
      name  = "DB_PASSWORD",
      value = local.db.password
    },
    {
      name  = "DB_NAME",
      value = "${var.project_name}"
    },
    {
      name  = "SSL_ENABLED"
      value = "false"
    }
  ]
}

#module "task_policy" {
#  source  = "cloudposse/iam-policy/aws"
#  version = "2.0.1"
#  context = module.this.context
#
#  iam_policy = [
#    {
#      version    = "2012-10-17"
#      policy_id  = "example"
#      statements = [
#        {
#          sid       = "ListMyBucket"
#          effect    = "Allow"
#          actions   = ["s3:ListBucket"]
#          resources = ["arn:aws:s3:::test"]
#        },
#      ]
#    }
#  ]
#}

