from typing import override
from prompt_toolkit import prompt
from prompt_toolkit.completion import WordCompleter
from prompt_toolkit.history import InMemoryHistory
from supabase import create_client
from commands.algolia import AlgoliaCommand
from commands.base import BaseCommand, CommandNotFoundError
from commands.performances import PerformanceCommand
from commands.artists import ArtistCommand
from commands.backup import BackupCommand
from commands.thumbnails import ThumbnailsCommand
from settings import Settings
from utils import project_root

class Command(BaseCommand):
    description: str = ""

    @override
    def define_subcommnands(self) -> "dict[str, BaseCommand]":
        return {
            "performance": PerformanceCommand(),
            "artist": ArtistCommand(),
            "backup": BackupCommand(json_file_path=project_root() / "data.json"),
            "algolia": AlgoliaCommand(),
            "thumbnails": ThumbnailsCommand(),
        }


if __name__ == "__main__":
    settings = Settings.model_validate({})
    supabase=create_client(
        f"https://{settings.supabase.project_id}.supabase.co",
        settings.supabase.api_key,
    )

    command_tool = Command()
    history = InMemoryHistory()

    while True:
        try:
            PROMPT = "main > "
            inputs = prompt(
                PROMPT,
                completer=WordCompleter(
                    command_tool.command_names()
                ),
                history=history,
            ).split()
            try:
                command = command_tool.get(inputs)
            except CommandNotFoundError:
                print(f"command `{" ".join(inputs)}`")
                continue

            command.run(command_name=inputs)

        except EOFError:
            break

