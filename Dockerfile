FROM node:latest

RUN useradd --user-group --create-home --shell /bin/false app

ENV APP_NAME "PIA"
ENV APP_USER "app"
ENV HOME /home/$APP_USER
ENV APP_DIR $HOME/$APP_NAME

WORKDIR $APP_DIR
COPY package.json $APP_DIR/package.json
RUN yarn global add @angular/cli
COPY . $APP_DIR
RUN chown -R $APP_USER:$APP_USER $HOME/*

RUN yarn install && yarn cache clean
USER $APP_USER
WORKDIR $APP_DIR

EXPOSE 4200 49152

CMD ["yarn", "start", "--host=0.0.0.0"]
