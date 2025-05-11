
terraform {
  required_providers {
    google-beta = {
      source  = "hashicorp/google-beta"
      version = "~> 4.0"
    }
    algolia = {
      source  = "k-yomo/algolia"
      version = ">= 0.1.0, < 1.0.0"
    }
    supabase = {
      source  = "supabase/supabase"
      version = "~> 1.0"
    }
  }
  backend "local" {
    path = "./state/terraform.tfstate"
  }
}

provider "algolia" {
  app_id  = var.algolia_app_id
  api_key = var.algolia_api_key
}

provider "google-beta" {
  project               = var.project_id
  billing_project       = var.project_id
  user_project_override = true
}

provider "supabase" {
  access_token = var.supabase_access_token
}

module "firebase" {
  source = "./modules/firebase/"
  providers = {
    google-beta = google-beta
  }
  project_id      = var.project_id
  project_name    = var.project_name
  billing_account = var.billing_account
  project_services = toset([
    "cloudbilling.googleapis.com",
    "cloudresourcemanager.googleapis.com",
    "firebase.googleapis.com",
    "serviceusage.googleapis.com",
  ])
  youtube_api_key_name = var.youtube_api_key_name
}

module "hosting" {
  source = "./modules/hosting/"
  providers = {
    google-beta = google-beta
  }
  release_site_id = var.hosting_release_site_id
  staging_site_id = var.hosting_staging_site_id
  depends_on      = [module.firebase]
}


module "algolia" {
  providers = {
    algolia = algolia
  }
  source                  = "./modules/algolia"
  index_name              = var.algolia_index_name
  searchable_attributes   = var.algolia_searchable_attributes
  attributes_to_retrieve  = var.algolia_attributes_to_retrieve
  attributes_for_faceting = var.algolia_attributes_for_faceting
  custom_ranking          = var.algolia_custom_ranking
}

module "supabase" {
  providers = {
    supabase = supabase
  }
  source                 = "./modules/supabase/"
  organization_id        = var.supabase_organization_id
  project_name           = var.project_name
  database_password      = var.supabase_database_password
  region                 = var.supabase_region
  site_url               = module.hosting.release_site_url
  google_auth_client_id  = var.supabase_auth_google_client_id
  google_auth_secret     = var.supabase_auth_google_secret
  twitter_auth_client_id = var.supabase_auth_twitter_client_id
  twitter_auth_secret    = var.supabase_auth_twitter_secret
}
