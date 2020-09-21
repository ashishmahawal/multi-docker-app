FROM node:current-alpine3.11
WORKDIR /app
COPY ./package.json ./
RUN npm install
COPY ./ ./
CMD ["npm","run","build"]

FROM nginx
EXPOSE 3000
COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/build /uusr/share/nginx/html