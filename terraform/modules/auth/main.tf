terraform {
  required_providers {
    google-beta = {
      source  = "hashicorp/google-beta"
      version = "~> 4.0"
    }
  }
}

resource "google_identity_platform_config" "default" {
  provider = google-beta
  project  = var.project_id
  quota {
    sign_up_quota_config {
      quota          = 100
      start_time     = "2025-03-19T12:00:00Z"
      quota_duration = "3600s" # 1 hour
    }
  }

}

resource "google_identity_platform_tenant" "default" {
  provider                 = google-beta
  display_name             = var.tenant_name
  allow_password_signup    = false
  enable_email_link_signin = false
}

resource "google_identity_platform_tenant_default_supported_idp_config" "default" {
  provider = google-beta
  project  = var.project_id

  for_each = var.config

  enabled       = true
  tenant        = google_identity_platform_tenant.default.name
  idp_id        = each.key
  client_id     = each.value["client_id"]
  client_secret = each.value["secret"]
}
