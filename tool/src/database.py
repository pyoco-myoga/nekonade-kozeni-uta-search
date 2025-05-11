
from datetime import datetime
from typing import ClassVar, Literal, TypeGuard
from pydantic import UUID4, BaseModel
from supabase import Client, create_client

from settings import Settings


class BaseTable(BaseModel):
    settings: ClassVar[Settings] = Settings.model_validate({})
    _supabase: ClassVar[Client | None] = None

    @classmethod
    def supabase(cls) -> Client:
        if cls._supabase is None:
            cls._supabase = create_client(
                f"https://{cls.settings.supabase.project_id}.supabase.co",
                cls.settings.supabase.api_key,
            )
        return cls._supabase


class Artist(BaseTable):
    id: UUID4
    name: str
    description: str

    @classmethod
    def get_all(cls) -> list["Artist"]:
        return [
            Artist.model_validate(artist)
            for artist in cls.supabase().table("artists")
                .select("*")
                .execute()
                .data
        ]

    @classmethod
    def get(cls, id: UUID4) -> "Artist | None":
        artist = (
            cls.supabase()
                .table("artists")
                .select("*")
                .eq("id", id.hex)
                .maybe_single()
                .execute()
        )
        if artist is None:
            return None
        return Artist.model_validate(artist.data)

    @classmethod
    def get_by_name(cls, name: str) -> "Artist | None":
        artist = (
            cls.supabase()
                .table("artists")
                .select("*")
                .eq("name", name)
                .maybe_single()
                .execute()
        )
        if artist is None:
            return None
        return Artist.model_validate(artist.data)

    @classmethod
    def is_exists(cls, name: str) -> bool:
        return cls.get_by_name(name) is not None

    @classmethod
    def insert(cls, name: str, description: str = ""):
        if not cls.is_exists(name):
            cls.supabase().table("artists").insert({
                "name": name,
                "description": description,
            }).execute()

    @classmethod
    def update(cls, artist: "Artist"):
        cls.supabase().table("artists").update(artist.model_dump())

class Song(BaseTable):
    id: UUID4
    artist_id: UUID4
    name: str
    description: str

    @classmethod
    def get_all(cls, artist_id: UUID4 | None = None) -> list["Song"]:
        if artist_id is not None:
            query = (
                cls.supabase()
                    .table("songs")
                    .select("*")
                    .eq("artist_id", artist_id)
            )
        else:
            query = cls.supabase().table("songs").select("*")
        return [
            Song.model_validate(song)
            for song in query.execute().data
        ]

    @classmethod
    def get(cls, id: UUID4) -> "Song | None":
        song = (
            cls.supabase()
            .table("songs")
            .select("*")
            .eq("id", id.hex)
            .maybe_single()
            .execute()
        )
        if song is None:
            return None
        return Song.model_validate(song.data)

    @classmethod
    def get_by_artist_and_name(cls, artist_id: UUID4, song_name: str) -> "Song | None":
        song = (
            cls.supabase()
            .table("songs")
            .select("*")
            .eq("name", song_name)
            .eq("artist_id", artist_id)
            .maybe_single()
            .execute()
        )
        if song is None:
            return None
        return Song.model_validate(song.data)

    @classmethod
    def is_exists(cls, artist_id: UUID4, song_name: str) -> bool:
        return cls.get_by_artist_and_name(artist_id, song_name) is not None

    @classmethod
    def insert(cls, artist_id: UUID4, song_name: str, description: str = ""):
        cls.supabase().table("songs").insert({
            "artist_id": artist_id.hex,
            "name": song_name,
            "description": description,
        }).execute()

class Video(BaseTable):
    id: UUID4
    video_id: str
    title: str
    published_at: datetime

    @classmethod
    def get(cls, id: UUID4) -> "Video | None":
        video = (
            cls.supabase()
                .table("videos")
                .select("*")
                .eq("id", id.hex)
                .maybe_single()
                .execute()
        ) 
        if video is not None:
            return Video.model_validate(video.data)
        else:
            return None

    @classmethod
    def get_by_video_id(cls, video_id: str) -> "Video | None":
        video = (
            cls.supabase()
                .table("videos")
                .select("*")
                .eq("video_id", video_id)
                .maybe_single()
                .execute()
        ) 
        if video is not None:
            return Video.model_validate(video.data)
        else:
            return None

    @classmethod
    def is_exists(cls, video_id: str) -> bool:
        return cls.get_by_video_id(video_id) is not None

    @classmethod
    def get_all(cls) -> list["Video"]:
        return [
            Video.model_validate(video)
            for video in cls.supabase()
                .table("videos")
                .select("*")
                .execute()
                .data
        ]

    @classmethod
    def insert(cls, video_id: str, title: str, published_at: datetime):
        print(published_at)
        cls.supabase().table("videos").insert({
            "video_id": video_id,
            "title": title,
            "published_at": published_at.isoformat(),
        }).execute()

type AccompanimentType = Literal["KARAOKE", "ACOUSTIC", "ELECTRIC"]
ACCOMPANIMENT_TYPE_VALUES = ["KARAOKE", "ACOUSTIC", "ELECTRIC"]

def is_accompaniment_type(value: str) -> TypeGuard[AccompanimentType]:
    return value in ACCOMPANIMENT_TYPE_VALUES

type LengthType = Literal["SHORT", "FULL"]
LENGTH_TYPE_VALUES = ["SHORT", "FULL"]

def is_length_type(value: str) -> TypeGuard[LengthType]:
    return value in LENGTH_TYPE_VALUES

class Performance(BaseTable):
    id: UUID4
    song_id: UUID4
    video_id: UUID4
    accompaniment: AccompanimentType
    length: LengthType
    recommended: bool
    start_sec: int
    end_sec: int

    @classmethod
    def is_exists(cls, id: UUID4) -> bool:
        return (
            cls.supabase().
                table("performances")
                .select("*")
                .eq("id", id)
                .maybe_single()
                .execute()
        ) is not None


    @classmethod
    def get_all(cls) -> list["Performance"]:
        return [
            Performance.model_validate(performance)
            for performance in
            cls.supabase().
                table("performances")
                .select("*")
                .execute()
                .data
        ]

    @classmethod
    def insert(
        cls,
        song_id: UUID4,
        video_id: UUID4,
        accompaniment: AccompanimentType,
        length: LengthType,
        recommended: bool,
        start_sec: int,
        end_sec: int,
    ):
        cls.supabase().table("performances").insert({
            "song_id": song_id.hex,
            "video_id": video_id.hex,
            "accompaniment": accompaniment,
            "length": length,
            "recommended": recommended,
            "start_sec": start_sec,
            "end_sec": end_sec,
        }).execute()
