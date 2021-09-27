import { DefineCommand } from "../../utils/decorators/DefineCommand";
import { CommandContext } from "../../structures/CommandContext";
import { BaseCommand } from "../../structures/BaseCommand";
import { createEmbed } from "../../utils/createEmbed";
import { User } from "discord.js";

@DefineCommand({
    description: "Unban someone from the server",
    name: "unban",
    slash: {
        name: "unban",
        options: [
            {
                description: "Who do you like to unban?",
                name: "memberid",
                required: true,
                type: "STRING"
            }
        ]
    },
    usage: "{prefix}unban <id>"
})
export class UnBanCommand extends BaseCommand {
    public async execute(ctx: CommandContext): Promise<any> {
        if (!ctx.member?.permissions.has("BAN_MEMBERS")) return ctx.reply({ embeds: [createEmbed("error", "Sorry, but you don't have **`BAN MEMBERS`** permission to use this command.", true)] });
        if (!ctx.guild?.me?.permissions.has("BAN_MEMBERS")) return ctx.reply({ embeds: [createEmbed("error", "Sorry, but I don't have **`BAN MEMBERS`** permission.", true)] });

        const memberId = ctx.isContextMenu() ? (ctx.additionalArgs.get("options") as User).id : (ctx.isInteraction() ? ctx.options?.getUser("MemberID", true).id : ctx.args[0]?.replace(/[^0-9]/g, ""));
        const user = await this.client.users.fetch(memberId!, { force: false }).catch(() => undefined);
        const resolved = ctx.guild.bans.resolve(user?.id as string);

        if (!user) return ctx.reply({ embeds: [createEmbed("warn", "Please specify someone.")] });
        if (!resolved) return ctx.reply({ embeds: [createEmbed("error", "That user is not banned.", true)] });

        await ctx.guild.bans.remove(user.id);
        return ctx.reply({ embeds: [createEmbed("success", `**${user.tag}** has been **\`UNBANNED\`** from the server.`, true)] });
    }
}
