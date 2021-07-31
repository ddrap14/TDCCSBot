const fs = require("fs");
const Discord = require("discord.js");
const carFiles = fs.readdirSync('./comands/cars').filter(file => file.endsWith('.json'));
const packFiles = fs.readdirSync("./comands/packsim/packs").filter(file => file.endsWith(".json"));

module.exports = {
	name: "openpack",
	aliases: ["op"],
	usage: "<pack name goes here>",
	args: true,
	cooldown: 30,
	description: "Open a pack!",
	execute(message, args) {
		let packName = args.map(i => i.toLowerCase());
		const searchResults = packFiles.filter(function (pack) {
			return packName.every(part => pack.includes(part));
		});

		if (searchResults.length === 1) {
			let currentPack = require(`./packs/${searchResults[0]}`);
			const cardFilter = currentPack["filter"];
			let rand, check;
			let rqStart, rqEnd;
			let currentCard = require(`../cars/${carFiles[Math.floor(Math.random() * carFiles.length)]}`);
			const pulledCards = [];
			const addedCars = [];
			for (let i = 0; i < 5; i++) {
				rand = Math.floor(Math.random() * 100);
				check = 0;
				for (let rarity of Object.keys(currentPack["packSequence"][i])) {
					check += currentPack["packSequence"][i][rarity];
					if (check > rand) {
						switch (rarity) {
							case "common":
								rqStart = 1;
								rqEnd = 19;
								break;
							case "uncommon":
								rqStart = 20;
								rqEnd = 29;
								break;
							case "rare":
								rqStart = 30;
								rqEnd = 39;
								break;
							case "superRare":
								rqStart = 40;
								rqEnd = 49;
								break;
							case "ultraRare":
								rqStart = 50;
								rqEnd = 64;
								break;
							case "epic":
								rqStart = 65;
								rqEnd = 79;
								break;
							case "legendary":
								rqStart = 80;
								rqEnd = 999;
								break;
							default:
								break;
						}
						break;
					}
				}
				let carFile = carFiles[Math.floor(Math.random() * carFiles.length)];
				currentCard = require(`../cars/${carFile}`);
				while (currentCard["rq"] < rqStart || currentCard["rq"] > rqEnd) {
					carFile = carFiles[Math.floor(Math.random() * carFiles.length)];
					currentCard = require(`../cars/${carFile}`);
									console.log(carFile);
				}
				addedCars.push(carFile);
				}
				console.log(addedCars);
				addedCars.sort(function (a, b) {
					const carA = require(`../cars/${a}`);
					const carB = require(`../cars/${b}`);

					if (carA["rq"] === carB["rq"]) {
						console.log(";");
						let nameA = `${carA["make"]} ${carA["model"]}`.toLowerCase();
						let nameB = `${carA["make"]} ${carA["model"]}`.toLowerCase();
						if (typeof carA["make"] === "object") {
							nameA = `${carA["make"][0]} ${carA["model"]}`.toLowerCase();
						}
						if (typeof carB["make"] === "object") {
							nameB = `${carB["make"][0]} ${carB["model"]}`.toLowerCase();
						}

						if (nameA < nameB) {
							return -1;
						}
						else if (nameA > nameB) {
							return 1;
						}
						else {
							return 0;
						}
					} else {
						if (carA["rq"] > carB["rq"]) {
							return 1;
						} else {
							return -1;
						}
					}
				});

				function rarityCheck(currentCar) {
					if (currentCar["rq"] > 79) { //leggie
						return message.client.emojis.cache.get("857512942471479337");
					} else if (currentCar["rq"] > 64 && currentCar["rq"] <= 79) { //epic
						return message.client.emojis.cache.get("726025468230238268");
					} else if (currentCar["rq"] > 49 && currentCar["rq"] <= 64) { //ultra
						return message.client.emojis.cache.get("726025431937187850");
					} else if (currentCar["rq"] > 39 && currentCar["rq"] <= 49) { //super
						return message.client.emojis.cache.get("857513197937623042");
					} else if (currentCar["rq"] > 29 && currentCar["rq"] <= 39) { //rare
						return message.client.emojis.cache.get("726025302656024586");
					} else if (currentCar["rq"] > 19 && currentCar["rq"] <= 29) { //uncommon
						return message.client.emojis.cache.get("726025273421725756");
					} else { //common
						return message.client.emojis.cache.get("726020544264273928");
					}
				}

				for (let i = 0; i < addedCars.length; i++) {
					let currentCard = require(`../cars/${addedCars[i]}`);
					let rarity = rarityCheck(currentCard);
					let make = currentCard["make"];
					if (typeof make === "object") {
						make = currentCard["make"][0];
					}

					if (i % 5 === 0) {
						pulledCards[i] = "";
					}
					pulledCards[i] += `(${rarity} ${currentCard["rq"]}) ${make} ${currentCard["model"]} (${currentCard["modelYear"]})`;
					if ((i + 1) % 5 !== 0) {
						pulledCards[i] += ` **[[Card]](${currentCard["card"]})**\n`;
					}
				}

				for (let i = 0; i < 5; i++) {
					let d = require(`../cars/${addedCars[i]}`);

					const packScreen = new Discord.MessageEmbed()
						.setColor("#18d17b")
						.setAuthor(message.author.tag, message.author.displayAvatarURL({ format: "png", dynamic: true }))
						.setTitle(`Opening ${currentPack["packName"]}...`)
						.setDescription("Cards can be viewed by clicking on them.")
						.setThumbnail(currentPack["pack"])
						.setImage(d["card"])
						.addField("Pack Contents:", pulledCards[i])
						.setTimestamp();
					message.channel.send(packScreen);
				}

				function filterCard(currentCard, filter) {
					let passed = true;
					if (currentCard["isPrize"] === false) {
						for (let criteria in filter) {
							if (filter[criteria] !== "None") {
								switch (criteria) {
									case "make":
									case "tags":
										if (Array.isArray(currentCard[criteria])) {
											if (currentCard[criteria].some(m => m === filter[criteria]) === false) {
												passed = false;
											}
										} else {
											if (currentCard[criteria] !== filter[criteria]) {
												passed = false;
											}
										}
										break;
									case "modelYear":
									case "seatCount":
										if (currentCard[criteria] < filter[criteria]["start"] || currentCard[criteria] > filter[criteria]["end"]) {
											passed = false;
										}
										break;
									default:
										if (currentCard[criteria] !== filter[criteria]) {
											passed = false;
										}
										break;
								}
							}
						}
					} else {
						passed = false;
					}
					return passed;
				}

		} else if (searchResults.length > 1) {
			const errorMessage = new Discord.MessageEmbed()
				.setColor("#d21404")
				.setAuthor(message.author.tag, message.author.displayAvatarURL({ format: "png", dynamic: true }))
				.setTitle("Error, please input a more precise value.")
				.setDescription("List of values can be found below.")
				.addField("To open a carbon fiber pack, please input 'carbon'")
				.addField("To open a ceramic pack, please input 'ceramic'")
				.setTimestamp();
			return message.channel.send(errorMessage);
		} else {
			const errorMessage = new Discord.MessageEmbed()
				.setColor("#d21404")
				.setAuthor(message.author.tag, message.author.displayAvatarURL({ format: "png", dynamic: true }))
				.setTitle("Error, you didn't input a valid pack. Maybe it was a typo?")
				.setDescription("List of values can be found below.")
				.addField("To open a carbon fiber pack, please input 'carbon'")
				.addField("To open a ceramic pack, please input 'ceramic'")
				.setTimestamp();
			return message.channel.send(errorMessage);
		}
	}
}
