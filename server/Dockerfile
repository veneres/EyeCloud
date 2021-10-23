FROM ubuntu:bionic
RUN apt-get update \
    && apt-get install -y python3-pip python3.6-dev libssl-dev\
    && cd /usr/local/bin \
    && ln -s /usr/bin/python3 python
COPY . /usr/src/app
WORKDIR /usr/src/app
RUN pip3 install -r requirements.txt
EXPOSE 5000
ENTRYPOINT ["python", "index.py"]
