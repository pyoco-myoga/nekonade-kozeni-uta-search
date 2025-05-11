from typing import ClassVar, final
from pydantic import BaseModel
from supabase import Client, create_client

from settings import Settings
from utils import add_indent

class CommandNotFoundError(Exception):
    pass


class BaseCommand(BaseModel):
    description: str
    _subcommands: "dict[str, BaseCommand] | None" = None

    settings: ClassVar[Settings] = Settings.model_validate({})
    _supabase: ClassVar[Client | None] = None

    @final
    @property
    def subcommands(self) -> "dict[str, BaseCommand]":
        if self._subcommands is None:
            self._subcommands = self.define_subcommnands()
        return self._subcommands

    def define_subcommnands(self) -> "dict[str, BaseCommand]":
        return {}

    def get(self, cmd: list[str]) -> "BaseCommand":
        command, _ = self._get(cmd)
        return command

    def _get(self, cmd: list[str]) -> "tuple[BaseCommand, str | None]":
        if cmd == []:
            return self, None

        if cmd[0] not in self.subcommands.keys():
            raise CommandNotFoundError()

        subcommand, subcommand_name = self.subcommands[cmd[0]]._get(cmd[1:])
        return subcommand, f"{cmd[0]} {subcommand_name}"

    def command_names(self) -> list[str]:
        result = []
        for subcommand_name, subcommand in self.subcommands.items():
            if subcommand.command_names() == []:
                result.append(subcommand_name)
            else:
                for subsubcommand in subcommand.command_names():
                    result.append(f"{subcommand_name} {subsubcommand}")
        return result

    @staticmethod
    def supabase() -> Client:
        if BaseCommand._supabase is None:
            BaseCommand._supabase = create_client(
                f"https://{BaseCommand.settings.supabase.project_id}.supabase.co",
                BaseCommand.settings.supabase.api_key,
            )
        return BaseCommand._supabase

    def run(self, command_name: list[str]):
        self.help(command_name)

    def help[**P](self, command_name: list[str]):
        print(f""""
help of '{" ".join(command_name)}'

{self.description}
""")

        for subcommand_name, subcommand in self.subcommands.items():
            print(f"""
{subcommand_name}:
{add_indent(subcommand.description)}
""")

