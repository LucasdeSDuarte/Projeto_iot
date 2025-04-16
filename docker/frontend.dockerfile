# docker/frontend.dockerfile

FROM node:18

WORKDIR /app

COPY frontend/package*.json ./
RUN npm install

COPY frontend ./

EXPOSE 5557

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5557"]
