#Quick start

```
$ npm i
$ PROFILES=producao node application.js
```

navegar para localhost:8080


## Argumentos:

Argumentos podem ser enviados por parâmetro ou variável de ambiente:

### Por argv:
```
$ node application.js --server.port 3000 --profiles producao
```

### Por variável de ambiente:

```
$ SERVER_PORT=3000 PROFILES=producao node application.js
```

##Docker

```
$ docker build -t eureka-monitor .
```

Argumentos podem ser enviados por variável de ambiente:

```
$ docker run -e PROFILES=producao eureka-monitor
```
