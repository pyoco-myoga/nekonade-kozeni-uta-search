from typing import Type
from pydantic import BaseModel
from pydantic_settings import BaseSettings, PydanticBaseSettingsSource, SettingsConfigDict, TomlConfigSettingsSource

from utils import project_root

class AlgoliaSettings(BaseModel):
    project_id: str
    api_key: str
    index_name: str

class SupabaseSettings(BaseModel):
    project_id: str
    anon_key: str
    api_key: str

class YoutubeSettings(BaseModel):
    api_key: str

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        toml_file=project_root() / "config.toml"
    )
    algolia: AlgoliaSettings
    supabase: SupabaseSettings
    youtube: YoutubeSettings

    @classmethod
    def settings_customise_sources(
        cls,
        settings_cls: Type[BaseSettings],
        init_settings: PydanticBaseSettingsSource,
        env_settings: PydanticBaseSettingsSource,
        dotenv_settings: PydanticBaseSettingsSource,
        file_secret_settings: PydanticBaseSettingsSource,
    ) -> tuple[PydanticBaseSettingsSource, ...]:
        return (TomlConfigSettingsSource(settings_cls),)
