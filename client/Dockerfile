FROM ubuntu:latest
RUN apt-get update \
    && apt-get install -y curl \
    && curl -sL https://deb.nodesource.com/setup_12.x | bash - \
    && apt-get install -y nodejs
WORKDIR /usr/src/app
COPY package.json /usr/src/app
RUN npm install
COPY . /usr/src/app
RUN npm install \
    && npm install -g @angular/cli@7.3.8 \
    && ng --version
EXPOSE 4200

ENTRYPOINT ["npm", "start"]
