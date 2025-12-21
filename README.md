To install dependencies:

```sh
bun install
```

To run:

```sh
bun run dev
```

open http://localhost:3000

## TODO

- Add optional `type` property to posts (`SHOW`, `ASK`, `JOB`)
- Update post creation UI to allow selecting a type (or skip)
- Filter posts by `type` for respective tabs (Show, Ask, Jobs)
- Render title with prefix: `"Show: ${post.title}"` (only for display)
