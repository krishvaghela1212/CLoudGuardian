
FROM node:22-alpine

WORKDIR /app

# Install production dependencies only
COPY package*.json ./
RUN npm ci --omit=dev

# Copy backend source code
COPY --chown=node:node . .

# Create writable directory for Winston log files
RUN mkdir -p logs && chown -R node:node /app

# Run as non-root user
USER node

ENV NODE_ENV=production
ENV PORT=5000

EXPOSE 5000

CMD ["npm", "start"]
