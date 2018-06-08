FROM node:10-jessie
ARG NODE_ENV
ENV NODE_ENV $NODE_ENV

WORKDIR /usr/src/app

COPY ./*.json ./
RUN npm install --ignore-scripts

COPY ./.git ./.git
COPY ./.gitmodules ./

RUN npm install --unsafe-perm
RUN npm run build

FROM node:10-alpine
WORKDIR /usr/src/app
COPY . ./
COPY --from=0 /usr/src/app /usr/src/app
CMD [ "npm", "start" ]
