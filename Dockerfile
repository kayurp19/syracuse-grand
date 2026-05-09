# Syracuse Grand — Node 20 Alpine image (static site + /api/contact)
FROM node:20-alpine

WORKDIR /srv

# Install production deps first for better layer caching
COPY package.json package-lock.json* ./
RUN npm install --omit=dev --no-audit --no-fund

# App source
COPY . .

ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080

CMD ["node", "server.js"]
