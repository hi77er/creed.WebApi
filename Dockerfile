FROM node:alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY ./out ./
EXPOSE 80
CMD ["npm", "run", "service"]