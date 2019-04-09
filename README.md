# EyeCloud
## Build
Install docker if needed [https://docs.docker.com/install/](https://docs.docker.com/install/).\
Run the following command inside the root directory of the project that contains `docker-compose.yml` to create the server and client applications:
```
docker-compose up --build
```
The server will run on [http://localhost:5000](http://localhost:5000) and the client will run on [http://localhost:4200](http:localhost:4200).\
If you want to load the default data do a POST request to [http://localhost:5000/recover_all_data](http://localhost:5000/recover_all_data) with this body of type application/json
```
{
    "username": "EyeCloud",
    "password": "password123"
}
```
If you have [Postman](https://www.getpostman.com/) installed you can import `postman_requests_example.json` and use the request `Recover all data`