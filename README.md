[![Build Status](https://travis-ci.org/CartoonIsArt/CIAPI.svg?branch=master)](https://travis-ci.org/CartoonIsArt/CIAPI)

# CIA Backend API

[CIA Frontend App](https://github.com/CartoonIsArt/eevee)과 호환되는 Restful 백엔드 API  

## 설치
```
yarn install
yarn start
```
localhost:3000에서 실행

## 테스트

```
$ curl -XPOST 'http://localhost:3000/users' -d '{
    "firstname": "CIA Developer Group!"
}'

HTTP/1.1 200 OK
Connection: keep-alive
Content-Length: 24
Content-Type: application/json; charset=utf-8
Date: Thu, 02 Nov 2017 10:27:00 GMT

{
    "firstname": "CIA Developer Group!",
    "id": 1
}
```

```
$ curl -XGET 'http://localhost:3000/users' 

HTTP/1.1 200 OK
Connection: keep-alive
Content-Length: 26
Content-Type: application/json; charset=utf-8
Date: Thu, 02 Nov 2017 10:27:03 GMT

[
    {
        "firstname": "CIA Developer Group!",
        "id": 1
    }
]
```
