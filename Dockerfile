FROM node:15.14.0
WORKDIR /usr/src/app
COPY . .
ENV NODE_ENV=production
RUN yarn install
CMD yarn run start