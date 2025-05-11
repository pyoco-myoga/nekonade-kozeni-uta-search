import json
from pathlib import Path
from typing import Any, override
from uuid import UUID

from pydantic import BaseModel
from pydantic_core import from_json

from commands.base import BaseCommand
from database import Artist, Performance, Song, Video

class UUIDEncoder(json.JSONEncoder):
    def default(self, o: Any) -> Any:
        if isinstance(o, UUID):
            return o.hex
        return json.JSONEncoder.default(self, o)

class Data(BaseModel):
    artists: list[Artist]
    songs: list[Song]
    videos: list[Video]
    performances: list[Performance]

class PullCommand(BaseCommand):
    description: str = "write to data to json"
    file_path: Path

    def run(self, command_name: list[str]):
        with open(self.file_path, "w") as f:
            f.write(
                Data(
                    artists=Artist.get_all(),
                    songs=Song.get_all(),
                    videos=Video.get_all(),
                    performances=Performance.get_all(),
                ).model_dump_json(
                    indent=4
                )
            )

class PushCommand(BaseCommand):
    description: str = "push data to database"
    file_path: Path

    def run(self, command_name: list[str]):
        with open(self.file_path) as f:
            data = Data.model_validate(from_json(f.read()))

        for artist in data.artists:
            if not Artist.is_exists(artist.name):
                (
                    self.supabase()
                        .table("artists")
                        .upsert(artist.model_dump(mode="json"))
                        .execute()
                )
            else:
                print(f"{artist.name} is exists.")
        for song in data.songs:
            if not Song.is_exists(song.artist_id, song.name):
                (
                    self.supabase()
                        .table("songs")
                        .upsert(song.model_dump(mode="json"))
                        .execute()
                )
            else:
                print(f"{song.name} is exists.")
        for video in data.videos:
            if not Video.is_exists(video.video_id):
                (
                    self.supabase()
                        .table("videos")
                        .upsert(video.model_dump(mode="json"))
                        .execute()
                )
            else:
                print(f"{video.video_id} is exists.")
        for performance in data.performances:
            if not Performance.is_exists(performance.id):
                (
                    self.supabase()
                        .table("performances")
                        .upsert(performance.model_dump(mode="json"))
                        .execute()
                )
            else:
                print(f"{performance.id} is exists.")

class BackupCommand(BaseCommand):
    description: str = "write to file"
    json_file_path: Path

    @override
    def define_subcommnands(self) -> "dict[str, BaseCommand]":
        return {
            "pull": PullCommand(file_path=self.json_file_path),
            "push": PushCommand(file_path=self.json_file_path)
        }
