# GottaGoFast-SS
Fast Prototyping:
this app is created using `npx create-remix`
- [Remix Docs](https://remix.run/docs)
this app uses tailwind for styoing
- [Tailwind Docs](https://tailwindcss.com/docs)

## Development

From your terminal:

```sh
npm run dev
```

This starts your app in development mode, rebuilding assets on file changes.

## Deployment

First, build your app for production:

```sh
npm run build
```

Then run the app in production mode:

```sh
npm start
```

Now you'll need to pick a host to deploy it to.

### DIY

If you're familiar with deploying node applications, the built-in Remix app server is production-ready.

Make sure to deploy the output of `remix build`

- `build/`
- `public/build/`
