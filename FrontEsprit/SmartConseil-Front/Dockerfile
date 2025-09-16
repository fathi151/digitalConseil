FROM node:18-alpine

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci
RUN npm install -g @angular/cli@16.2.16 http-server

# Copy source code
COPY . .

# Build Angular pour Docker
RUN ng build --configuration=docker

# Serve Angular build
WORKDIR /app/dist/<nom-du-projet-angular>
EXPOSE 4200
CMD ["http-server", "-p", "4200", "-a", "0.0.0.0"]
