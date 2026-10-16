FROM node:25-alpine AS runtime

WORKDIR /app
ENV HOST=0.0.0.0
ENV PORT=4173
ENV NODE_ENV=production

COPY dist ./dist
COPY public ./public
COPY data ./data
COPY api ./api

USER node
EXPOSE 4173
HEALTHCHECK --interval=15s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:4173/api/health').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"

CMD ["node", "dist/server.js"]
