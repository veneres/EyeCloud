FROM ubuntu:latest
RUN apt-get update \
    && apt-get install -y curl \
    && curl -sL https://deb.nodesource.com/setup_11.x | bash - \
    && apt-get install -y nodejs
COPY . /usr/src/app
WORKDIR /usr/src/app
RUN npm install -g @angular/cli && npm install
EXPOSE 4200
ENTRYPOINT ["npm", "start"]
