FROM node:slim
# Create app directory
EXPOSE 3030
ADD . /
ADD package.json package.json
ADD app.js app.js
ADD master.js master.js
VOLUME /server/config
RUN npm install
CMD ["node","master.js"]
