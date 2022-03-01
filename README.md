<img src="assets/logo.png" width="66">

## Melonly Node.js Framework

Melonly is a fast and modern web development framework for Node.js. It makes easy to create secure and fast web applications with awesome developer experience.

**Table of Contents | Documentation**

- [Melonly Node.js Framework](#melonly-nodejs-framework)
- [Requirements](#requirements)
- [Running Application](#running-application)
- [App Directory Structure](#app-directory-structure)
  - [`/database`](#database)
  - [`/public`](#public)
  - [`/src`](#src)
  - [`/storage`](#storage)
  - [`/views`](#views)
- [License](#license)


## Requirements

- Node.js v16.4.2+
- npm installed


## Running Application

Once your application project has been created you can run it on the local server:

```shell
npm start
```

Your application will be available on `localhost:3000` by default. You can set the port in `.env` configuration file.


## App Directory Structure

Default Melonly application structure consists of several main folders:


### `/database`

In this directory database migrations are created. You can also store `sqlite` database there.


### `/public`

This is the only directory visible to users. This is where you should put client side things like compiled styles, JS scripts and images.


### `/src`

The `src` directory contains your application code. Feel free to modify and change it to your needs.


### `/storage`

There are stored cache and temporary files. TypeScript code is compiled into `dist` directory inside this folder. You don't need to edit anything there.


### `/views`

The `views` directory contains app views rendered by your application. View files have `.melon.html` extension.


## License

Melonly is an open-source framework licensed under the [MIT license](melonly/LICENSE).

Author: [Doc077](https://github.com/Doc077)

If you discovered a bug or security vulnerability please open an issue / pull request or email me: dom.rajkowski@gmail.com.
