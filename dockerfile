# Base image
FROM node:12.18.1

# Create app directory
WORKDIR /app

ENV NODE_ENV=production

# Install app dependencies
COPY ["package.json", "package-lock.json*", "./"]
RUN npm install --production

# Bundle app source
COPY . .
CMD [ "node", "server.js" ]

