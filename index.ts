import { Client, Intents, Message, TextChannel } from "discord.js";
import { CanardOrders, ExplorateurOrders, Game, Side } from "./Game";
import { Player } from "./Player";
import { Role, Types } from "./Role";
require("dotenv").config();

const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MEMBERS,
    Intents.FLAGS.GUILD_BANS,
    Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS,
    Intents.FLAGS.GUILD_INTEGRATIONS,
    Intents.FLAGS.GUILD_WEBHOOKS,
    Intents.FLAGS.GUILD_INVITES,
    Intents.FLAGS.GUILD_VOICE_STATES,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
    Intents.FLAGS.GUILD_MESSAGE_TYPING,
    Intents.FLAGS.DIRECT_MESSAGES,
    Intents.FLAGS.DIRECT_MESSAGE_REACTIONS,
    Intents.FLAGS.DIRECT_MESSAGE_TYPING,
  ],
  partials: ["CHANNEL"],
});

const tokenBlue: string = process.env.EMOTE_BLUE!;
const tokenRed: string = process.env.EMOTE_RED!;
const YEP: string = process.env.YEP!;
const tokenDM: string = "AL";
const ChannelId: string = process.env.CHANNEL_ID!;
var channel: TextChannel | undefined = undefined;

const checkminutes: number = 5;
const checkthe_interval: number = checkminutes * 60 * 1000;

var gameBlue: Game = new Game([], false, false, 2, [], Side.Blue);
var gameRed: Game = new Game([], false, false, 2, [], Side.Red);
var game: Game = gameBlue;

const getCommand = (msg: Message): string[] | null => {
  var cmd = null;
  if (msg.content.startsWith(tokenBlue + " ")) {
    cmd = msg.content.substring((tokenBlue + " ").length);
    game = gameBlue;
    return cmd.split(" ");
  } else if (msg.content.startsWith(tokenRed + " ")) {
    cmd = msg.content.substring((tokenRed + " ").length);
    game = gameRed;
    return cmd.split(" ");
  } else if (msg.content.startsWith(tokenDM + " ")) {
    cmd = msg.content.substring((tokenDM + " ").length);
    if (gameBlue.players.some((x) => x.user.id == msg.author.id)) {
      game = gameBlue;
    } else if (gameRed.players.some((x) => x.user.id == msg.author.id)) {
      game = gameRed;
    }
    return cmd.split(" ");
  } else {
    return null;
  }
};

client.login(process.env.CLIENT_TOKEN);

client.on("ready", () => {
  if (client.user) {
    console.log(`Logged in as ${client.user.tag}!`);
    channel = client.channels.cache.get(ChannelId) as TextChannel;
  }
});

client.on("messageCreate", (msg: Message) => {
  if (msg.author.bot) return;
  const cmd = getCommand(msg);

  if (cmd) {
    //------------- LOBBY --------------

    if (cmd[0] == "help" || cmd[0] == "h") {
      msg.reply(
        "```(j)oin - Join the game\n" +
          "(l)eave - Leave the game\n" +
          "(p)urge - Purge the player list\n" +
          "(s)ettings - Show the settings\n" +
          "set imposters [number] - Sets the max number of imposters (Default: 2)\n" +
          "start - Start the game\n" +
          "stop - Stop the game\n" +
          "end [win|lose] - End the game and starts the scoring phase\n" +
          "add [x] - Add x points to yourtself\n" +
          "score - Display scoreboard\n" +
          "clear - Clears the scoreboard\n" +
          "roles - Lists roles" +
          "(h)elp - Show command list```"
      );
      msg.react(YEP);
    }

    if (cmd[0] == "roles") {
      var roles = Object.values(Role) as Role[];
      var rolestr = "```Roles:\n~" + Types.Crewmate.toString() + ":\n";
      roles
        .filter((x) => x.value.type == Types.Crewmate)
        .forEach((x) => (rolestr += x.toDetailedString() + "\n"));
      rolestr += "~" + Types.Impostor.toString() + ":\n";
      roles
        .filter((x) => x.value.type == Types.Impostor)
        .forEach((x) => (rolestr += x.toDetailedString() + "\n"));
      msg.reply(rolestr + "```");
      msg.react(YEP);
    }

    if (cmd[0] == "settings" || cmd[0] == "s") {
      var str: string = "```Settings:\n";
      if (game.players.length == 0) {
        str += "- No players.\n";
      } else {
        str += "- Players: (" + game.players.length + ")\n";
        game.players.forEach((x) => (str += "\t- " + x.user.username + "\n"));
      }
      str += "- Number of imposters max: " + game.maxImpostorCount + "\n";
      str +=
        "- Status: " + (game.isRunning ? "Playing..." : "Waiting...") + "```";
      msg.reply(str);
      msg.react(YEP);
    }
    if (!gameBlue.isRunning && !gameRed.isRunning) {
      if (cmd[0] == "switch") {
        game = gameBlue.players.some((x) => x.user.id == msg.author.id)
          ? gameBlue
          : gameRed;
        var playerToRemove = game.players.find(
          (x) => x.user.id == msg.author.id
        );
        if (playerToRemove) {
          game.players = game.players.filter((x) => x != playerToRemove);
          game = game == gameBlue ? gameRed : gameBlue;
          if (!game.players.some((x) => x.user.id == msg.author.id)) {
            playerToRemove.side =
              playerToRemove.side == Side.Blue ? Side.Red : Side.Blue;
            game.players.push(playerToRemove);
            msg.react(YEP);
          } else {
            msg.reply("Error while leaving team.");
          }
        } else {
          msg.reply("You aren't in a team.");
        }
      }
    }
    if (!game.isRunning) {
      if (cmd[0] == "join" || cmd[0] == "j") {
        if (
          !gameBlue.players.some((x) => x.user == msg.author) &&
          !gameRed.players.some((x) => x.user == msg.author)
        ) {
          game.players.push(new Player(msg.author, 0, [], game.side));
          msg.react(YEP);
        } else {
          msg.reply(
            "You cannot join two teams. First leave your current team, or use the 'switch' command to change team."
          );
        }
      }
      if (cmd[0] == "leave" || cmd[0] == "l") {
        var playerToLeave = game.players.find(
          (x) => x.user.id == msg.author.id
        );
        if (playerToLeave) {
          game.players = game.players.filter((x) => x != playerToRemove);
          msg.react(YEP);
        }
      }
      if (cmd[0] == "purge" || cmd[0] == "p") {
        game.players = [];
        msg.react(YEP);
      }
      if (cmd[0] == "set") {
        if (cmd[1] && cmd[1] == "impostors") {
          if (cmd[2]) {
            const nbrOfImpostors = parseInt(cmd[2], 10);
            if (nbrOfImpostors >= 0 || nbrOfImpostors <= 5) {
              game.maxImpostorCount = nbrOfImpostors;
              msg.react(YEP);
            } else {
              msg.reply("Wrong impostors number.");
            }
          }
        } else {
          msg.reply("Wrong parameters.");
        }
      }
    }

    //------------- GAME --------------

    if (cmd[0] == "timer") {
      if (game.isRunning && game.intervalArray.length == 0) {
        game.players.forEach((x) => {
          if (x.role == Role.Canard) {
            game.addInterval(
              setInterval(function () {
                var rand = Math.floor(
                  Math.random() * Object.keys(CanardOrders).length
                );
                var order =
                  Object.values(CanardOrders)[
                    parseInt(Object.keys(CanardOrders)[rand])
                  ];
                x.user.send(
                  "`" + x.ordersHistory.length + 1 + ") " + order + "`"
                );
                x.ordersHistory.push(order);
              }, checkthe_interval)
            );
          }

          if (x.role == Role.Explorateur) {
            game.addInterval(
              setInterval(function () {
                var rand = Math.floor(
                  Math.random() * Object.keys(ExplorateurOrders).length
                );
                var order =
                  Object.values(ExplorateurOrders)[
                    parseInt(Object.keys(ExplorateurOrders)[rand])
                  ];
                x.user.send(order);
                x.ordersHistory.push(order);
              }, checkthe_interval)
            );
          }
        });
        msg.react(YEP);
      } else {
        msg.reply("Game has not yet started.");
      }
    }

    if (cmd[0] == "start") {
      if (!game.isRunning) {
        if (game.players.length < 1) {
          msg.reply("Not enough players.");
        } else {
          var token = game.side == Side.Blue ? tokenBlue : tokenRed;
          msg.reply(
            "Starting game... You will be receiving your role in PM.\nDon't forget to type '" +
              token +
              " timer' when the game begin"
          );
          game.setRunning(true);
          game.setWaitingForDM(false);
          game.players.forEach((x) => x.reset());
          getRandomRoles();
          game.players.forEach((x) => {
            x.user.send("```" + x.role!.toCardString() + "```");
          });
          msg.react(YEP);
        }
      } else {
        msg.reply("Game has already started.");
      }
    }

    if (cmd[0] == "stop") {
      if (game.isRunning) {
        msg.reply("Stopping game...");
        game.setRunning(false);
        game.setWaitingForDM(false);
        game.players.forEach((x) => x.reset());
        game.clearIntervals();
        msg.react(YEP);
      } else {
        msg.reply("Game has not yet started.");
      }
    }

    //------------- SCORE --------------

    if (cmd[0] == "score") {
      var score = "```Score:\n";
      var tmpPlayers: Player[] = [];
      if (cmd[1] == "global") {
        tmpPlayers = [...gameBlue.players, ...gameRed.players];
      } else {
        tmpPlayers = [...game.players];
      }
      if (tmpPlayers.length == 0) {
        msg.reply("No players.");
      } else {
        tmpPlayers.sort((a, b) => (a.score > b.score ? -1 : 1));
        tmpPlayers.forEach(
          (x, i) => (score += x.toScore(i + 1, cmd[1] == "global") + "\n")
        );
        msg.reply(score + "```");
      }
      msg.react(YEP);
    }

    if (cmd[0] == "clear") {
      if (cmd[1] == "global") {
        gameBlue.players.forEach((x) => x.clearScore());
        gameRed.players.forEach((x) => x.clearScore());
      } else {
        game.players.forEach((x) => x.clearScore());
      }
      msg.react(YEP);
    }

    if (cmd[0] == "add") {
      if (cmd[1]) {
        var player =
          gameBlue.players.find((x) => x.user.id == msg.author.id) ??
          gameRed.players.find((x) => x.user.id == msg.author.id);
        if (player != null) {
          var nbr = parseInt(cmd[1], 10);
          if (nbr) {
            player.addScore(nbr);
            showScore();
            msg.react(YEP);
          } else {
            msg.reply("Error: Wrong parameter.");
          }
        } else {
          msg.reply("Error: Not a player.");
        }
      } else {
        msg.reply("Error: No parameters given.");
      }
    }

    //------------- RESULTS --------------

    if (cmd[0] == "end") {
      if (cmd[1] != "lose" && cmd[1] != "win") {
        msg.reply("Wrong parameters");
      } else {
        if (game.isRunning) {
          msg.reply("Ending game... You will receive a survey in DM");
          game.setRunning(false);
          game.setWaitingForDM(true);
          game.clearIntervals();
          game.players.forEach((x) => {
            if (cmd[1] == "win") {
              if (x.role?.value.type == Types.Crewmate) {
                x.score += 1;
              }
            } else if (cmd[1] == "lose") {
              if (x.role?.value.type == Types.Impostor) {
                x.score += 2;
              }
            }
          });
          game.players.forEach((x) => {
            var string = "```Qui sont les imposteurs ?\n0- Aucun\n";

            game.players.forEach((y, i) => {
              if (y.user.id != x.user.id) {
                string += i + 1 + "- " + y.user.username + "\n";
              }
            });
            string +=
              "Répondre avec le numéro de l'imposteur. Exemple: 'AL 1'```";
            x.user.send(string);
          });
          msg.react(YEP);
        } else {
          msg.reply("Game has not yet started.");
        }
      }
    }
  }

  if (msg.channel.type == "DM") {
    const cmdDM = getCommand(msg);
    if (cmdDM) {
      if (!game.isRunning && game.waitingForDM) {
        const vote = parseInt(cmdDM[0]);
        var votingPlayer = game.players.find((x) => x.user.id == msg.author.id);
        if (vote >= 0) {
          if (votingPlayer != null && votingPlayer.vote != undefined) {
            msg.reply("Already Voted");
          } else if (
            vote != 0 &&
            (vote > game.players.length ||
              msg.author.id == game.players[vote - 1].user.id)
          ) {
            msg.reply("Player out of Bounds");
          } else {
            votingPlayer?.setVote(vote == 0 ? "Aucun" : game.players[vote - 1]);
            msg.react(YEP);
            if (game.players.filter((x) => x.vote == undefined).length == 0) {
              var roleString = "```Roles:\n";
              game.players.forEach((x) => {
                roleString += x.toRoleReveal();
              });
              channel?.send(roleString + "```");

              game.players.forEach((x) => {
                if (
                  x.role?.value.type == Types.Crewmate &&
                  (x.vote as Player)?.role?.value.type == Types.Impostor
                ) {
                  x.addScore(1);
                }
              });

              const imps = game.players.filter(
                (x) => x.role?.value.type == Types.Impostor
              );

              if (
                game.players.filter(
                  (x) => (x.vote as Player)?.role?.value.type == Types.Impostor
                ).length >
                game.players.length / 2
              ) {
                imps.forEach((x) => x.addScore(-1));
              }

              showScore();

              var tokenMsg = game.side == Side.Blue ? tokenBlue : tokenRed;
              channel?.send(
                "Attribuez un point aux Crewmate ayant respecté leur engagement (" +
                  tokenMsg +
                  " add 1)"
              );
            }
          }
        }
      }
    }
  }
});

//------------- FUNCTIONS --------------

const showScore = () => {
  var tmpPlayers = game.players;
  if (tmpPlayers.length == 0) {
    channel?.send("No players.");
  } else {
    var score = "```Score:\n";
    tmpPlayers.sort((a, b) => (a.score > b.score ? -1 : 1));
    tmpPlayers.forEach((x, i) => (score += x.toScore(i + 1, false) + "\n"));
    channel?.send(score + "```");
  }
};

function getRandomInt(max: number) {
  return Math.floor(Math.random() * max);
}

function weightedRand(list: Role[]) {
  var sum = 0,
    r = Math.random();
  for (var i of list) {
    sum += i.value.weight;
    if (r <= sum) {
      return i;
    }
  }
}

const getRandomRoles = () => {
  const nbrOfImposters = getRandomInt(game.maxImpostorCount) + 1;
  var mappedRoles = [];
  for (let i = 0; i < nbrOfImposters; i++) {
    mappedRoles.push(
      weightedRand(
        Object.values(Role).filter((x) => x.value.type == Types.Impostor)
      )
    );
  }
  while (mappedRoles.length < game.players.length) {
    mappedRoles.push(
      weightedRand(
        Object.values(Role).filter((x) => x.value.type == Types.Crewmate)
      )
    );
  }
  mappedRoles.sort((a, b) => 0.5 - Math.random());
  for (let j = 0; j < game.players.length; j++) {
    game.players[j].role = mappedRoles[j];
  }
};
