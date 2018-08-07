require('./../BedrockUpdateBot.js')
const Discord = require('discord.js');
const fs = require('fs');
var btoa = require('btoa')

class CheckGooglePlayVersionTask {
    static getDelay() {
        return 300000; //5 mins
    }

    static getName() {
        return "CheckGooglePlayVersionTask";
    }

    static check(Bot) {
        /*
            Initializing them in the botManager corrupt the object for some reasons
        */
        var betaAccount = require('gpapi').GooglePlayAPI({
            username: botManager.loginConfig["betaAccount"]["username"],
            password: botManager.loginConfig["betaAccount"]["password"],
            androidId: botManager.loginConfig["betaAccount"]["androidId"],
            useCache: false,
            debug: false
        });

        var normalAccount = require('gpapi').GooglePlayAPI({
            username: botManager.loginConfig["normalAccount"]["username"],
            password: botManager.loginConfig["normalAccount"]["password"],
            androidId: botManager.loginConfig["normalAccount"]["androidId"],
            useCache: false,
            debug: false
        });

        betaAccount.bulkDetails("com.mojang.minecraftpe", function (err, res) {
            if (res !== undefined) {
                var betaVersion = res[0].details.appDetails.versionString;
                var betaVersionCode = res[0].details.appDetails.versionCode;

                if ((betaVersion + "_beta") !== botManager.config["lastVersionAndroidBeta"] && (betaVersion + "_beta") !== botManager.config["lastVersionAndroidBeta2"]) {
                    console.log("betaVersion: " + betaVersion)
                    botManager.config["lastVersionAndroidBeta2"] = botManager.config["lastVersionAndroidBeta"];
                    botManager.config["lastVersionAndroidBeta"] = (betaVersion + "_beta");
                    botManager.config["lastVersionReleased"] = (betaVersion + "_beta");
                    botManager.config["lastVersionReleasedIsBeta"] = true;
                    botManager.saveConfig()
                    var embed = new Discord.RichEmbed()
                        .setTitle(`A new version is out on the Google Play Store for beta users: ` + betaVersion + " :pushpin:")
                        .setDescription(res[0].details.appDetails.recentChangesHtml.replace(/<br\s*\/?>/gi, ' '))
                        .setColor('#0941a9')
                        .setAuthor("BedrockUpdateBot", botManager.avatarURL)
                    botManager.sendToChannels('news', embed)
                    botManager.sendToChannels('debug', "A new version is out on the GooglePlayStore for beta users! (" + betaVersion + ") ")
                    botManager.client.post('statuses/update', { status: '📌 A new version is out on the Google Play Store for beta users: ' + betaVersion + " !\n\n#RT" }, function (error, tweet, response) { });
                    Bot.users.forEach(function (element) {
                        if (element.id == botManager.config['ownerId']) {
                            element.send(embed)
                        }
                    });

                    botManager.client.post('statuses/update', { status: '📌 A new version is out on the Google Play Store for beta users: ' + betaVersion + " !\n\n#RT" }, function (error, tweet, response) { });

                    fs.mkdirSync("MCPE/Beta/" + betaVersion + "_beta/")
                    var fStream = fs.createWriteStream("MCPE/Beta/" + betaVersion + "_beta/" + betaVersion + "_beta.apk");
                    
                    fStream.on('open', function () {
                        betaAccount.download("com.mojang.minecraftpe", betaVersionCode).then(function (res) {
                            res.pipe(fStream);
                        });
                    })

                    fStream.on('finish', function () {
                        require('./../deassembly/Deassembly.js').run(betaVersion);
                    })
                }
            } else {
                Bot.users.forEach(function (element) {
                    if (element.id == botManager.config['ownerId']) {
                        element.send("Request failed beta ?")
                        console.log(res)
                        console.log(err)
                    }
                });
            }
        });


        normalAccount.bulkDetails("com.mojang.minecraftpe", function (err, res) {
            if (res !== undefined) {
                var normalVersion = res[0].details.appDetails.versionString;
                var normalVersionCode = res[0].details.appDetails.versionCode;

                if (normalVersion !== botManager.config["lastVersionAndroid"] && normalVersion !== botManager.config["lastVersionAndroid2"]) {
                    console.log("normalVersion: " + normalVersion)
                    botManager.config["lastVersionAndroid2"] = botManager.config["lastVersionAndroid"];
                    botManager.config["lastVersionAndroid"] = normalVersion;
                    botManager.config["lastVersionReleased"] = normalVersion;
                    botManager.config["lastVersionReleasedIsBeta"] = false;
                    botManager.saveConfig()
                    var embed = new Discord.RichEmbed()
                        .setTitle(`A new version is out on the Google Play Store: ` + botManager.config["lastVersionAndroid"] + " :pushpin:")
                        .setDescription(res[0].details.appDetails.recentChangesHtml.replace(/<br\s*\/?>/gi, ' '))
                        .setColor('#0941a9')
                        .setAuthor("BedrockUpdateBot", botManager.avatarURL)
                    botManager.sendToChannels('news', embed)
                    botManager.sendToChannels('debug', "A new version is out on the GooglePlayStore ! (" + body["Android"]["Version"] + ") ")
                    botManager.Bot.users.forEach(function (element) {
                        if (element.id == botManager.config['ownerId']) {
                            element.send(embed);
                        }
                    });
                    botManager.client.post('statuses/update', { status: '📌 A new version is out on the Google Play Store: ' + normalVersion + " !\n\n#RT" }, function (error, tweet, response) { });

                    fs.mkdirSync("MCPE/Release/" + normalVersion + "/")
                    var fStream = fs.createWriteStream("MCPE/Release/" + normalVersion + "/" + normalVersion + ".apk");

                    fStream.on('open', function () {
                        betaAccount.download("com.mojang.minecraftpe", normalVersionCode).then(function (res) {
                            res.pipe(fStream);
                        });
                    })

                    fStream.on('finish', function () {
                        require('./../deassembly/Deassembly.js').run(normalVersion);
                    })
                }
            } else {
                Bot.users.forEach(function (element) {
                    if (element.id == botManager.config['ownerId']) {
                        element.send("Request failed ? normal")
                        console.log(res)
                        console.log(err)
                    }
                });
            }
        });
    }
}

module.exports = CheckGooglePlayVersionTask;