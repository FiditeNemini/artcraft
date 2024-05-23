# Storyteller GGF

## Coding Rules and Styles

```
Short Style Guide TS React and Engine:

No use of lets

No basic for loop operators.
Use the collection operators and array operators.

React Side / No modules over 200 lines. ( loose rule )

Don't do:
if (condition) return;

Do:
if (condition) {
	return;
}

No use of any type.
If you can use chat gpt to create the interface.
```

## Local Testing & Development

### Set up `.env` and the Proxy Server

Copy & paste the env settings from `.env-local-proxy` to `.env`, (if the file `.env` do not exist, simply create one at the root of this project's folder beside the other env settings files).

The settings from `.env-local-proxy` directs all requests to `localhost:3000`, this will relieve us from having to deal with CORS between various services.

Then, start the proxy server in the folder `/proxy`. Before running the proxy for the first time, run:

```
npm i
```

To start the proxy run:

```
node proxy.js
```

### Run the Code Locally

To setup and run this project's code locally:

```
npm install
npm run dev
```

## Other Documentation

This project uses Remix for routing and Tailwind for styling:

- [Remix Docs](https://remix.run/docs)
- [Tailwind Docs](https://tailwindcss.com/docs)

On Netlify, we use functions:

- [Netlify Functions Overview](https://docs.netlify.com/functions/overview)
