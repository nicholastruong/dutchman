CREATE DATABASE IF NOT EXISTS `lost_dutchman`;
USE `lost_dutchman`;

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
	facilitator_id int NOT NULL, #TODO: make this foreign key
	day int NOT NULL DEFAULT(1),
	PRIMARY KEY(game_id)
);

DROP TABLE IF EXISTS team_states;
CREATE TABLE team_states (
	user_id int NOT NULL,
	game_id int NOT NULL,
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
	UNIQUE(user_id)
);

DROP TABLE IF EXISTS weather;
CREATE TABLE weather (
	day int NOT NULL,
	low_country varchar(32) NOT NULL,
	high_country varchar(32) NOT NULL,
	canyon varchar(32) NOT NULL,
	PRIMARY KEY(day)
);


INSERT INTO users
	(username, password, salt, is_admin)
VALUES
	('jffa', 'a09d9e950ca8c0b62e4f57323a5ab150aaf2d6a377d387c6cde61376ef0d92c1', '8d5e5bf2301c9f64', FALSE),
	('jffb', '0f8cf2eedbbd4ea5333d17b8b804209b79fac5fa99e2baf3a923cbde585bdc12', '5e7d78ad6b21bea9', FALSE),
	('jffc', '2b01306814453782c77b204d9fdd3c400b839ffc1415b7041df72a2edbd2d8a3', 'd7235c9b20edc7ac', FALSE),
	('jffd', '6706dabf150d2ad3757abb8a9c5bdfdbfda9ceb803fc8d4fce0cca0bf162440d', '776fdfd2eae73e98', FALSE),
	('jffe', 'dcbd25d1806a7c8ec2587084777dfc6f81d918fc5d8ba1ef21b549710bd2418b', '4ee2c2a972098042', FALSE),
	('jfff', 'b658dae7180c9abc3b93b82ba35fa0b2490e79dbe474d46ff132e7bc230e6879', 'b4148be4ccfba287', FALSE),
	('jffg', '4e8bf73ec9b359e80581eca42dfa5a37358c9618d02be7a974137c0b2118c9b3', '3cb2e7134158e8dd', FALSE),
	('admin', 'eb37a5deeb192d1e807583b5556bc9d483e63d399fd31921dcf666fd48e388b0', '47e866bc3dff1b13', TRUE);

INSERT INTO games
	(room_name, facilitator_id)
VALUES
	("jff", 8);

INSERT INTO team_states
	(user_id, game_id)
VALUES
	(1, 1),
	(2, 1),
	(3, 1),
	(4, 1),
	(5, 1),
	(6, 1),
	(7, 1);

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