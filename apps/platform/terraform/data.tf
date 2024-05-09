data "aws_vpc" "default" {
  default = false

  tags = {
    Environment = var.environment
  }
}

data "aws_subnets" "private_subnets" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.default.id]
  }

  tags = {
    Environment = var.environment
    Attributes  = "private"
  }
}

data "aws_security_group" "default" {
  name   = "default"
  vpc_id = data.aws_vpc.default.id
  tags = {
    Environment = var.environment
  }
}

data "aws_security_group" "egress_anywhere" {
  vpc_id = data.aws_vpc.default.id

  tags = {
    Environment = var.environment
    Name        = "egress-anywhere"
  }
}

data "aws_security_group" "ingress_vpc_web" {
  vpc_id = data.aws_vpc.default.id

  tags = {
    Environment = var.environment
    Name        = "ingress-vpc-web"
  }
}

data "aws_ecs_cluster" "default" {
  cluster_name = "${var.org_name}-${var.environment}"
  tags = {
    Environment = var.environment
  }
}

data "aws_lb" "default" {
  name = "${var.org_name}-${var.environment}"
  tags = {
    Environment = var.environment
  }
}

data "aws_lb_listener" "default_public" {
  load_balancer_arn = data.aws_lb.default.arn
  port              = local.public_listener_port
}

data "aws_partition" "current" {
}

data "aws_route53_zone" "default" {
  name         = local.zone_name
  private_zone = false
}



