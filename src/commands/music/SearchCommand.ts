import { DefineCommand } from "../../utils/decorators/DefineCommand";
import { inVC, validVC, sameVC } from "../../utils/decorators/MusicUtil";
import { CommandContext } from "../../structures/CommandContext";
import { checkQuery, handleVideos, searchTrack } from "../../utils/handlers/GeneralUtil";
import { BaseCommand } from "../../structures/BaseCommand";
import { ISong } from "../../typings";
import { createEmbed } from "../../utils/createEmbed";
import { MessageActionRow, MessageButton, MessageSelectOptionData, MessageSelectMenu } from "discord.js";

@DefineCommand({
    contextChat: "Add to queue",
    description: "Play some track using provided query",
    name: "search",
    slash: {
        description: "Search the specified track",
        name: "search",
        options: [
            {
                description: "Query to search",
                name: "query",
                type: "STRING"
            },
            {
                choices: [
                    {
                        name: "YouTube",
                        value: "youtube"
                    },
                    {
                        name: "SoundCloud",
                        value: "soundcloud"
                    },
                    {
                        name: "Spotify",
                        value: "spotify"
                    }
                ],
                description: "Where the track should be taken?",
                name: "source",
                required: false,
                type: "STRING"
            }
        ]
    },
    usage: "{prefix}search <query>"
})
export class SearchCommand extends BaseCommand {
    @inVC()
    @validVC()
    @sameVC()
    public async execute(ctx: CommandContext): Promise<any> {
        if (ctx.isInteraction() && !ctx.deferred) await ctx.deferReply();

        const voiceChannel = ctx.member!.voice.channel!;
        const query = (ctx.args.join(" ") || ctx.options?.getString("query")) ?? ctx.options?.getMessage("message")?.content;

        if (!query) {
            return ctx.send({
                embeds: [
                    createEmbed("warn", "Please provide some query to search.")
                ]
            });
        }
        if (checkQuery(query).isURL) {
            const newCtx = new CommandContext(ctx.context, [String(query)]);
            return this.client.commands.get("play")!.execute(newCtx);
        }

        const tracks = await searchTrack(this.client, query, (ctx.options?.getString("source") as "youtube"|"soundcloud"|undefined) ?? "soundcloud").catch(() => undefined);
        if (!tracks || (tracks.items.length <= 0)) return ctx.reply({ embeds: [createEmbed("error", "I can't obtain any search results.", true)] });

        const msg = await ctx.send({
            content: "Please select some tracks and then press `Done` to continue",
            components: [
                new MessageActionRow()
                    .addComponents(
                        new MessageSelectMenu()
                            .setMinValues(1)
                            .setMaxValues(10)
                            .setCustomId(Buffer.from(`${ctx.author.id}_${this.meta.name}_no`).toString("base64"))
                            .addOptions(this.generateSelectMenu(tracks.items))
                            .setPlaceholder("Select some tracks")
                    ),
                new MessageActionRow()
                    .addComponents(
                        new MessageButton()
                            .setCustomId("DONE_BTN")
                            .setLabel("Done")
                            .setEmoji("✅")
                            .setStyle("PRIMARY")
                    )
            ]
        });
        const toQueue: ISong[] = await (new Promise(resolve => {
            let arr: ISong[] = [];

            const collector = msg.createMessageComponentCollector({
                filter: i => (i.isSelectMenu() || i.isButton()) && (i.user.id === ctx.author.id)
            });

            collector.on("collect", i => {
                if (i.isSelectMenu()) {
                    arr = i.values.map(val => {
                        const num = Number(val.slice(-1));

                        return tracks.items[num];
                    });
                } else if (i.isButton() && (i.customId === "DONE_BTN")) {
                    if (!arr.length) {
                        return;
                    }

                    return collector.stop();
                }
            }).on("end", () => resolve(arr));
        }));

        return handleVideos(this.client, ctx, toQueue, voiceChannel);
    }

    private generateSelectMenu(tracks: ISong[]): MessageSelectOptionData[] {
        const emojis = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣", "🔟"];

        return tracks.slice(0, 10).map((x, i) => (
            {
                label: x.title.length > 98 ? `${x.title.substr(0, 97)}...` : x.title,
                emoji: emojis[i],
                value: `MUSIC-${i}`
            }
        ));
    }
}
