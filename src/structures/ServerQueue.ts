import { SongManager } from "../utils/SongManager";
import { LoopMode } from "../typings";
import { AudioPlayer, AudioPlayerStatus, VoiceConnection } from "@discordjs/voice";
import { TextBasedChannels, Snowflake } from "discord.js";

export class ServerQueue {
    public loopMode: LoopMode = "OFF";
    public shuffle = false;
    public connection: VoiceConnection|null = null;
    public player: AudioPlayer|null = null;
    public dcTimeout: NodeJS.Timeout|null = null;
    public timeout: NodeJS.Timeout|null = null;
    public readonly songs = new SongManager();
    private _lastMusicMsg: Snowflake|null = null;
    private _lastVSUpdateMsg: Snowflake|null = null;

    public constructor(public readonly textChannel: TextBasedChannels) {
        Object.defineProperties(this, {
            _lastMusicMsg: {
                enumerable: false
            },
            _lastVSUpdateMsg: {
                enumerable: false
            }
        });
    }

    public set lastMusicMsg(value: Snowflake|null) {
        this._lastMusicMsg = value;
    }

    public get lastMusicMsg(): Snowflake|null {
        return this._lastMusicMsg;
    }

    public set lastVSUpdateMsg(value: Snowflake|null) {
        this._lastVSUpdateMsg = value;
    }

    public get lastVSUpdateMsg(): Snowflake|null {
        return this._lastVSUpdateMsg;
    }

    public set playing(value: boolean) {
        if (value) {
            this.player?.unpause();
        } else {
            this.player?.pause();
        }
    }

    public get playing(): boolean {
        return this.player?.state.status === AudioPlayerStatus.Playing;
    }
}
