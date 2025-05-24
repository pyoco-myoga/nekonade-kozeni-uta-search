
from typing import ClassVar, override
from algoliasearch.search.client import SearchClientSync
from pydantic import UUID4, BaseModel, ConfigDict
from pydantic import alias_generators
from prompt_toolkit import prompt

from database import AccompanimentType, Artist, LengthType, Performance, Song, Video
from commands.base import BaseCommand

class BaseAlgoliaCommand(BaseCommand):
    _client: ClassVar[SearchClientSync | None] = None

    @classmethod
    def client(cls) -> SearchClientSync:
        if cls._client is None:
            cls._client = SearchClientSync(
                app_id=cls.settings.algolia.project_id,
                api_key=cls.settings.algolia.api_key,
            )
        return cls._client

class AlgoliaData(BaseModel):
    id: UUID4
    artist: str
    artist_id: UUID4
    song: str
    song_id: UUID4
    video_id: str
    start_sec: int
    end_sec: int
    recommended: bool
    accompaniment: AccompanimentType
    length: LengthType
    _tags: list[str]

    model_config = ConfigDict(
        alias_generator=alias_generators.to_camel,
        populate_by_name=True,
        from_attributes=True,
    )

class AlgoliaUploadCommand(BaseAlgoliaCommand):
    description: str = "upload data to algolia"

    def run(self, command_name: list[str]):
        response = self.client().search_single_index(
            index_name=self.settings.algolia.index_name,
            search_params={"query": ""}
        )

        existing_performances: dict[UUID4, AlgoliaData] = {}
        for hit in response.hits:
            data = AlgoliaData.model_validate(hit)
            existing_performances[data.id] = data

        performances = Performance.get_all()
        algolia_data: list[AlgoliaData] = []
        for performance in performances:
            if (
                performance.id in existing_performances.keys() and
                existing_performances[performance.id] == performance
            ):
                continue

            song = Song.get(performance.song_id)
            assert song is not None
            artist = Artist.get(song.artist_id)
            assert artist is not None
            video = Video.get(performance.video_id)
            assert video is not None
            algolia_data.append(
                AlgoliaData(
                    id=performance.id,
                    artist=artist.name,
                    artist_id=artist.id,
                    song=song.name,
                    song_id=song.id,
                    video_id=video.video_id,
                    start_sec=performance.start_sec,
                    end_sec=performance.end_sec,
                    recommended=performance.recommended,
                    accompaniment=performance.accompaniment,
                    length=performance.length,
                    _tags=[],
                )
            )
        if algolia_data == []:
            return
        self.client().save_objects(
            index_name=self.settings.algolia.index_name,
            objects=[
                {
                    "objectID": str(data.id),
                    **data.model_dump(mode="json", by_alias=True)
                }
                
                for data in algolia_data
            ]
        )

class AlgoliaDeleteAllCommand(BaseAlgoliaCommand):
    description: str = "upload data to algolia"

    def run(self, command_name: list[str]):
        response = self.client().search_single_index(
            index_name=self.settings.algolia.index_name,
            search_params={"query": ""}
        )

        existing_performances: dict[UUID4, AlgoliaData] = {}
        for hit in response.hits:
            data = AlgoliaData.model_validate(hit)
            existing_performances[data.id] = data

        performances = Performance.get_all()

        self.client().delete_objects(
            index_name=self.settings.algolia.index_name,
            object_ids=[
                performance.id.hex for performance in performances
            ]
        )

class AlgoliaSearchCommand(BaseAlgoliaCommand):
    description: str = "algolia search command"
    
    def run(self, command_name: list[str]):
        query = prompt(f"({" ".join(command_name)}) query > ")
        response = self.client().search_single_index(
            index_name=self.settings.algolia.index_name,
            search_params={"query": query}
        )
        for hit in response.hits:
            data = AlgoliaData.model_validate(hit)
            print(data.model_dump_json(indent=4))


class AlgoliaCommand(BaseCommand):
    description: str = "algolia command"

    @override
    def define_subcommnands(self) -> "dict[str, BaseCommand]":
        return {
            "upload": AlgoliaUploadCommand(),
            "search": AlgoliaSearchCommand(),
            # "delete-all": AlgoliaDeleteAllCommand(),
        }
