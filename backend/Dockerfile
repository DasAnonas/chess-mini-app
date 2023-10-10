FROM node:20

RUN mkdir /app

WORKDIR /app

COPY . .

RUN npm install

RUN npx tsc

EXPOSE 8080
			

CMD [ "node", "dist/index.js" ]