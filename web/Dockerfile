FROM node:alpine

ARG SERVICE_ACCOUNT_KEY
ARG JWT_SECRET
ENV SERVICE_ACCOUNT_KEY_ENV=$SERVICE_ACCOUNT_KEY
ENV JWT_SECRET_ENV=$JWT_SECRET

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY . /usr/src/app/

RUN npm install
RUN npm run build

CMD ["npm", "start"]