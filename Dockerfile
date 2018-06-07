FROM node:10-jessie AS node-with-git
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
ARG NODE_ENV
ENV NODE_ENV $NODE_ENV
COPY . /usr/src/app
COPY ./webapp /usr/src/app/webapp
RUN npm install --unsafe-perm
RUN npm run build

FROM node:10-alpine AS production-redy
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY --from=0 /usr/src/app /usr/src/app
CMD [ "npm", "start" ]
