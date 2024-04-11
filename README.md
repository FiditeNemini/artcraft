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

# IF YOU ARE WORKING ON THIS PROJECT PLEASE ASK THE TEAM MEMBERS HOW TO SET UP THIS IS OUTDATED INFORMATION
# GottaGoFast-SS
Fast Prototyping with Better Netlify Pipeline:

- [Remix Docs](https://remix.run/docs)
- [Netlify Functions Overview](https://docs.netlify.com/functions/overview)
- [Tailwind Docs](https://tailwindcss.com/docs)

## Netlify Setup

1. Install the [Netlify CLI](https://docs.netlify.com/cli/get-started/):

```sh
npm i -g netlify-cli
```

If you have previously installed the Netlify CLI, you should update it to the latest version:

```sh
npm i -g netlify-cli@latest
```

2. Sign up and log in to Netlify:

```sh
netlify login
```

3. Create a new site:

```sh
netlify init
```

## Development

Ensure all packages are installed by running:

```sh
npm install
```

Run

```sh
netlify dev
```

Open up [http://localhost:8888](http://localhost:8888), and you're ready to go!

### Serve your site locally

To serve your site locally in a production-like environment, run

```sh
netlify serve
```

Your site will be available at [http://localhost:8888](http://localhost:8888). Note that it will not auto-reload when you make changes.

## Deployment

There are two ways to deploy your app to Netlify, you can either link your app to your git repo and have it auto deploy changes to Netlify, or you can deploy your app manually. If you've followed the setup instructions already, all you need to do is run this:

```sh
# preview deployment
netlify deploy --build

# production deployment
netlify deploy --build --prod
```
