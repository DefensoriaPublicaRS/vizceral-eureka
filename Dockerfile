FROM node:alpine

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

ARG NODE_ENV
ENV NODE_ENV $NODE_ENV
COPY . /usr/src/app
RUN npm install --unsafe-perm
RUN npm run build

CMD [ "npm", "start" ]
