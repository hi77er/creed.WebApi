FROM node:16
WORKDIR /usr/src/app
COPY package*.json index.js ./
RUN npm install
EXPOSE 80
CMD ["node", "index.js"]