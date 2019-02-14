CREATE DATABASE IF NOT EXISTS `lost_dutchman`;

DROP TABLE IF EXISTS users;
CREATE TABLE users (
	user_id int NOT NULL AUTO_INCREMENT,
	username varchar(64) NOT NULL,
	password char(64) NOT NULL, 
	salt char(16) NOT NULL,
	is_admin bool DEFAULT(0),
	PRIMARY KEY(user_id),
	UNIQUE(username)
);

DROP TABLE IF EXISTS games;
CREATE TABLE games (
	game_id int NOT NULL AUTO_INCREMENT,
	room_name varchar(32) NOT NULL,
	facilitator_id int NOT NULL,
	day int NOT NULL DEFAULT(1),
	PRIMARY KEY(game_id)
);

DROP TABLE IF EXISTS player_states;
CREATE TABLE team_states (
	user_id int NOT NULL,
	game_id int NOT NULL,
	team_name varchar(64) NOT NULL,
	current_location int NOT NULL DEFAULT(0),
	cash int DEFAULT(0),
	supplies int DEFAULT(0),
	fuel int DEFAULT(0),
	tents int DEFAULT(0),
	batteries int DEFAULT(0),
	spare_tires int DEFAULT(0),
	caves int DEFAULT(0),
	turbos int DEFAULT(0),
	is_ready bool DEFAULT(0),
	gold_vid bool DEFAULT(0),
	turbo_vid bool DEFAULT(0),
	has_returned bool DEFAULT(0),
	PRIMARY KEY(user_id, game_id),
	FOREIGN KEY(user_id) REFERENCES users(user_id) ON DELETE CASCADE,
	FOREIGN KEY(game_id) REFERENCES games(game_id) ON DELETE CASCADE,
	UNIQUE(team_name)
);

DROP TABLE IF EXISTS weather;
CREATE TABLE weather (
	day int NOT NULL,
	low_country varchar(32) NOT NULL,
	high_country varchar(32) NOT NULL,
	canyon varchar(32) NOT NULL,
	PRIMARY KEY(day)
);

INSERT INTO weather
	(day, low_country, high_country, canyon)
VALUES
	(1, 'Rainy and Wet', 'Sunny and Cool', 'Normal'),
	(2, 'Sunny and Cool', 'Sunny and Cool', 'Normal'),
	(3, 'Sunny and Cool', 'Sunny and Cool', 'Flooded'),
	(4, 'Rainy and Wet', 'Sunny and Cool', 'Flooded'),
	(5, 'Sunny and Cool', 'Sunny and Cool', 'Normal'),
	(6, 'Rainy and Wet', 'Sunny and Cool', 'Normal'),
	(7, 'Rainy and Wet', 'Sunny and Cool', 'Flooded'),
	(8, 'Sunny and Cool', 'Sunny and Cool', 'Normal'),
	(9, 'Sunny and Cool', 'Sunny and Cool', 'Flooded'),
	(10, 'Arctic Blast', 'Arctic Blast', 'Frozen'),
	(11, 'Sunny and Cool', 'Sunny and Cool', 'Normal'),
	(12, 'Arctic Blast', 'Arctic Blast', 'Frozen'),
	(13, 'Sunny and Cool', 'Sunny and Cool', 'Normal'),
	(14, 'Rainy and Wet', 'Sunny and Cool', 'Normal'),
	(15, 'Rainy and Wet', 'Sunny and Cool', 'Normal'),
	(16, 'Sunny and Cool', 'Sunny and Cool', 'Normal'),
	(17, 'Sunny and Cool', 'Sunny and Cool', 'Flooded'),
	(18, 'Sunny and Cool', 'Sunny and Cool', 'Flooded'),
	(19, 'Sunny and Cool', 'Sunny and Cool', 'Normal'),
	(20, 'Sunny and Cool', 'Sunny and Cool', 'Normal');