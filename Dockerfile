ARG BUN_VERSION=1.3.2
FROM oven/bun:${BUN_VERSION}-slim AS base

WORKDIR /usr/src/app

RUN groupadd -r hypenews && \
    useradd -r -g hypenews -d /usr/src/app -s /bin/sh hypenews && \
    chown -R hypenews:hypenews /usr/src/app

FROM base AS deps

COPY package.json bun.lock /temp/prod/server/
RUN cd /temp/prod/server && bun install

COPY frontend/package.json frontend/bun.lock /temp/prod/frontend/
RUN cd /temp/prod/frontend && bun install

FROM base AS build

COPY . .
COPY --from=deps /temp/prod/server/node_modules node_modules
COPY --from=deps /temp/prod/frontend/node_modules ./frontend/node_modules

ENV NODE_ENV=production
RUN cd frontend && bun run build -d

FROM base AS runner

COPY --from=deps /temp/prod/server/node_modules ./node_modules

COPY --exclude=frontend --from=build /usr/src/app .
COPY --from=build /usr/src/app/frontend/dist ./frontend/dist

RUN chown -R hypenews:hypenews /usr/src/app

USER hypenews

EXPOSE 3000

CMD ["bun", "run", "start"]
