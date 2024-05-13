# task configuration
locals {
  # Editable Variables
  main_domain_name = "softkit.dev"

  domain_name_env = tomap({
    "prod" : local.main_domain_name,
  })

  task_cpu_env = {
  }

  task_memory_env = {
  }

  desired_count_env = {
  }

  instance_type_env = {
    "prod" = "t3.micro"
  }

  # Non-Editable Variables

  capacity_provider_name = "simple-web-app"

  zone_name = lookup(local.domain_name_env, var.environment, "${var.environment}.${local.main_domain_name}")

  alb_domain_name = "api.${local.zone_name}"

  task_cpu      = lookup(local.task_cpu_env, var.environment, 1024)
  task_memory   = lookup(local.task_memory_env, var.environment, 879)
  desired_count = lookup(local.desired_count_env, var.environment, 1)
  instance_type = lookup(local.instance_type_env, var.environment, "t3.micro")

  public_listener_port  = 443
  public_app_path_route = "/api/platform"
  health_check_path     = "${local.public_app_path_route}/health"
  app_port              = 80
}
