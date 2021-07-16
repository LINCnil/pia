# BUILDER
FROM node:14 AS nodebuild

ENV PIA_VERSION 3.0.0

WORKDIR /usr/app/pia

COPY . .

RUN  npm install npm@latest -g \
 && npm install --unsafe-perm -g node-sass \
 && npm install -g @angular/cli

RUN yarn install \
 && sed -i -e "s/version: '3.0.0'/version: '$PIA_VERSION'/g" src/environments/environment.prod.ts \
 && /usr/app/pia/node_modules/@angular/cli/bin/ng build --prod --build-optimizer


# SERVER
FROM nginx:1.20.1

COPY --from=nodebuild /usr/app/pia/nginx/cnil_pia.conf /etc/nginx/conf.d/default.conf

WORKDIR /var/www/pia

COPY --from=nodebuild /usr/app/pia/dist/pia ./dist/pia
