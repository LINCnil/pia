FROM debian:stable

RUN apt-get update && apt-get install --no-install-recommends -y apt-transport-https lsb-release ca-certificates net-tools lsof postgresql-client wget \
    && apt-get install --no-install-recommends -y git curl build-essential unzip python-pip python-setuptools \
    && apt-get install --no-install-recommends -y dnsutils vim-nox\
    && apt-get autoremove -y && apt-get clean

ENV HOME=/home/jenkins
ENV USER=jenkins
ENV GROUP=users

ARG UID
ARG GID
RUN useradd -d $HOME -g ${GID} -u ${UID} -m $USER -s /bin/bash \
    && mkdir -p $HOME/bin \
    && chown -R $USER:$GROUP $HOME

ARG ETCDVER=3.3.1
RUN wget -q https://github.com/coreos/etcd/releases/download/v${ETCDVER}/etcd-v${ETCDVER}-linux-amd64.tar.gz -O /tmp/etcd.tar.gz \
    && tar -xzf /tmp/etcd.tar.gz -C /tmp \
    && mv /tmp/etcd-v${ETCDVER}-linux-amd64/etcd* /usr/local/bin/ \
    && chmod 755 /usr/local/bin/etcd* \
    && rm -rf /tmp/etcd*

ARG CONFDVER=0.15.0
RUN wget -q https://github.com/kelseyhightower/confd/releases/download/v${CONFDVER}/confd-${CONFDVER}-linux-amd64 -O /usr/local/bin/confd \
    && chmod 755 /usr/local/bin/confd \
    && mkdir -p /etc/confd/conf.d \
    && mkdir -p /etc/confd/templates

USER $USER:$GROUP
WORKDIR $HOME

ENV PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/bin/:$HOME/bin:$HOME/.local/bin/

ENV NVM_DIR="$HOME/.nvm"
RUN curl -so- https://raw.githubusercontent.com/creationix/nvm/v0.33.8/install.sh | bash \
    && [ -s "$NVM_DIR/nvm.sh" ] \
    && . "$NVM_DIR/nvm.sh" \
    && nvm install 8.11.3 \
    && npm install -g @angular/cli

