
import time
import requests
from PIL import Image
from typing import override
from pathlib import Path

from supabase import create_client
from supabase.lib.client_options import SyncClientOptions
from supabase.client import Client
from commands.base import BaseCommand
from database import Video
from io import BytesIO
from tqdm import tqdm

BUCKET_NAME = "thumbnails"

class FetchThumbnailsCommand(BaseCommand):
    description: str = "downloads thumbnails"

    @classmethod
    def supabase_storage(cls) -> Client:
        return create_client(
            f"https://{cls.settings.supabase.project_id}.supabase.co",
            cls.settings.supabase.api_key,
            SyncClientOptions(schema="storage")
        )


    @staticmethod
    def file_path(video_id: str) -> str:
        return f"thumbnails/{video_id}.jpg"

    @override
    def run(self, command_name: list[str]):
        for bucket in self.supabase().storage.list_buckets():
            if BUCKET_NAME == bucket.name:
                break
        else:
            self.supabase().storage.create_bucket(
                "thumbnails",
                options={
                    "public": True,
                    "allowed_mime_types": ["image/jpeg"]
                }
            )

        existing_videos = [
            Path(video_data["name"]).stem
            for video_data in self.supabase_storage()
                .from_("objects")
                .select("name")
                .execute()
                .data
        ]

        new_videos = [
            video for video in Video.get_all()
            if video.video_id not in existing_videos
        ]
        for video in tqdm(new_videos):
            response = requests.get(f"https://img.youtube.com/vi/{video.video_id}/0.jpg")
            image = Image.open(BytesIO(response.content))
            width, height = image.size
            image = image.crop((0, 45, width, height - 45))
            image = image.resize((image.width // 2, image.height // 2))

            image_bytes = BytesIO()
            image.save(image_bytes, format="JPEG")
            image_bytes.seek(0)
            self.supabase().storage.from_("thumbnails").upload(
                file=image_bytes.getvalue(),
                path=FetchThumbnailsCommand.file_path(video.video_id),
                file_options={
                    "upsert": "true",
                    "content-type": "image/jpeg"
                },
            )
            time.sleep(1)


class ThumbnailsCommand(BaseCommand):
    description: str = "thumbnails commands"

    def define_subcommnands(self) -> "dict[str, BaseCommand]":
        return {
            "fetch": FetchThumbnailsCommand()
        }
