
from typing import override
from prompt_toolkit import prompt
from prompt_toolkit.completion import FuzzyWordCompleter
from commands.base import BaseCommand
from database import Artist


class ListArtistCommand(BaseCommand):
    description: str = "list artists"

    @override
    def run(self, command_name: list[str]):
        artists = Artist.get_all()
        for artist in artists:
            print(artist.name)

class AddArtistCommand(BaseCommand):
    description: str = "add artist"

    @override
    def run(self, command_name: list[str]):
        artist_name = prompt(
            f"({" ".join(command_name)}) artist > "
        )
        if Artist.is_exists(artist_name):
            print(f"artist `{artist_name}` already exists")
            return
        Artist.insert(artist_name)

class ModifyArtistCommand(BaseCommand):
    description: str = "modify artist information"

    @override
    def run(self, command_name: list[str]):
        artist_name = prompt(
            f"({" ".join(command_name)}) artist > ",
            completer=FuzzyWordCompleter([
                artist.name for artist in Artist.get_all()
            ])
        )
        artist = Artist.get_by_name(artist_name)
        if artist is None:
            print(f"artist `{artist_name}` not exists")
            return
        
        artist.name = prompt(
            f"({" ".join(command_name)}) artist name > ",
            default=artist.name,
        )

        artist.description = prompt(
            f"({" ".join(command_name)}) artist description > ",
            default=artist.description,
        )
        Artist.update(artist)

        

class ArtistCommand(BaseCommand):
    description: str = "artists command"

    @override
    def define_subcommnands(self) -> "dict[str, BaseCommand]":
        return {
            "ls": ListArtistCommand(),
            "add": AddArtistCommand(),
            "modify": ModifyArtistCommand(),
        }
