
terraform {
  required_providers {
    supabase = {
      source  = "supabase/supabase"
      version = "~> 1.0"
    }
  }
}

resource "supabase_project" "default" {
  organization_id   = var.organization_id
  name              = var.project_name
  database_password = var.database_password
  region            = var.region
  lifecycle {
    ignore_changes = [database_password]
  }
}

resource "supabase_settings" "default" {
  project_ref = supabase_project.default.id

  # https://api.supabase.com/api/v1#tag/rest/PATCH/v1/projects/{ref}/postgrest
  api = jsonencode({
    db_schema = "public,storage,graphql_public"
  })

  # https://api.supabase.com/api/v1#tag/auth/PATCH/v1/projects/{ref}/config/auth
  auth = jsonencode({
    site_url               = var.site_url
    external_email_enabled = false
    external_phone_enabled = false
    saml_enabled           = false

    external_google_enabled   = true
    external_google_client_id = var.google_auth_client_id
    external_google_secret    = var.google_auth_secret

    external_twitter_enabled   = true
    external_twitter_client_id = var.twitter_auth_client_id
    external_twitter_secret    = var.twitter_auth_secret
  })

  # database = jsonencode({})
  # network = 
  # pooler = 
  # storage = 
}
