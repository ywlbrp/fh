import { CommandContext } from "../structures/CommandContext";
import { ServerQueue } from "../structures/ServerQueue";
import { Disc } from "../structures/Disc";

import { BaseApplicationCommandData, ApplicationCommandOptionData, ClientEvents, Client as OClient, Collection, MessageEmbed } from "discord.js";

export type MessageInteractionAction = "editReply" | "reply" | "followUp";

export interface QueryData {
    isURL: boolean;
    sourceType?: "youtube" | "spotify" | "soundcloud" | "query" | "unknown";
    type?: "track" | "playlist" | "unknown";
}

export interface SearchTrackResult {
    type?: "selection"|"results";
    items: ISong[];
}

export interface PaginationPayload {
    author: string;
    content?: string;
    pages: string[];
    embed: MessageEmbed;
    edit(index: number, embed: MessageEmbed, page: string): unknown;
}

export interface SlashOption extends BaseApplicationCommandData {
    name: string;
    description?: string;
    options?: ApplicationCommandOptionData[];
}

export interface IEvent {
    readonly name: keyof ClientEvents;
    execute(...args: any): void;
}

export interface ICommandComponent {
    meta: {
        aliases?: string[];
        cooldown?: number;
        disable?: boolean;
        readonly path?: string;
        devOnly?: boolean;
        description?: string;
        readonly category?: string;
        name: string;
        usage?: string;
        slash?: SlashOption;
        contextChat?: string;
        contextUser?: string;
    };
    execute(context: CommandContext, ...args: any): any;
}

export interface ICategoryMeta {
    name: string;
    hide: boolean;
    cmds: Collection<string, ICommandComponent>;
}

declare module "discord.js" {
    // @ts-expect-error Override typings
    export interface Client extends OClient {
        config: Disc["config"];
        logger: Disc["logger"];
        request: Disc["request"];
        commands: Disc["commands"];
        events: Disc["events"];

        build(token: string): Promise<this>;
    }

    export interface Guild {
        client: Disc;
        queue?: ServerQueue;
    }
}

export interface ISong {
    id: string;
    title: string;
    url: string;
    duration: number;
    thumbnail: string;
}

export interface IQueueSong {
    song: ISong;
    index: number;
    key: string;
}

export type LoopMode = "OFF"|"SONG"|"QUEUE";
