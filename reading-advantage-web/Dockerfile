FROM node:alpine

ARG SERVICE_ACCOUNT_KEY
ENV SERVICE_ACCOUNT_KEY=$SERVICE_ACCOUNT_KEY

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY . /usr/src/app/

RUN npm install
RUN npm run build

CMD ["npm", "start"]