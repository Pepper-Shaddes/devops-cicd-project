
FROM node:22

WORKDIR /app

COPY package*.json ./

RUN npm ci --omit=dev

COPY --chown=node:node server.js ./
COPY --chown=node:node app.js ./
COPY --chown=node:node messageValidator.js ./
COPY --chown=node:node public ./public

USER node

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["npm", "start"]

