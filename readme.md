# experimental-tiny-file-blog-server

A simple streaming based server

This is just a prototype of how much is actually required for a simple blog if I
were to do it in the traditional sense but using modern NodeJS.

**Constraints**

- Avoid using any external dependencies for things like server, middleware,
  routing
- Make it verbose for common actions, and only depending on the helpers already
  provided by node

## About

I plan on building one which acts as it's own CMS and wanted to see if I needed
a library like koa, fastify, restify, nestjs, express, etc.

Or could I just use the `node:http` to handle most cases, considering it's grown
quite a bit in terms of functionalities over the past years.

The project also led to having a tiny middleware system added to it which is
very similar to what Koa does since it's one of the systems that make the most
sense and is simpler to create compared to the one that Hapi maintains.

Hapi's middleware / plugin system is a lot more solid because of the dep graph
it creates making it very consistent in terms of functionality. Though we are
trying to keep the amount of effort to minimal

To avoid spending too much time on CSS I basically created a replication of
[manuelmoreale.com's](manuelmoreale.com/) blog.

So you see the latest blog post up first and then can move to the others from
the footer.

## Usage

1. Clone the repo
2. Install the deps

```sh
pnpm i
```

3. Run the dev server

```sh
pnpm dev
```

4. Start the normal server

```sh
pnpm start
```
