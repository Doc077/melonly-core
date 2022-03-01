<img src="assets/logo.png" width="66">

## Melonly Node.js Framework

Melonly is a fast and modern web development framework for Node.js. It makes easy to create secure and fast web applications with awesome developer experience.

**Table of Contents | Documentation**

- [Melonly Node.js Framework](#melonly-nodejs-framework)
- [Requirements](#requirements)
- [Running Application](#running-application)
- [Directory Structure](#directory-structure)
  - [`/database`](#database)
  - [`/public`](#public)
  - [`/src`](#src)
  - [`/storage`](#storage)
  - [`/views`](#views)
- [The Basics](#the-basics)
  - [Configuration](#configuration)
  - [Controllers and Routing](#controllers-and-routing)
  - [Views](#views-1)
- [License](#license)


## Requirements

- Node.js v16.4.2+
- `npm` installed


## Running Application

Once your application project has been created you can run it on the local server:

```shell
npm start
```

Your application will be available on `localhost:3000` by default. You can set the port in `.env` configuration file.


## Directory Structure

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


## The Basics

### Configuration

App configuration is based on `.env` file. This is where database credentials and environment-specific settings should be stored. Melonly automatically reads all `.env` variables to `process.env` object available in your code.

```
APP_PORT=3000

DATABASE_CONNECTION=mysql
DATABASE_HOST=localhost
```

You can reference these variables this way:

```ts
console.log(process.env.APP_PORT)
```


### Controllers and Routing

Now we can develop our application. Main entry file for the Node app is `src/main.ts` file. This is the place where app middleware and controllers are registered. Routing system in Melonly is done using controller classes. Framework already ships with one controller in `src/app/app.controller.ts` file by default:

```ts
import { Controller, Get, Request, Response, ViewResponse } from '@melonly/core'

@Controller()
export class AppController {
    constructor(private readonly request: Request, private readonly response: Response) {}

    @Get('/')
    public index(): ViewResponse {
        return this.response.render('home', {
            message: 'Hello World',
        })
    }
}
```

Basically, a controller is just a class which handles web requests. Each controller should contain decorated methods registering routes. In the example above, when the user enters `/` route, the request will be passed to the `index` method which returns a view with passed variable.


### Views

Melonly includes a built-in view templating engine. Views are placed in `/views` directory and have the `.melon.html` extension.

The example template looks like this:

```html
<h1>{{ title }}</h1>

[each item in [1, 2, 3]]
    <div>{{ item }}</div>
[/each]

[if logged]
    <a href="/logout">Log out</a>
[/if]
```

Control directives have a square brackets syntax with `{{ ... }}` for variable interpolation.


## License

Melonly is an open-source framework licensed under the [MIT license](melonly/LICENSE).

Author: [Doc077](https://github.com/Doc077)

If you discovered a bug or security vulnerability please open an issue / pull request or email me: dom.rajkowski@gmail.com.
