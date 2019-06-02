# EyeCloud
## Introduction (taken from the related paper)
In this paper, we discuss and evaluate the advantages and disadvantages of several techniques to visualize and analyze eye movement data tracked and recorded from public transport map viewers from various cities across the world. Such techniques include heat maps and gaze stripes. To overcome the disadvantages and improve the effectiveness of those techniques, we present a viable solution that makes use of existing techniques such as heat maps and gaze stripes, as well as an attention cloud, which is inspired by a tag cloud or word cloud. We also develop a web application with interactive attention clouds, named the EyeCloud, to put theory into practice. The main objective of this paper is to help public transport map designers and producers gain feedback and insights on how the current design of the map can be further improved, by leveraging on the visualization tool. In addition, this visualization tool, the EyeCloud, can be easily extended to many other purposes with various types of data. It could be possibly applied to entertainment industries, for instance, to track the attention of the film audiences in order to improve on the advertisements.
![Teaser](./teaser.png)
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