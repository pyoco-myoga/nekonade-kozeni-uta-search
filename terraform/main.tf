
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
  user_project_override = true
  billing_project       = var.project_id
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
    "firebasestorage.googleapis.com",
    "firebasedataconnect.googleapis.com",
    "serviceusage.googleapis.com",
    "identitytoolkit.googleapis.com"
  ])
}

module "auth" {
  source = "./modules/auth/"
  providers = {
    google-beta = google-beta
  }
  project_id  = var.project_id
  tenant_name = var.google_identitiy_platform_tenant_name
  config      = var.authentication_config
  depends_on  = [module.firebase]
}

module "hosting" {
  source = "./modules/hosting/"
  providers = {
    google-beta = google-beta
  }
  site_id    = var.hosting_site_id
  depends_on = [module.firebase]
}

module "storage" {
  source = "./modules/storage/"
  providers = {
    google-beta = google-beta
  }
  project_id    = var.project_id
  name          = var.cloud_storage_name
  location      = var.cloud_storage_location
  storage_class = var.cloud_storage_class
  depends_on    = [module.firebase]
}

module "dataconnect" {
  source = "./modules/dataconnect/"
  providers = {
    google-beta = google-beta
  }

  project_id = var.project_id
  service_id = var.data_connect_service_id
  location   = var.data_connect_service_location

  depends_on = [module.firebase]
}

module "algolia" {
  providers = {
    algolia = algolia
  }
  source                = "./modules/algolia"
  index_name            = var.algolia_index_name
  searchable_attributes = var.algolia_searchable_attributes
}

