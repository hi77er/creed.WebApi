FROM node:16
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY ./out ./
EXPOSE 80
CMD ["npm", "run", "service"]