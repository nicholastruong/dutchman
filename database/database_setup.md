## Database Setup Instructions

### Installing MySQL

1. Go to https://dev.mysql.com/downloads/installer/ and scroll down to Generally Available Releases. Select the correct operator system and click "Download" on "mysql-installer-community".

2. After the installer finishes downloading, open it. When it asks which product to install, select "MySQL Server". You can use all the default settings, except for setting the root password. Pick a root password. Finish installing.

### Setting up Database

1. Open up MySQL Command Line Client. Enter password when prompted.

2. Copy contents of "db.sql" file into the client. Hit enter.

3. Copy and paste "ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'YourRootPassword';" into the client. Replace the YourRootPassword string with your actual password.

4. You can close MySQL Command Line Client now. Update the appropriate config file with your MySQL password so that the server will be able to connect to the database.