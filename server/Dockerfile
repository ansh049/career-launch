FROM node:22-alpine

WORKDIR /app

# Ensure proper user permissions
RUN chown -R node:node /app

COPY --chown=node:node package*.json ./
RUN npm ci --omit=dev

COPY --chown=node:node src ./src

USER node

ENV NODE_ENV=production
ENV PORT=5000

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:5000/api/health/live || exit 1

CMD ["node", "src/server.js"]