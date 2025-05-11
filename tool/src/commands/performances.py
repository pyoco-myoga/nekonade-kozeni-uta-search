
from datetime import datetime
from typing import override

from prompt_toolkit import prompt
from prompt_toolkit.completion import WordCompleter, FuzzyWordCompleter
from pydantic import BaseModel
from commands.base import BaseCommand
from database import ACCOMPANIMENT_TYPE_VALUES, LENGTH_TYPE_VALUES, AccompanimentType, Artist, LengthType, Performance, Song, Video, is_accompaniment_type, is_length_type
from utils import youtube_url
from googleapiclient import discovery

class YoutubeData(BaseModel):
    title: str
    published_at: datetime

class BasePerformanceCommand(BaseCommand):

    @classmethod
    def youtube_data(cls, video_id: str) -> YoutubeData:
        """
        returns (title, published_at)
        """
        youtube = discovery.build(
            "youtube", "v3", developerKey=cls.settings.youtube.api_key
        )
        video_data = youtube.videos().list(part="snippet", id=video_id).execute()

        assert video_data["items"] != []
        title = video_data["items"][0]["snippet"]["title"]
        published_at = datetime.fromisoformat(
            video_data["items"][0]["snippet"]["publishedAt"]
        )
        return YoutubeData(
            title=title,
            published_at=published_at
        )

    def artist_completer(self) -> FuzzyWordCompleter:
        return FuzzyWordCompleter([
            Artist.model_validate(artist).name
            for artist in Artist.get_all()
        ])

    def song_completer(self, artist_name: str) -> FuzzyWordCompleter:
        artist = Artist.get_by_name(artist_name)
        if artist is None:
            return FuzzyWordCompleter([])

        artist = Artist.model_validate(artist)
        return FuzzyWordCompleter([
            song.name
            for song in Song.get_all(artist.id)
        ])

    def video_completer(self) -> WordCompleter:
        return WordCompleter([
            video.video_id
            for video in Video.get_all()
        ])

    def accompaniment_completer(self) -> FuzzyWordCompleter:
        return FuzzyWordCompleter(ACCOMPANIMENT_TYPE_VALUES)

    def length_completer(self) -> FuzzyWordCompleter:
        return FuzzyWordCompleter(LENGTH_TYPE_VALUES)

    def input_artist(self, message: str, default: str = "") -> Artist:
        artist_name = prompt(
            message,
            completer=self.artist_completer(),
            default=default,
        )

        if not Artist.is_exists(artist_name):
            Artist.insert(artist_name)
        artist = Artist.get_by_name(artist_name)
        assert artist is not None, f"{artist} must be exists in `artists` table"

        return artist

    def input_song(self, message: str, artist: Artist, default: str = "") -> Song:
        song_name = prompt(
            message,
            completer=self.song_completer(artist_name=artist.name),
            default=default,
        )
        if not Song.is_exists(artist_id=artist.id, song_name=song_name):
            Song.insert(artist_id=artist.id, song_name=song_name)
        song = Song.get_by_artist_and_name(artist_id=artist.id, song_name=song_name)
        assert song is not None, f"{song_name} must be exists in `songs` table"
        return song

    def input_video(
        self,
        message: str,
        default: str = ""
    ) -> Video:
        video_id = prompt(
            message,
            completer=self.video_completer(),
            default=default,
        )
        if not Video.is_exists(video_id):
            video_data = self.youtube_data(video_id)
            Video.insert(
                video_id=video_id,
                title=video_data.title,
                published_at=video_data.published_at, 
            )
        video = Video.get_by_video_id(video_id)
        assert video is not None, f"{video_id} must be exists in `songs` table"
        return video

    def input_accompaniment(self, message: str, default: str = "") -> AccompanimentType:
        while True:
            accompaniment_inputs = prompt(
                message,
                completer=self.accompaniment_completer(),
                default=default,
            )
            if is_accompaniment_type(accompaniment_inputs):
                accompaniment = accompaniment_inputs
                break
        return accompaniment

    def input_length(self, message: str, default: str = "") -> LengthType:
        while True:
            length_inputs = prompt(
                message,
                completer=self.length_completer(),
                default=default,
            )
            if is_length_type(length_inputs):
                length = length_inputs
                break
        return length

    def input_recommended(self, message: str, default: str = "") -> bool:
        recommended_inputs = prompt(message, default=default)
        if recommended_inputs in ["N", "n"]:
            recommended = False
        else:
            recommended = True
        return recommended


class AddPerformancesCommand(BasePerformanceCommand):
    description: str = "add performance to database"

    @override
    def run(self, command_name: list[str]):
        PROMPT = f"({" ".join(command_name)})"
        while True:
            try:
                artist = self.input_artist(f"{PROMPT} artist > ")
                song = self.input_song(f"{PROMPT} song > ", artist=artist)
                video = self.input_video(f"{PROMPT} video > ")

                accompaniment = self.input_accompaniment(f"{PROMPT} accompaniment > ")

                length = self.input_length(f"{PROMPT} length > ")

                recommended = self.input_recommended(f"{PROMPT} recommended (Y/n) > ")

                start_sec = int(prompt(f"{PROMPT} start > {youtube_url(video.video_id)}&t="))
                end_sec = int(prompt(f"{PROMPT} end > {youtube_url(video.video_id)}&t="))

                Performance.insert(
                    song_id=song.id,
                    video_id=video.id,
                    start_sec=start_sec,
                    end_sec=end_sec,
                    accompaniment=accompaniment,
                    length=length,
                    recommended=recommended,
                )
            except EOFError:
                break


class PerformanceCommand(BaseCommand):
    description: str = "performance command"

    @override
    def define_subcommnands(self) -> "dict[str, BaseCommand]":
        return {
            "add": AddPerformancesCommand()
        }
