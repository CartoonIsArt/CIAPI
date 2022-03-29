FROM node:15.14.0
WORKDIR /usr/src/app
COPY package*.json .
COPY yarn.lock .
RUN yarn install
COPY . .
ENV NODE_ENV=production
EXPOSE 3000
ENTRYPOINT ["yarn", "run", "start"]