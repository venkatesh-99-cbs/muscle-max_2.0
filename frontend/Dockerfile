FROM node:20-slim

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install --legacy-peer-deps

COPY . .

EXPOSE 5173

# Default command for Docker — runs Vite dev server
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
